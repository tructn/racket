import { Container, Title, Text, Button, Group } from "@mantine/core";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { IoRocket } from "react-icons/io5";

function ComingSoon() {
  const { loginWithRedirect } = useAuth0();

  return (
    <Container
      size="lg"
      className="flex min-h-[80vh] flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8 flex justify-center"
        >
          <IoRocket size={120} className="text-pink-500" />
        </motion.div>

        <Title order={1} className="mb-4 text-4xl font-bold">
          Coming Soon!
        </Title>

        <Text size="xl" c="dimmed" className="mb-8 max-w-2xl">
          We're working hard to bring you something amazing. Our team of digital
          wizards is casting spells and brewing code potions to make this
          feature magical!
        </Text>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" color="pink" onClick={() => loginWithRedirect()}>
            Join the Waitlist
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-8"
        >
          <Text size="sm" c="dimmed">
            Estimated launch: Soon™
          </Text>
        </motion.div>
      </motion.div>
    </Container>
  );
}

export default ComingSoon;
