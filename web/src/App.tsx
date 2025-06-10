import { lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { useClaims } from "@/hooks/useClaims";
import Landing from "@/pages/landing";
import AdminLayout from "@/components/layout/admin";
import AnonymousLayout from "@/components/layout/anonymous";
import MeLayout from "@/components/layout/me";
import ComingSoon from "./pages/comming-soon";

const DashboardScreen = lazy(() => import("@/pages/admin/dashboard"));
const MatchesScreen = lazy(() => import("@/pages/admin/matches"));
const PlayerScreen = lazy(() => import("@/pages/admin/players"));
const SportCentersScreen = lazy(() => import("@/pages/admin/sportcenter"));
const SettingsScreen = lazy(() => import("@/pages/admin/settings"));
const PageNotFoundScreen = lazy(() => import("@/pages/page-not-found"));
const Requests = lazy(() => import("@/components/requests"));
const AdminRequestScreen = lazy(() => import("@/pages/admin/requests"));
const ReportingScreen = lazy(() => import("@/pages/admin/reporting"));
const UsersScreen = lazy(() => import("@/pages/admin/users"));
const WalletScreen = lazy(() => import("@/pages/admin/wallets"));
const OutstandingPaymentReport = lazy(
  () => import("@/pages/anonymous/outstanding-payment-report"),
);
const TeamManagement = lazy(() => import("@/pages/admin/teams"));
const ProfileScreen = lazy(() => import("@/pages/admin/profile"));

// Me
const MeDashboard = lazy(() => import("@/pages/me/dashboard"));
const MeWallet = lazy(() => import("@/pages/me/wallet"));
const MePerformance = lazy(() => import("@/pages/me/performance"));

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Inter, sans-serif",
});

function App() {
  const { isAdmin } = useClaims();
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  // Handle post-login redirection
  if (isAuthenticated && !isLoading) {
    const isLandingPage = location.pathname === "/";
    if (isLandingPage) {
      if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/me" replace />;
      }
    }
  }

  return (
    <MantineProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index={true} element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="requests" element={<AdminRequestScreen />} />
          <Route path="players" element={<PlayerScreen />} />
          <Route path="teams" element={<TeamManagement />} />
          <Route path="matches" element={<MatchesScreen />} />
          <Route path="sportcenters" element={<SportCentersScreen />} />
          <Route path="reports" element={<ReportingScreen />} />
          <Route path="users" element={<UsersScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="wallets" element={<WalletScreen />} />
        </Route>
        <Route path="/me" element={<MeLayout />}>
          <Route index element={<MeDashboard />} />
          <Route path="wallet" element={<MeWallet />} />
          <Route path="performance" element={<MePerformance />} />
        </Route>
        <Route path="/anonymous" element={<AnonymousLayout />}>
          <Route index element={<Requests />} />
          <Route
            path="outstanding-payment-report"
            element={<OutstandingPaymentReport />}
          />
        </Route>
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<PageNotFoundScreen />} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
