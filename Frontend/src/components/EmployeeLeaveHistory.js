import React, { useState, useEffect } from "react";
import axios from "axios";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const EmployeeLeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredLeaveHistory, setFilteredLeaveHistory] = useState([]);
  const [searchName, setSearchName] = useState(""); // State for search input
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [itemsPerPage] = useState(5); // Items per page

  // Fetch leave history of all employees from the backend
  const fetchLeaveHistory = async () => {
    console.log("🔍 Fetching leave history...");
    try {
      const response = await axios.get("http://localhost:3000/leaves/all");
      console.log("✅ API Response:", response.data);
      setLeaveHistory(response.data);
      setFilteredLeaveHistory(response.data); // Initially, display all records
    } catch (error) {
      console.error("❌ API Error:", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);

    // Filter the leave history based on the input value
    if (value === "") {
      setFilteredLeaveHistory(leaveHistory); // If search is cleared, show all
    } else {
      const filtered = leaveHistory.filter((record) =>
        record.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLeaveHistory(filtered); // Set the filtered leave history
    }
  };

  // Change page and update the filtered data based on the page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Get the current page's leave history data (paginated)
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredLeaveHistory.slice(indexOfFirstRecord, indexOfLastRecord);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredLeaveHistory.length / itemsPerPage);

  // Fetch leave history when the component mounts
  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
  {/* Search Input */}
  <div className="mb-6 flex items-center space-x-4">
    <input
      type="text"
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 dark:focus:ring-blue-400"
      placeholder="Search by employee name..."
      value={searchName}
      onChange={handleSearchChange}
    />
    <button
      className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
      onClick={() => handleSearchChange("")}
    >
      Clear
    </button>
  </div>

  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:bg-gray-700">
        <tr>
          {['EmployeeId', 'Name', 'Type', 'Start Date', 'End Date', 'Reason', 'Total Leave Days', 'Status'].map((header) => (
            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {currentRecords.map((record) => (
          <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.employeeId}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.type}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {formatDate(record.startDate)}
              {record.startDayType === "Half Day" && <span className="ml-2 text-xs text-gray-400">(Half Day)</span>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {formatDate(record.endDate)}
              {record.endDate === "Half Day" && <span className="ml-2 text-xs text-gray-400">(Half Day)</span>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.reason}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.totalLeaveDays}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : record.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {record.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination Controls */}
  {totalPages > 1 && (
    <div className="flex justify-between items-center mt-6">
      <button
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </div>
      <button
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )}
</div>

  

  );
};

export default EmployeeLeaveHistory;
