import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/context.jsx';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const Slider = ({ isActive, setIsActive, setAnswerHistory }) => {
    const { id } = useParams();
    const [isVisible, setIsVisible] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showDeleteAll, setShowDeleteAll] = useState(false);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const [selectedConv, setSelectedConv] = useState(null);
    const { theme } = useContext(ThemeContext);
    const [conversations, setConversations] = useState([]);
    const [userData, setUserData] = useState({ name: '', email: '' });
    const navigate = useNavigate();

    // Fixed close function
  const handleClose = () => {
    try {
        setIsActive(false);
        console.log("Slider closed successfully");
    } catch (error) {
        console.error("Error closing slider:", error);
        // Fallback mechanism
        document.body.classList.remove('slider-active');
    }
};

    // Fixed new chat function
   const handleNewChat = () => {
    try {
        // Clear local storage first
        localStorage.removeItem("chatHistory");
        console.log("Chat history cleared from localStorage");
        
        // Update state if the prop exists
        if (typeof setAnswerHistory === 'function') {
            setAnswerHistory([]);
            console.log("Answer history state reset");
        } else {
            console.warn("setAnswerHistory is not a function or not provided");
        }
        
        // Close the slider
        setIsActive(false);
        console.log("Slider closed");
        
        // Handle navigation with fallback
        if (navigate) {
            navigate(window.location.pathname, { replace: true });
            console.log("Navigation triggered");
        } else {
            console.warn("Navigate function not available");
            // Fallback: reload the page
            window.location.reload();
        }
    } catch (error) {
        console.error("Error in handleNewChat:", error);
        // Ultimate fallback: refresh the page
        alert("An error occurred. The page will refresh.");
        window.location.reload();
    }
};

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`https://api-ai-1-lz3k.onrender.com/userdata/${id}`, {
                    withCredentials: true
                });

                if (response.data && response.data.success) {
                    setUserData({
                        name: response.data.user.name || 'User',
                        email: response.data.user.email || 'No email'
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserData({
                    name: 'User',
                    email: 'No email'
                });
            }
        };

        fetchUserData();
    }, [id]);

    useEffect(() => {
        fetchConversations();
    }, []); // Removed conversations from dependencies to avoid infinite loop

    const handleDeleteClick = (conv, e) => {
        e.stopPropagation();
        setSelectedConv(conv);
        setShowDeletePopup(true);
    };

    const handleDelete = async () => {
        try {
            if (!selectedConv || !selectedConv._id) {
                console.error('No conversation selected for deletion');
                return;
            }

            const response = await axios.delete(`https://api-ai-1-lz3k.onrender.com/conversation/${selectedConv._id}`, {
                withCredentials: true
            });

            if (response.status === 200) {
                setConversations(prevConversations =>
                    prevConversations.filter(conv => conv._id !== selectedConv._id)
                );
                console.log('Conversation deleted successfully');
            }

            setShowDeletePopup(false);
            setSelectedConv(null);
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Failed to delete conversation. Please try again.');
        }
    };

    const handleDeleteAllChats = () => {
        setShowDeleteAll(true); 
    };

    const confirmDeleteAllChats = async () => {
        try {
            const response = await axios.delete('https://api-ai-1-lz3k.onrender.com/conversations/all', {
                withCredentials: true
            });

            if (response.status === 200) {
                setConversations([]);
                setAnswerHistory([]);
                console.log('All conversations deleted successfully');
                setShowDeleteAll(false); 
            }
        } catch (error) {
            console.error('Error deleting all conversations:', error);
            alert('Failed to delete all conversations. Please try again.');
        }
    };

    const cancelDeleteAllChats = () => {
        setShowDeleteAll(false); 
    };

    const handleLogout = () => {
        axios.get("https://api-ai-1-lz3k.onrender.com/logout")
        .then(res => {
            if(res.data.Status === "success") {
                navigate("/Login", { replace: true });
                window.location.reload();
            } else {
                alert("Error");
            }
        })
        .catch(err => console.log(err));
    };

    const handleConversationClick = (conv) => {
        setAnswerHistory([{
            question: conv.question,
            answer: conv.answer
        }]);
        setIsActive(false);

        setTimeout(() => {
            const chatHistoryElement = document.querySelector('.para');
            if (chatHistoryElement) {
                chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
            }
        }, 100);
    };

    useEffect(() => {
        let timer;
        if (isActive) {
            timer = setTimeout(() => {
                setIsVisible(true);
            }, 200);
        } else {
            setIsVisible(false);
        }
        return () => clearTimeout(timer);
    }, [isActive]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('https://api-ai-1-lz3k.onrender.com/conversations', {
                withCredentials: true
            });
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            if (error.response && error.response.status === 401) {
                console.log("Unauthorized access, please log in again.");
            }
        }
    };

    return (
        <>
            <div
                className={`fixed h-[100vh] shadow-lg left-0 top-0 z-10 rounded transition-all duration-300
                    ${isActive ? 'translate-x-0' : '-translate-x-full'}
                    ${theme === "light" ? "bg-white text-[#501854] border" : "bg-[#1D121A] text-white"}
                    w-[70%] md:w-[15vw]`}
            >
                <div className="w-full h-full flex flex-col">
                    {isActive && (
                        <div
                            className="flex items-center py-4 pl-3 cursor-pointer"
                            onClick={handleClose}
                        >
                            <i className={`fa-solid fa-right-from-bracket text-[15px] md:text-lg p-2 rounded-md transition duration-100 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"}`}></i>
                            <h3 className={`ml-2 text-base animated-h3 text-[14px] md:text-lg font-bold ${isVisible ? 'visible' : ''}`}>
                                Close
                            </h3>
                        </div>
                    )}

                    {isActive && (
                        <div className="flex-1 flex flex-col pl-3">
                            <div
                                className="flex items-center py-2 cursor-pointer"
                                onClick={handleNewChat}
                            >
                                <i className={`fa-solid fa-plus text-lg p-2 rounded-md transition duration-100 text-[15px] md:text-lg ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"}`}></i>
                                <h3 className={`ml-2 text-base animated-h3 text-[14px] md:text-lg font-bold ${isVisible ? 'visible' : ''}`}>
                                    New Chat
                                </h3>
                            </div>

                            <div className="history mt-20 flex-1">
                                <h1 className='font-medium text-[15px] md:text-lg'>Recent Search </h1>
                                <div className='mt-3 overflow-y-auto max-h-[40vh] custom-scrollbar overflow-x-hidden'>
                                    <ul className='list-none'>
                                        {conversations.map((conv, index) => (
                                            <li
                                                key={index}
                                                className={`text-[10px] md:text-[13px] rounded-lg p-3 flex items-center justify-between transition-all duration-200 group relative hover:pr-8 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-[#2C2431]"} ${isVisible ? 'visible' : ''}`}
                                                onClick={() => handleConversationClick(conv)}
                                            >
                                                <span className='font-medium truncate pr-2 cursor-pointer'>
                                                    {conv.question}
                                                </span>
                                                <i
                                                    className={`fa-solid fa-xmark absolute right-2 opacity-0 group-hover:opacity-100  text-[12px] md:text-[13px] transition-all duration-300 transform translate-x-3 group-hover:translate-x-0 cursor-pointer p-2 rounded-md ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"}`}
                                                    onClick={(e) => handleDeleteClick(conv, e)}
                                                ></i>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="setting flex items-center py-4 mt-auto mb-20">
                                <i
                                    className={`fa-solid fa-gear text-lg p-2 rounded-md transition duration-100 text-[12px] md:text-lg ${theme === "light" ? "hover:bg-[#f8f4f8]" : "hover:bg-gray-700"} cursor-pointer`}
                                    onClick={() => setShowSettingsPopup(true)}
                                ></i>
                                <h3
                                    className={`ml-2 text-base animated-h3 text-[14px] md:text-lg font-bold ${isVisible ? 'visible' : ''} cursor-pointer`}
                                    onClick={() => setShowSettingsPopup(true)}
                                >
                                    Settings
                                </h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/10 backdrop-brightness-50"
                        onClick={() => setShowDeletePopup(false)}
                    ></div>
                    <div className={`${theme === 'light' ? 'bg-white text-[#501854]' : 'bg-[#1D121A] text-white'} rounded-lg p-6 w-[90%] max-w-[400px] shadow-xl relative animate-scaleIn`}>
                        <h3 className="text-lg font-semibold mb-4">Delete Conversation</h3>
                        <p className="mb-6">Are you sure you want to delete this conversation?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                className={`px-4 py-2 rounded-md transition-colors duration-200 ${theme === 'light'
                                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                onClick={() => setShowDeletePopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteAll && (
                <div className="fixed inset-0 flex items-center justify-center z-100 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/10 backdrop-brightness-50"
                        onClick={cancelDeleteAllChats}
                    ></div>
                    <div className={`${theme === 'light' ? 'bg-white text-[#501854]' : 'bg-[#1D121A] text-white'} rounded-lg p-6 w-[90%] max-w-[400px] shadow-xl relative animate-scaleIn`}>
                        <h3 className="text-lg font-semibold mb-4">Delete All Chats</h3>
                        <p className="mb-6">Are you sure you want to delete all chats?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                className={`px-4 py-2 rounded-md transition-colors duration-200 ${theme === 'light'
                                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                onClick={cancelDeleteAllChats}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                                onClick={confirmDeleteAllChats}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSettingsPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/10 backdrop-brightness-50"
                        onClick={() => setShowSettingsPopup(false)}
                    ></div>
                    <div className={`${theme === 'light' ? 'bg-white text-[#501854]' : 'bg-[#1D121A] text-white'} rounded-lg p-6 w-[90%] max-w-[400px] shadow-xl relative animate-scaleIn`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Settings</h3>
                            <button
                                onClick={() => setShowSettingsPopup(false)}
                                className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-[#f8f4f8]' : 'hover:bg-gray-700'}`}
                            >
                                <i className="fa-solid fa-xmark px-2 hover:rounded-4xl"></i>
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${theme === 'light' ? 'bg-[#F4DBEF]' : 'bg-[#2C2431]'}`}>
                                    <i className="fa-solid fa-user text-lg"></i>
                                </div>
                                <div>
                                    <h4 className="font-medium">{userData.name}</h4>
                                    <p className="text-sm opacity-75">{userData.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors duration-200 ${theme === 'light'
                                    ? 'bg-gray-100 hover:bg-gray-200'
                                    : 'bg-[#2C2431] hover:bg-[#3A2E42]'
                                    }`}
                            >
                                <span>Theme</span>
                                <span className="opacity-75">{theme === 'light' ? 'Light' : 'Dark'}</span>
                            </button>

                            <button
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors duration-200 ${theme === 'light'
                                    ? 'bg-gray-100 hover:bg-gray-200'
                                    : 'bg-[#2C2431] hover:bg-[#3A2E42]'
                                    }`}
                            >
                                <span>Feedback</span>
                                <i className="fa-solid fa-comment-dots"></i>
                            </button>

                            <div className='flex justify-around items-center'>
                                <button
                                    className={`w-[160px] flex items-center justify-around px-3 py-3 rounded-md transition-colors duration-200 ${theme === 'light'
                                        ? 'bg-gray-100 hover:bg-gray-200'
                                        : 'bg-[#2C2431] hover:bg-[#3A2E42]'
                                        }`}
                                    onClick={handleDeleteAllChats}
                                >
                                    <span className="text-red-500">Delete All Chats</span>
                                    <i className="fa-solid fa-trash text-red-500"></i>
                                </button>
                                <button
                                    className={`w-[160px] flex items-center justify-evenly px-4 py-3 rounded-md transition-colors duration-200 ${theme === 'light'
                                        ? 'bg-gray-100 hover:bg-gray-200'
                                        : 'bg-[#2C2431] hover:bg-[#3A2E42]'
                                        } text-red-500`}
                                    onClick={handleLogout}
                                >
                                    <span>Logout</span>
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-opacity-20 text-xs text-center opacity-75">
                            <p>Version 1.0.0</p>
                            <p className="mt-1">© 2025 Your Company</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Slider;
