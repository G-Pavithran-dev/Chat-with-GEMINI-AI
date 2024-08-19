import React from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import { GoogleAIFileManager } from '@google/generative-ai/server'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY)
const fileManager = new GoogleAIFileManager(import.meta.env.VITE_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
export default function ChatEnvironment() {
  const [input, setInput] = React.useState('Analyse the image and give me a complaint format to the respective Indian railway department ith prioirtize the seriousnous of the issue shown. Display department of railway, category, priority and the complaint format one by one.')
  const [file, setFile] = React.useState(null)
  const [uploadResponse, setUpload] = React.useState(null)
  const [data, setData] = React.useState([
    { input: '', response: 'Hi there! How can I help you?' },
  ])

  React.useEffect(() => {
    const storedData = localStorage.getItem('myData')
    if (storedData) {
      setData(JSON.parse(storedData))
    }
  }, [])


  async function getResponse(data) {
    const prompt = input
    setData((prevData) => [
      ...prevData,
      { input: prompt, response: 'Generating response...' },
    ])



    try {
      const uploadedFile = await fileManager.getFile(data.name)
      console.log('uploadedFile', uploadedFile)
      const result = await model.generateContent([
        {
          text: prompt,
        },
        {
          fileData: {
            mimeType: uploadedFile.mimeType,
            fileUri: uploadedFile.uri,
          },
        },
      ])
      console.log('result', result)
      const responseText = result.response.text()

      setData((prevData) => {
        const newData = [...prevData]
        const lastIndex = newData.length - 1
        newData[lastIndex] = {
          ...newData[lastIndex],
          response: responseText,
        }
        localStorage.setItem('myData', JSON.stringify(newData))
        return newData
      })
    } catch (error) {
      setData((prevData) => {
        const newData = [...prevData]
        const lastIndex = newData.length - 1
        newData[lastIndex] = {
          ...newData[lastIndex],
          response: '**Error generating response, Kindly retry**',
        }
        return newData
      })
      console.error('Error in generating content', error)
    }
  }

  async function handleFileUpload() {
    if (!file) {
      console.log(file)

      console.log('No file selected')
      return
    }
    const formData = new FormData()
    formData.append('image', file)
    axios
      .post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        console.log(res.data)
        setUpload(res.data.data)
        getResponse(res.data.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  function handleNewChat() {
    setData([{ input: '', response: 'Hi there! How can I help you?' }])
    localStorage.removeItem('myData')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (input === '') return
    handleFileUpload()
    setInput('')
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      })
    }, 1000)
  }

  return (
    <main className="w-[99vw] h-full flex flex-col bg-gray-950">
      <section className="pb-20 pt-14 flex flex-col">
        {data.map((item, index) => (
          <>
            {item.input && (
              <section
                className="user-chat flex flex-col px-5 py-3 self-end"
                key={index}
              >
                <h3 className="font-bold self-end p-2 text-purple-500">You</h3>
                <p className="bg-gray-800 font-normal px-4 py-3 rounded-md text-gray-200">
                  {item.input}
                </p>
                {uploadResponse && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="uploaded"
                    className="w-40 h-40 rounded-md mt-2"
                  />
                )}
              </section>
            )}
            <section className="ai-reply flex flex-col p-2 self-start">
              <h3 className="font-bold self-start p-1 text-green-500">
                Railway Service
              </h3>

              <ReactMarkdown
                className={`font-normal markdown p-3 ${
                  item.response ===
                  '**Error generating response, Kindly retry**'
                    ? 'bg-red-600'
                    : 'bg-gray-800'
                } rounded-md leading-relaxed text-gray-200`}
                children={item.response}
              />
            </section>
          </>
        ))}
      </section>
      <form
        className="fixed bottom-0 p-4 flex justify-center w-full bg-gray-950 mt-8"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="bg-gray-900 border border-gray-700 rounded-full mr-2 text-xl text-white hover:bg-gray-800 disabled:bg-gray-400"
          onClick={handleNewChat}
        >
          +
        </button>
        <input
          type="file"
          className="p-2 text-gray-50 rounded-md rounded-r-none w-[30rem] focus:outline-none bg-gray-700"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          disabled={false}
          type="submit"
          className="bg-gray-900 border border-gray-700 rounded-md rounded-l-none text-lg text-white hover:bg-gray-800 disabled:bg-gray-400"
        >
          SEND
        </button>
      </form>
    </main>
  )
}
