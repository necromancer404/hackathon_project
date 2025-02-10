import { useState } from "react";
import { X, Send } from "lucide-react";
import "./button.css"; // Import the CSS file for styles

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");

    // Simulated bot reply after a delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Hello! How can I help?", sender: "bot" },
      ]);
    }, 1000);
  };

  return (
    <div className="chat-container">
      {isOpen ? (
        <div className="chatbox">
          {/* Chat Header */}
          <div className="chat-header">
            <h2>Chat</h2>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${
                  msg.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              <Send />
            </button>
          </div>
        </div>
      ) : (
        <button className="open-chat-btn" onClick={() => setIsOpen(true)}>
          Chat
        </button>
      )}
    </div>
  );
}
