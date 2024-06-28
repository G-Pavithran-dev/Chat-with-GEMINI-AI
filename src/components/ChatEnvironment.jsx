import React from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from "react-markdown"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
export default function ChatEnvironment() {
    const [input, setInput] = React.useState('')
    const [data, setData] = React.useState([
      {
        input: 'Hi Gemini',
        response: 'Hi there! How can I help you today?',
      },
    ])

    async function getResponse()
    {
        const prompt = input
        setData((prevData) => [
          ...prevData,
          { input: prompt, response: 'Generating response...' },
        ])

        try {
          const result = await model.generateContent(prompt)
          const responseText = result.response.candidates[0].content.parts[0].text

          setData((prevData) => {
            const newData = [...prevData]
            const lastIndex = newData.length - 1
            newData[lastIndex] = {
              ...newData[lastIndex],
              response: responseText,
            }
            return newData
          })
        } catch (error) {
          console.error('Error generating response:', error)
        }
    }

    function handleSubmit(e){
        e.preventDefault();
        if(input === "") return
        getResponse()
        setInput("")
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          })
        }, 1000)
    }
  return (
    <section className="w-screen h-full flex flex-col bg-slate-100">
      <section className="pb-20 pt-14 flex flex-col">
        {data.map((item, index) => (
          <>
            <section
              className="user-chat flex flex-col px-5 py-3 self-end"
              key={index}
            >
              <h3 className="font-bold self-end p-2">You</h3>
              <p className="bg-slate-400 font-normal px-4 py-3 rounded-md">
                {item.input}
              </p>
            </section>
            <section className="ai-reply flex flex-col w-8/12 p-2 self-start">
              <h3 className="font-bold self-start p-1">Gemini</h3>
              <ReactMarkdown
                className="font-normal p-1 rounded-md"
                children={item.response}
              />
            </section>
          </>
        ))}
      </section>
      <form
        className="fixed bottom-0 p-4 flex justify-center w-full bg-slate-100 mt-8"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={input}
          className="p-2 border border-gray-300 border-r-transparent rounded-md rounded-r-none w-[30rem] focus:outline-none "
          placeholder="Enter your prompt..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={false}
          type="submit"
          className="bg-white border border-gray-300 border-l-transparent rounded-md rounded-l-none hover:bg-slate-200 text-lg disabled:bg-slate-400"
        >
          🌐
        </button>
      </form>
    </section>
  )
}
