// DashboardLayout.jsx
import { useState, useEffect } from "react";
import {
  LayoutDashboard, FileText, Plus, Users,
  LogOut, Menu, X, ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import ProfileDropdown from "../../components/layout/ProfileDropDown";
import Dashboard from "../../pages/Dashboard/Dashboard";

const NAVIGATION_MENU = [
  { id: "dashboard",    name: "Dashboard",      icon: LayoutDashboard },
  { id: "invoices",     name: "Invoices",        icon: FileText        },
  { id: "invoices/new", name: "Create Invoice",  icon: Plus            },
  { id: "profile",      name: "Profile",         icon: Users           },
];

const PAGE_TITLES = {
  dashboard:      "Dashboard",
  invoices:       "Invoices",
  "invoices/new": "Create Invoice",
  profile:        "Profile",
};

const InvoicesPage      = () => <h2 className="text-xl font-bold text-gray-900">All Invoices</h2>;
const CreateInvoicePage = () => <h2 className="text-xl font-bold text-gray-900">Create Invoice</h2>;
const ProfilePage       = () => <h2 className="text-xl font-bold text-gray-900">Profile</h2>;

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const [activeNavItem,        setActiveNavItem]        = useState("dashboard");
  const [sidebarOpen,          setSidebarOpen]          = useState(true);
  const [sidebarCollapsed,     setSidebarCollapsed]     = useState(false);
  const [isMobile,             setIsMobile]             = useState(false);
  const [profileDropdownOpen,  setProfileDropdownOpen]  = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = (id) => {
    setActiveNavItem(id);
    if (isMobile) setSidebarOpen(false);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed && !isMobile ? "w-[72px]" : "w-64"}
          ${isMobile
            ? sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
            : "translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">InvoiceAI</span>
            </div>
          )}
          {!isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-auto"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 ml-auto">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAVIGATION_MENU.map(({ id, name, icon: Icon }) => {
            const isActive = activeNavItem === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                title={sidebarCollapsed && !isMobile ? name : undefined}
                className={`
                  relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-150 group
                  ${isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                )}
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`} />
                {(!sidebarCollapsed || isMobile) && <span>{name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <button
            onClick={logout}
            title={sidebarCollapsed && !isMobile ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {(!sidebarCollapsed || isMobile) && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-[72px]" : "ml-64"}
        `}
      >
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-sm font-semibold text-gray-900">
              {PAGE_TITLES[activeNavItem] ?? activeNavItem}
            </h1>
          </div>

          <ProfileDropdown
            isOpen={profileDropdownOpen}
            onToggle={() => setProfileDropdownOpen((v) => !v)}
            avatar={initials}
            companyName={user?.name ?? ""}
            email={user?.email ?? ""}
            onLogout={logout}
            onViewProfile={() => navigate("profile")}
          />
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeNavItem === "dashboard"    && <Dashboard onNavigate={navigate} />}
          {activeNavItem === "invoices"     && <InvoicesPage />}
          {activeNavItem === "invoices/new" && <CreateInvoicePage />}
          {activeNavItem === "profile"      && <ProfilePage />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;