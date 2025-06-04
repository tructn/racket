import { Button, Container, Group, Text } from "@mantine/core";
import { useAuth0 } from "@auth0/auth0-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import SectionLoading from "@/components/loading/section-loading";
import { motion } from "framer-motion";

function AnonymousLayout() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/90 shadow-sm backdrop-blur-lg">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <img src="/logo.svg" alt="Racket" className="h-16" />
          </motion.div>

          <Group>
            <Button
              variant="filled"
              color="pink"
              onClick={() => loginWithRedirect()}
            >
              Login
            </Button>
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
      <footer className="mt-auto border-t bg-white py-8">
        <Container size="lg">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Text size="sm" c="dimmed">
              © {new Date().getFullYear()} Racket. All rights reserved.
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

export default AnonymousLayout;
