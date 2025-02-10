import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { CalendarIcon } from "@heroicons/react/solid"; // You can use a calendar icon

const PublicHolidays = ({ userRole }) => {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });
  const [refresh, setRefresh] = useState(false);  // New state to trigger re-fetch

  // Fetch public holidays from the backend
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch("http://localhost:3000/public-holidays");
        const data = await response.json();
        console.log("Holidays data:", data); // Log the response to inspect the data

        if (Array.isArray(data)) {
          setHolidays(data);
        } else {
          console.error("Expected an array, but received:", data);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
  }, [refresh]); // Re-fetch holidays when refresh state changes

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new holiday to the database
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.date || !newHoliday.name) return;

    try {
      const response = await fetch("http://localhost:3000/public-holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHoliday),
      });

      if (response.ok) {
        const addedHoliday = await response.json();
        setHolidays((prev) => [...prev, { ...newHoliday, id: addedHoliday.id }]);
        setNewHoliday({ date: "", name: "" });

        // Toggle refresh state to re-fetch holidays
        setRefresh((prev) => !prev); // This will trigger the useEffect again
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  // Delete a holiday from the database
  const handleDeleteHoliday = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/public-holidays/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setHolidays((prev) => prev.filter((holiday) => holiday.id !== id));
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {userRole === "hr" && (
          <form onSubmit={handleAddHoliday} className="mb-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                name="date"
                value={newHoliday.date}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <input
                type="text"
                name="name"
                value={newHoliday.name}
                onChange={handleInputChange}
                placeholder="Holiday Name"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 transition-all duration-200"
              >
                <PlusIcon className="h-6 w-6" />
              </button>
            </div>
          </form>
        )}
        <ul className="space-y-6">
          {holidays.map((holiday) => (
            <li
              key={holiday.id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <CalendarIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                <div className="flex space-x-4 items-center">
                  <input
                    type="date"
                    value={holiday.date ? holiday.date.split("T")[0] : ""}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    disabled
                  />
                  <input
                    type="text"
                    value={holiday.name}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    disabled
                  />
                </div>
              </div>
              {userRole === "hr" && (
                <button
                  onClick={() => handleDeleteHoliday(holiday.id)}
                  className="ml-4 p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PublicHolidays;
