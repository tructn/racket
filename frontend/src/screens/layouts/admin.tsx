import { useAuth0 } from "@auth0/auth0-react";
import { Tooltip } from "@mantine/core";
import cx from "clsx";
import { FC, ReactNode, Suspense, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import AppLoading from "../../components/app-loading";
import SectionLoading from "../../components/section-loading";
import LogoutButton from "../../components/logout-button";
import UserProfile from "../../components/profile";

import {
  IoBarChart,
  IoBasketball,
  IoCafe,
  IoChevronBackCircle,
  IoDocumentText,
  IoHeart,
  IoPersonAdd,
  IoSettings,
  IoStorefront,
} from "react-icons/io5";

interface NavItemProps {
  label?: string;
  path: string;
  icon: ReactNode;
  showLabel?: boolean;
}
const NavItem: FC<NavItemProps> = ({ label, path, icon, showLabel = true }) => {
  return (
    <NavLink
      className="flex items-center gap-2 rounded px-4 py-3 hover:bg-blue-600 [&.active]:bg-blue-600"
      to={path}
    >
      {showLabel ? (
        <span className="text-xl">{icon}</span>
      ) : (
        <Tooltip label={label} position="right-end">
          <span className="text-xl">{icon}</span>
        </Tooltip>
      )}
      {label && showLabel && <span>{label}</span>}
    </NavLink>
  );
};

function AdminLayout() {
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
          "group relative flex h-full flex-shrink-0 flex-grow-0 flex-col border-r bg-blue-700 text-white transition-all delay-100",
          !collapsed && "w-[270px]",
          collapsed && "w-16",
        )}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex justify-center text-center">
            <img src="logo.svg" alt="LOGO" width={100} height={100} />
          </div>
          <div className={cx("flex flex-col p-2", collapsed && "items-center")}>
            <UserProfile showLabel={!collapsed} />
          </div>
          <div className="flex flex-col p-2">
            <NavItem
              showLabel={!collapsed}
              path="/"
              label="Dashboard"
              icon={<IoBarChart />}
            />
            <NavItem
              showLabel={!collapsed}
              path="/matches"
              label="Matches"
              icon={<IoBasketball />}
            />
            <NavItem
              showLabel={!collapsed}
              path="/players"
              label="Players"
              icon={<IoPersonAdd />}
            />
            <NavItem
              showLabel={!collapsed}
              path="/reports"
              label="Reports"
              icon={<IoDocumentText />}
            />
            <NavItem
              showLabel={!collapsed}
              path="/requests"
              label="Requests"
              icon={<IoCafe />}
            />
            <NavItem
              showLabel={!collapsed}
              path="/sportcenters"
              label="Sport Centers"
              icon={<IoStorefront />}
            />
            <NavItem
              showLabel={!collapsed}
              path="/settings"
              label="Settings"
              icon={<IoSettings />}
            />
          </div>
          <button
            onClick={toggleSideNav}
            className="absolute -right-2 top-2 hidden rounded-full border border-blue-500 bg-white text-lg text-blue-500 shadow ring-blue-500 group-hover:block"
          >
            <IoChevronBackCircle className={cx(collapsed && "rotate-180")} />
          </button>
        </div>
        <div className="p-2">
          <LogoutButton showLabel={!collapsed} />
        </div>
      </div>
      <div className="flex w-full flex-1 bg-slate-300">
        <Suspense fallback={<SectionLoading />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default AdminLayout;
