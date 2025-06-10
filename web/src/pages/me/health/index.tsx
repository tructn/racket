import {
  ActionIcon,
  Badge,
  Container,
  Group,
  Stack,
  Table,
  Text,
  Card,
  SimpleGrid,
  List,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IoArrowBackCircleOutline,
  IoCalendar,
  IoTrendingUp,
  IoTrendingDown,
  IoWarning,
  IoStatsChart,
} from "react-icons/io5";
import SectionLoading from "@/components/loading/section-loading";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface HealthMetrics {
  performanceScore: number;
  matchStats: {
    totalMatches: number;
    winRate: number;
    averageDuration: number;
    recentForm: "winning" | "losing" | "stable";
  };
  recentMatches: {
    id: string;
    date: string;
    duration: number;
    result: "win" | "loss";
    score: string;
    opponent: string;
  }[];
  performanceHistory: {
    date: string;
    score: number;
    winRate: number;
  }[];
  recommendations: string[];
}

const mockHealthData: HealthMetrics = {
  performanceScore: 85,
  matchStats: {
    totalMatches: 24,
    winRate: 65,
    averageDuration: 45,
    recentForm: "winning",
  },
  recentMatches: [
    {
      id: "1",
      date: "2024-03-15",
      duration: 48,
      result: "win",
      score: "21-18, 21-16",
      opponent: "John Smith",
    },
    {
      id: "2",
      date: "2024-03-12",
      duration: 52,
      result: "loss",
      score: "19-21, 21-19, 18-21",
      opponent: "Sarah Johnson",
    },
    {
      id: "3",
      date: "2024-03-08",
      duration: 45,
      result: "win",
      score: "21-15, 21-17",
      opponent: "Mike Brown",
    },
  ],
  performanceHistory: [
    { date: "2024-02-15", score: 75, winRate: 60 },
    { date: "2024-02-22", score: 78, winRate: 62 },
    { date: "2024-03-01", score: 82, winRate: 65 },
    { date: "2024-03-08", score: 80, winRate: 63 },
    { date: "2024-03-15", score: 85, winRate: 65 },
  ],
  recommendations: [
    "Consider increasing your training frequency to 3 times per week",
    "Focus on improving your backhand technique",
    "Work on your footwork speed and agility",
    "Practice serving accuracy",
  ],
};

export default function MeHealth() {
  const navigate = useNavigate();
  const {
    data: healthData,
    isLoading,
    error,
  } = useQuery<HealthMetrics>({
    queryKey: ["health-metrics"],
    queryFn: () => Promise.resolve(mockHealthData),
  });

  if (isLoading) {
    return <SectionLoading />;
  }

  if (error) {
    return <div>Error loading health data</div>;
  }

  return (
    <Container size="lg" className="py-8">
      <div className="mb-8">
        <Group justify="space-between" align="center">
          <div className="flex items-center gap-3">
            <IoStatsChart className="text-blue-600" size={24} />
            <div>
              <Text size="lg" fw={500}>
                Performance Analytics
              </Text>
              <Text size="sm" c="dimmed">
                Track your match performance and statistics
              </Text>
            </div>
          </div>
          <ActionIcon
            variant="transparent"
            size="lg"
            onClick={() => navigate(-1)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <IoArrowBackCircleOutline size={30} />
          </ActionIcon>
        </Group>
      </div>

      {/* Performance Trend Chart */}
      <Card withBorder shadow="sm" p="xl" mb="xl">
        <Text size="lg" fw={500} mb="md">
          Performance Trend
        </Text>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={healthData?.performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis yAxisId="left" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, ""]}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="score"
                stroke="#228be6"
                name="Performance Score"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="winRate"
                stroke="#40c057"
                name="Win Rate"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Key Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="8" spacing="md">
        <Card withBorder shadow="sm" p="md">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Total Matches
            </Text>
            <Group>
              <Text size="xl" fw={700}>
                {healthData?.matchStats.totalMatches}
              </Text>
              <IoCalendar size={20} />
            </Group>
          </Stack>
        </Card>

        <Card withBorder shadow="sm" p="md">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Win Rate
            </Text>
            <Group>
              <Text size="xl" fw={700}>
                {healthData?.matchStats.winRate}%
              </Text>
              {healthData?.matchStats.recentForm === "winning" ? (
                <IoTrendingUp size={20} color="green" />
              ) : healthData?.matchStats.recentForm === "losing" ? (
                <IoTrendingDown size={20} color="red" />
              ) : (
                <IoWarning size={20} color="orange" />
              )}
            </Group>
          </Stack>
        </Card>

        <Card withBorder shadow="sm" p="md">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Avg. Match Duration
            </Text>
            <Group>
              <Text size="xl" fw={700}>
                {healthData?.matchStats.averageDuration} min
              </Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder shadow="sm" p="md">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Recent Form
            </Text>
            <Group>
              <Badge
                color={
                  healthData?.matchStats.recentForm === "winning"
                    ? "green"
                    : healthData?.matchStats.recentForm === "losing"
                      ? "red"
                      : "orange"
                }
                size="lg"
              >
                {(healthData?.matchStats.recentForm ?? "stable")
                  .charAt(0)
                  .toUpperCase() +
                  (healthData?.matchStats.recentForm ?? "stable").slice(1)}
              </Badge>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Match Statistics Chart */}
      <Card withBorder shadow="sm" p="xl" mb="xl">
        <Text size="lg" fw={500} mb="md">
          Match Statistics
        </Text>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={healthData?.recentMatches}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="opponent" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="duration" name="Duration (min)" fill="#228be6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Matches */}
      <Card withBorder shadow="sm" p="md" mb="8">
        <Text size="lg" fw={500} mb="md">
          Recent Matches
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Opponent</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Result</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {healthData?.recentMatches.map((match) => (
              <Table.Tr key={match.id}>
                <Table.Td>{match.date}</Table.Td>
                <Table.Td>{match.opponent}</Table.Td>
                <Table.Td>{match.duration} min</Table.Td>
                <Table.Td>{match.score}</Table.Td>
                <Table.Td>
                  <Badge color={match.result === "win" ? "green" : "red"}>
                    {match.result.toUpperCase()}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Recommendations */}
      <Card withBorder shadow="sm" p="md">
        <Text size="lg" fw={500} mb="md">
          Performance Recommendations
        </Text>
        <List spacing="sm">
          {healthData?.recommendations.map((recommendation, index) => (
            <List.Item key={index}>{recommendation}</List.Item>
          ))}
        </List>
      </Card>
    </Container>
  );
}
