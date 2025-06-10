import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Tabs,
  Card,
  SimpleGrid,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IoArrowBackCircleOutline,
  IoCalendar,
  IoTime,
  IoLocation,
  IoPerson,
  IoAdd,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoHourglass,
  IoStatsChart,
} from "react-icons/io5";
import formatter from "@/common/formatter";
import SectionLoading from "@/components/loading/section-loading";
import { useNavigate } from "react-router-dom";

interface Match {
  id: number;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "completed" | "cancelled";
  opponent: {
    id: number;
    name: string;
    avatar?: string;
  };
  requestStatus?: "pending" | "approved" | "rejected";
}

interface MatchRequest {
  id: number;
  matchId: number;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Mock data
const mockMatches: Match[] = [
  {
    id: 1,
    date: "2024-03-25",
    time: "14:00",
    location: "Central Tennis Court",
    status: "upcoming",
    opponent: {
      id: 101,
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: 2,
    date: "2024-03-28",
    time: "16:30",
    location: "Sports Complex Court 3",
    status: "upcoming",
    opponent: {
      id: 102,
      name: "Emma Wilson",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
  },
  {
    id: 3,
    date: "2024-03-20",
    time: "15:00",
    location: "Community Tennis Center",
    status: "completed",
    opponent: {
      id: 103,
      name: "Michael Brown",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
  {
    id: 4,
    date: "2024-03-15",
    time: "13:00",
    location: "City Park Courts",
    status: "cancelled",
    opponent: {
      id: 104,
      name: "Sarah Davis",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  },
];

const mockRequests: MatchRequest[] = [
  {
    id: 1,
    matchId: 5,
    message: "Requesting a match for next weekend",
    status: "pending",
    createdAt: "2024-03-22T10:00:00Z",
  },
  {
    id: 2,
    matchId: 6,
    message: "Looking for a practice match",
    status: "approved",
    createdAt: "2024-03-21T15:30:00Z",
  },
  {
    id: 3,
    matchId: 7,
    message: "Weekday evening match request",
    status: "rejected",
    createdAt: "2024-03-20T09:15:00Z",
  },
];

export default function MeRequests() {
  const navigate = useNavigate();
  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ["getMyMatches"],
    queryFn: () => Promise.resolve(mockMatches),
  });

  const { data: requests, isLoading: isLoadingRequests } = useQuery<
    MatchRequest[]
  >({
    queryKey: ["getMyMatchRequests"],
    queryFn: () => Promise.resolve(mockRequests),
  });

  if (isLoadingMatches || isLoadingRequests) {
    return <SectionLoading />;
  }

  const upcomingMatches =
    matches?.filter((match) => match.status === "upcoming") || [];
  const pastMatches =
    matches?.filter((match) => match.status !== "upcoming") || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { color: "blue", icon: IoHourglass, label: "Upcoming" },
      completed: {
        color: "green",
        icon: IoCheckmarkCircle,
        label: "Completed",
      },
      cancelled: { color: "red", icon: IoCloseCircle, label: "Cancelled" },
      pending: { color: "yellow", icon: IoHourglass, label: "Pending" },
      approved: { color: "green", icon: IoCheckmarkCircle, label: "Approved" },
      rejected: { color: "red", icon: IoCloseCircle, label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge
        size="sm"
        variant="light"
        color={config.color}
        leftSection={<Icon size={14} />}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <Container size="lg" className="py-8">
      <div className="mb-8">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Match Requests</Title>
            <Text c="dimmed">View and manage your match requests</Text>
          </div>
          <Group>
            <Button
              leftSection={<IoAdd size={20} />}
              variant="light"
              color="blue"
            >
              New Request
            </Button>
            <ActionIcon
              variant="transparent"
              size="lg"
              onClick={() => navigate(-1)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <IoArrowBackCircleOutline size={30} />
            </ActionIcon>
          </Group>
        </Group>
      </div>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} className="mb-8">
        <Card withBorder shadow="sm" p="md">
          <Group>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <IoCalendar size={24} className="text-blue-600" />
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Upcoming Matches
              </Text>
              <Title order={3}>{upcomingMatches.length}</Title>
            </div>
          </Group>
        </Card>

        <Card withBorder shadow="sm" p="md">
          <Group>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <IoStatsChart size={24} className="text-green-600" />
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Completed Matches
              </Text>
              <Title order={3}>
                {pastMatches.filter((m) => m.status === "completed").length}
              </Title>
            </div>
          </Group>
        </Card>

        <Card withBorder shadow="sm" p="md">
          <Group>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
              <IoHourglass size={24} className="text-yellow-600" />
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Pending Requests
              </Text>
              <Title order={3}>
                {requests?.filter((r) => r.status === "pending").length || 0}
              </Title>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <Tabs defaultValue="upcoming">
        <Tabs.List>
          <Tabs.Tab value="upcoming">Upcoming Matches</Tabs.Tab>
          <Tabs.Tab value="history">Match History</Tabs.Tab>
          <Tabs.Tab value="requests">My Requests</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upcoming" pt="md">
          <Paper shadow="sm" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date & Time</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Opponent</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!upcomingMatches.length ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
                        <Text size="lg" c="dimmed">
                          No upcoming matches
                        </Text>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  upcomingMatches.map((match) => (
                    <Table.Tr key={match.id}>
                      <Table.Td>
                        <Stack gap={4}>
                          <Group gap={8}>
                            <IoCalendar size={16} className="text-blue-500" />
                            <Text size="sm">
                              {formatter.formatDate(new Date(match.date))}
                            </Text>
                          </Group>
                          <Group gap={8}>
                            <IoTime size={16} className="text-blue-500" />
                            <Text size="sm">{match.time}</Text>
                          </Group>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8}>
                          <IoLocation size={16} className="text-blue-500" />
                          <Text size="sm">{match.location}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8}>
                          <IoPerson size={16} className="text-blue-500" />
                          <Text size="sm">{match.opponent.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{getStatusBadge(match.status)}</Table.Td>
                      <Table.Td>
                        <Button variant="light" size="xs">
                          View Details
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Paper shadow="sm" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date & Time</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Opponent</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!pastMatches.length ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
                        <Text size="lg" c="dimmed">
                          No match history
                        </Text>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  pastMatches.map((match) => (
                    <Table.Tr key={match.id}>
                      <Table.Td>
                        <Stack gap={4}>
                          <Group gap={8}>
                            <IoCalendar size={16} className="text-blue-500" />
                            <Text size="sm">
                              {formatter.formatDate(new Date(match.date))}
                            </Text>
                          </Group>
                          <Group gap={8}>
                            <IoTime size={16} className="text-blue-500" />
                            <Text size="sm">{match.time}</Text>
                          </Group>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8}>
                          <IoLocation size={16} className="text-blue-500" />
                          <Text size="sm">{match.location}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8}>
                          <IoPerson size={16} className="text-blue-500" />
                          <Text size="sm">{match.opponent.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{getStatusBadge(match.status)}</Table.Td>
                      <Table.Td>
                        <Button variant="light" size="xs">
                          View Details
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="requests" pt="md">
          <Paper shadow="sm" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Message</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!requests?.length ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
                        <Text size="lg" c="dimmed">
                          No requests yet
                        </Text>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  requests.map((request) => (
                    <Table.Tr key={request.id}>
                      <Table.Td>
                        <Text size="sm">
                          {formatter.formatDate(new Date(request.createdAt))}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{request.message}</Text>
                      </Table.Td>
                      <Table.Td>{getStatusBadge(request.status)}</Table.Td>
                      <Table.Td>
                        <Button variant="light" size="xs">
                          View Details
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
