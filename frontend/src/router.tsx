import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Route, Routes } from "react-router-dom";
import ClubOwnerLayout from "./screens/layouts/club-owner";
import ClubOwnerDashboard from "./screens/club-owner/dashboard";
import TeamsPage from "./screens/club-owner/teams";
import PlayersPage from "./screens/club-owner/players";
import BookingsPage from "./screens/club-owner/bookings";
import CostsPage from "./screens/club-owner/costs";
import SettingsPage from "./screens/club-owner/settings";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function Router() {
  const { isAuthenticated } = useAuth0();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/club-owner/dashboard" replace />
          ) : (
            <div>Welcome to Racket</div>
          )
        }
      />
      <Route
        path="/club-owner"
        element={
          <ProtectedRoute>
            <ClubOwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClubOwnerDashboard />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="costs" element={<CostsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
