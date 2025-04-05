import { useAuth0 } from "@auth0/auth0-react";
import { Tooltip, Divider, Menu } from "@mantine/core";
import cx from "clsx";
import { FC, ReactNode, Suspense, useState } from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AppLoading from "../../components/loading/app-loading";
import SectionLoading from "../../components/loading/section-loading";
import UserProfile from "../../components/profile";

import {
  IoBarChart,
  IoChevronBackCircle,
  IoPersonAdd,
  IoSettings,
  IoPeople,
  IoCalendar,
  IoWallet,
  IoLogOut,
} from "react-icons/io5";

interface NavItemProps {
  label?: string;
  path: string;
  icon: ReactNode;
  showLabel?: boolean;
}

const NavItem: FC<NavItemProps> = ({ label, path, icon, showLabel }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <NavLink
      to={path}
      className={cx(
        "flex items-center gap-3 rounded-md px-4 py-2.5 transition-all duration-200",
        "hover:bg-blue-600",
        isActive && "bg-blue-600 font-medium text-white",
        !isActive && "text-white/80 hover:text-white",
      )}
    >
      <div className="flex w-5 items-center justify-center">{icon}</div>
      {showLabel && <span>{label}</span>}
    </NavLink>
  );
};

const NAV_ITEMS = [
  {
    path: "/club-owner/dashboard",
    icon: <IoBarChart className="text-lg" />,
    label: "Dashboard",
  },
  {
    path: "/club-owner/teams",
    icon: <IoPeople className="text-lg" />,
    label: "Teams",
  },
  {
    path: "/club-owner/players",
    icon: <IoPersonAdd className="text-lg" />,
    label: "Players",
  },
  {
    path: "/club-owner/bookings",
    icon: <IoCalendar className="text-lg" />,
    label: "Bookings",
  },
  {
    path: "/club-owner/costs",
    icon: <IoWallet className="text-lg" />,
    label: "Costs",
  },
  {
    path: "/club-owner/settings",
    icon: <IoSettings className="text-lg" />,
    label: "Settings",
  },
] as const;

function ClubOwnerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const navigate = useNavigate();

  function toggleSideNav() {
    setCollapsed(!collapsed);
  }

  if (isLoading) {
    return <AppLoading text="Log you in..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <div className="flex h-screen w-screen">
      <div
        className={cx(
          "group relative flex h-full flex-shrink-0 flex-grow-0 flex-col border-r border-white/10 bg-blue-700 transition-all duration-300",
          !collapsed && "w-[280px]",
          collapsed && "w-16",
        )}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col items-center justify-center border-b border-white/10 p-4">
            <img
              src="/logo.svg"
              alt="LOGO"
              className={cx(
                "transition-all duration-300",
                collapsed ? "h-8 w-8" : "h-20 w-20",
              )}
            />
            <span
              className={cx(
                "mt-2 font-bold text-white transition-all duration-300",
                collapsed ? "text-xs" : "text-xl",
              )}
            >
              RACKET
            </span>
          </div>

          <div className={cx("flex flex-col p-4", collapsed && "items-center")}>
            <Menu position="right" withArrow>
              <Menu.Target>
                <div className="cursor-pointer rounded-lg bg-blue-600 p-2 hover:bg-blue-500">
                  <UserProfile showLabel={!collapsed} />
                </div>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IoSettings className="text-lg" />}
                  component={NavLink}
                  to="/club-owner/settings"
                >
                  Settings
                </Menu.Item>
                <Menu.Item
                  leftSection={<IoLogOut className="text-lg" />}
                  onClick={() => {
                    navigate("/login", { replace: true });
                    logout({
                      logoutParams: { returnTo: "/login" },
                    });
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>

          <Divider className="my-2 border-white/10" />

          <nav
            className={cx(
              "flex flex-col gap-1 px-2 py-2",
              collapsed && "items-center",
            )}
          >
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                icon={item.icon}
                label={item.label}
                showLabel={!collapsed}
              />
            ))}
          </nav>
        </div>

        <Tooltip
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          position="right"
          withArrow
        >
          <button
            onClick={toggleSideNav}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center border-t border-white/10 p-2 text-white/80 transition-all hover:bg-blue-600 hover:text-white"
          >
            <IoChevronBackCircle
              className={cx(
                "text-xl transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </Tooltip>
      </div>

      <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
        <Suspense fallback={<SectionLoading />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default ClubOwnerLayout;
