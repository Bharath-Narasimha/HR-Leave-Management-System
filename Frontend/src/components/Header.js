import { Link } from "react-router-dom";

const Header = ({ user }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const firstLetter = user.firstName[0].toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#6366f1]
     text-white shadow-xl border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">

          {/* Left: Avatar + Name */}
          <Link
            to="/profile"
            className="flex items-center space-x-3 min-w-0 group transition-all duration-300 hover:scale-[1.03]"
          >
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-indigo-900 font-bold text-lg shadow-lg transform transition-all duration-300 group-hover:rotate-[8deg] group-hover:scale-110">
              {firstLetter}
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs text-gray-400">Welcome,</span>
              <span className="text-sm sm:text-base font-semibold truncate text-white max-w-[150px] sm:max-w-[200px]">
                {fullName}
              </span>
            </div>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Header;
