import { useAuth0 } from "@auth0/auth0-react";
import { Card, Grid, Group, Paper, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { IoPeople, IoCalendar, IoWallet } from "react-icons/io5";

interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  totalBookings: number;
  totalCosts: number;
}

export default function ClubOwnerDashboard() {
  const { user } = useAuth0();
  const { get } = useApi();
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalPlayers: 0,
    totalBookings: 0,
    totalCosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real implementation, you would fetch these stats from your API
        // For now, we'll use mock data
        setStats({
          totalTeams: 3,
          totalPlayers: 24,
          totalBookings: 12,
          totalCosts: 1250,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <Title order={2}>Welcome, {user?.name}</Title>
      <Text color="dimmed">
        Manage your teams, players, bookings, and costs
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Teams</Text>
              <IoPeople className="text-2xl text-blue-500" />
            </Group>
            <Text size="xl" fw={700}>
              {stats.totalTeams}
            </Text>
            <Text size="sm" c="dimmed">
              Total teams you manage
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Players</Text>
              <IoPeople className="text-2xl text-green-500" />
            </Group>
            <Text size="xl" fw={700}>
              {stats.totalPlayers}
            </Text>
            <Text size="sm" c="dimmed">
              Total players in your teams
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Bookings</Text>
              <IoCalendar className="text-2xl text-orange-500" />
            </Group>
            <Text size="xl" fw={700}>
              {stats.totalBookings}
            </Text>
            <Text size="sm" c="dimmed">
              Upcoming court bookings
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Costs</Text>
              <IoWallet className="text-2xl text-red-500" />
            </Group>
            <Text size="xl" fw={700}>
              ${stats.totalCosts}
            </Text>
            <Text size="sm" c="dimmed">
              Total costs this month
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Title order={3} mb="md">
              Recent Teams
            </Title>
            <Text>No teams found. Create your first team to get started.</Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Title order={3} mb="md">
              Upcoming Bookings
            </Title>
            <Text>
              No upcoming bookings. Schedule your first booking to get started.
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
}
