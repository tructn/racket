import { useAuth0 } from "@auth0/auth0-react";
import { Tooltip, Divider } from "@mantine/core";
import cx from "clsx";
import { FC, ReactNode, Suspense, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import AppLoading from "../../components/loading/app-loading";
import SectionLoading from "../../components/loading/section-loading";
import LogoutButton from "../../components/auth/logout-button";
import UserProfile from "../../components/profile";

import {
  IoBarChart,
  IoChevronBackCircle,
  IoPersonAdd,
  IoSettings,
  IoPeople,
  IoCalendar,
  IoWallet,
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
        "flex items-center gap-3 rounded-lg px-4 py-3 text-white transition-all duration-200",
        "hover:translate-x-1 hover:bg-blue-600/80",
        isActive && "translate-x-1 bg-blue-800/90 shadow-lg",
        !isActive && "opacity-80 hover:opacity-100",
      )}
    >
      <div className="flex w-6 items-center justify-center">{icon}</div>
      {showLabel && <span className="font-medium">{label}</span>}
    </NavLink>
  );
};

function ClubOwnerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();

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
          "group relative flex h-full flex-shrink-0 flex-grow-0 flex-col bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-300",
          !collapsed && "w-[280px]",
          collapsed && "w-20",
        )}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex justify-center p-4">
            <img
              src="/logo.svg"
              alt="LOGO"
              className={cx(
                "transition-all duration-300",
                collapsed ? "h-12 w-12" : "h-24 w-24",
              )}
            />
          </div>

          <div className={cx("flex flex-col p-4", collapsed && "items-center")}>
            <UserProfile showLabel={!collapsed} />
          </div>

          <Divider className="my-2 opacity-20" />

          <div
            className={cx(
              "flex flex-col gap-1 px-3 py-2",
              collapsed && "items-center",
            )}
          >
            <NavItem
              path="/club-owner/dashboard"
              icon={<IoBarChart className="text-xl" />}
              label="Dashboard"
              showLabel={!collapsed}
            />
            <NavItem
              path="/club-owner/teams"
              icon={<IoPeople className="text-xl" />}
              label="Teams"
              showLabel={!collapsed}
            />
            <NavItem
              path="/club-owner/players"
              icon={<IoPersonAdd className="text-xl" />}
              label="Players"
              showLabel={!collapsed}
            />
            <NavItem
              path="/club-owner/bookings"
              icon={<IoCalendar className="text-xl" />}
              label="Bookings"
              showLabel={!collapsed}
            />
            <NavItem
              path="/club-owner/costs"
              icon={<IoWallet className="text-xl" />}
              label="Costs"
              showLabel={!collapsed}
            />
            <NavItem
              path="/club-owner/settings"
              icon={<IoSettings className="text-xl" />}
              label="Settings"
              showLabel={!collapsed}
            />
          </div>
        </div>

        <Tooltip
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          position="right"
          withArrow
        >
          <button
            onClick={toggleSideNav}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center p-3 text-white transition-all hover:bg-blue-700/50"
          >
            <IoChevronBackCircle
              className={cx(
                "text-2xl transition-transform duration-300",
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
