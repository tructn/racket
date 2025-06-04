import { useAuth0 } from "@auth0/auth0-react";
import cx from "clsx";
import { FC, ReactNode, Suspense, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import AppLoading from "@/components/loading/app-loading";
import SectionLoading from "@/components/loading/section-loading";
import LogoutButton from "@/components/auth/logout-button";
import UserProfile from "@/components/profile";

import {
  IoBarChart,
  IoChevronBackCircle,
  IoSettings,
  IoChevronDown,
  IoStatsChart,
  IoCalendar,
  IoShirt,
  IoPerson,
  IoList,
  IoBusiness,
  IoApps,
  IoBaseball,
  IoChevronBackCircleOutline,
} from "react-icons/io5";
import { FaCircleDot } from "react-icons/fa6";
import { Text } from "@mantine/core";

interface MenuItem {
  label: string;
  path?: string;
  icon: ReactNode;
  childItems?: MenuItem[];
}

interface NavItemProps {
  item: MenuItem;
  showLabel?: boolean;
  level?: number;
}

const NavItem: FC<NavItemProps> = ({ item, showLabel = true, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.childItems && item.childItems.length > 0;
  const location = useLocation();

  const isActive = (path?: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      setExpanded((prev) => !prev);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className={cx(
          "flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200",
          "hover:bg-blue-600/80 hover:shadow-lg",
          isActive(item.path) && "bg-blue-600 shadow-lg",
          level > 0 && "ml-4",
          !showLabel && "justify-center px-2",
        )}
      >
        {hasChildren ? (
          <div
            onClick={handleClick}
            className="flex w-full cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl text-blue-100">{item.icon}</span>
              {item.label && showLabel && <span>{item.label}</span>}
            </div>
            {item.label && showLabel && (
              <IoChevronDown
                className={cx(
                  "text-blue-100 transition-transform duration-300",
                  expanded && "rotate-180",
                )}
              />
            )}
          </div>
        ) : (
          <NavLink
            to={item.path || "#"}
            className={({ isActive }) =>
              cx("flex w-full items-center gap-3", isActive && "text-white")
            }
          >
            <span
              className={cx("text-blue-100", level > 0 ? "text-lg" : "text-xl")}
            >
              {level > 0 ? <FaCircleDot className="text-[10px]" /> : item.icon}
            </span>
            {item.label && showLabel && (
              <span className="font-medium">{item.label}</span>
            )}
          </NavLink>
        )}
      </div>
      {hasChildren && showLabel && expanded && (
        <div className="relative mt-1 space-y-0.5">
          {item.childItems?.map((child, index) => (
            <NavItem
              key={index}
              item={child}
              showLabel={showLabel}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <IoApps />,
    },
    {
      label: "Sports",
      icon: <IoBaseball />,
      childItems: [
        {
          label: "Matches",
          path: "/admin/matches",
          icon: <IoCalendar />,
        },
        {
          label: "Teams",
          path: "/admin/teams",
          icon: <IoShirt />,
        },
        {
          label: "Players",
          path: "/admin/players",
          icon: <IoPerson />,
        },
      ],
    },
    {
      label: "Management",
      icon: <IoStatsChart />,
      childItems: [
        {
          label: "Reports",
          path: "/admin/reports",
          icon: <IoBarChart />,
        },
        {
          label: "Requests",
          path: "/admin/requests",
          icon: <IoList />,
        },
        {
          label: "Users",
          path: "/admin/users",
          icon: <IoPerson />,
        },
      ],
    },
    {
      label: "Sport Centers",
      path: "/admin/sportcenters",
      icon: <IoBusiness />,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: <IoSettings />,
    },
  ];

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
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
      <div
        className={cx(
          "group relative flex h-full flex-shrink-0 flex-grow-0 flex-col border-r border-blue-600/20 bg-gradient-to-b from-blue-700 to-blue-800 text-white shadow-xl transition-all duration-300 ease-in-out",
          !collapsed && "w-[280px]",
          collapsed && "w-20",
        )}
      >
        <div
          className={cx(
            "flex flex-1 flex-col",
            collapsed ? "items-center" : "",
          )}
        >
          <div className={cx("flex items-center justify-center gap-2 py-4")}>
            {!collapsed ? (
              <div className="flex flex-col items-center">
                <img
                  src="/logo.svg"
                  alt="Racket"
                  className="h-20 w-20 transition-transform duration-300 hover:scale-110"
                />
                <Text size="lg" fw={700} className="text-white">
                  RACKET CONSOLE
                </Text>
              </div>
            ) : (
              <button
                onClick={toggleSideNav}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-lime-500 p-2 text-xl text-white transition-all duration-300 hover:bg-lime-500/40 hover:shadow-md"
              >
                <IoChevronBackCircleOutline
                  size={20}
                  className={cx(
                    "transition-transform duration-300",
                    collapsed && "rotate-180",
                  )}
                />
              </button>
            )}
          </div>
          <div className={cx("flex flex-col p-4", collapsed && "items-center")}>
            <UserProfile showLabel={!collapsed} />
          </div>
          <div className="flex flex-col gap-1 p-4">
            {menuItems.map((item, index) => (
              <NavItem key={index} item={item} showLabel={!collapsed} />
            ))}
          </div>
          {!collapsed && (
            <button
              onClick={toggleSideNav}
              className="absolute -right-3 top-4 hidden h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 p-1.5 text-lg text-white transition-all duration-300 hover:bg-blue-600/40 hover:shadow-md group-hover:flex"
            >
              <IoChevronBackCircle
                className={cx(
                  "transition-transform duration-300",
                  collapsed && "rotate-180",
                )}
              />
            </button>
          )}
        </div>
        <div className="border-t border-blue-600/20 p-4">
          <LogoutButton showLabel={!collapsed} />
        </div>
      </div>
      <div className="flex w-full flex-1 overflow-auto">
        <Suspense fallback={<SectionLoading />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default AdminLayout;
