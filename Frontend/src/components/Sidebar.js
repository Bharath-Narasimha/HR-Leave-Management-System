import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  HomeIcon,
  CalendarIcon,
  ClipboardListIcon,
  UserGroupIcon,
  UserIcon,
  DocumentReportIcon,
} from "@heroicons/react/outline"

const getSystemTitle = (role) => {
  switch (role) {
    case "hr":
      return "HR Leave MS"
    case "manager":
      return "Manager Leave MS"
    case "employee":
      return "Employee Leave MS"
    default:
      return "Leave MS"
  }
}

const Sidebar = ({ userRole, onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    onLogout()
    navigate("/login")
  }

  const navItems = [
    { name: "Dashboard", icon: HomeIcon, path: "/", roles: ["hr", "manager", "employee"] },
    { name: "Leave Application", icon: CalendarIcon, path: "/leave-application", roles: ["hr", "manager", "employee"] },
    { name: "Leave History", icon: ClipboardListIcon, path: "/leave-history", roles: ["hr", "manager", "employee"] },
    { name: userRole === "hr" ? "HR Approval" : "Manager Approval", icon: UserGroupIcon, path: "/manager-approval", roles: ["hr", "manager"] },
    { name: "Public Holidays", icon: CalendarIcon, path: "/public-holidays", roles: ["hr", "manager", "employee"] },
    { name: "Employee Management", icon: UserIcon, path: "/employee-management", roles: ["hr"] },
    { name: "Employee Leave History", icon: ClipboardListIcon , path: "/employee-leave-History", roles: ["hr","manager"] },
    //{name: "Reports", icon: DocumentReportIcon, path: "/reports", roles: ["hr", "manager"]},
  ]

  return (
    <div
      className={`flex flex-col ${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-gray-900 via-blue-800 to-gray-800 text-white transition-width duration-300`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#1e40af]">
        {!isCollapsed && (
          <span className="text-xl font-semibold">{getSystemTitle(userRole)}</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-white rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? "M3 12h18m-6-6l6 6-6 6" : "M21 12H3m6-6l-6 6 6 6"}
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-4 p-4">
          {navItems.map(
            (item) =>
              item.roles.includes(userRole) && (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                      location.pathname === item.path
                        ? "text-white font-semibold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {!isCollapsed && (
                      <span className="ml-4 text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              )
          )}
        </ul>
      </nav>

      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-2 text-gray-400 hover:text-white rounded-lg transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
