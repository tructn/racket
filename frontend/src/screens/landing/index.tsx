import { useAuth0 } from "@auth0/auth0-react";

function Landing() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div className="flex items-center">
            <img src="./logo.svg" alt="Badminton" className="h-20" />
            <h1 className="text-2xl font-bold text-blue-600">Racket</h1>
          </div>
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-300 hover:bg-blue-700"
            onClick={() => loginWithRedirect()}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Streamline Your Badminton Team Management
          </h1>
          <p className="mb-8 text-xl">
            Say goodbye to the hassle of managing players, costs, and court
            bookings. Racket is here to make your life easier!
          </p>
          <button
            className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition duration-300 hover:bg-gray-100"
            onClick={() => loginWithRedirect()}
          >
            Login
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Player Management",
              "Cost Management",
              "Court Booking",
              "Team Communication",
              "Match Statistics",
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-6 text-center shadow-md"
              >
                <h3 className="mb-4 text-xl font-semibold">{feature}</h3>
                <p className="text-gray-600">
                  Easily manage and track all aspects of your badminton team.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Pricing Plans
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: "Basic Plan",
                price: "$9.99/month",
                features: [
                  "Player Management",
                  "Court Booking",
                  "Basic Support",
                ],
              },
              {
                name: "Pro Plan",
                price: "$19.99/month",
                features: [
                  "All Basic Features",
                  "Cost Management",
                  "Match Statistics",
                  "Priority Support",
                ],
              },
              {
                name: "Team Plan",
                price: "$29.99/month",
                features: [
                  "All Pro Features",
                  "Team Communication Tools",
                  "Customizable Options",
                ],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-6 text-center shadow-md"
              >
                <h3 className="mb-4 text-2xl font-bold">{plan.name}</h3>
                <p className="mb-6 text-3xl font-semibold">{plan.price}</p>
                <ul className="mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="mb-2 text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-300 hover:bg-blue-700">
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                quote:
                  "Racket has transformed how we manage our club. It’s intuitive, efficient, and saves us so much time!",
                author: "Sarah, Team Captain",
              },
              {
                quote:
                  "The court booking feature is a game-changer. No more confusion or double bookings!",
                author: "Mike, Club Manager",
              },
            ].map((testimonial, index) => (
              <div key={index} className="rounded-lg bg-white p-6 shadow-md">
                <p className="mb-4 text-gray-600">"{testimonial.quote}"</p>
                <p className="font-semibold text-gray-800">
                  – {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-4 text-gray-600">
            © 2023 Racket. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Facebook
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Instagram
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
