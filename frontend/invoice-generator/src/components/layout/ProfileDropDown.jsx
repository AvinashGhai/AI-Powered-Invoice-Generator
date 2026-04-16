import { ChevronDown } from "lucide-react";

const ProfileDropdown = ({
  isOpen,
  onToggle,
  avatar,
  companyName,
  email,
  onLogout,
  onViewProfile,
}) => {
  return (
    <div className="relative">
      
      {/* TOP PROFILE BUTTON */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
      >
        {/* AVATAR */}
        <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-semibold">
          {avatar}
        </div>

        {/* NAME + EMAIL */}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {companyName}
          </p>
          <p className="text-xs text-gray-400">
            {email}
          </p>
        </div>

        {/* ARROW */}
        <ChevronDown
          size={16}
          className={`text-gray-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">

          {/* USER INFO */}
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              {companyName}
            </p>
            <p className="text-xs text-gray-400">
              {email}
            </p>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-gray-100" />

          {/* VIEW PROFILE */}
          <button
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            View Profile
          </button>

          {/* DIVIDER */}
          <div className="border-t border-gray-100" />

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;