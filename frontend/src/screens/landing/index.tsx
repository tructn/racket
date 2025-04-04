import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaComments,
  FaChartLine,
  FaGithub,
} from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";

function Landing() {
  const { loginWithRedirect } = useAuth0();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="font-inter min-h-screen bg-black">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed z-50 w-full bg-black/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <img src="./logo.svg" alt="Badminton" className="h-20" />
          </motion.div>
          <div className="flex items-center gap-6">
            <motion.a
              href="https://github.com/tructn/racket"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white"
            >
              <FaGithub className="text-2xl" />
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-all duration-300"
              onClick={() => loginWithRedirect()}
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black pb-32 pt-40 text-white">
        <motion.div
          className="relative z-10 mx-auto max-w-5xl text-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1
            className="mb-6 text-8xl font-medium leading-tight tracking-tight"
            variants={fadeInUp}
          >
            Racket.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </motion.h1>
          <motion.p
            className="mb-12 text-2xl text-gray-400"
            variants={fadeInUp}
          >
            Experience the future of badminton team management.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-blue-500 px-10 py-4 text-lg font-medium text-white transition-all duration-300"
            onClick={() => loginWithRedirect()}
            variants={fadeInUp}
          >
            Get Started <BsArrowRight className="ml-2 inline-block" />
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-8">
          <motion.h2
            className="mb-20 text-center text-5xl font-medium text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Everything you need.
            <br />
            <span className="text-gray-400">All in one place.</span>
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <FaUsers />,
                title: "Player Management",
                description: "Organize your team with precision.",
              },
              {
                icon: <FaMoneyBillWave />,
                title: "Cost Management",
                description: "Track expenses effortlessly.",
              },
              {
                icon: <FaCalendarAlt />,
                title: "Court Booking",
                description: "Book courts with ease.",
              },
              {
                icon: <FaComments />,
                title: "Team Communication",
                description: "Stay connected with your team.",
              },
              {
                icon: <FaChartLine />,
                title: "Match Statistics",
                description: "Analyze performance in detail.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group rounded-3xl bg-zinc-900 p-10 text-left transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <div className="mb-8 text-4xl text-blue-400 group-hover:text-blue-300">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-2xl font-medium text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-8">
          <motion.h2
            className="mb-20 text-center text-5xl font-medium text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Loved by players worldwide.
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 gap-12 md:grid-cols-2"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                quote:
                  "Racket has transformed how we manage our club. It's intuitive, efficient, and saves us so much time!",
                author: "Sarah, Team Captain",
              },
              {
                quote:
                  "The court booking feature is a game-changer. No more confusion or double bookings!",
                author: "Mike, Club Manager",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="rounded-3xl bg-zinc-900 p-10 text-left transition-all duration-300"
                variants={fadeInUp}
              >
                <p className="mb-6 text-xl text-gray-300">
                  "{testimonial.quote}"
                </p>
                <p className="font-medium text-white">– {testimonial.author}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black py-12">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <p className="text-gray-400">
              © 2024 Racket. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
