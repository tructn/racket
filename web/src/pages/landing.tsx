import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaComments,
  FaChartLine,
  FaGithub,
  FaStar,
} from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import { useClaims } from "@/hooks/useClaims";
import { useNavigate } from "react-router-dom";

function Landing() {
  const { loginWithRedirect } = useAuth0();
  const { isAdmin } = useClaims();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginWithRedirect();
  };

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
    <div className="font-inter min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed z-50 w-full bg-white/90 shadow-md backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <img src="./logo.svg" alt="Racket" className="h-16" />
          </motion.div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="font-medium text-gray-700 hover:text-blue-600"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="font-medium text-gray-700 hover:text-blue-600"
            >
              Success Stories
            </a>
            <a
              href="#pricing"
              className="font-medium text-gray-700 hover:text-blue-600"
            >
              Plans
            </a>
          </div>
          <div className="flex items-center gap-6">
            <motion.a
              href="https://github.com/tructn/racket"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-600 hover:text-blue-700"
            >
              <FaGithub className="text-2xl" />
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30"
              onClick={handleLogin}
            >
              Join Now
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pb-32 pt-36">
        <motion.div
          className="relative z-10 mx-auto max-w-5xl text-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1
            className="mb-6 text-7xl font-bold leading-tight tracking-tight text-gray-900"
            variants={fadeInUp}
          >
            Elevate Your Game.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              With Racket.
            </span>
          </motion.h1>
          <motion.p
            className="mb-12 text-2xl font-medium text-gray-600"
            variants={fadeInUp}
          >
            The ultimate platform for modern badminton clubs and teams.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-12 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30"
            onClick={handleLogin}
            variants={fadeInUp}
          >
            Start Your Journey <BsArrowRight className="ml-2 inline-block" />
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-gradient-to-b from-gray-50 to-white py-32"
      >
        <div className="mx-auto max-w-7xl px-8">
          <motion.h2
            className="mb-20 text-center text-5xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Powerful Features.
            <br />
            <span className="font-medium text-gray-600">
              Seamless Experience.
            </span>
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
                title: "Smart Team Management",
                description:
                  "Streamline your roster and player profiles with ease.",
              },
              {
                icon: <FaMoneyBillWave />,
                title: "Financial Control",
                description:
                  "Master your club's finances with powerful tracking tools.",
              },
              {
                icon: <FaCalendarAlt />,
                title: "Smart Court Booking",
                description:
                  "Book and manage courts with intelligent scheduling.",
              },
              {
                icon: <FaComments />,
                title: "Team Collaboration",
                description:
                  "Keep everyone in sync with integrated communication.",
              },
              {
                icon: <FaChartLine />,
                title: "Performance Analytics",
                description: "Gain insights with advanced match statistics.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group rounded-2xl bg-white p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                variants={fadeInUp}
              >
                <div className="mb-6 text-4xl text-blue-600 group-hover:text-blue-500">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="font-medium text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="bg-gradient-to-b from-white to-gray-50 py-32"
      >
        <div className="mx-auto max-w-7xl px-8">
          <motion.h2
            className="mb-20 text-center text-5xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Trusted by Champions.
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
                  "Racket has revolutionized our club's operations. The intuitive interface and powerful features have made team management a breeze!",
                author: "Sarah Chen, National Team Captain",
                rating: 5,
              },
              {
                quote:
                  "The smart court booking system has eliminated all our scheduling headaches. It's like having a personal assistant for our club!",
                author: "Mike Thompson, Elite Club Director",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="rounded-2xl bg-white p-8 text-left shadow-lg transition-all duration-300 hover:shadow-xl"
                variants={fadeInUp}
              >
                <div className="mb-4 flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-xl" />
                  ))}
                </div>
                <p className="mb-6 text-xl font-medium text-gray-700">
                  "{testimonial.quote}"
                </p>
                <p className="font-bold text-gray-900">
                  – {testimonial.author}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <p className="text-gray-600">
              © {new Date().getFullYear()} Racket. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-gray-600 hover:text-blue-700">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-700">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-700">
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
