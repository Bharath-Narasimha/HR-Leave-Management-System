import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Registration from "./Registration";

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Make a POST request to the backend API for login
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      credentials: "include", // This sends cookies with the request
    })
      .then((response) => response.json())
      .then((data) => {
        // Once login is successful, check the cookies for user info
        const userInfo = JSON.parse(decodeURIComponent(document.cookie.split('; ').find(row => row.startsWith('userInfo=')).split('=')[1]));

        if (userInfo) {
          setUser({
            id: userInfo.id,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            role: userInfo.role,
          });
          navigate("/"); // Redirect to the home page after successful login
        } else {
          alert("Login failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during login");
      });
  };

  const handleRegister = (formData) => {
    console.log("Registration data:", formData);
    setUser({ username: formData.email, role: formData.employeeType });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {isLogin ? (
          <form className="bg-white p-8 rounded-lg shadow-xl space-y-6" onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign in to your LMS</h2>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Email address"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
            <div className="text-center">
              <button
                type="button" // Prevent form submission for toggle
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isLogin ? "Need an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </form>
        ) : (
          <Registration onRegister={handleRegister} />
        )}
      </div>
    </div>
  );
};

export default Login;
