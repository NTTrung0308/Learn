import React, { useState, useEffect } from "react";
import "./assets/css/ChatAI.css";
import api from "../api";

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Xin chào! Tôi là trợ lý tiếng Anh của bạn. Tôi có thể giúp bạn thực hành tiếng Anh, giải thích ngữ pháp, cung cấp từ vựng, sửa lỗi câu, và nhiều hơn thế nữa.",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/chat", { message: input });
      const aiMessage = { text: response.data.reply, sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tối ưu auto-scroll
  useEffect(() => {
    const messagesContainer = document.querySelector(".chat-ai-messages");
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // Thêm tính năng clear chat
  const clearChat = () => {
    setMessages([
      {
        text: "Xin chào! Tôi là trợ lý tiếng Anh của bạn. Tôi có thể giúp bạn thực hành tiếng Anh, giải thích ngữ pháp, cung cấp từ vựng, sửa lỗi câu, và nhiều hơn thế nữa.",
        sender: "ai",
      },
    ]);
  };

  return (
    <div className="chat-ai-container">
      <button onClick={toggleChat} className="chat-ai-button">
        <i className="fas fa-robot"></i>
      </button>
      {isOpen && (
        <div className="chat-ai-window">
          <div className="chat-ai-header">
            <div className="header-left">
              <h2>Trợ lý Tiếng Anh</h2>
              <span className="status-indicator">● Đang hoạt động</span>
            </div>
            <div className="header-right">
              <button
                onClick={clearChat}
                className="clear-chat-button"
                title="Xóa cuộc trò chuyện"
              >
                <i className="fas fa-trash"></i>
              </button>
              <button onClick={toggleChat} className="close-chat-button">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="chat-ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message ai loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="loading-text">Trợ lý đang trả lời...</span>
              </div>
            )}
          </div>

          <div className="chat-ai-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi tiếng Anh của bạn..."
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ""}
              className="send-button"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAI;
