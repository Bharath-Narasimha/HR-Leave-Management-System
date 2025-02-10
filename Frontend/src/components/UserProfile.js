import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/solid";
import axios from "axios";

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
    <div className="min-h-screen flex items-center justify-center bg-blue-100 py-6">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg transform hover:scale-100 transition duration-300 ease-in-out">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center tracking-wide">
          User Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center mb-5">
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="h-32 w-32 rounded-full border-4 border-gray-300 shadow-md"
              />
            ) : (
              <UserCircleIcon className="h-32 w-32 text-gray-400 bg-gray-100 p-3 rounded-full shadow-md" />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600" htmlFor="email">
              Email
            </label>
            <p className="text-xl text-gray-800 font-medium">{profileData.email}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600" htmlFor="joiningDate">
              Joining Date
            </label>
            <input
              type="date"
              id="joiningDate"
              name="joiningDate"
              value={profileData.joiningDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 focus:ring-indigo-600 focus:border-indigo-600 shadow-md p-3 text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600" htmlFor="designation">
              Designation
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={profileData.designation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 focus:ring-indigo-600 focus:border-indigo-600 shadow-md p-3 text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600" htmlFor="department">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={profileData.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 focus:ring-indigo-600 focus:border-indigo-600 shadow-md p-3 text-gray-800"
            />
          </div>

          <div className="mt-5">
            <button
              type="submit"
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 shadow-md transition duration-200 ease-in-out"
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
