import React, { useState, useEffect } from "react";
import axios from "axios";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // Change this to your desired format
};

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
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Employee
              </th>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leaveRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {request.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {request.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(request.startDate)}
                  {request.startDayType === "Half Day" && (
                    <span className="ml-2 text-xs text-gray-400">(Half Day)</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(request.endDate)}
                  {request.endDayType === "Half Day" && (
                    <span className="ml-2 text-xs text-gray-400">(Half Day)</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(request)} // Trigger view and fetch balances
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-all duration-200 ease-in-out"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4 transition-all duration-200 ease-in-out"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 ease-in-out"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal View - Enhanced */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {selectedRequest.name}'s Leave Request
              </h3>
              <div className="mt-2">
                <table className="min-w-full table-auto">
                  <tbody>
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 font-medium text-left">
                        <strong>Type:</strong>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-left">
                        {selectedRequest.type}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 font-medium text-left">
                        <strong>Start Date:</strong>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-left">
                        {formatDate(selectedRequest.startDate)}
                        {selectedRequest.startDayType === "Half Day" && (
                          <span className="ml-2 text-xs text-gray-400">(Half Day)</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 font-medium text-left">
                        <strong>End Date:</strong>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-left">
                        {formatDate(selectedRequest.endDate)}
                        {selectedRequest.endDayType === "Half Day" && (
                          <span className="ml-2 text-xs text-gray-400">(Half Day)</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 font-medium text-left">
                        <strong>Reason:</strong>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-left">
                        {selectedRequest.reason}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 font-medium text-left">
                        <strong>Total Leave Days:</strong>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-left">
                        {selectedRequest.totalLeaveDays}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 font-medium text-left">
                        <strong>{selectedRequest.type === 'PL' ? 'Paid Leave' : 'Casual Leave'} Balance:</strong>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-left">
                        {selectedRequest.type === 'PL' ? plBalance : clBalance}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 font-medium text-left">
                        <strong>Remaining {selectedRequest.type === 'PL' ? 'Paid Leave' : 'Casual Leave'}:</strong>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-left">
                        {selectedRequest.type === 'PL'
                          ? plBalance - selectedRequest.totalLeaveDays
                          : clBalance - selectedRequest.totalLeaveDays}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 ease-in-out"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerApproval;
