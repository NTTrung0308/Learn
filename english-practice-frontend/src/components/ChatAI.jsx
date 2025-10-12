import React, { useState, useEffect, useRef } from "react";
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
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

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

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Vui lòng sử dụng Chrome hoặc Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInput(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        alert('Vui lòng cho phép sử dụng microphone để ghi âm.');
      }
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      if (input.trim()) {
        handleSendVoiceMessage(input);
      }
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSendVoiceMessage = async (voiceText) => {
    if (!voiceText.trim()) return;

    const userMessage = { text: voiceText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/chat/voice-feedback", { 
        transcription: voiceText 
      });
      const aiMessage = { text: response.data.reply, sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending voice message:", error);
      const errorMessage = {
        text: "Xin lỗi, tôi không thể xử lý tin nhắn thoại của bạn.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const messagesContainer = document.querySelector(".chat-ai-messages");
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

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
              placeholder={isRecording ? "Đang nghe..." : "Nhập câu hỏi tiếng Anh của bạn..."}
              disabled={isLoading || isRecording}
            />
            <button
              onClick={handleToggleRecording}
              className={`record-button ${isRecording ? "recording" : ""}`}
              title={isRecording ? "Dừng ghi âm" : "Ghi âm"}
              disabled={isLoading}
            >
              <i className={`fas ${isRecording ? "fa-stop" : "fa-microphone"}`}></i>
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === "" || isRecording}
              className="send-button"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
          {isRecording && (
            <div className="recording-indicator">
              <div className="pulse-animation"></div>
              <span>Đang ghi âm... Nói tiếng Anh vào microphone</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatAI;