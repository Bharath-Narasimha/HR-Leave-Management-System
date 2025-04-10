import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { CalendarIcon } from "@heroicons/react/solid"; // You can use a calendar icon
import { Plus, Trash2, Calendar } from "lucide-react";
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
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
  const today = new Date();
  const upcoming = holidays.filter((h) => new Date(h.date) >= today);
  const past = holidays.filter((h) => new Date(h.date) < today);

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-28">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">

        {/* Sticky Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold">Company Holidays</h2>
            <p className="text-sm text-indigo-200">{holidays.length} holidays listed</p>
          </div>
          {userRole === "hr" && (
            <form onSubmit={handleAddHoliday} className="hidden md:flex items-center gap-2">
              <input
                type="date"
                name="date"
                value={newHoliday.date}
                onChange={handleInputChange}
                required
                className="px-2 py-1.5 rounded-md border bg-white text-gray-800 text-sm focus:ring-2 ring-indigo-400"
              />
              <input
                type="text"
                name="name"
                value={newHoliday.name}
                onChange={handleInputChange}
                required
                placeholder="Holiday Name"
                className="px-2 py-1.5 rounded-md border bg-white text-gray-800 text-sm focus:ring-2 ring-indigo-400"
              />
              <button
                type="submit"
                className="bg-white text-indigo-600 hover:bg-indigo-100 transition px-3 py-1.5 rounded-md font-semibold"
              >
                <Plus size={16} />
              </button>
            </form>
          )}
        </div>

        {/* HR Mobile Form */}
        {userRole === "hr" && (
          <div className="md:hidden px-4 py-4 bg-indigo-50 border-b">
            <form onSubmit={handleAddHoliday} className="space-y-2">
              <input
                type="date"
                name="date"
                value={newHoliday.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 ring-indigo-500"
              />
              <input
                type="text"
                name="name"
                value={newHoliday.name}
                onChange={handleInputChange}
                required
                placeholder="Holiday Name"
                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Add Holiday
              </button>
            </form>
          </div>
        )}

        {/* Section: Upcoming Holidays */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">Upcoming Holidays</h3>
          {upcoming.length > 0 ? (
            <ul className="space-y-3">
              {upcoming.map((holiday) => (
                <li
                  key={holiday.id}
                  className="flex items-center justify-between bg-indigo-50 px-4 py-3 rounded-lg border hover:shadow transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-800">{holiday.name}</p>
                      <p className="text-sm text-indigo-500">{formatDate(holiday.date)}</p>
                    </div>
                  </div>
                  {userRole === "hr" && (
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming holidays.</p>
          )}
        </div>

        {/* Section: Past Holidays */}
        <div className="px-4 pb-5 pt-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Past Holidays</h3>
          {past.length > 0 ? (
            <ul className="space-y-3">
              {past.map((holiday) => (
                <li
                  key={holiday.id}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-200 rounded-full">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{holiday.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(holiday.date)}</p>
                    </div>
                  </div>
                  {userRole === "hr" && (
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No past holidays.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicHolidays;
