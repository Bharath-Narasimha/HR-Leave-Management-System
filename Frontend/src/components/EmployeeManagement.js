import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/outline";
import axios from "axios"; // Make sure axios is installed for API calls

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
    status: "",
    plOpeningBalance:0,
  });
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [searchName, setSearchName] = useState(""); // Track the search term
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [recordsPerPage] = useState(5); // Records per page
  
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

      await axios.put(`http://localhost:3000/employees/${editEmployee.id}`, { ...updatedEmployee, joiningDate: formattedDate });
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

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setCurrentPage(1); // Reset to the first page when search changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b-2 border-gray-300 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("employeeData")}
          className={`text-lg font-medium px-6 py-3 border-b-2 ${activeTab === 'employeeData' ? 'border-blue-600 font-semibold text-blue-600' : 'border-transparent text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}
        >
          Employee Data
        </button>
        <button
          onClick={() => setActiveTab("leaveBalance")}
          className={`text-lg font-medium px-6 py-3 border-b-2 ${activeTab === 'leaveBalance' ? 'border-blue-600 font-semibold text-blue-600' : 'border-transparent text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}
        >
          Leave Balance
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 dark:focus:ring-blue-400"
          placeholder="Search by name..."
          value={searchName}
          onChange={handleSearchChange}
        />
      </div>

      {/* Employee Data Tab Content */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${activeTab === "employeeData" ? "block" : "hidden"}`}>
        {activeTab === "employeeData" && (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joining Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Edit</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentRecords.map((employee) => (
                <tr key={employee.id} className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out">
                  <td className="px-4 py-3 whitespace-nowrap">{employee.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{employee.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{employee.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{employee.designation}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{employee.department}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{employee.employeetype}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap flex items-center font-semibold">
                    {employee.status === "Active" ? (
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    )}
                    <span className={employee.status === "Active" ? "text-green-600" : "text-red-600"}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-center">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="text-blue-600 hover:text-blue-900 transition-all duration-150"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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

      {/* Leave Balance Tab Content */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${activeTab === "leaveBalance" ? "block" : "hidden"}`}>
        {activeTab === "leaveBalance" && (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PL Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CL Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaveBalances.map((leave) => (
                <tr key={leave.employeeId} className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out">
                  <td className="px-4 py-3 whitespace-nowrap">{leave.employeeId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.employeeName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.plBalance}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.clBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Employee Modal */}
      {editEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full sm:w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Edit Employee</h3>
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  name="name"
                  value={updatedEmployee.name}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={updatedEmployee.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Role</label>
                <select
                  name="employeeType"
                  value={updatedEmployee.employeeType || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={updatedEmployee.designation}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Department</label>
                <input
                  type="text"
                  name="department"
                  value={updatedEmployee.department}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={updatedEmployee.joiningDate}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Status</label>
                <select
                  name="status"
                  value={updatedEmployee.status || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Set PL Balance</label>
                <input
                  type="number"
                  name="plOpeningBalance"
                  value={updatedEmployee.plOpeningBalance}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
