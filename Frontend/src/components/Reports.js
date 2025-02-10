import React, { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CalendarIcon } from "@heroicons/react/outline"

const Reports = () => {
  const [reportType, setReportType] = useState("leaveUsage")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  const leaveUsageData = [
    { name: "Jan", Sick: 4, Vacation: 2, Personal: 1 },
    { name: "Feb", Sick: 3, Vacation: 4, Personal: 2 },
    { name: "Mar", Sick: 2, Vacation: 6, Personal: 3 },
    { name: "Apr", Sick: 5, Vacation: 3, Personal: 1 },
    { name: "May", Sick: 1, Vacation: 5, Personal: 2 },
    { name: "Jun", Sick: 2, Vacation: 7, Personal: 0 },
  ]

  const employeePerformanceData = [
    { name: "John", Performance: 85, Attendance: 95 },
    { name: "Jane", Performance: 92, Attendance: 98 },
    { name: "Bob", Performance: 78, Attendance: 88 },
    { name: "Alice", Performance: 88, Attendance: 92 },
    { name: "Charlie", Performance: 95, Attendance: 97 },
  ]

  const leaveDistributionData = [
    { name: "Sick Leave", value: 30 },
    { name: "Vacation", value: 45 },
    { name: "Personal", value: 15 },
    { name: "Maternity", value: 10 },
  ]

  const leaveBalanceData = [
    { name: "John", Sick: 5, Vacation: 10, Personal: 3 },
    { name: "Jane", Sick: 7, Vacation: 8, Personal: 2 },
    { name: "Bob", Sick: 3, Vacation: 12, Personal: 1 },
    { name: "Alice", Sick: 6, Vacation: 9, Personal: 3 },
    { name: "Charlie", Sick: 4, Vacation: 11, Personal: 2 },
  ]

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({ ...prev, [name]: value }))
  }

  const renderChart = () => {
    switch (reportType) {
      case "leaveUsage":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={leaveUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sick" fill="#8884d8" />
              <Bar dataKey="Vacation" fill="#82ca9d" />
              <Bar dataKey="Personal" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        )
      case "employeePerformance":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={employeePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Performance" stroke="#8884d8" />
              <Line type="monotone" dataKey="Attendance" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        )
      case "leaveDistribution":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie dataKey="value" data={leaveDistributionData} fill="#8884d8" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      case "leaveBalance":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={leaveBalanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sick" fill="#8884d8" />
              <Bar dataKey="Vacation" fill="#82ca9d" />
              <Bar dataKey="Personal" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Reports</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="leaveUsage">Leave Usage</option>
              <option value="employeePerformance">Employee Performance</option>
              <option value="leaveDistribution">Leave Distribution</option>
              <option value="leaveBalance">Leave Balance</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="date"
                name="start"
                id="startDate"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={dateRange.start}
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="date"
                name="end"
                id="endDate"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={dateRange.end}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {reportType === "leaveUsage" && "Leave Usage Report"}
            {reportType === "employeePerformance" && "Employee Performance Report"}
            {reportType === "leaveDistribution" && "Leave Distribution Report"}
            {reportType === "leaveBalance" && "Leave Balance Report"}
          </h2>
          {renderChart()}
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Summary</h3>
          <p className="text-gray-600 dark:text-gray-300">
            This report shows data for the period from {dateRange.start || "[Start Date]"} to{" "}
            {dateRange.end || "[End Date]"}.
            {reportType === "leaveUsage" && " It displays the usage of different types of leave over time."}
            {reportType === "employeePerformance" && " It compares employee performance and attendance metrics."}
            {reportType === "leaveDistribution" &&
              " It shows the distribution of different types of leave taken by employees."}
            {reportType === "leaveBalance" &&
              " It displays the current leave balance for each employee across different leave types."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Reports



