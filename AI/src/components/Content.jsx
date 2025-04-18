import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ThemeContext } from "../context/context.jsx";
import axios from "axios";

const Content = forwardRef(({ answerHistory, setAnswerHistory }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [likedAnswers, setLikedAnswers] = useState(new Set());
  const [dislikedAnswers, setDislikedAnswers] = useState(new Set());
  const { theme } = useContext(ThemeContext);
  const [copyNotification, setCopyNotification] = useState({ show: false, text: '' });

  
  const chatHistoryRef = useRef(null);

 
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(answerHistory));
  }, [answerHistory]);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop =
        chatHistoryRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [answerHistory]);

  const getInputFieldStyle = () => {
    return {
      background: isFocused
        ? theme === "light"
          ? "#F4DBEF"
          : "#38323E"
        : theme === "light"
          ? "#fff"
          : "#fff",
      color: theme === "light" ? "#201B25" : "#fff",
      outline: "none",
    };
  };

  const Answer = async (text) => {
    if (!text.trim()) return;

    const currentQuestion = text;
    setInputText("");
    setIsLoading(true);
    setAnswerHistory((prevHistory) => [
      ...prevHistory,
      { question: currentQuestion, answer: "" },
    ]);

    try {
      const response = await axios.post('https://api-ai-1-lz3k.onrender.com/chatbot', {
        inputText: currentQuestion,
      });
      console.log("API Response:", response.data);

      let newAnswer = response.data.candidates[0].content.parts[0].text;
      newAnswer = newAnswer.replace(/\*/g, "");

      let i = 0;
      const typingSpeed = 3;

      const intervalId = setInterval(() => {
        setAnswerHistory((prevHistory) => {
          const updatedHistory = [...prevHistory];
          updatedHistory[updatedHistory.length - 1] = {
            question: currentQuestion,
            answer: newAnswer.substring(0, i + 1),
          };
          return updatedHistory;
        });

        i++;
        if (i >= newAnswer.length) {
          clearInterval(intervalId);
          setIsLoading(false);
        }
      }, typingSpeed);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAnswerHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1] = {
          question: currentQuestion,
          answer: "Error fetching data. Please try again.",
        };
        return updatedHistory;
      });
      setIsLoading(false);
    }
  };

  
  const handleQuestionClick = (question) => {
    setInputText(question);
    Answer(question);
  };

 
  const triggerAnswer = (text) => {
    setInputText(text);
    Answer(text);
  };

  
  useImperativeHandle(ref, () => ({
    triggerAnswer
  }));

  const handleCopy = (text) => {
    if (isLoading) return;
    navigator.clipboard.writeText(text);
    
   
    setCopyNotification({ show: true, text: 'Text copied to clipboard successfully!' });
    
    setTimeout(() => {
      setCopyNotification({ show: false, text: '' });
    }, 1500);
  };

  const handleLike = (index) => {
    if (isLoading) return;
    setLikedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setDislikedAnswers(prev => {
          const newDisliked = new Set(prev);
          newDisliked.delete(index);
          return newDisliked;
        });
      }
      return newSet;
    });
  };

  const handleDislike = (index) => {
    if (isLoading) return;
    setDislikedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setLikedAnswers(prev => {
          const newLiked = new Set(prev);
          newLiked.delete(index);
          return newLiked;
        });
      }
      return newSet;
    });
  };

  return (
    <div className="content flex flex-col justify-between flex-grow relative">
      
      {copyNotification.show && (
        <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg overflow-hidden animate-slideIn">
          <div className={`px-4 py-3 flex items-center gap-2 ${
            theme === "light" ? "bg-[#F4DBEF] text-[#501854]" : "bg-[#2B2532] text-white"
          }`}>
            <i className="fa-solid fa-check-circle"></i>
            <span className="font-medium">{copyNotification.text}</span>
          </div>
        </div>
      )}

      <div
        className="para flex flex-col justify-start items-center w-full max-w-[750px] mx-auto p-4 flex-grow custom-scrollbar scroll-fade-effect"
        ref={chatHistoryRef}
      >
        {answerHistory.map((item, index) => (
          <div key={index} className="mb-4 w-full">
        
            <div className="flex items-start gap-2 relative group">
              <div className={`text-left font-semibold p-4 rounded-2xl text-[12px] md:text-[15px] ${
                theme === "light" ? "bg-[#F4DBEF]" : "bg-[#2B2532]"
              }`}>
                {item.question}
              </div>
              <button
                onClick={() => handleCopy(item.question)}
                className={`p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 mt-2 ${
                  theme === "light" 
                    ? "hover:bg-[#F4DBEF] text-[#501854]" 
                    : "hover:bg-[#2B2532] text-white"
                }`}
              >
                <i className="fa-regular fa-copy"></i>
              </button>
            </div>

          
            <div className="mt-3">
              <div
                className={`text-left p-4 rounded-2xl flex-grow ${
                  theme === "light" ? "bg-[#F4DBEF]" : "bg-[#2B2532]"
                }`}
              >
                {isLoading && index === answerHistory.length - 1 && !item.answer ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  </div>
                ) : (
                  <div>
                    {item.answer.split("\n").map((paragraph, paragraphIndex) => {
                      const colonIndex = paragraph.indexOf(":");
                      if (colonIndex === -1) {
                        return (
                          <div key={paragraphIndex} className="mb-2">
                            <div className="mt-2 block text-[10px] md:text-[15px]">{paragraph}</div>
                          </div>
                        );
                      }

                      const topic = paragraph.substring(0, colonIndex);
                      const content = paragraph.substring(colonIndex + 1);

                      return (
                        <div key={paragraphIndex} className="mb-2">
                          <div className="font-bold block  text-[12px] md:text-[15px]">{topic}:</div>
                          <div className={`mt-2 block text-[12px] md:text-[15px] ${
                            content.startsWith("Example") ? "italic text-gray-600 " : ""
                          }`}>
                            {content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

    
            {!isLoading && item.answer && (
              <div className={`flex gap-2 mt-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <button
                  onClick={() => handleCopy(item.answer)}
                  disabled={isLoading}
                  className={`p-2 rounded-md transition-all ${
                    theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                  }`}
                >
                  <i className="fa-regular fa-copy"></i>
                </button>
                <button
                  onClick={() => handleLike(index)}
                  disabled={isLoading}
                  className={`p-2 rounded-md transition-all ${
                    theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                  }`}
                >
                  <i className={`fa-${likedAnswers.has(index) ? 'solid animate-like' : 'regular'} fa-thumbs-up`}></i>
                </button>
                <button
                  onClick={() => handleDislike(index)}
                  disabled={isLoading}
                  className={`p-2 rounded-md transition-all ${
                    theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                  }`}
                >
                  <i className={`fa-${dislikedAnswers.has(index) ? 'solid animate-dislike' : 'regular'} fa-thumbs-down`}></i>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="input h-20 md:h-30 rounded-3xl w-full max-w-[600px] mx-auto mb-8 p-2 flex items-center transition-colors duration-200 bg-[#1D121A]">
        <input
          type="text"
          placeholder="Ask anything..."
          className={`w-full h-10 md:h-12 text-[13px] md:text-[16px] rounded-lg px-4 transition-colors duration-200 ${theme === "light"
              ? "bg-white text-[#201B25]"
              : "bg-[#352E3A] text-white"
            }`}
          style={getInputFieldStyle()}
          onFocus={() => setIsFocused(true)}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && Answer(inputText)}
        />
        <button
          className={`text-white px-4 py-2 rounded-xl ml-2 transition-colors duration-200 ${theme === "light"
              ? "bg-[#D2689A] hover:bg-[#F4DBEF] hover:text-[#501854]"
              : "bg-[#D2689A] hover:bg-[#C55A8A]"
            }`}
          onClick={() => Answer(inputText)}
        >
          <i className="fa-solid fa-paper-plane text-[16px] md:text-[24px]"></i>
        </button>
      </div>
    </div>
  );
});

export default Content;
