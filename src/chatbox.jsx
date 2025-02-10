import React, { useState, useRef, useEffect } from "react";

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = (e) => {
    draggingRef.current = true;
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const startResize = (e) => {
    e.stopPropagation();
    resizingRef.current = true;
    offset.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (draggingRef.current) {
        setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
      } else if (resizingRef.current) {
        setSize((prev) => ({
          width: Math.max(200, prev.width + (e.clientX - offset.current.x)),
          height: Math.max(150, prev.height + (e.clientY - offset.current.y)),
        }));
        offset.current = { x: e.clientX, y: e.clientY };
      }
    };

    const stopActions = () => {
      draggingRef.current = false;
      resizingRef.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopActions);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopActions);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "User", text: input }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "AI Tutor", text: formatMessage(data.response) }]);
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages((prev) => [...prev, { sender: "AI Tutor", text: "❌ Failed to get a response!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre style="background: #1e1e1e; color: #f8f8f2; padding: 10px; border-radius: 5px; overflow-x: auto;"><code class="language-${lang || "plaintext"}">${code}</code></pre>`;
      })
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\$(.*?)\$/g, "<span style='color: #ffcc00; font-style: italic;'>$1</span>")
      .replace(/\n/g, "<br>");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        border: "1px solid #444",
        borderRadius: "8px",
        backgroundColor: "#222",
        color: "#fff",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ background: "#444", padding: "10px", textAlign: "center", fontWeight: "bold", cursor: "move" }} onMouseDown={startDrag}>
        AI Tutor Chatbox
      </div>
      <div style={{ flexGrow: 1, overflowY: "auto", padding: "10px", backgroundColor: "#333", display: "flex", flexDirection: "column" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            background: msg.sender === "User" ? "#007bff" : "#555",
            padding: "8px",
            borderRadius: "5px",
            marginBottom: "5px",
            color: "#fff",
            maxWidth: "80%",
            alignSelf: msg.sender === "User" ? "flex-end" : "flex-start",
            whiteSpace: "pre-line",
          }}
          dangerouslySetInnerHTML={{ __html: msg.text }}></div>
        ))}
        {isTyping && <div style={{ fontStyle: "italic", color: "#aaa" }}>AI is typing...</div>}
      </div>
      <div style={{ display: "flex", padding: "5px", backgroundColor: "#222" }}>
        <button style={{ marginRight: "5px", padding: "8px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px" }} onClick={() => setSize({ width: size.width + 20, height: size.height + 20 })}>➕</button>
        <button style={{ marginRight: "5px", padding: "8px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px" }} onClick={() => setSize({ width: Math.max(200, size.width - 20), height: Math.max(150, size.height - 20) })}>➖</button>
        <input style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #555", backgroundColor: "#444", color: "#fff" }} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask AI Tutor..." />
        <button style={{ marginLeft: "5px", padding: "8px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbox;
