import React from "react";
import SectionLoading from "../loading/section-loading";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Avatar, Menu, Text, UnstyledButton } from "@mantine/core";
import { IoPerson, IoLogOut, IoPieChart } from "react-icons/io5";

interface UserProfileProp {
  showLabel: boolean;
}

const UserProfile: React.FC<UserProfileProp> = ({ showLabel }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const navigate = useNavigate();

  if (isLoading) {
    return <SectionLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-start gap-2">
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <UnstyledButton className="flex items-center gap-2">
            <Avatar
              src={user?.picture}
              alt={user?.name || "User"}
              size="md"
              radius="xl"
              className="border-2 border-blue-500"
              styles={{
                placeholder: {
                  color: "#fff",
                  fontWeight: 600,
                },
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            {showLabel && (
              <div className="flex flex-col items-start justify-start">
                <Text size="sm" fw={500} className="text-white">
                  {user?.name || "User"}
                </Text>
                {user?.email && (
                  <Text size="xs" className="text-white/70">
                    {user.email}
                  </Text>
                )}
              </div>
            )}
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item
            leftSection={<IoPerson size={14} />}
            onClick={() => navigate("/admin/profile")}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            leftSection={<IoPieChart size={14} />}
            onClick={() => navigate("/me")}
          >
            My Dashboard
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            leftSection={<IoLogOut size={14} />}
            color="red"
            onClick={() => {
              logout({
                logoutParams: {
                  returnTo: window.location.origin,
                },
              });
            }}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

export default UserProfile;
