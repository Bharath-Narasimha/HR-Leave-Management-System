import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from "./components/Header"
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LeaveApplication from './components/LeaveApplication';
import LeaveHistory from './components/LeaveHistory';
import ManagerApproval from './components/ManagerApproval';
import PublicHolidays from './components/PublicHolidays';
import EmployeeManagement from './components/EmployeeManagement';
import Reports from './components/Reports';
import VerifyEmail from "./components/VerifyEmail";
import EmployeeLeaveHistory from "./components/EmployeeLeaveHistory";
import UserProfile from "./components/UserProfile"
function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };
  const handleUpdateUser = (updatedUserData) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUserData }))
  }

  const PrivateRoute = ({ element, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles.includes(user.role)) {
      return (
        <>
        <Header user={user}/>
        {
        React.cloneElement(element, { user, onLogout: handleLogout })
    }</>
      )
    }
    return <Navigate to="/" replace />;
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {user && <Sidebar userRole={user.role} onLogout={handleLogout} />}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route
              path="/"
              element={
                <PrivateRoute
                  element={<Dashboard user={user} />}
                  allowedRoles={['hr', 'manager', 'employee']}
                />
              }
            />
            <Route
              path="/leave-application"
              element={
                <PrivateRoute
                  element={<LeaveApplication user={user} />}
                  allowedRoles={['hr', 'manager', 'employee']}
                />
              }
            />
            <Route
              path="/leave-history"
              element={
                <PrivateRoute
                  element={<LeaveHistory user={user} />}
                  allowedRoles={['hr', 'manager', 'employee']}
                />
              }
            />
            <Route
              path="/manager-approval"
              element={
                <PrivateRoute
                  element={<ManagerApproval user={user} />}
                  allowedRoles={['hr', 'manager']}
                />
              }
            />
            <Route
              path="/public-holidays"
              element={
                <PrivateRoute
                  element={<PublicHolidays userRole={user?.role} />}
                  allowedRoles={['hr', 'manager', 'employee']}
                />
              }
            />
            <Route
              path="/employee-management"
              element={
                <PrivateRoute
                  element={<EmployeeManagement user={user} />}
                  allowedRoles={['hr']}
                />
              }
            />
           {/* <Route
              path="/reports"
              element={
                <PrivateRoute
                  element={<Reports user={user} />}
                  allowedRoles={['hr', 'manager']}
                />
              }
            />*/}
            <Route
              path="/employee-leave-history"
              element={
                <PrivateRoute
                  element={<EmployeeLeaveHistory user={user} />}
                  allowedRoles={['hr','manager']}
                />
              }
            />
             <Route
              path="/profile"
              element={
                <PrivateRoute
                  element={<UserProfile onUpdateUser={handleUpdateUser} />}
                  allowedRoles={["hr", "manager", "employee"]}
                />
              }
            />
            <Route path="/verify-email" element={<VerifyEmail/>} />
            </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
