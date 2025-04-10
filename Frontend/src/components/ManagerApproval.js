import React, { useState, useEffect } from "react";
import axios from "axios";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // Change this to your desired format
};
const Detail = ({ label, value }) => (
  <div className="text-sm">
    <div className="text-gray-500 dark:text-gray-400 font-semibold">{label}</div>
    <div className="text-gray-800 dark:text-gray-100">{value}</div>
  </div>
);
const ManagerApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [clBalance, setClBalance] = useState(0);
  const [plBalance, setPlBalance] = useState(0);

  // Fetch leave requests from the backend
  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get("http://localhost:3000/leave-requests");
      setLeaveRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  // Fetch balances for the selected employee
  const fetchLeaveBalances = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/leave-balances/${employeeId}`);
      setClBalance(response.data.clBalance);
      setPlBalance(response.data.plBalance);
    } catch (error) {
      console.error("Error fetching leave balances:", error);
    }
  };

  // Handle approving a leave request
  const handleApprove = async (id) => {
    try {
      // First, update the leave request status to "Approved"
      const updateHistoryResponse = await axios.put(`http://localhost:3000/update-leave-history/${id}`, { status: 'Approved' });
  
      if (updateHistoryResponse.status === 200) {
        // Find the selected request (leave request) and get the employeeId and leave type
        const request = leaveRequests.find((leave) => leave.id === id);
        const { employeeId, type, totalLeaveDays } = request;
  
        // Fetch leave balances for the employee
        const balanceResponse = await axios.get(`http://localhost:3000/api/leave-balances/${employeeId}`);
        const currentClBalance = balanceResponse.data.clBalance;
        const currentPlBalance = balanceResponse.data.plBalance;

        // Determine the type of leave (PL or CL) and update the balance
        let balanceUpdateUrl = '';
        let newBalance = 0;
  
        if (type === 'PL') {
          // Calculate the remaining Paid Leave balance
          newBalance = currentPlBalance - totalLeaveDays;
          balanceUpdateUrl = `http://localhost:3000/update-pl-balance/${employeeId}`;
        } else if (type === 'CL') {
          // Calculate the remaining Casual Leave balance
          newBalance = currentClBalance - totalLeaveDays;
          balanceUpdateUrl = `http://localhost:3000/update-cl-balance/${employeeId}`;
        }
  
        // Update the leave balance in the respective table
        const balanceUpdateResponse = await axios.put(balanceUpdateUrl, { balance: newBalance });
  
        if (balanceUpdateResponse.status === 200) {
          // If successful, delete the leave request from the system
          await axios.delete(`http://localhost:3000/leave-requests/${id}`);
  
          // Remove the approved leave from the UI
          setLeaveRequests((prevRequests) => prevRequests.filter((leave) => leave.id !== id));
        }
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
  };
  
  // Handle rejecting a leave request
  const handleReject = async (id) => {
    try {
      const updateHistoryResponse = await axios.put(`http://localhost:3000/update-leave-history/${id}`, { status: 'Rejected' });
      
      if (updateHistoryResponse.status === 200) {
        await axios.delete(`http://localhost:3000/leave-requests/${id}`);
        
        setLeaveRequests((prevRequests) => prevRequests.filter((leave) => leave.id !== id));
      }
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  // Fetch leave requests when the component mounts
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Handle the view button click to show the leave request details
  const handleView = (request) => {
    setSelectedRequest(request);
    fetchLeaveBalances(request.employeeId);  // Fetch balances for the employee
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
     <div className="sm:p-6 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-start">Leave Requests</h2>

      {/* Mobile Layout - Card View */}
      <div className="space-y-4 lg:hidden">
        {leaveRequests.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">No leave requests found.</div>
        )}
        {leaveRequests.map((request) => (
          <div
            key={request.id}
            className="bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-xl shadow p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{request.name}</h3>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full
                ${request.status === 'Pending' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  request.status === 'Approved' ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                {request.status}
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Type:</strong> {request.type}</p>
              <p>
                <strong>From:</strong> {formatDate(request.startDate)}
                {request.startDayType === 'Half Day' && <span className="text-xs text-gray-500 ml-1">(Half Day)</span>}
              </p>
              <p>
                <strong>To:</strong> {formatDate(request.endDate)}
                {request.endDayType === 'Half Day' && <span className="text-xs text-gray-500 ml-1">(Half Day)</span>}
              </p>
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <button
                onClick={() => handleView(request)}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              >
                View
              </button>
              <button
                onClick={() => handleApprove(request.id)}
                className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(request.id)}
                className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout - Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden">
          <thead className="bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">End Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {leaveRequests.map((request) => (
              <tr key={request.id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{request.name}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{request.type}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatDate(request.startDate)}
                  {request.startDayType === 'Half Day' && (
                    <span className="text-xs text-gray-500 ml-1">(Half Day)</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatDate(request.endDate)}
                  {request.endDayType === 'Half Day' && (
                    <span className="text-xs text-gray-500 ml-1">(Half Day)</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      request.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}
                  `}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handleView(request)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {leaveRequests.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 dark:text-gray-400 py-6">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Modal View - Enhanced */}
      {selectedRequest && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="relative w-full max-w-lg rounded-2xl shadow-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-all duration-300 ease-in-out animate-fade-in">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z" />
          </svg>
          {selectedRequest.name}'s Leave Request
        </h2>
        <button
          onClick={() => setSelectedRequest(null)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Detail label="Type" value={selectedRequest.type} />
          <Detail
            label="Total Leave Days"
            value={selectedRequest.totalLeaveDays}
          />
          <Detail
            label="Start Date"
            value={
              <>
                {formatDate(selectedRequest.startDate)}
                {selectedRequest.startDayType === "Half Day" && (
                  <span className="ml-1 text-xs text-gray-400">(Half Day)</span>
                )}
              </>
            }
          />
          <Detail
            label="End Date"
            value={
              <>
                {formatDate(selectedRequest.endDate)}
                {selectedRequest.endDayType === "Half Day" && (
                  <span className="ml-1 text-xs text-gray-400">(Half Day)</span>
                )}
              </>
            }
          />
          <Detail label="Reason" value={selectedRequest.reason} />
          <Detail
            label={`${selectedRequest.type === "PL" ? "Paid Leave" : "Casual Leave"} Balance`}
            value={selectedRequest.type === "PL" ? plBalance : clBalance}
          />
          <Detail
            label={`Remaining ${selectedRequest.type === "PL" ? "Paid Leave" : "Casual Leave"}`}
            value={
              selectedRequest.type === "PL"
                ? plBalance - selectedRequest.totalLeaveDays
                : clBalance - selectedRequest.totalLeaveDays
            }
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          onClick={() => setSelectedRequest(null)}
          className="px-6 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-150"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ManagerApproval;
