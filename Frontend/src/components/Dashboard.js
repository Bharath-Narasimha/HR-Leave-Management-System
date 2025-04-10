import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaCalendarCheck, FaCalendarTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Dashboard = ({ user }) => {
  // State for leave balances
  const [clBalance, setClBalance] = useState("0 days");
  const [plBalance, setPlBalance] = useState("0 days");
  const navigate = useNavigate();

  // Accrued & used
  const [accruedCL, setClAccrued] = useState(0);
  const [accruedPL, setPlAccrued] = useState(0);
  const [usedCL, setClUsed] = useState(0);
  const [usedPL, setPlUsed] = useState(0);
  const [clEntitlement,setclentitlement]=useState(0);
  const [carryforwardPL,setcarryforwardPL]=useState(0);
  // Other state
  const [upcomingHolidays, setUpcomingHolidays] = useState(0);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to format date
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const handleApplyLeave = () => {
    navigate('/leave-application'); // Redirect with leave type query param
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(Cookies.get("userInfo"));
        if (userInfo && userInfo.id) {
          // 1) Fetch CL & PL balances
          const balanceResponse = await axios.get(
            `http://localhost:3000/get-balances/${userInfo.id}`
          );
          setClBalance(`${balanceResponse.data.clBalance} days`);
          setPlBalance(`${Math.floor(balanceResponse.data.plBalance)} days`);
     
          // 2) Fetch accrued & used
          setClAccrued(balanceResponse.data.accruedCL);
          setPlAccrued(balanceResponse.data.accruedPL);
          setClUsed(balanceResponse.data.usedCL);
          setPlUsed(balanceResponse.data.usedPL);
          setcarryforwardPL(balanceResponse.data.carryForwardPL);
          setclentitlement(balanceResponse.data.clEntitlement);
          // 3) Fetch leave history
          const leaveHistoryResponse = await axios.get(
            `http://localhost:3000/get-leave-history/${userInfo.id}`
          );
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const filteredLeaveHistory = leaveHistoryResponse.data
            .filter((leave) => {
              const leaveStartDate = new Date(leave.startDate);
              return leaveStartDate >= tomorrow || leave.status === "Rejected";
            })
            .map((leave) => ({
              ...leave,
              formattedStartDate: formatDate(leave.startDate),
              formattedEndDate: formatDate(leave.endDate),
            }));

          setLeaveHistory(filteredLeaveHistory);

          // 4) Fetch upcoming holidays
          const holidaysResponse = await axios.get(
            "http://localhost:3000/get-upcoming-holidays"
          );
          setUpcomingHolidays(holidaysResponse.data.upcomingHolidays);
        }
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render notifications from leave history
  const renderLeaveHistoryAsNotifications = () => {
    return leaveHistory.map((leave) => (
      <li key={leave.id} className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            Your {leave.type} leave request from {leave.formattedStartDate} to{" "}
            {leave.formattedEndDate}.
          </p>
          <p className="text-sm text-gray-500 truncate">{`Status: ${leave.status}`}</p>
        </div>
      </li>
    ));
  };

  // Render content based on user role
  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case "hr":
        return (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              HR Dashboard
            </h2>
            <p className="text-gray-600">
              Welcome to the HR dashboard. Manage employee records and leave
              requests.
            </p>
          </div>
        );
      case "manager":
        return (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Manager Dashboard
            </h2>
            <p className="text-gray-600">
              Manage and approve leave requests for your team.
            </p>
          </div>
        );
      default:
        return (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Employee Dashboard
            </h2>
            <p className="text-gray-600">
              View your leave balances, request time off, and check company
              announcements.
            </p>
          </div>
        );
    }
  };

  // Loading / error states
  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-28">
      {/* Leave Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Casual Leave Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-5 rounded-t-2xl">
            <h2 className="text-2xl font-bold tracking-wide">Casual Leave</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Annual Entitlement</p>
                <p className="text-xl font-semibold">{clEntitlement} days</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Used Leave</p>
                <p className="text-xl font-semibold">{usedCL} days</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Accrued Leave</p>
                <p className="text-xl font-semibold">{accruedCL} days</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="text-xl font-semibold text-blue-600">{clBalance}</p>
              </div>
            </div>
            <button 
              className="w-full py-3 mt-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
              onClick={() => handleApplyLeave()}
            >
              Apply Leave
            </button>
          </div>
        </div>
  
        {/* Paid Leave Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-400 text-white p-5 rounded-t-2xl">
            <h2 className="text-2xl font-bold tracking-wide">Paid Leave</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Carry Forward PL</p>
                <p className="text-xl font-semibold">{carryforwardPL} days</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Used PL</p>
                <p className="text-xl font-semibold">{usedPL} days</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Accrued PL</p>
                <p className="text-xl font-semibold">{accruedPL} days</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="text-xl font-semibold text-green-600">{plBalance}</p>
              </div>
            </div>
            <button 
              className="w-full py-3 mt-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
              onClick={() => handleApplyLeave()}
            >
              Apply Leave
            </button>
          </div>
        </div>
      </div>
  
      {/* Role Specific Content */}
      <div className="mt-10">
        {renderRoleSpecificContent()}
      </div>
  
      {/* Upcoming Holidays */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 border border-yellow-100">
        <h2 className="text-2xl font-semibold text-yellow-600 mb-2">Upcoming Holidays</h2>
        <p className="text-gray-700 text-lg">{`${upcomingHolidays} holiday(s) coming up!`}</p>
      </div>
  
      {/* Notifications */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
        <ul className="space-y-3">
          {leaveHistory.length === 0 ? (
            <li className="text-gray-500 italic">No notifications.</li>
          ) : (
            renderLeaveHistoryAsNotifications()
          )}
        </ul>
      </div>
    </div>
  );
  
}

export default Dashboard;
