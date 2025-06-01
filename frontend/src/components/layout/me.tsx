import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import {
  Container,
  Group,
  Text,
  Title,
  Avatar,
  Menu,
  Badge,
} from "@mantine/core";
import { motion } from "framer-motion";
import SectionLoading from "@/components/loading/section-loading";
import { IoLogOut, IoSettings, IoNotifications } from "react-icons/io5";
import { useClaims } from "@/hooks/useClaims";

function MeLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth0();
  const navigate = useNavigate();
  const { isAdmin } = useClaims();

  if (isLoading) {
    return <SectionLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/90 shadow-sm backdrop-blur-lg">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex cursor-pointer items-center gap-2"
            onClick={() => navigate("/")}
          >
            <img src="/logo.svg" alt="RACKET" className="h-16" />
            <Title order={3} className="text-blue-600">
              RACKET
            </Title>
          </motion.div>

          <Group>
            <Menu shadow="md" width={300}>
              <Menu.Target>
                <div className="relative cursor-pointer">
                  <IoNotifications size={24} className="text-gray-600" />
                  <Badge
                    size="xs"
                    color="red"
                    className="absolute -right-1 -top-1"
                  >
                    3
                  </Badge>
                </div>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Notifications</Menu.Label>
                <Menu.Item onClick={() => navigate("/me/notifications")}>
                  <div className="flex flex-col">
                    <Text size="sm" fw={500}>
                      New match request
                    </Text>
                    <Text size="xs" c="dimmed">
                      Team Alpha wants to play with you
                    </Text>
                  </div>
                </Menu.Item>
                <Menu.Item onClick={() => navigate("/me/notifications")}>
                  <div className="flex flex-col">
                    <Text size="sm" fw={500}>
                      Payment received
                    </Text>
                    <Text size="xs" c="dimmed">
                      You received $50 from Team Beta
                    </Text>
                  </div>
                </Menu.Item>
                <Menu.Item onClick={() => navigate("/me/notifications")}>
                  <div className="flex flex-col">
                    <Text size="sm" fw={500}>
                      Booking confirmed
                    </Text>
                    <Text size="xs" c="dimmed">
                      Your booking for Court 3 is confirmed
                    </Text>
                  </div>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={() => navigate("/me/notifications")}>
                  View all notifications
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar
                  src={user?.picture}
                  alt={user?.name}
                  size="md"
                  className="cursor-pointer"
                />
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{user?.name}</Menu.Label>
                {isAdmin && (
                  <Menu.Item
                    leftSection={<IoSettings size={14} />}
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    Admin Console
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IoLogOut size={14} />}
                  onClick={() => logout()}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <Suspense fallback={<SectionLoading />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <Container size="lg">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Text size="sm" c="dimmed">
              © 2024 Racket. All rights reserved.
            </Text>
            <Group gap="xl">
              <Text
                size="sm"
                c="dimmed"
                className="cursor-pointer hover:text-blue-600"
              >
                Privacy Policy
              </Text>
              <Text
                size="sm"
                c="dimmed"
                className="cursor-pointer hover:text-blue-600"
              >
                Terms of Service
              </Text>
              <Text
                size="sm"
                c="dimmed"
                className="cursor-pointer hover:text-blue-600"
              >
                Contact Us
              </Text>
            </Group>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default MeLayout;
