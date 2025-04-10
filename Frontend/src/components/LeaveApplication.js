import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { BriefcaseIcon } from "@heroicons/react/solid";
const LeaveApplication = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    startDayType: "Full Day",
    endDayType: "Full Day",
    reason: "",
  });

  const [employee, setEmployee] = useState({ id: "", firstName: "", lastName: "" });
  const [totalLeaveDays, setTotalLeaveDays] = useState(0);
  const [publicHolidays, setPublicHolidays] = useState(new Set());
  const [leaveBalances, setLeaveBalances] = useState({ plBalance: 0, clBalance: 0 });
  const [remainingPL, setRemainingPL] = useState(0);
  const [remainingCL, setRemainingCL] = useState(0);

  useEffect(() => {
    const employeeData = Cookies.get("userInfo");
    if (employeeData) {
      try {
        const parsedEmployee = JSON.parse(employeeData);
        if (parsedEmployee && parsedEmployee.id) {
          setEmployee({ id: parsedEmployee.id, firstName: parsedEmployee.firstName, lastName: parsedEmployee.lastName });
        }
      } catch (error) {
        console.error("Error parsing employee data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchPublicHolidays = async () => {
      try {
        const response = await fetch("http://localhost:3000/leave-public-holidays");
        if (response.ok) {
          const holidays = await response.json();
  
          // Convert the holiday dates to 'YYYY-MM-DD' format for comparison
          const formattedHolidays = new Set(
            holidays.map(h => new Date(h.date).toISOString().split("T")[0]) // Extract date part only
          );
  
          setPublicHolidays(formattedHolidays);
        }
      } catch (error) {
        console.error("Error fetching public holidays:", error);
      }
    };
  
    fetchPublicHolidays();
  }, []);

  useEffect(() => {
    calculateLeaveDays();
  }, [formData.startDate, formData.endDate, formData.startDayType, formData.endDayType, formData.leaveType, publicHolidays]);

  const calculateLeaveDays = () => {
    let startDate = new Date(formData.startDate);
    let endDate = new Date(formData.endDate);
    let count = 0;

    if (startDate > endDate) {
      setTotalLeaveDays(0);
      return;
    }

    let isStartDateCounted = false;

    while (startDate <= endDate) {
      const dayOfWeek = startDate.getDay();
      const formattedDate = startDate.toISOString().split('T')[0];
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPublicHoliday = publicHolidays.has(formattedDate);

      if (formData.leaveType === "CL" && formattedDate === formData.startDate && formData.startDayType === "Half Day" && !isWeekend && !isPublicHoliday && !isStartDateCounted) {
        count += 0.5;
        isStartDateCounted = true;
      }
      else if (formData.leaveType === "CL" && formattedDate === formData.endDate && formData.endDayType === "Half Day" && !isWeekend && !isPublicHoliday) {
        count += 0.5;
      }
      else if (!isWeekend && !isPublicHoliday) {
        count += 1;
      }

      startDate.setDate(startDate.getDate() + 1);
    }

    if (publicHolidays.has(formData.startDate) && formData.leaveType === "CL" && formData.startDayType === "Half Day") {
      count -= 0.5;
    }

    setTotalLeaveDays(count);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee.id) {
      alert("Employee ID is missing, please log in again.");
      return;
    }

    const leaveRequest = { 
      ...formData, 
      employeeId: employee.id,
      totalLeaveDays: totalLeaveDays 
    };
  
    try {
      const response = await fetch("http://localhost:3000/leave-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveRequest),
      });
      
      if (response.ok) {
        alert("Leave request submitted successfully!");
        setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" });
        setTotalLeaveDays(0);
      } else {
        const errorData = await response.json();
        alert("Failed to submit leave request: " + errorData.message);
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
    }
  };

  useEffect(() => {
    if (!employee.id) return;

    const fetchLeaveBalances = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/leave-balance/${employee.id}`);
        if (response.ok) {
          const data = await response.json();
          setLeaveBalances(data);
          setRemainingPL(data.plBalance);
          setRemainingCL(data.clBalance);
        }
      } catch (error) {
        console.error("Error fetching leave balances:", error);
      }
    };

    fetchLeaveBalances();
  }, [employee.id]);

  useEffect(() => {
    if (formData.leaveType === "PL") {
      setRemainingPL(leaveBalances.plBalance - totalLeaveDays);
    } else if (formData.leaveType === "CL") {
      setRemainingCL(leaveBalances.clBalance - totalLeaveDays);
    }
  }, [formData.leaveType, totalLeaveDays, leaveBalances]);

  // Conditional class for negative balances
  const negativeBalanceClass = (balance) => (balance < 0 ? "text-red-600" : "text-green-600");

  // Disable button if balance is negative
  const isButtonDisabled = (formData.leaveType === "PL" && remainingPL < 0) || (formData.leaveType === "CL" && remainingCL < 0);
  
return (
  <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-28">
    <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-6 py-6 sm:py-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-2 rounded-full">
            <BriefcaseIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold tracking-wide">Leave Application</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Applying as: <span className="font-semibold">{employee.firstName} {employee.lastName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Leave Type */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Leave Type</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4 text-gray-800"
              >
                <option value="">Select leave type</option>
                <option value="CL">Casual Leave</option>
                <option value="PL">Paid Leave</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                required
                className="w-full border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4 text-gray-800 resize-none"
                placeholder="Please provide the reason for your leave request"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4 text-gray-800"
                />
                {formData.leaveType === "CL" && (
                  <select
                    name="startDayType"
                    value={formData.startDayType}
                    onChange={handleChange}
                    className="w-full mt-2 border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4 text-gray-800"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4 text-gray-800"
                />
                {formData.leaveType === "CL" && (
                  <select
                    name="endDayType"
                    value={formData.endDayType}
                    onChange={handleChange}
                    className="w-full mt-2 border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4 text-gray-800"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                )}
              </div>
            </div>

            {/* Summary */}
            {formData.leaveType && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-inner">
                <h3 className="font-semibold text-indigo-700 mb-2">Leave Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-indigo-500">Total Days</p>
                    <p className="font-bold text-indigo-800">{totalLeaveDays} days</p>
                  </div>
                  <div>
                    <p className="text-indigo-500">Remaining</p>
                    <p className={`font-bold ${negativeBalanceClass(formData.leaveType === 'CL' ? remainingCL : remainingPL)}`}>
                      {formData.leaveType === "CL" ? remainingCL : remainingPL} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-10">
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full py-3 px-5 rounded-xl text-white font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isButtonDisabled 
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            }`}
          >
            {isButtonDisabled 
              ? "Insufficient Leave Balance" 
              : "Submit Leave Request"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
  
  
};

export default LeaveApplication;
