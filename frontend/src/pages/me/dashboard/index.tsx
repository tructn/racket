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
  IoWallet,
  IoLocation,
  IoCall,
  IoMail,
  IoPeople,
  IoThumbsDown,
  IoApps,
  IoGolf,
  IoTime,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useClaims } from "@/hooks/useClaims";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import Currency from "@/components/currency";
import { notifications } from "@mantine/notifications";
import SectionLoading from "@/components/loading/section-loading";

interface Match {
  matchId: number;
  start: string;
  end: string;
  sportCenterName: string;
  sportCenterId: number;
  costPerSection: number;
  minutePerSection: number;
  individualCost: number;
  cost: number;
  additionalCost: number;
  court: string;
  customSection: string | null;
  playerCount: number;
  registrationIds: number[];
}

function MeDashboard() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { isAdmin, isLoading: isClaimsLoading } = useClaims();
  const { get } = useApi();

  const { data: availableMatches = [], isLoading: isMatchesLoading } = useQuery<
    Match[]
  >({
    queryKey: ["upcoming-matches"],
    queryFn: () => get<Match[]>("api/v1/upcoming-matches"),
  });

  const handleBookNow = (matchId: number) => {
    notifications.show({
      title: "Coming Soon",
      message: "This feature is coming soon!",
      color: "pink",
    });
  };

  const handleNotInterested = () => {
    notifications.show({
      title: "Coming Soon",
      message: "This feature is coming soon!",
      color: "blue",
    });
  };

  if (isClaimsLoading || isMatchesLoading) {
    return <SectionLoading />;
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
                <IoApps className="text-blue-600" size={24} />
                <div>
                  <Text size="lg" fw={500}>
                    Admin Panel
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
            onClick={() => navigate("/coming-soon")}
          >
            <div className="flex items-center gap-3">
              <IoGolf className="text-blue-600" size={24} />
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
            onClick={() => navigate("/coming-soon")}
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

        {!availableMatches || availableMatches.length === 0 ? (
          <div className="rounded-lg bg-slate-50 px-5 py-12 text-center">
            <div className="text-xl font-bold text-slate-600">
              No Matches Available
            </div>
            <p className="mt-1 text-sm text-slate-500">
              There are no upcoming matches at the moment
            </p>
          </div>
        ) : (
          <Stack gap="md">
            {availableMatches.map((match) => (
              <Paper key={match.matchId} shadow="sm" p="md" withBorder>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <Group mb="xs">
                      <Badge color="green">Available</Badge>
                      <Text fw={500} size="lg">
                        {dayjs(match.start).format("ddd DD MMM, YYYY")}
                      </Text>
                    </Group>

                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <IoLocation className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">
                            Location
                          </Text>
                          <Text size="sm" fw={500}>
                            {match.sportCenterName} - {match.court}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <IoPeople className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">
                            Players
                          </Text>
                          <Text size="sm" fw={500}>
                            {match.playerCount}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <IoTime className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">
                            Time
                          </Text>
                          <Text size="sm" fw={500}>
                            {dayjs(match.start).format("HH:mm")} -{" "}
                            {dayjs(match.end).format("HH:mm")}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <IoWallet className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">
                            Total Cost
                          </Text>
                          <Text size="sm" fw={500}>
                            <Currency value={match.cost} />
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <IoWallet className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">
                            Your Share
                          </Text>
                          <Text size="sm" fw={500}>
                            <Currency value={match.individualCost} />
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      color="pink"
                      onClick={() => handleBookNow(match.matchId)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Paper>
            ))}
          </Stack>
        )}
      </Card>
    </Container>
  );
}

export default MeDashboard;
