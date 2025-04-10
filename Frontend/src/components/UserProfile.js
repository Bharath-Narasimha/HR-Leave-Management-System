import { useState, useEffect } from "react";
//import { UserCircleIcon } from "@heroicons/react/solid";
import axios from "axios";
import { UserCircleIcon } from 'lucide-react';
const UserProfile = ({ user, onUpdateUser }) => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    joiningDate: "",
    designation: "",
    department: "",
    profileImage: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.firstName || "",
        email: user.email || "",
        joiningDate: user.joiningDate || "",
        designation: user.designation || "",
        department: user.department || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:3000/user/${user.id}`, profileData);

      if (response.status === 200) {
        onUpdateUser(profileData);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-indigo-600 p-6">
        <h2 className="text-2xl font-bold text-white text-center">
          User Profile
        </h2>
      </div>
      
      <div className="relative -mt-12 flex justify-center">
        {profileData.profileImage ? (
          <img
            src={profileData.profileImage || "/placeholder.svg"}
            alt="Profile"
            className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover"
          />
        ) : (
          <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
            <UserCircleIcon className="h-20 w-20 text-indigo-300" />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 pt-4">
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-800 font-medium">{profileData.email}</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700" htmlFor="joiningDate">
              Joining Date
            </label>
            <input
              type="date"
              id="joiningDate"
              name="joiningDate"
              value={profileData.joiningDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-gray-700 text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700" htmlFor="designation">
              Designation
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={profileData.designation}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-gray-700 text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700" htmlFor="department">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={profileData.department}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-gray-700 text-sm"
            />
          </div>
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-200 ease-in-out flex items-center justify-center"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default UserProfile;
