import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import ProfileDropdown from "../../components/layout/ProfileDropDown";


/* ================= NAV MENU ================= */
const NAVIGATION_MENU = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "invoices", name: "Invoices", icon: FileText },
  { id: "invoices/new", name: "Create Invoice", icon: Plus },
  { id: "profile", name: "Profile", icon: Users },
];

/* ================= NAV ITEM ================= */
const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all
        ${
          isActive
            ? "bg-blue-50 text-blue-900 shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <Icon
        className={`h-5 w-5 ${
          isActive ? "text-blue-900" : "text-gray-500"
        }`}
      />
      {!isCollapsed && <span className="ml-3">{item.name}</span>}
    </button>
  );
};

/* ================= PAGES ================= */

const DashboardPage = () => (
  <div>
    <h2 className="text-xl font-bold">Welcome back 👋</h2>
    <p className="text-gray-400">Here's your invoice overview.</p>
  </div>
);

const InvoicesPage = () => (
  <div>
    <h2 className="text-xl font-bold">All Invoices</h2>
  </div>
);

const CreateInvoicePage = () => (
  <div>
    <h2 className="text-xl font-bold">Create Invoice</h2>
  </div>
);

const ProfilePage = () => (
  <div>
    <h2 className="text-xl font-bold">Profile</h2>
  </div>
);

/* ================= MAIN LAYOUT ================= */

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const [activeNavItem, setActiveNavItem] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  /* ===== RESPONSIVE ===== */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===== NAVIGATION ===== */
  const handleNavigation = (id) => {
    setActiveNavItem(id);
  };

  /* ===== USER INITIALS ===== */
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r transition-all
        ${sidebarCollapsed ? "w-20" : "w-64"}
        ${isMobile
          ? sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : "translate-x-0"
        }`}
      >
        {/* LOGO */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!sidebarCollapsed && (
            <h1 className="font-bold text-sm">AI Invoice App</h1>
          )}
          {!isMobile && (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              ☰
            </button>
          )}
        </div>

        {/* NAV */}
        <nav className="p-4 space-y-2">
          {NAVIGATION_MENU.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="mt-auto p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
          >
            <LogOut size={16} />
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div
        className={`flex-1 flex flex-col transition-all
        ${sidebarCollapsed ? "ml-20" : "ml-64"}
        ${isMobile && "ml-0"}`}
      >
        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X /> : <Menu />}
              </button>
            )}
            <h1 className="text-sm font-semibold capitalize">
              {activeNavItem}
            </h1>
          </div>

          {/* PROFILE DROPDOWN */}
          <ProfileDropdown
  isOpen={profileDropdownOpen}
  onToggle={(e) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  }}
  avatar={initials}
  companyName={user?.name || ""}
  email={user?.email || ""}
  onLogout={logout}
  onViewProfile={() => {
    setActiveNavItem("profile");   // 🔥 THIS LINE
    setProfileDropdownOpen(false); // close dropdown
  }}
/>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">

          {activeNavItem === "dashboard" && <DashboardPage />}

          {activeNavItem === "invoices" && <InvoicesPage />}

          {activeNavItem === "invoices/new" && <CreateInvoicePage />}

          {activeNavItem === "profile" && <ProfilePage />}

        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;