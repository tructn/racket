import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import PlayersPage from "../players";

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

describe("PlayersPage", () => {
  beforeEach(() => {
    // Mock Auth0 user data
    (useAuth0 as jest.Mock).mockReturnValue({
      user: {
        name: "John Doe",
      },
      isAuthenticated: true,
    });
  });

  it("renders the players page title", () => {
    render(<PlayersPage />);
    expect(screen.getByText("Players")).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<PlayersPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays add player button", async () => {
    render(<PlayersPage />);
    await waitFor(() => {
      expect(screen.getByText("Add Player")).toBeInTheDocument();
    });
  });

  it("opens add player modal when clicking add button", async () => {
    render(<PlayersPage />);
    await waitFor(() => {
      const addButton = screen.getByText("Add Player");
      fireEvent.click(addButton);
      expect(screen.getByText("Add Player")).toBeInTheDocument();
    });
  });

  it("displays player table after loading", async () => {
    render(<PlayersPage />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  it("displays player details in table", async () => {
    render(<PlayersPage />);
    await waitFor(() => {
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();
    });
  });

  it("displays team count in table", async () => {
    render(<PlayersPage />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("opens edit modal when clicking edit button", async () => {
    render(<PlayersPage />);
    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);
      expect(screen.getByText("Edit Player")).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog when clicking delete button", async () => {
    const mockConfirm = jest.fn();
    window.confirm = mockConfirm;

    render(<PlayersPage />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  it("displays table headers", async () => {
    render(<PlayersPage />);
    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Phone")).toBeInTheDocument();
      expect(screen.getByText("Teams")).toBeInTheDocument();
      expect(screen.getByText("Joined")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });
});
