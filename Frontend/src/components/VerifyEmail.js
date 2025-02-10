import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyEmail = ({ setUser }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    if (token) {
      // Make the request to verify the email with the token
      fetch(`http://localhost:5000/verify-email?token=${token}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            setMessage(data.message);
            // Assuming your backend returns the user data upon successful verification
            setUser({
              id: data.id,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              role: data.role, // Update with the role after verification
            });
          } else {
            setMessage(data.error || 'An error occurred.');
            setIsError(true);
          }
        })
        .catch((error) => {
          setMessage('Error verifying email.');
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setMessage('Invalid verification link.');
      setIsError(true);
      setIsLoading(false);
    }
  }, [token, navigate, setUser]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-sm w-full p-6 bg-white shadow-lg rounded-lg">
        {isLoading ? (
          <p className="text-gray-600 text-center">Loading...</p>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-center text-gray-700">Email Verification</h2>
            <div className="mt-6 text-center">
                  <p className="mt-4 text-sm text-gray-600">
                    We have sent you The mail, After successful verification
                  </p>
                  <p className="mt-4 text-sm text-gray-600">
                    Please log in with your credentials to proceed.
                  </p>
                  <div className="mt-6">
                  <button
  onClick={() =>{ navigate('/login' , { replace: true }); console.log("Navigating to login...");}}
  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
  Go to Login Page
</button>
                      
                  </div>
              
             
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
