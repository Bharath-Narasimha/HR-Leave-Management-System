import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/outline";
import axios from "axios"; // Make sure axios is installed for API calls
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Working Day</th>                
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    {employee.lastworkingday 
                      ? new Date(employee.lastworkingday).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
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
      <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${activeTab === "leaveBalance" ? "block" : "hidden"}`}
    >
      {activeTab === "leaveBalance" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={handleUpdateLeaveBalances}
            >
              <FontAwesomeIcon icon={faSyncAlt} className="w-5 h-5 mr-2" />
              Update Leave Balances
            </button>
            <button
              onClick={() => setModalVisible(true)}
              className="ml-4 flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              <FontAwesomeIcon icon={faSyncAlt} className="w-5 h-5 mr-2" />
              Update CL Entitlement
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Carry Forward PL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Used PL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Accrued PL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remaining PL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Annual CL Entitlement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Used CL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Accrued CL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remaining CL</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaveBalances.map((leave) => (
                <tr key={leave.employeeId} className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out">
                  <td className="px-4 py-3 whitespace-nowrap">{leave.employeeId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.employeeName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.carryForwardPL}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.usedPL}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.accruedPL}</td> 
                  <td className="px-4 py-3 whitespace-nowrap">{leave.plBalance}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{clEntitlement}</td> 
                  <td className="px-4 py-3 whitespace-nowrap">{leave.usedCL}</td>  
                  <td className="px-4 py-3 whitespace-nowrap">{leave.accruedCL}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{leave.clBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Modal for updating CL entitlement */}
      {modalVisible && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Update CL Entitlement</h2>
            <input
              type="number"
              value={newClEntitlement}
              onChange={(e) => setNewClEntitlement(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter new CL Entitlement"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
  onClick={() => {
    handleUpdateEntitlement();
    setModalVisible(false);
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full sm:w-96 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Edit Employee</h3>
            <form onSubmit={handleSaveChanges} className="space-y-2">
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Name</label>
                <input
                  type="text"
                  name="name"
                  value={updatedEmployee.name}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={updatedEmployee.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Role</label>
                <select
                  name="employeeType"
                  value={updatedEmployee.employeeType || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={updatedEmployee.designation}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Department</label>
                <input
                  type="text"
                  name="department"
                  value={updatedEmployee.department}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={updatedEmployee.joiningDate}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Last Working Date</label>
                <input
                  type="date"
                  name="lastworkingDay"
                  value={updatedEmployee.lastworkingDay || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Status</label>
                <select
                  name="status"
                  value={updatedEmployee.status || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600 text-sm">Set PL Balance</label>
                <input
                  type="number"
                  name="plOpeningBalance"
                  value={updatedEmployee.plOpeningBalance}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
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
