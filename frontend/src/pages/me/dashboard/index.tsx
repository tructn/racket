import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Card,
  Group,
  Badge,
  Stack,
  Button,
} from "@mantine/core";
import { useAuth0 } from "@auth0/auth0-react";
import {
  IoShieldCheckmark,
  IoWallet,
  IoNotifications,
  IoLocation,
  IoCall,
  IoMail,
  IoPeople,
  IoThumbsDown,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useClaims } from "@/hooks/useClaims";

interface Match {
  id: string;
  location: string;
  price: number;
  team: string;
  date: string;
  time: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: "available" | "booked" | "pending";
}

function MeDashboard() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { isAdmin, isLoading: isClaimsLoading } = useClaims();

  // Mock data - replace with actual API call
  const availableMatches: Match[] = [
    {
      id: "1",
      location: "Sports Center A - Court 1",
      price: 50,
      team: "Team Alpha",
      date: "2024-03-20",
      time: "18:00 - 20:00",
      contactName: "John Smith",
      contactPhone: "+1 234 567 890",
      contactEmail: "john@example.com",
      status: "available",
    },
    {
      id: "2",
      location: "Sports Center B - Court 2",
      price: 45,
      team: "Team Beta",
      date: "2024-03-21",
      time: "19:00 - 21:00",
      contactName: "Sarah Johnson",
      contactPhone: "+1 234 567 891",
      contactEmail: "sarah@example.com",
      status: "available",
    },
    {
      id: "3",
      location: "Sports Center C - Court 3",
      price: 55,
      team: "Team Gamma",
      date: "2024-03-22",
      time: "17:00 - 19:00",
      contactName: "Mike Brown",
      contactPhone: "+1 234 567 892",
      contactEmail: "mike@example.com",
      status: "available",
    },
  ];

  const getStatusColor = (status: Match["status"]): string => {
    switch (status) {
      case "available":
        return "green";
      case "booked":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const handleViewDetails = (matchId: string) => {
    navigate(`/me/matches/${matchId}`);
  };

  const handleBookNow = (matchId: string) => {
    navigate(`/me/bookings/new?matchId=${matchId}`);
  };

  const handleNotInterested = () => {
    navigate("/me/bookings");
  };

  if (isClaimsLoading) {
    return null; // Or return a loading spinner
  }

  return (
    <Container size="lg" className="py-8">
      {/* Dashboard Tiles Section */}
      <div className="mb-8">
        <Title order={2}>Welcome, {user?.name || "User"}!</Title>
        <Text c="dimmed">Your activity overview</Text>
      </div>

      <Grid className="mb-8">
        {isAdmin && (
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper
              shadow="sm"
              p="md"
              className="h-full cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate("/admin/dashboard")}
            >
              <div className="flex items-center gap-3">
                <IoShieldCheckmark className="text-blue-600" size={24} />
                <div>
                  <Text size="lg" fw={500}>
                    Admin Console
                  </Text>
                  <Text size="sm" c="dimmed">
                    Organize your teams and matches
                  </Text>
                </div>
              </div>
            </Paper>
          </Grid.Col>
        )}

        <Grid.Col span={{ base: 12, md: isAdmin ? 4 : 6 }}>
          <Paper
            shadow="sm"
            p="md"
            className="h-full cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate("/me/requests")}
          >
            <div className="flex items-center gap-3">
              <IoNotifications className="text-blue-600" size={24} />
              <div>
                <Text size="lg" fw={500}>
                  My Requests
                </Text>
                <Text size="sm" c="dimmed">
                  Track your pending requests
                </Text>
              </div>
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: isAdmin ? 4 : 6 }}>
          <Paper
            shadow="sm"
            p="md"
            className="h-full cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate("/me/wallet")}
          >
            <div className="flex items-center gap-3">
              <IoWallet className="text-blue-600" size={24} />
              <div>
                <Text size="lg" fw={500}>
                  Wallet
                </Text>
                <Text size="sm" c="dimmed">
                  Manage your wallet balance
                </Text>
              </div>
            </div>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Available Matches Section */}
      <Card shadow="sm" p="lg" className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Title order={3}>Available Matches</Title>
            <Text c="dimmed">Find and book your next match</Text>
          </div>
          <Button
            color="red"
            variant="light"
            leftSection={<IoThumbsDown />}
            onClick={handleNotInterested}
          >
            Not interested
          </Button>
        </div>

        <Stack gap="md">
          {availableMatches.map((match) => (
            <Paper key={match.id} shadow="sm" p="md" withBorder>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <Group mb="xs">
                    <Badge color={getStatusColor(match.status)}>
                      {match.status.charAt(0).toUpperCase() +
                        match.status.slice(1)}
                    </Badge>
                    <Text fw={500} size="lg">
                      {dayjs(match.date).format("MMMM D, YYYY")} - {match.time}
                    </Text>
                  </Group>

                  <Group gap="xl" mb="xs">
                    <Group gap="xs">
                      <IoLocation className="text-blue-600" size={16} />
                      <Text size="sm">{match.location}</Text>
                    </Group>
                    <Group gap="xs">
                      <IoPeople className="text-blue-600" size={16} />
                      <Text size="sm">{match.team}</Text>
                    </Group>
                    <Group gap="xs">
                      <IoWallet className="text-blue-600" size={16} />
                      <Text size="sm">${match.price}</Text>
                    </Group>
                  </Group>

                  <Group gap="xl">
                    <Group gap="xs">
                      <IoCall className="text-blue-600" size={16} />
                      <Text size="sm">{match.contactPhone}</Text>
                    </Group>
                    <Group gap="xs">
                      <IoMail className="text-blue-600" size={16} />
                      <Text size="sm">{match.contactEmail}</Text>
                    </Group>
                  </Group>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() => handleViewDetails(match.id)}
                  >
                    View Details
                  </Button>
                  <Button color="blue" onClick={() => handleBookNow(match.id)}>
                    Book Now
                  </Button>
                </div>
              </div>
            </Paper>
          ))}
        </Stack>
      </Card>
    </Container>
  );
}

export default MeDashboard;
