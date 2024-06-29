import React from "react";

export default function Navbar() {
    return (
      <nav className="w-screen fixed top-0 bg-gray-950">
        <img
          src="/images/Main-Logo.png"
          alt="logo"
          className="h-11 w-32 mx-auto bg-gradient-to-r from-purple-500 to-green-500 my-2"
        />
      </nav>
    )
}