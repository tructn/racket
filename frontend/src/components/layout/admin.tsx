import { useAuth0 } from "@auth0/auth0-react";
import { Popover } from "@mantine/core";
import cx from "clsx";
import { FC, ReactNode, Suspense, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import AppLoading from "@/components/loading/app-loading";
import SectionLoading from "@/components/loading/section-loading";
import LogoutButton from "@/components/auth/logout-button";
import UserProfile from "@/components/profile";

import {
  IoBarChart,
  IoBasketball,
  IoCafe,
  IoChevronBackCircle,
  IoDocumentText,
  IoPersonAdd,
  IoPeople,
  IoSettings,
  IoStorefront,
  IoChevronDown,
} from "react-icons/io5";

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

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className={cx(
          "flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200",
          "hover:bg-blue-600/80 hover:shadow-lg [&.active]:bg-blue-600 [&.active]:shadow-lg",
          level > 0 && "ml-4",
          !showLabel && "justify-center px-2",
        )}
      >
        {hasChildren ? (
          <Popover
            position="right-start"
            withArrow
            shadow="md"
            disabled={showLabel}
          >
            <Popover.Target>
              <div
                onClick={handleClick}
                className="flex w-full cursor-pointer items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl text-blue-100">{item.icon}</span>
                  {item.label && showLabel && (
                    <span className="font-medium">{item.label}</span>
                  )}
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
            </Popover.Target>
            {!showLabel && (
              <Popover.Dropdown>
                {item.childItems?.map((child, index) => (
                  <NavLink
                    key={index}
                    to={child.path || "#"}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50"
                  >
                    <span className="text-blue-600">{child.icon}</span>
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </Popover.Dropdown>
            )}
          </Popover>
        ) : (
          <NavLink
            to={item.path || "#"}
            className="flex w-full items-center gap-3"
          >
            <span className="text-xl text-blue-100">{item.icon}</span>
            {item.label && showLabel && (
              <span className="font-medium">{item.label}</span>
            )}
          </NavLink>
        )}
      </div>
      {hasChildren && showLabel && expanded && (
        <div className="mt-1 space-y-1">
          {item.childItems?.map((child, index) => (
            <NavLink
              key={index}
              to={child.path || "#"}
              className={cx(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all duration-200",
                "hover:bg-blue-600/80 hover:shadow-lg [&.active]:bg-blue-600 [&.active]:shadow-lg",
                "ml-4",
              )}
            >
              <span className="text-xl text-blue-100">{child.icon}</span>
              <span className="font-medium">{child.label}</span>
            </NavLink>
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
      icon: <IoBarChart />,
    },
    {
      label: "Sports",
      icon: <IoBasketball />,
      childItems: [
        {
          label: "Matches",
          path: "/admin/matches",
          icon: <IoBasketball />,
        },
        {
          label: "Teams",
          path: "/admin/teams",
          icon: <IoPeople />,
        },
        {
          label: "Players",
          path: "/admin/players",
          icon: <IoPersonAdd />,
        },
      ],
    },
    {
      label: "Management",
      icon: <IoDocumentText />,
      childItems: [
        {
          label: "Reports",
          path: "/admin/reports",
          icon: <IoDocumentText />,
        },
        {
          label: "Requests",
          path: "/admin/requests",
          icon: <IoCafe />,
        },
      ],
    },
    {
      label: "Sport Centers",
      path: "/admin/sportcenters",
      icon: <IoStorefront />,
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
        <div className="flex flex-1 flex-col">
          <div className="flex justify-center p-4">
            <img
              src="/logo.svg"
              alt="LOGO"
              className={cx(
                "transition-transform duration-300 hover:scale-110",
                collapsed ? "h-12 w-12" : "h-16 w-16",
              )}
            />
          </div>
          <div className={cx("flex flex-col p-4", collapsed && "items-center")}>
            <UserProfile showLabel={!collapsed} />
          </div>
          <div className="flex flex-col gap-1 p-4">
            {menuItems.map((item, index) => (
              <NavItem key={index} item={item} showLabel={!collapsed} />
            ))}
          </div>
          <button
            onClick={toggleSideNav}
            className="absolute -right-3 top-4 hidden rounded-full border-2 border-blue-500 bg-white p-1 text-lg text-blue-500 shadow-lg ring-2 ring-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-xl group-hover:block"
          >
            <IoChevronBackCircle
              className={cx(
                "transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
          </button>
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
