import { render, screen, waitFor } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import ClubOwnerDashboard from "../dashboard";

// Mock the useAuth0 hook
jest.mock("@auth0/auth0-react");

// Mock the useApi hook
jest.mock("../../../hooks/useApi", () => ({
  useApi: () => ({
    get: jest.fn(),
  }),
}));

describe("ClubOwnerDashboard", () => {
  beforeEach(() => {
    // Mock Auth0 user data
    (useAuth0 as jest.Mock).mockReturnValue({
      user: {
        name: "John Doe",
      },
      isAuthenticated: true,
    });
  });

  it("renders the dashboard with user name", () => {
    render(<ClubOwnerDashboard />);
    expect(screen.getByText("Welcome, John Doe")).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<ClubOwnerDashboard />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays stats cards after loading", async () => {
    render(<ClubOwnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Teams")).toBeInTheDocument();
      expect(screen.getByText("Players")).toBeInTheDocument();
      expect(screen.getByText("Bookings")).toBeInTheDocument();
      expect(screen.getByText("Costs")).toBeInTheDocument();
    });
  });

  it("displays recent teams section", async () => {
    render(<ClubOwnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Recent Teams")).toBeInTheDocument();
    });
  });

  it("displays upcoming bookings section", async () => {
    render(<ClubOwnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Upcoming Bookings")).toBeInTheDocument();
    });
  });
});
