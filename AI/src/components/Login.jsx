import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showLanding, setShowLanding] = useState(false);
  const [bgBlack, setBgBlack] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  axios.defaults.withCredentials = true;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      setMessage({ text: "Please fill in all fields!", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      return;
    }

    axios
      .post("https://api-ai-1-lz3k.onrender.com/login", { email, password })
      .then((result) => {
        if (result.data.Status === "success") {
          if (result.data.role === "admin") {
            setMessage({ text: "Login successful!", type: "success" });
            setBgBlack(true);
            setShowLanding(true);
            
            axios.get(`https://api-ai-1-lz3k.onrender.com/userdata/email/${email}`)
              .then(userRes => {
                const userId = userRes.data.user._id;
                setTimeout(() => {
                  axios.get("https://a-8-rgdf.onrender.com/verify-token", { withCredentials: true })
                    .then(() => {
                      navigate(`/chat/${userId}`);
                    })
                    .catch(err => {
                      console.error("Token verification failed:", err);
                      navigate("/chat/user");
                    });
                }, 4000);
              })
              .catch(err => {
                console.error("Error fetching user data:", err);
                setTimeout(() => {
                  navigate("/chat/user");
                }, 4000);
              });
          }
        } else {
          setMessage({
            text: "No user found, please signup first",
            type: "error",
          });
        }
        setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      })
      .catch(() => {
        setMessage({ text: "Login failed. Please check your Email and password.", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      });
  };
  return (
    <div className={`min-h-screen w-full flex justify-center items-center font-poppins transition-colors duration-1000 ${bgBlack ? "bg-black" : "bg-white"} px-4 py-8`}>
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-4 py-2 sm:px-6 sm:py-3 rounded-md text-white shadow-lg z-50 text-sm sm:text-base ${message.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {showLanding ? (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-white text-center"
          >
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Welcome to AI Assistant
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl"
            >
              Loading your experience...
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-white animate-spin mx-auto"></div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md p-6 sm:p-8 text-black rounded-xl shadow-2xl bg-white"
          >
            <div className="text-center">
              <h1 className="text-xl md:text-2xl  font-poppins text-[#2c3e50] font-bold mb-2">Welcome to AI Assistant</h1>
              <p className="text-[12px] md:text-[14px] text-[#7f8c8d]">Login to continue your journey.</p>
            </div>
            <form className="mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="peer mt-1 block w-full px-4 py-2 text-[12px]  md:text-[16px] sm:py-3 border border-gray-300 font-poppins rounded-lg shadow-sm placeholder:text-transparent text-black outline-none focus:outline focus:outline-[#551230] focus:border-[#551230] transition-all"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 text-xs sm:text-sm font-poppins transition-all duration-200 pointer-events-none ${email ? "top-[-10px] text-[10px] sm:text-[12px] text-[#551230]" : "top-3 sm:top-4 text-sm sm:text-base text-[#551230]"
                    } bg-white px-1`}
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type="password"
                  className="peer mt-1 block w-full px-4 py-2 sm:py-3 border text-[12px] md:text-[16px]  border-gray-300 font-poppins rounded-lg shadow-sm placeholder:text-transparent text-black outline-none focus:outline focus:outline-[#551230] focus:border-[#551230] transition-all"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label
                  htmlFor="password"
                  className={`absolute left-3 text-xs sm:text-sm font-poppins transition-all duration-200 pointer-events-none ${password ? "top-[-10px] text-[10px] sm:text-[12px] text-[#551230]" : "top-3 sm:top-4 text-sm sm:text-base text-[#551230]"
                    } bg-white px-1`}
                >
                  Password
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 sm:py-3 px-4 border-2 font-poppins rounded-xl shadow-md text-sm font-medium text-[#551230] hover:bg-[#551230] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#771940] focus:ring-opacity-50 transition-all transform hover:scale-105 active:scale-95"
              >
                Login
              </button>
            </form>
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-[#7f8c8d] font-poppins">
                Don't Have an Account?{' '}
                <Link to="/" className="text-[#771940] hover:text-[#551230] font-semibold underline">Sign Up Here</Link>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Login;
