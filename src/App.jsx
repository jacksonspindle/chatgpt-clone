import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  Message,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { motion } from "framer-motion";

const API_KEY = "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";

function App() {
  const [query, setQuery] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim() !== "") {
      handleSend(inputValue);
      setInputValue("");
    }
  };

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage];

    // update or messages state
    setMessages(newMessages);

    // set a type indicator (chatGPT is typing)
    setTyping(true);
    //process message to chatGPT
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // chatMessages { sender: "user" or "ChatGPT", message: "The message content here"}
    // apiMessages { role: "user" or "assistant", content: "The messages content here"}
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // role: "user" => a message from the user, "assistant" => a response from ChatGPT
    // system => generally one initial message defining HOW we want chatgpt to talk

    const systemMessage = {
      role: "system",
      content:
        "Answer everything as if you are a world class high-end fashion designer, artist, and teacher",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setTyping(false);
      });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.h1
        className="title"
        initial={{ y: "-10%", opacity: 0 }}
        animate={{
          y: 50,
          // x: "45vw",
          opacity: 1,
          transition: { duration: 0.5 },
        }}
      >
        AI Stylist
      </motion.h1>
      {chatOpen && (
        <motion.div
          className="App"
          drag
          initial={{ opacity: 0, y: -500 }}
          animate={{ y: 50, opacity: 1, transition: { duration: 2 } }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div
            style={{
              position: "relative",
              height: "500px",
              width: "400px",
            }}
          >
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                typing ? <TypingIndicator content="ChatGPT is typing" /> : null
              }
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
          </div>
        </motion.div>
      )}
      {/* <form
          onSubmit={(e) => {
            setChatOpen(true);
            e.preventDefault();
            handleSend(e.target.input.value);
            e.target.input.value = "";
          }}
          className="form"
        >
          <input
            autoComplete="off"
            className="prompt-input"
            type="text"
            name="input"
            placeholder="Type message here"
          />
         
        </form> */}
      <div style={{ position: "absolute", bottom: "20%" }}>
        <form
          className="form"
          onSubmit={(e) => {
            // setChatOpen(true);
            e.preventDefault();
            handleSend(pendingMessage);
            setPendingMessage("");
          }}
        >
          <motion.input
            type="text"
            placeholder="Search"
            // value={query}
            onChange={(e) => {
              setPendingMessage(e.target.value);
              setChatOpen(true);
              e.preventDefault();

              // e.target.value = "";
              handleSubmit;
              setQuery(true);
            }}
            initial={{ width: 55, y: "47vw" }}
            animate={{
              width: query ? "50vw" : 55,
              y: query ? "0vw" : "0vw",
              // x: query ? "-26vw" : "0vw",
            }}
            transition={{ duration: 0.75 }}
            style={{
              padding: "10px",
              fontSize: "16px",
              border: "none",
              borderRadius: "4px",
              outline: "none",
              boxShadow: "0 1px 6px rgba(0, 0, 0, 0.1)",
              margin: "10px",
              background: "black",
              color: "white",
              // position: "absolute",
              // bottom: "20%",
              // margin: "0%",
            }}
          ></motion.input>
        </form>
      </div>
    </div>
  );
}

export default App;
