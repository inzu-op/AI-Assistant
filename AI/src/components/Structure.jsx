import React, { useState, useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/context.jsx';
import Content from './Content';
import Slider from './Slider';

const Structure = ({ isActive, setIsActive }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isLight, setIsLight] = useState(theme === 'light');
  const [answerHistory, setAnswerHistory] = useState([]);

  useEffect(() => {
    setIsLight(theme === 'light');
  }, [theme]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      setAnswerHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleToggle = () => {
    setIsActive(prev => !prev);
  };

  const contentStyle = {
    backgroundColor: theme === 'light' ? '#fff' : '#201B25',
    color: theme === 'light' ? '#501854' : '#fff',
    position: 'absolute',
    left: isActive ? '15vw' : '0',
    right: '0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out'
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const isProcessingRef = useRef(false);
  const contentRef = useRef();

  const handleListItemClick = async (text) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      if (contentRef.current) {
        await contentRef.current.triggerAnswer(text);
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  return (
    <>
      <Slider
        isActive={isActive}
        setIsActive={setIsActive}
        setAnswerHistory={setAnswerHistory}
      />

      <div className="main rounded-lg transition-all duration-200 ease-in-out p-2 custom-scrollbar" style={contentStyle}>
        {/* Top Bar */}
        <div className="flex justify-between items-center">

          {!isActive && (
            <div className="menu-icon cursor-pointer fixed top-5 left-4 z-50 block " onClick={handleToggle}>
              <button
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-8 w-8 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                  }`}
                data-sidebar="trigger"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-panel-left pointer-events-none"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                  <path d="M9 3v18"></path>
                </svg>
                <span className="sr-only">Toggle Sidebar</span>
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="fixed right-6 top-5 z-50">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-200 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                }`}
            >
              {isLight ? (
                <i className="fa-solid fa-moon text-xl"></i>
              ) : (
                <i className="fa-solid fa-sun text-xl"></i>
              )}
            </button>
          </div>
        </div>

        {/* Page Title */}
        <h1 className="font-bold text-2xl mt-16 sm:text-3xl md:text-4xl ml-6 sm:ml-10">
          Chat AI
        </h1>

        {/* Help & Suggestions Section */}
        <div className="placeholder-content flex-grow px-4 md:px-10 mt-10 sm:mt-16">
          <div className="flex flex-col md:flex-row md:items-start lg:items-center gap-6 flex-wrap">
            {/* Heading */}
            <h2 className="text-[16px] sm:text-2xl md:text-3xl font-semibold min-w-max">
              How can I help you?
            </h2>

            {/* Suggestions */}
            <ul className="flex flex-col md:flex-row gap-3 flex-wrap font-medium">
              {[
                "What are some tips for staying healthy?",
                "Some skills to be learn in college",
                "What are some simple mindfulness exercises?",
                "mention some real time projects "
              ].map((text, index) => (
                <li
                  key={index}
                  className={`text-[12px] sm:text-base p-3 rounded-md cursor-pointer transition-colors duration-200 ${theme === "light"
                      ? "bg-[#f8f4f8] hover:bg-[#F4DBEF] text-[#501854]"
                      : "bg-[#2A222F] hover:bg-[#3A2E41] text-white"
                    }`}
                  onClick={() => handleListItemClick(text)}
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chat Content */}
        <Content
          ref={contentRef}
          answerHistory={answerHistory}
          setAnswerHistory={setAnswerHistory}
        />
      </div>
    </>
  );
};

export default Structure;
