import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import ClubOwnerLayout from "./screens/layouts/club-owner";
import Landing from "./screens/landing";

const ClubOwnerDashboard = lazy(() => import("./screens/club-owner/dashboard"));
const TeamsPage = lazy(() => import("./screens/club-owner/teams"));
const PlayersPage = lazy(() => import("./screens/club-owner/players"));
const BookingsPage = lazy(() => import("./screens/club-owner/bookings"));
const CostsPage = lazy(() => import("./screens/club-owner/costs"));
const SettingsPage = lazy(() => import("./screens/club-owner/settings"));
const PageNotFoundScreen = lazy(() => import("./screens/page-not-found"));

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

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/club-owner/dashboard" replace />
          ) : (
            <Landing />
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

      <Route path="*" element={<PageNotFoundScreen />} />
    </Routes>
  );
}

export default App;
