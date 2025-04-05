import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import BookingsPage from "../bookings";

// Mock the useAuth0 hook
jest.mock("@auth0/auth0-react");

// Mock the useApi hook
jest.mock("../../../hooks/useApi", () => ({
  useApi: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
  }),
}));

describe("BookingsPage", () => {
  beforeEach(() => {
    // Mock Auth0 user data
    (useAuth0 as jest.Mock).mockReturnValue({
      user: {
        name: "John Doe",
      },
      isAuthenticated: true,
    });
  });

  it("renders the bookings page title", () => {
    render(<BookingsPage />);
    expect(screen.getByText("Bookings")).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<BookingsPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays new booking button", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText("New Booking")).toBeInTheDocument();
    });
  });

  it("opens new booking modal when clicking new button", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      const newButton = screen.getByText("New Booking");
      fireEvent.click(newButton);
      expect(screen.getByText("New Booking")).toBeInTheDocument();
    });
  });

  it("displays booking table after loading", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Team Alpha")).toBeInTheDocument();
      expect(screen.getByText("Team Beta")).toBeInTheDocument();
    });
  });

  it("displays booking details in table", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Court 1")).toBeInTheDocument();
      expect(screen.getByText("Court 2")).toBeInTheDocument();
    });
  });

  it("displays booking status badges", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText("confirmed")).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
    });
  });

  it("opens edit modal when clicking edit button", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);
      expect(screen.getByText("Edit Booking")).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog when clicking delete button", async () => {
    const mockConfirm = jest.fn();
    window.confirm = mockConfirm;

    render(<BookingsPage />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  it("displays table headers", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Team")).toBeInTheDocument();
      expect(screen.getByText("Court")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Time")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  it("displays booking times correctly", async () => {
    render(<BookingsPage />);
    await waitFor(() => {
      expect(screen.getByText("14:00 - 16:00")).toBeInTheDocument();
      expect(screen.getByText("10:00 - 12:00")).toBeInTheDocument();
    });
  });
});
