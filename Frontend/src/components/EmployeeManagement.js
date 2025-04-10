import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/outline";
import axios from "axios"; // Make sure axios is installed for API calls
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { Search } from "lucide-react"; 

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("employeeData");
  const [editEmployee, setEditEmployee] = useState(null); // Track employee to edit
  const [updatedEmployee, setUpdatedEmployee] = useState({
    name: "",
    email: "",
    employeeType: "",
    designation: "",
    department: "",
    joiningDate: new Date(),
    lastworkingDay: new Date(),
    status: "",
    plOpeningBalance:0,
  });
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [searchName, setSearchName] = useState(""); // Track the search term
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [recordsPerPage] = useState(5); // Records per page
  const [modalVisible, setModalVisible] = useState(false);
  const [clEntitlement, setClEntitlement] = useState(9);
  const [newClEntitlement, setNewClEntitlement] = useState(""); // New entitlement input
  // Function to filter employees by search name
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchName.toLowerCase())
  );

  // Calculate the index of the last record to display
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEmployees.slice(indexOfFirstRecord, indexOfLastRecord);

  // Calculate total pages
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  useEffect(() => {
    // Fetch employees from backend
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:3000/employees"); // Replace with your API endpoint
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employee data", error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3000/leave-balances")
      .then((response) => {
        setLeaveBalances(response.data);
      })
      .catch((error) => {
        console.error("Error fetching leave balances:", error);
      });
  }, []);

  const handleEditEmployee = (employee) => {
    setEditEmployee(employee);
    setUpdatedEmployee({
      name: employee.name,
      email: employee.email,
      employeeType: employee.employeetype, // Ensure this is set correctly
      designation: employee.designation,
      department: employee.department,
      joiningDate: employee.joiningDate,
      status: employee.status,
      plOpeningBalance:employee.plOpeningBalance,
      lastworkingDay:employee.lastworkingDay,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEmployee((prev) => ({
      ...prev,
      [name]: value || (name === "employeeType" ? "employee" : ""),
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (!editEmployee || !editEmployee.id) {
      console.error("Invalid employee ID");
      return;
    }

    try {
      const formattedDate = new Date(updatedEmployee.joiningDate).toISOString().split("T")[0];
      const formattedlastworkingDay = updatedEmployee.lastworkingDay 
        ? new Date(updatedEmployee.lastworkingDay).toISOString().split("T")[0]
        : null;

      await axios.put(`http://localhost:3000/employees/${editEmployee.id}`, {
        ...updatedEmployee,
        joiningDate: formattedDate,
        lastworkingDay: formattedlastworkingDay
      });

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === editEmployee.id ? { ...employee, ...updatedEmployee } : employee
        )
      );
      setEditEmployee(null);
    } catch (error) {
      console.error("Error updating employee data", error);
    }
  };
  const handleUpdateLeaveBalances = async () => {
    try {
      // Call both APIs sequentially
      await fetch("http://localhost:3000/updates-pl", { method: "POST" });
      await fetch("http://localhost:3000/updates-cl", { method: "POST" });
  
      alert("Leave balances updated successfully!");
    } catch (error) {
      console.error("Error updating leave balances:", error);
      alert("Failed to update leave balances. Try again.");
    }
  };
  const handleUpdateEntitlement = async () => {
    if (isNaN(newClEntitlement) || newClEntitlement <= 0) {
      alert("Please enter a valid entitlement value.");
      return;
    }
  
    
      await axios.put('http://localhost:3000/settings', {
        newClEntitlement
      });
  
      setClEntitlement(newClEntitlement);
      alert("CL Entitlement updated successfully!");
      setModalVisible(false);
     
  };
  

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setCurrentPage(1); // Reset to the first page when search changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const tabs = [
    { label: "Employee Data", value: "employeeData" },
    { label: "Leave Balance", value: "leaveBalance" },
  ];
  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Tabs */}
      <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative flex justify-start sm:justify-center gap-4 sm:gap-8 border-b border-gray-300 dark:border-gray-700 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative px-1 sm:px-2 py-2 text-sm sm:text-base font-medium transition-all duration-300
              ${activeTab === tab.value
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-300"}`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

     
    </div>

    <div className="mb-6 w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />

        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          placeholder="Search by name..."
          value={searchName}
          onChange={handleSearchChange}
        />
      </div>
    </div>

      {/* Employee Data Tab Content */}
<div className={`transition-opacity duration-500 ${activeTab === "employeeData" ? "opacity-100" : "opacity-0 hidden"}`}>
  {/* Desktop Table View */}
  <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
    <table className="min-w-full text-sm md:text-base divide-y divide-gray-300 dark:divide-gray-700">
      <thead className="bg-gradient-to-r from-blue-200 to-indigo-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-200 uppercase text-xs font-bold">
        <tr>
          {["ID", "Name", "Email", "Designation", "Department", "Role", "Joining Date", "Last Working Day", "Status", "Edit"].map((header, index) => (
            <th key={index} className="px-4 py-3 text-left whitespace-nowrap">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
        {currentRecords.map((employee) => (
          <tr
            key={employee.id}
            className="hover:bg-blue-50 dark:hover:bg-gray-700 transition duration-200"
          >
            <td className="px-4 py-3">{employee.id}</td>
            <td className="px-4 py-3 font-medium">{employee.name}</td>
            <td className="px-4 py-3">{employee.email}</td>
            <td className="px-4 py-3">{employee.designation}</td>
            <td className="px-4 py-3">{employee.department}</td>
            <td className="px-4 py-3">{employee.employeetype}</td>
            <td className="px-4 py-3">{formatDate(employee.joiningDate)}</td>
            <td className="px-4 py-3">{employee.lastworkingday ? formatDate(employee.lastworkingday) : "-"}</td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center px-2 py-1 text-sm rounded-full ${
                employee.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                <span className="w-2 h-2 mr-1 rounded-full inline-block bg-current"></span>
                {employee.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => handleEditEmployee(employee)}
                className="text-blue-600 hover:text-blue-900"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Mobile Card View */}
<div className="lg:hidden grid grid-cols-1 gap-4 mt-4">
  {currentRecords.map((employee) => (
    <div
      key={employee.id}
      className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 relative border border-gray-200 dark:border-gray-800 transition-transform duration-300 hover:scale-[1.02]"
    >
      {/* Status Badge */}
      <span
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md ${
          employee.status === "Active"
            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
            : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
        }`}
      >
        {employee.status}
      </span>

      {/* Header: Avatar + Name */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-white flex items-center justify-center font-semibold text-lg">
          {employee.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{employee.designation}</p>
        </div>
        <button
          onClick={() => handleEditEmployee(employee)}
          className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 pl-2 border-l-4 border-blue-200 dark:border-blue-500">
        <p><strong>ID:</strong> {employee.id}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Role:</strong> {employee.employeetype}</p>
        <p><strong>Joining:</strong> {formatDate(employee.joiningDate)}</p>
        <p><strong>Last Day:</strong> {employee.lastworkingday ? formatDate(employee.lastworkingday) : "-"}</p>
      </div>
    </div>
  ))}
</div>


  {/* Pagination */}
  {totalPages > 1 && (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
      <button
        className="px-4 py-2 w-full sm:w-auto text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
      </div>
      <button
        className="px-4 py-2 w-full sm:w-auto text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  )}
</div>

 {/* Leave Balance Tab Content */}
<div
  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 transition-all duration-300 ease-in-out ${
    activeTab === "leaveBalance" ? "block" : "hidden"
  }`}
>
  {activeTab === "leaveBalance" && (
    <><div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mb-8">
    <button
      onClick={handleUpdateLeaveBalances}
      className="relative group overflow-hidden w-full sm:w-auto px-6 py-3 rounded-2xl border border-indigo-500 text-indigo-600 font-semibold backdrop-blur-md bg-white/10 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out z-0" />
      <span className="relative z-10 flex items-center gap-2 text-sm sm:text-base">
        <FontAwesomeIcon icon={faSyncAlt} className="w-5 h-5" />
        Update Leave Balances
      </span>
    </button>
  
    <button
      onClick={() => setModalVisible(true)}
      className="relative group overflow-hidden w-full sm:w-auto px-6 py-3 rounded-2xl border border-indigo-500 text-indigo-600 font-semibold backdrop-blur-md bg-white/10 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out z-0" />
      <span className="relative z-10 flex items-center gap-2 text-sm sm:text-base">
        <FontAwesomeIcon icon={faSyncAlt} className="w-5 h-5" />
        Update CL Entitlement
      </span>
    </button>
  </div>
  
      {/* Responsive Design - Modern Card Layout for Mobile */}
<div className="space-y-6 sm:hidden">
  {leaveBalances.map((leave) => (
    <div
      key={leave.employeeId}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-5 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {leave.employeeName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {leave.employeeId}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
          Leave Balance
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Opening Balance PL</p>
          <p className="font-semibold">{leave.carryForwardPL}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Used PL</p>
          <p className="font-semibold">{leave.usedPL}</p>
        </div>

        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Accrued PL</p>
          <p className="font-semibold">{leave.accruedPL}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Remaining PL</p>
          <p className="font-semibold text-green-600 dark:text-green-400">{leave.plBalance}</p>
        </div>

        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">CL Entitlement</p>
          <p className="font-semibold">{clEntitlement}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Used CL</p>
          <p className="font-semibold">{leave.usedCL}</p>
        </div>

        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Accrued CL</p>
          <p className="font-semibold">{leave.accruedCL}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Remaining CL</p>
          <p className="font-semibold text-green-600 dark:text-green-400">{leave.clBalance}</p>
        </div>
      </div>
    </div>
  ))}
</div>


      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg mt-6">
        <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-300">
          <thead className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              {[
                "Employee ID",
                "Name",
                "Opening Balance PL",
                "Used PL",
                "Accrued PL",
                "Remaining PL",
                "CL Entitlement",
                "Used CL",
                "Accrued CL",
                "Remaining CL",
              ].map((header) => (
                <th key={header} className="px-4 py-3 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {leaveBalances.map((leave) => (
              <tr
                key={leave.employeeId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out"
              >
                <td className="px-4 py-3">{leave.employeeId}</td>
                <td className="px-4 py-3">{leave.employeeName}</td>
                <td className="px-4 py-3">{leave.carryForwardPL}</td>
                <td className="px-4 py-3">{leave.usedPL}</td>
                <td className="px-4 py-3">{leave.accruedPL}</td>
                <td className="px-4 py-3">{leave.plBalance}</td>
                <td className="px-4 py-3">{clEntitlement}</td>
                <td className="px-4 py-3">{leave.usedCL}</td>
                <td className="px-4 py-3">{leave.accruedCL}</td>
                <td className="px-4 py-3">{leave.clBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )}

  {/* Modal */}
  {modalVisible && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-xl w-[90%] max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Update CL Entitlement
        </h2>
        <input
          type="number"
          value={newClEntitlement}
          onChange={(e) => setNewClEntitlement(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter new CL Entitlement"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setModalVisible(false)}
            className="px-5 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleUpdateEntitlement();
              setModalVisible(false);
            }}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium focus:outline-none"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )}
</div>



      {/* Edit Employee Modal */}
      {editEmployee && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
       <div className="bg-white rounded-xl w-full max-w-xl shadow-xl">
         <div className="bg-indigo-600 p-4 rounded-t-xl">
           <h3 className="text-xl font-bold text-white">Edit Employee</h3>
         </div>
         
         <form onSubmit={handleSaveChanges} className="p-5 space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Name</label>
               <input
                 type="text"
                 name="name"
                 value={updatedEmployee.name}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                 required
               />
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Email</label>
               <input
                 type="email"
                 name="email"
                 value={updatedEmployee.email}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                 required
               />
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Role</label>
               <select
                 name="employeeType"
                 value={updatedEmployee.employeeType || ""}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               >
                 <option value="employee">Employee</option>
                 <option value="manager">Manager</option>
                 <option value="hr">HR</option>
               </select>
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Status</label>
               <select
                 name="status"
                 value={updatedEmployee.status || ""}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               >
                 <option value="Active">Active</option>
                 <option value="InActive">InActive</option>
               </select>
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Designation</label>
               <input
                 type="text"
                 name="designation"
                 value={updatedEmployee.designation}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               />
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Department</label>
               <input
                 type="text"
                 name="department"
                 value={updatedEmployee.department}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               />
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Joining Date</label>
               <input
                 type="date"
                 name="joiningDate"
                 value={updatedEmployee.joiningDate}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               />
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Last Working Date</label>
               <input
                 type="date"
                 name="lastworkingDay"
                 value={updatedEmployee.lastworkingDay || ''}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               />
             </div>
             
             <div className="space-y-1">
               <label className="font-medium text-gray-700 text-sm">Opening Balance PL</label>
               <input
                 type="number"
                 name="plOpeningBalance"
                 value={updatedEmployee.plOpeningBalance}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               />
             </div>
           </div>
           
           <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
             <button
               type="button"
               onClick={() => setEditEmployee(null)}
               className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
             >
               Save Changes
             </button>
           </div>
         </form>
       </div>
     </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
