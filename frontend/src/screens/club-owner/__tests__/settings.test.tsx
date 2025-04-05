import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import SettingsPage from "../settings";

// Mock the useAuth0 hook
jest.mock("@auth0/auth0-react");

// Mock the useApi hook
jest.mock("../../../hooks/useApi", () => ({
  useApi: () => ({
    get: jest.fn(),
    put: jest.fn(),
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    // Mock Auth0 user data
    (useAuth0 as jest.Mock).mockReturnValue({
      user: {
        name: "John Doe",
      },
      isAuthenticated: true,
    });
  });

  it("renders the settings page title", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays settings form after loading", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("Club Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Website")).toBeInTheDocument();
      expect(screen.getByLabelText("Business Hours")).toBeInTheDocument();
    });
  });

  it("displays current settings values", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("Tennis Club")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("123 Tennis Court, Sports City"),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("+1234567890")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("info@tennisclub.com"),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("www.tennisclub.com"),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("9:00 AM - 9:00 PM")).toBeInTheDocument();
    });
  });

  it("updates form values when changed", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      const clubNameInput = screen.getByLabelText("Club Name");
      fireEvent.change(clubNameInput, {
        target: { value: "New Tennis Club" },
      });
      expect(clubNameInput).toHaveValue("New Tennis Club");
    });
  });

  it("displays save changes button", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });
  });

  it("handles form submission", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      const form = screen.getByRole("form");
      fireEvent.submit(form);
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });
  });

  it("shows loading state during save", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      const saveButton = screen.getByText("Save Changes");
      fireEvent.click(saveButton);
      expect(saveButton).toHaveAttribute("loading");
    });
  });

  it("validates required fields", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      const clubNameInput = screen.getByLabelText("Club Name");
      fireEvent.change(clubNameInput, { target: { value: "" } });
      fireEvent.blur(clubNameInput);
      expect(screen.getByText("Club Name is required")).toBeInTheDocument();
    });
  });

  it("maintains form state during edits", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      const clubNameInput = screen.getByLabelText("Club Name");
      const addressInput = screen.getByLabelText("Address");

      fireEvent.change(clubNameInput, {
        target: { value: "New Tennis Club" },
      });
      fireEvent.change(addressInput, {
        target: { value: "New Address" },
      });

      expect(clubNameInput).toHaveValue("New Tennis Club");
      expect(addressInput).toHaveValue("New Address");
    });
  });
});
