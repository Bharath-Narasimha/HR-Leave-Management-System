import { Link } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/solid";

interface User {
  firstName: string;
  lastName: string;
}

const Header = ({ user }: { user: User }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const firstLetter = user.firstName[0].toUpperCase();

  return (
    <header className="z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3"> {/* Reduced padding */}
          <h1 className="text-2xl font-semibold tracking-tight"> {/* Smaller font size */}
            Welcome, <span className="font-bold">{user.firstName}!</span>
          </h1>
          <Link to="/profile" className="flex items-center space-x-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-gray-800 font-semibold text-lg shadow-md transform transition-all duration-200 hover:scale-105"> {/* Reduced size of avatar */}
              {firstLetter}
            </div>
            <span className="text-sm font-medium text-white truncate max-w-xs">
              {fullName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
