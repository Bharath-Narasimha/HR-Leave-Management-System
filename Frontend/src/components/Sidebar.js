import React, { useState, useEffect } from "react"
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
  const [isBottomNavOpen, setIsBottomNavOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

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
    { name: "Employee Leave History", icon: ClipboardListIcon, path: "/employee-leave-History", roles: ["hr","manager"] },
  ]

  const userNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Regular sidebar for desktop - unchanged */}
      <div
      className={`hidden md:flex flex-col transition-all duration-500 ease-in-out
        ${isCollapsed ? "w-20" : "w-72"}
        h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700
        text-white shadow-xl backdrop-blur-lg rounded-tr-none rounded-br-none overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-600">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-wide">{getSystemTitle(userRole)}</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-indigo-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isCollapsed
                  ? "M3 12h18m-6-6l6 6-6 6"
                  : "M21 12H3m6-6l-6 6 6 6"
              }
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-indigo-900">
        <ul className="space-y-2 p-4">
          {navItems.map(
            (item) =>
              item.roles.includes(userRole) && (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                      ${
                        location.pathname === item.path
                          ? "bg-indigo-600 text-white shadow-md"
                          : "hover:bg-indigo-500 text-indigo-200 hover:text-white"
                      }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium tracking-wide">{item.name}</span>
                    )}
                  </Link>
                </li>
              )
          )}
        </ul>
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto px-4 py-4 border-t border-indigo-600">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
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
      {/* Mobile Bottom Navigation */}
<div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
  {/* Bottom Drawer */}
  {isBottomNavOpen && (
  <div className="fixed inset-x-0 bottom-0 z-50 pb-24">
    <div className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white/70 backdrop-blur-xl border border-blue-100 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] rounded-t-3xl animate-slide-up transition-all duration-300 ease-in-out max-h-[75vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-blue-800 tracking-tight">{getSystemTitle(userRole)}</h3>
        <button
          onClick={() => setIsBottomNavOpen(false)}
          className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition duration-200 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <ul className="divide-y divide-gray-100">
        {userNavItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              onClick={() => setIsBottomNavOpen(false)}
              className={`group flex items-center px-6 py-4 transition-colors duration-200 ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform duration-200 text-blue-600" />
              <span className="text-[16px] tracking-tight">{item.name}</span>
            </Link>
          </li>
        ))}

        {/* Logout */}
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-4 text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-4"
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
            <span className="font-medium">Logout</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
)}


 {/* Bottom Navigation Bar - Indigo Luxe Mode */}
 <div className="relative z-50 mx-4 mb-4 rounded-[28px] bg-gradient-to-br from-[#4c50ff]/90 via-[#3730a3]/85 to-[#1e1b4b]/85 backdrop-blur-2xl border border-indigo-400/30 shadow-[0_15px_40px_rgba(76,80,255,0.5)]">
  <div className="flex items-center justify-between px-4 py-3">
    {/* Left Icons */}
    {userNavItems.slice(0, 2).map((item) => (
      <Link
        key={item.name}
        to={item.path}
        className="flex flex-col items-center w-16 group transition-all duration-300"
      >
        <item.icon
          className={`w-6 h-6 transition-all duration-300 ${
            location.pathname === item.path
              ? "text-white font-bold"
              : "text-indigo-200 group-hover:text-white"
          }`}
        />
        <span
          className={`text-[11px] mt-1 font-semibold transition-all duration-300 ${
            location.pathname === item.path
              ? "text-white"
              : "text-indigo-200 group-hover:text-white"
          }`}
        >
          {item.name === "Leave Application"
            ? "Apply"
            : item.name === "Dashboard"
            ? "Home"
            : item.name.split(" ")[0]}
        </span>
      </Link>
    ))}

    {/* Center FAB */}
    <button
      onClick={() => setIsBottomNavOpen(true)}
      className="relative -mt-10 z-20 bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#a78bfa] p-4 rounded-full shadow-xl hover:scale-105 transition-transform border-[3px] border-indigo-300/50"
    >
      <div className="absolute inset-0 bg-indigo-400/30 rounded-full blur-xl opacity-70 animate-ping z-0" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-white relative z-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    {/* Right Icons */}
    {userNavItems.slice(2, 4).map((item) => (
      <Link
        key={item.name}
        to={item.path}
        className="flex flex-col items-center w-16 group transition-all duration-300"
      >
        <item.icon
          className={`w-6 h-6 transition-all duration-300 ${
            location.pathname === item.path
              ? "text-white font-bold"
              : "text-indigo-200 group-hover:text-white"
          }`}
        />
        <span
          className={`text-[11px] mt-1 font-semibold transition-all duration-300 ${
            location.pathname === item.path
              ? "text-white"
              : "text-indigo-200 group-hover:text-white"
          }`}
        >
          {item.name === "Leave History"
            ? "History"
            : item.name === "Public Holidays"
            ? "Holidays"
            : item.name.split(" ")[0]}
        </span>
      </Link>
    ))}
  </div>
</div>



</div>

    </>
  )
}

export default Sidebar