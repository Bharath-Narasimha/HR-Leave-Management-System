import React, { useState, useEffect } from "react";
import { CalendarIcon, CheckCircleIcon, AdjustmentsIcon } from "@heroicons/react/outline";
import axios from "axios";
import Cookies from "js-cookie";

const StatCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
  <div className={`p-6 rounded-lg shadow-lg bg-gradient-to-r ${bgColor} text-white`}>
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${textColor} shadow-lg`}>
        <Icon className="h-10 w-10 text-white" />
      </div>
      <div className="ml-4">
        <p className="mb-2 text-sm font-medium">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = ({ user }) => {
  const [clBalance, setClBalance] = useState("0 days");
  const [plBalance, setPlBalance] = useState("0 days");
  const [upcomingHolidays, setUpcomingHolidays] = useState(0);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(Cookies.get("userInfo"));
        if (userInfo && userInfo.id) {
          const balanceResponse = await axios.get(`http://localhost:3000/get-balances/${userInfo.id}`);
          setClBalance(`${balanceResponse.data.clBalance} days`);
          setPlBalance(`${Math.floor(balanceResponse.data.plBalance)} days`);

          const leaveHistoryResponse = await axios.get(`http://localhost:3000/get-leave-history/${userInfo.id}`);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const filteredLeaveHistory = leaveHistoryResponse.data.filter((leave) => {
            const leaveStartDate = new Date(leave.startDate);
            return leaveStartDate >= tomorrow || leave.status === "Rejected";
          }).map((leave) => ({
            ...leave,
            formattedStartDate: formatDate(leave.startDate),
            formattedEndDate: formatDate(leave.endDate),
          }));

          setLeaveHistory(filteredLeaveHistory);

          const holidaysResponse = await axios.get("http://localhost:3000/get-upcoming-holidays");
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

  const stats = [
    {
      title: "PL Balance",
      value: loading ? "Loading..." : plBalance,
      icon: CheckCircleIcon,
      bgColor: "from-green-400 to-green-500",
      textColor: "bg-green-500",
    },
    {
      title: "CL Balance",
      value: loading ? "Loading..." : clBalance,
      icon: AdjustmentsIcon,
      bgColor: "from-blue-400 to-blue-500",
      textColor: "bg-blue-500",
    },
    {
      title: "Upcoming Holidays",
      value: loading ? "Loading..." : `${upcomingHolidays}`,
      icon: CalendarIcon,
      bgColor: "from-yellow-400 to-yellow-500",
      textColor: "bg-yellow-500",
    },
  ];

  const renderLeaveHistoryAsNotifications = () => {
    return leaveHistory.map((leave) => (
      <li key={leave.id} className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            Your {leave.type} leave request from {leave.formattedStartDate} to {leave.formattedEndDate}.
          </p>
          <p className="text-sm text-gray-500 truncate">{`Status: ${leave.status}`}</p>
        </div>
      </li>
    ));
  };

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case "hr":
        return (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">HR Dashboard</h2>
            <p className="text-gray-600">Welcome to the HR dashboard. Manage employee records and leave requests.</p>
          </div>
        );
      case "manager":
        return (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Manager Dashboard</h2>
            <p className="text-gray-600">Manage and approve leave requests for your team.</p>
          </div>
        );
      default:
        return (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Dashboard</h2>
            <p className="text-gray-600">View your leave balances, request time off, and check company announcements.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {renderRoleSpecificContent()}

      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
        <ul className="space-y-4">
          {loading ? (
            <li className="text-gray-500">Loading notifications...</li>
          ) : error ? (
            <li className="text-red-500">Error loading notifications.</li>
          ) : (
            renderLeaveHistoryAsNotifications()
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
