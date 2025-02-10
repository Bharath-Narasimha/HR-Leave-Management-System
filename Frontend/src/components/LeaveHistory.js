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
    <div className="p-6">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:bg-gray-700">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Start Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            End Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Reason
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {leaveHistory.map((leave) => (
          <tr key={leave.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {leave.type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {formatDate(leave.startDate)}
              {leave.startDayType === "Half Day" && (
                <span className="ml-2 text-xs text-gray-400">(Half Day)</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {formatDate(leave.endDate)}
              {leave.endDayType === "Half Day" && (
                <span className="ml-2 text-xs text-gray-400">(Half Day)</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
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
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
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
