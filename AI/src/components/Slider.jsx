import React, { useState, useEffect, useContext, useRef } from 'react';
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
    
    // Use a ref to track if the component is mounted
    const isMounted = useRef(true);
    
    // API URL reference for consistency
    const API_BASE_URL = 'https://api-ai-1-lz3k.onrender.com';

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Define API request options
    const apiOptions = {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            // Adding cache control headers to prevent caching issues
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    };

    // Simple debug function
    const debugLog = (message) => {
        console.log(`[Slider Debug] ${message}`);
    };

    // Handle toggle with proper state management
    const handleToggle = () => {
        debugLog(`Toggle clicked, current state: ${isActive}`);
        setIsActive(prev => !prev);
    };

    useEffect(() => {
        debugLog(`isActive changed to: ${isActive}`);
        if (isActive) {
            setTimeout(() => {
                if (isMounted.current) {
                    setIsVisible(true);
                    debugLog("Set isVisible to true");
                }
            }, 100);
        } else {
            setIsVisible(false);
            debugLog("Set isVisible to false");
        }
    }, [isActive]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                debugLog("Fetching user data");
                const response = await axios.get(`${API_BASE_URL}/userdata/${id}`, apiOptions);

                if (response.data && response.data.success && isMounted.current) {
                    setUserData({
                        name: response.data.user.name || 'User',
                        email: response.data.user.email || 'No email'
                    });
                    debugLog("User data fetched successfully");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (isMounted.current) {
                    setUserData({
                        name: 'User',
                        email: 'No email'
                    });
                }
            }
        };

        fetchUserData();
    }, [id]);

    // Fetch conversations only on mount
    useEffect(() => {
        debugLog("Component mounted, fetching conversations");
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            debugLog("Fetching conversations");
            const response = await axios.get(`${API_BASE_URL}/conversations`, apiOptions);
            
            if (isMounted.current) {
                setConversations(response.data);
                debugLog(`Fetched ${response.data.length} conversations`);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            if (error.response && error.response.status === 401) {
                debugLog("Unauthorized access, redirecting to login");
                navigate("/Login", { replace: true });
            }
        }
    };

    const handleDeleteClick = (conv, e) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedConv(conv);
        setShowDeletePopup(true);
        debugLog(`Delete clicked for conversation: ${conv._id}`);
    };

    const handleDelete = async () => {
        if (!selectedConv || !selectedConv._id) {
            console.error('No conversation selected for deletion');
            return;
        }

        try {
            debugLog(`Deleting conversation: ${selectedConv._id}`);
            const response = await axios.delete(
                `${API_BASE_URL}/conversation/${selectedConv._id}`, 
                apiOptions
            );

            if (response.status === 200) {
                if (isMounted.current) {
                    setConversations(prevConversations =>
                        prevConversations.filter(conv => conv._id !== selectedConv._id)
                    );
                    debugLog("Conversation deleted successfully");
                }
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Failed to delete conversation. Please try again.');
        } finally {
            if (isMounted.current) {
                setShowDeletePopup(false);
                setSelectedConv(null);
            }
        }
    };

    const handleDeleteAllChats = () => {
        setShowDeleteAll(true);
        debugLog("Delete all chats requested");
    };

    const confirmDeleteAllChats = async () => {
        try {
            debugLog("Confirming delete all chats");
            const response = await axios.delete(`${API_BASE_URL}/conversations/all`, apiOptions);

            if (response.status === 200 && isMounted.current) {
                setConversations([]);
                // Clear answer history in parent component
                setAnswerHistory([]);
                debugLog("All conversations deleted successfully");
            }
        } catch (error) {
            console.error('Error deleting all conversations:', error);
            alert('Failed to delete all conversations. Please try again.');
        } finally {
            if (isMounted.current) {
                setShowDeleteAll(false);
            }
        }
    };

    const cancelDeleteAllChats = () => {
        setShowDeleteAll(false);
    };

    const handleLogout = () => {
        debugLog("Logout requested");
        axios.get(`${API_BASE_URL}/logout`, apiOptions)
            .then(res => {
                if (res.data.Status === "success") {
                    debugLog("Logout successful, redirecting to login");
                    navigate("/Login", { replace: true });
                } else {
                    debugLog("Logout failed");
                    alert("Error logging out");
                }
            })
            .catch(err => {
                console.error("Logout error:", err);
                // Force logout on error
                navigate("/Login", { replace: true });
            });
    };

    // Improved New Chat handler with proper state management
    const handleNewChat = () => {
        debugLog("New chat requested");
        
        // 1. Clear localStorage
        try {
            localStorage.removeItem("chatHistory");
            debugLog("Chat history cleared from localStorage");
        } catch (e) {
            console.error("Error clearing localStorage:", e);
        }
        
        // 2. Clear answer history in parent component
        setAnswerHistory([]); // This will update the parent component
        debugLog("Answer history state cleared");
        
        // 3. Close the sidebar
        setIsActive(false);
        debugLog("Sidebar closed");
        
        // 4. Show explicit success message
        console.log("New chat initiated successfully");
    };

    const handleConversationClick = (conv) => {
        debugLog(`Conversation clicked: ${conv._id}`);
        
        // Update answer history in parent component
        setAnswerHistory(prevHistory => {
            const updatedHistory = [...prevHistory, {
                question: conv.question,
                answer: conv.answer
            }];
            debugLog(`Answer history updated with ${conv.question}`);
            return updatedHistory;
        });
        
        // Close the sidebar
        setIsActive(false);
        debugLog("Sidebar closed after conversation click");

        // Scroll to bottom after a delay
        setTimeout(() => {
            const chatHistoryElement = document.querySelector('.para');
            if (chatHistoryElement) {
                chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
                debugLog("Scrolled to bottom of chat history");
            } else {
                debugLog("Could not find chat history element to scroll");
            }
        }, 200);
    };

    return (
        <>
            <div
                className={`fixed h-[100vh] shadow-lg left-0 top-0 z-10 rounded-lg transition-all duration-300
                    ${isActive ? 'translate-x-0' : '-translate-x-full'}
                    ${theme === "light" ? "bg-white text-[#501854] border" : "bg-[#1D121A] text-white"}
                    w-[70%] md:w-[15vw]`}
            >
                <div className="w-full h-full flex flex-col">
                    {/* Close button */}
                    <button
                        className="flex items-center py-4 pl-3 cursor-pointer"
                        onClick={handleToggle}
                        aria-label="Close sidebar"
                    >
                        <i className={`fa-solid fa-right-from-bracket text-[15px] md:text-lg p-2 rounded-md transition duration-100 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"}`}></i>
                        <span className={`ml-2 text-base animated-h3 text-[14px] md:text-lg font-bold ${isVisible ? 'visible' : ''}`}>
                            Close
                        </span>
                    </button>

                    <div className="flex-1 flex flex-col pl-3">
                        {/* New Chat button */}
                        <button
                            className="flex items-center py-2 cursor-pointer"
                            onClick={handleNewChat}
                            aria-label="Start new chat"
                        >
                            <i className={`fa-solid fa-plus text-lg p-2 rounded-md transition duration-100 text-[15px] md:text-lg ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"}`}></i>
                            <span className={`ml-2 text-base animated-h3 text-[14px] md:text-lg font-bold ${isVisible ? 'visible' : ''}`}>
                                New Chat
                            </span>
                        </button>

                        {/* Recent Search */}
                        <div className="history mt-20 flex-1">
                            <h1 className='font-medium text-[15px] md:text-lg'>Recent Search</h1>
                            <div className='mt-3 overflow-y-auto max-h-[40vh] custom-scrollbar overflow-x-hidden'>
                                <ul className='list-none'>
                                    {conversations.map((conv, index) => (
                                        <li
                                            key={`conv-${index}-${conv._id}`}
                                            className={`text-[10px] md:text-[13px] rounded-lg p-3 flex items-center justify-between transition-all duration-200 group relative hover:pr-8 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-[#2C2431]"} ${isVisible ? 'visible' : ''}`}
                                            onClick={() => handleConversationClick(conv)}
                                        >
                                            <span className='font-medium truncate pr-2 cursor-pointer'>
                                                {conv.question}
                                            </span>
                                            <button
                                                className={`absolute right-2 opacity-0 group-hover:opacity-100 text-[12px] md:text-[13px] transition-all duration-300 transform translate-x-3 group-hover:translate-x-0 cursor-pointer p-2 rounded-md ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"}`}
                                                onClick={(e) => handleDeleteClick(conv, e)}
                                                aria-label="Delete conversation"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="setting flex items-center py-4 mt-auto mb-20">
                            <button
                                className={`flex items-center w-full`}
                                onClick={() => setShowSettingsPopup(true)}
                                aria-label="Open settings"
                            >
                                <i className={`fa-solid fa-gear text-lg p-2 rounded-md transition duration-100 text-[12px] md:text-lg ${theme === "light" ? "hover:bg-[#f8f4f8]" : "hover:bg-gray-700"}`}></i>
                                <span className={`ml-2 text-base animated-h3 text-[14px] md:text-lg font-bold ${isVisible ? 'visible' : ''}`}>
                                    Settings
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Popup */}
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

            {/* Delete All Chats Confirmation Popup */}
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

            {/* Settings Popup */}
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
