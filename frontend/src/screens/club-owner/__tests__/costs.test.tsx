import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import CostsPage from "../costs";

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

describe("CostsPage", () => {
  beforeEach(() => {
    // Mock Auth0 user data
    (useAuth0 as jest.Mock).mockReturnValue({
      user: {
        name: "John Doe",
      },
      isAuthenticated: true,
    });
  });

  it("renders the costs page title", () => {
    render(<CostsPage />);
    expect(screen.getByText("Costs")).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<CostsPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays add cost button", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      expect(screen.getByText("Add Cost")).toBeInTheDocument();
    });
  });

  it("opens add cost modal when clicking add button", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      const addButton = screen.getByText("Add Cost");
      fireEvent.click(addButton);
      expect(screen.getByText("Add Cost")).toBeInTheDocument();
    });
  });

  it("displays total costs card", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      expect(screen.getByText("Total Costs: $350")).toBeInTheDocument();
    });
  });

  it("displays cost table after loading", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      expect(screen.getByText("Team Alpha")).toBeInTheDocument();
      expect(screen.getByText("Team Beta")).toBeInTheDocument();
    });
  });

  it("displays cost details in table", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      expect(screen.getByText("Court rental")).toBeInTheDocument();
      expect(screen.getByText("Equipment purchase")).toBeInTheDocument();
    });
  });

  it("displays cost amounts in table", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      expect(screen.getByText("$100")).toBeInTheDocument();
      expect(screen.getByText("$250")).toBeInTheDocument();
    });
  });

  it("opens edit modal when clicking edit button", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);
      expect(screen.getByText("Edit Cost")).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog when clicking delete button", async () => {
    const mockConfirm = jest.fn();
    window.confirm = mockConfirm;

    render(<CostsPage />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  it("displays table headers", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      expect(screen.getByText("Team")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  it("displays cost categories correctly", async () => {
    render(<CostsPage />);
    await waitFor(() => {
      expect(screen.getByText("Rental")).toBeInTheDocument();
      expect(screen.getByText("Equipment")).toBeInTheDocument();
    });
  });
});
