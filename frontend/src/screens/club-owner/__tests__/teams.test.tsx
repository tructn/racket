import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import TeamsPage from "../teams";

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

describe("TeamsPage", () => {
  beforeEach(() => {
    // Mock Auth0 user data
    (useAuth0 as jest.Mock).mockReturnValue({
      user: {
        name: "John Doe",
      },
      isAuthenticated: true,
    });
  });

  it("renders the teams page title", () => {
    render(<TeamsPage />);
    expect(screen.getByText("Teams")).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<TeamsPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays create team button", async () => {
    render(<TeamsPage />);
    await waitFor(() => {
      expect(screen.getByText("Create Team")).toBeInTheDocument();
    });
  });

  it("opens create team modal when clicking create button", async () => {
    render(<TeamsPage />);
    await waitFor(() => {
      const createButton = screen.getByText("Create Team");
      fireEvent.click(createButton);
      expect(screen.getByText("Create Team")).toBeInTheDocument();
    });
  });

  it("displays team cards after loading", async () => {
    render(<TeamsPage />);
    await waitFor(() => {
      expect(screen.getByText("Team Alpha")).toBeInTheDocument();
      expect(screen.getByText("Team Beta")).toBeInTheDocument();
    });
  });

  it("displays team details in cards", async () => {
    render(<TeamsPage />);
    await waitFor(() => {
      expect(screen.getByText("Our premier team")).toBeInTheDocument();
      expect(screen.getByText("Development team")).toBeInTheDocument();
    });
  });

  it("displays member count in team cards", async () => {
    render(<TeamsPage />);
    await waitFor(() => {
      expect(screen.getByText("Members: 8")).toBeInTheDocument();
      expect(screen.getByText("Members: 6")).toBeInTheDocument();
    });
  });

  it("opens edit modal when clicking edit button", async () => {
    render(<TeamsPage />);
    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);
      expect(screen.getByText("Edit Team")).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog when clicking delete button", async () => {
    const mockConfirm = jest.fn();
    window.confirm = mockConfirm;

    render(<TeamsPage />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      expect(mockConfirm).toHaveBeenCalled();
    });
  });
});
