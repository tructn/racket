import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import { motion } from "framer-motion";
import SectionLoading from "@/components/loading/section-loading";
import { IoCalendar, IoList, IoTime } from "react-icons/io5";

function MeLayout() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  if (isLoading) {
    return <SectionLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/90 shadow-sm backdrop-blur-lg">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <img src="/logo.svg" alt="Racket" className="h-8" />
            <Title order={3} className="text-blue-600">
              Racket
            </Title>
          </motion.div>

          <Group>
            <Button
              variant="light"
              color="blue"
              leftSection={<IoCalendar />}
              onClick={() => navigate("/me/bookings")}
            >
              Book Court
            </Button>
            <Button
              variant="light"
              color="blue"
              leftSection={<IoList />}
              onClick={() => navigate("/me/requests")}
            >
              My Requests
            </Button>
            <Button
              color="blue"
              leftSection={<IoTime />}
              onClick={() => navigate("/me/schedule")}
            >
              My Schedule
            </Button>
          </Group>
        </Container>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <Suspense fallback={<SectionLoading />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white py-8">
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
