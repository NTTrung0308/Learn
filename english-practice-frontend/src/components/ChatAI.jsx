import React, { useState, useEffect } from "react";
import "./assets/css/ChatAI.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Xin chào! Tôi là trợ lý tiếng Anh của bạn. Tôi có thể giúp bạn thực hành tiếng Anh, giải thích ngữ pháp, cung cấp từ vựng, sửa lỗi câu, và nhiều hơn thế nữa.",
      sender: "ai"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiKey =
    process.env.REACT_APP_API_KEY || "AIzaSyCEewvt2tFdFkkel8-hcRhrtvxcv1_Kwgk";

  // Khởi tạo model một lần duy nhất
  const [genAI, setGenAI] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (apiKey) {
      const genAIInstance = new GoogleGenerativeAI(apiKey);
      const modelInstance = genAIInstance.getGenerativeModel({
        model: "gemini-2.5-flash", 
        generationConfig: {
          maxOutputTokens: 150, 
          temperature: 0.3, 
          topP: 0.8,
          topK: 40,
        },
      });
      setGenAI(genAIInstance);
      setModel(modelInstance);
    }
  }, [apiKey]);

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
    if (input.trim() === "" || !apiKey || !model) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prompt ngắn gọn và hiệu quả hơn
      const prompt = `[Bạn là trợ lý tiếng Anh] Trả lời ngắn gọn (dưới 150 từ) bằng tiếng Việt: ${input}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiMessage = { text, sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      let errorText = "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";
      
      if (error.message?.includes("API_KEY") || error.message?.includes("401")) {
        errorText = "Lỗi xác thực API. Vui lòng kiểm tra khóa API.";
      } else if (error.message?.includes("quota") || error.message?.includes("429")) {
        errorText = "Đã vượt quá giới hạn. Vui lòng thử lại sau ít phút.";
      } else if (error.message?.includes("network") || error.message?.includes("FETCH_ERROR")) {
        errorText = "Lỗi kết nối. Kiểm tra mạng và thử lại.";
      }

      const errorMessage = { text: errorText, sender: "ai" };
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
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  // Thêm tính năng clear chat
  const clearChat = () => {
    setMessages([
      {
        text: "Xin chào! Tôi là trợ lý tiếng Anh của bạn. Tôi có thể giúp bạn thực hành tiếng Anh, giải thích ngữ pháp, cung cấp từ vựng, sửa lỗi câu, và nhiều hơn thế nữa.",
        sender: "ai"
      }
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
              <button onClick={clearChat} className="clear-chat-button" title="Xóa cuộc trò chuyện">
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
              placeholder={
                !apiKey ? "Khóa API chưa được cấu hình." : "Nhập câu hỏi tiếng Anh của bạn..."
              }
              disabled={!apiKey || isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!apiKey || isLoading || input.trim() === ""}
              className="send-button"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
          
          {!apiKey && (
            <div className="api-warning">
              <i className="fas fa-exclamation-triangle"></i>
              Vui lòng cấu hình API key trong file .env
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatAI;