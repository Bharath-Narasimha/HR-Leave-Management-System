import React, { useState, useEffect } from "react";
import axios from "axios";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

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
const handleCancelRequest= async (id)=>{
  console.log(id);
  try {
    await axios.delete(`http://localhost:3000/delete-leave-record/${id}`);
    alert("Leave request cancelled successfully.");
    console.log(`request id ${id}`);
    fetchLeaveHistory(); // Refresh the list after deletion
  } catch (error) {
    console.error("Error cancelling leave:", error);
    alert("Failed to cancel leave request.");
  }

}
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
    <div className="p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
    <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
      <input
        type="text"
        placeholder="Search by employee name..."
        value={searchName}
        onChange={handleSearchChange}
        className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={() => handleSearchChange("")}
        className="text-indigo-700 border border-indigo-500 hover:bg-indigo-100 rounded-lg px-4 py-2"
      >
        Clear
      </button>
    </div>

    <div className="overflow-x-auto rounded-xl border shadow-md bg-white dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800">
          <tr>
            {["EmployeeId", "Name", "Type", "Start Date", "End Date", "Reason", "Total Days", "Status", "Action"].map(header => (
              <th
                key={header}
                className="text-xs uppercase text-indigo-700 dark:text-indigo-300 tracking-wider px-6 py-3 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
          {currentRecords.map((record) => (
            <tr key={record.id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{record.employeeId}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{record.name}</td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{record.type}</td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {format(new Date(record.startDate), "dd MMM yyyy")}
                {record.startDayType === "Half Day" && (
                  <span className="ml-2 text-xs text-indigo-500">(Half)</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {format(new Date(record.endDate), "dd MMM yyyy")}
                {record.endDayType === "Half Day" && (
                  <span className="ml-2 text-xs text-indigo-500">(Half)</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{record.reason}</td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{record.totalLeaveDays}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    record.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : record.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {record.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {(record.status === "Pending" || record.status === "Approved") && (
                  <button
                    onClick={() => handleCancelRequest(record.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-400 px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {totalPages > 1 && (
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )}
  </div>

  

  );
};

export default EmployeeLeaveHistory;
