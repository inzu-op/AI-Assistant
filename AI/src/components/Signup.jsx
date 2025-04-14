import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    axios.defaults.withCredentials = true;
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!name || !email || !password) {
            setMessage({ text: "Please fill in all fields!", type: "error" });
            setTimeout(() => setMessage({ text: "", type: "" }), 2000);
            return;
        }
        axios.post("https://api-ai-1-lz3k.onrender.com/signup", { name, email, password })
            .then(result => {
                if (result.data === "success") {
                    setMessage({ text: "Signup successful! Redirecting...", type: "success" });
                    setTimeout(() => navigate("/Login"), 2000);
                }
            })
            .catch(err => {
                setMessage({ text: err.message, type: "error" });
                setTimeout(() => setMessage({ text: "", type: "" }), 2000);
            });
    };

    return (
        <div className="min-h-screen flex justify-center items-center font-poppins bg-gradient-to-br from-gray-100 to-gray-300 p-4 sm:p-6 lg:p-8">
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`fixed top-4 sm:top-10 left-1/2 transform -translate-x-1/2 px-4 py-2 sm:px-6 sm:py-3 rounded-md text-white shadow-lg z-50 text-sm sm:text-base ${
                            message.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="w-full max-w-md p-6 sm:p-8 rounded-xl shadow-2xl bg-white">
                <div className="text-center">
                    <h1 className="text-xl sm:text-3xl font-bold text-[#2c3e50] mb-2">Create Your Account</h1>
                    <p className="text-[10px] sm:text-sm text-[#7f8c8d]">Join us to get started with your journey.</p>
                </div>
                
                <form className="mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                    <div className="relative">
                        <input
                            id="name"
                            type="text"
                            className="peer block w-full px-4 py-2 text-[12px] md:text-[16px] sm:py-3 border border-gray-300 rounded-lg shadow-sm text-black outline-none focus:outline-[#551230] focus:border-[#551230] transition-all"
                            placeholder=" "
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <label 
                            htmlFor="name" 
                            className={`absolute left-3 text-xs sm:text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                                name ? "top-[-10px] text-[10px] sm:text-[12px] text-[#551230]" 
                                     : "top-2 sm:top-3 text-sm sm:text-base text-[#551230]"
                            }`}
                        >
                            Full Name
                        </label>
                    </div>
                    
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            className="peer block w-full px-4 py-2 sm:py-3 text-[12px] md:text-[16px] border border-gray-300 rounded-lg shadow-sm text-black outline-none focus:outline-[#551230] focus:border-[#551230] transition-all"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label 
                            htmlFor="email" 
                            className={`absolute left-3 text-xs sm:text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                                email ? "top-[-10px] text-[10px] sm:text-[12px] text-[#551230]" 
                                      : "top-2 sm:top-3 text-sm sm:text-base text-[#551230]"
                            }`}
                        >
                            Email Address
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            id="password"
                            type="password"
                            className="peer block w-full px-4 py-2 sm:py-3 border text-[12px] md:text-[16px] border-gray-300 rounded-lg shadow-sm text-black outline-none focus:outline-[#551230] focus:border-[#551230] transition-all"
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label 
                            htmlFor="password" 
                            className={`absolute left-3 text-xs sm:text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                                password ? "top-[-10px] text-[10px] sm:text-[12px] text-[#551230]" 
                                         : "top-2 sm:top-3 text-sm sm:text-base text-[#551230]"
                            }`}
                        >
                            Password
                        </label>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-2 sm:py-3 px-4 border-2 rounded-xl shadow-md text-sm font-medium text-[#771940] bg-white hover:bg-[#551230] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#771940] focus:ring-opacity-50 transition-all transform hover:scale-105 active:scale-95"
                    >
                        Sign Up
                    </button>
                </form>
                
                <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-xs sm:text-sm text-[#7f8c8d]">
                        Already Have an Account?{" "}
                        <Link 
                            to="/Login" 
                            className="text-[#551230] hover:text-[#771940] font-semibold underline"
                        >
                            Login Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
