import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie to access cookies
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  
  // Return the formatted date
  return `${day}/${month}/${year}`; // Change format if necessary (e.g., "MM/DD/YYYY")
};
const LeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the employeeId from cookies (userInfo should be set when the user logs in)
    const userInfo = Cookies.get("userInfo");

    if (userInfo) {
      const { id } = JSON.parse(userInfo); // Assuming the cookie contains the employeeId as JSON

      // Fetch the leave history for the employee
      const fetchLeaveHistory = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/leave-history/${id}`);
          setLeaveHistory(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching leave history:", error);
          setLoading(false);
        }
      };

      fetchLeaveHistory();
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-28">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-start">
        Leave History
      </h2>

      {/* Mobile Layout */}
      <div className="space-y-6 sm:hidden">
        {leaveHistory.map((leave) => (
          <div
            key={leave.id}
            className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-4 border border-gray-200 dark:border-gray-700 backdrop-blur-md bg-opacity-60 dark:bg-opacity-60 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                {leave.type}
              </span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  leave.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : leave.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {leave.status}
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              <strong>Start:</strong> {formatDate(leave.startDate)}{" "}
              {leave.startDayType === "Half Day" && (
                <span className="text-xs text-gray-400">(Half Day)</span>
              )}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              <strong>End:</strong> {formatDate(leave.endDate)}{" "}
              {leave.endDayType === "Half Day" && (
                <span className="text-xs text-gray-400">(Half Day)</span>
              )}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <strong>Reason:</strong> {leave.reason}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-60 dark:bg-opacity-60 border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gradient-to-r from-indigo-200 to-indigo-300 dark:from-gray-700 dark:to-gray-800">
            <tr>
              {["Type", "Start Date", "End Date", "Status", "Reason"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {leaveHistory.map((leave) => (
              <tr
                key={leave.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-600 dark:text-indigo-400">
                  {leave.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {formatDate(leave.startDate)}{" "}
                  {leave.startDayType === "Half Day" && (
                    <span className="ml-2 text-xs text-gray-400">
                      (Half Day)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {formatDate(leave.endDate)}{" "}
                  {leave.endDayType === "Half Day" && (
                    <span className="ml-2 text-xs text-gray-400">
                      (Half Day)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      leave.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : leave.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {leave.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveHistory;
