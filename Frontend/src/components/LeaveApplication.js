import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

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
    <div className="p-6 bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-300 rounded-lg shadow-xl">
  <p className="text-xl font-semibold text-gray-800 mb-6">
    Applying as: <strong>{employee.firstName} {employee.lastName}</strong>
  </p>
  <div className="bg-white p-8 rounded-lg shadow-lg">
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Leave Type</label>
        <select
          name="leaveType"
          value={formData.leaveType}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select leave type</option>
          <option value="CL">Casual Leave</option>
          <option value="PL">Paid Leave</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {formData.leaveType === "CL" && (
          <select
            name="startDayType"
            value={formData.startDayType}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Full Day">Full Day</option>
            <option value="Half Day">Half Day</option>
          </select>
        )}
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {formData.leaveType === "CL" && (
          <select
            name="endDayType"
            value={formData.endDayType}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Full Day">Full Day</option>
            <option value="Half Day">Half Day</option>
          </select>
        )}
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Reason</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows="2"
          required
          className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <p className="mb-4 text-sm font-semibold text-gray-700">Total Leave Days: {totalLeaveDays}</p>

      {formData.leaveType === "PL" && (
        <>
          <p className={`mb-4 text-sm font-semibold ${negativeBalanceClass(remainingPL)}`}>
            Remaining PL: {remainingPL}
          </p>
          <p className={`mb-4 text-sm font-semibold ${negativeBalanceClass(leaveBalances.plBalance)}`}>
            PL Balance: {leaveBalances.plBalance}
          </p>
        </>
      )}

      {formData.leaveType === "CL" && (
        <>
          <p className={`mb-4 text-sm font-semibold ${negativeBalanceClass(remainingCL)}`}>
            Remaining CL: {remainingCL}
          </p>
          <p className={`mb-4 text-sm font-semibold ${negativeBalanceClass(leaveBalances.clBalance)}`}>
            CL Balance: {leaveBalances.clBalance}
          </p>
        </>
      )}

      <button
        type="submit"
        className={`w-full p-3 rounded-lg text-white text-sm font-semibold ${isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-indigo-500 transition duration-200"}`}
        disabled={isButtonDisabled}
      >
        {isButtonDisabled ? "Leave cannot be applied due to low balance" : "Submit Leave Request"}
      </button>
    </form>
  </div>
</div>

  );
};

export default LeaveApplication;
