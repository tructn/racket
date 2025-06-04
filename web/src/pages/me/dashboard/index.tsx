import dayjs from "dayjs";
import { useState } from "react";
import ReactConfetti from "react-confetti";
import {
  IoApps,
  IoBookmark,
  IoCalendar,
  IoCloseCircle,
  IoGolf,
  IoLocation,
  IoPeople,
  IoThumbsDown,
  IoTime,
  IoWallet,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "react-use";

import Currency from "@/components/currency";
import SectionLoading from "@/components/loading/section-loading";
import { useApi } from "@/hooks/useApi";
import { useClaims } from "@/hooks/useClaims";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface MyUpcomingMatch {
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
  isRegistered: boolean;
}

function MeDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth0();
  const { isAdmin, isLoading: isClaimsLoading } = useClaims();
  const { get, post } = useApi();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: availableMatches = [], isLoading: isMatchesLoading } = useQuery<
    MyUpcomingMatch[]
  >({
    queryKey: ["my-upcoming-matches"],
    queryFn: () => get<MyUpcomingMatch[]>("api/v1/me/upcoming-matches"),
  });

  const { mutate: registerMatch, isPending: isRegistering } = useMutation({
    mutationFn: (matchId: number) =>
      post<{ matchId: number }>("api/v1/registrations/matches/register", {
        matchId,
      }),
    onSuccess: () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
      notifications.show({
        title: "Success",
        message: "Successfully booked the match",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["my-upcoming-matches"] });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to book the match",
        color: "red",
      });
    },
  });

  const { mutate: unregisterMatch, isPending: isUnregistering } = useMutation({
    mutationFn: (matchId: number) =>
      post<{ matchId: number }>("api/v1/registrations/matches/unregister", {
        matchId,
      }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Successfully unregistered for the match",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["my-upcoming-matches"] });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to unregister for the match",
        color: "red",
      });
    },
  });

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
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
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

      <div className="mt-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Title order={3} className="flex items-center gap-2">
              <IoCalendar className="text-blue-600" size={24} />
              Available Matches
            </Title>
            <Text c="dimmed">Find and book your next match</Text>
          </div>
          <Button
            color="red"
            variant="light"
            leftSection={<IoThumbsDown size={18} />}
            onClick={handleNotInterested}
            className="w-full sm:w-auto"
          >
            Not interested
          </Button>
        </div>

        {!availableMatches || availableMatches.length === 0 ? (
          <div className="rounded-lg bg-slate-50 px-4 py-8 text-center sm:px-5 sm:py-12">
            <IoCloseCircle size={48} className="mx-auto mb-4 text-slate-400" />
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
              <Paper
                key={match.matchId}
                shadow="sm"
                p="md"
                withBorder
                className={
                  match.isRegistered ? "border-green-500 bg-green-50" : ""
                }
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <Group mb="xs" wrap="nowrap">
                      <Badge
                        color={match.isRegistered ? "pink" : "green"}
                        leftSection={<IoCalendar size={14} />}
                      >
                        {match.isRegistered ? "Booked" : "Available"}
                      </Badge>
                      <Text fw={500} size="lg" className="truncate">
                        {dayjs(match.start).format("ddd DD MMM, YYYY")}
                      </Text>
                    </Group>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <IoLocation className="text-blue-600" size={16} />
                        </div>
                        <div className="min-w-0">
                          <Text size="xs" c="dimmed">
                            Location
                          </Text>
                          <Text size="sm" fw={500} className="truncate">
                            {match.sportCenterName} - {match.court}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <IoPeople className="text-blue-600" size={16} />
                        </div>
                        <div className="min-w-0">
                          <Text size="xs" c="dimmed">
                            Players
                          </Text>
                          <Text size="sm" fw={500}>
                            {match.playerCount}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <IoTime className="text-blue-600" size={16} />
                        </div>
                        <div className="min-w-0">
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
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <IoWallet className="text-blue-600" size={16} />
                        </div>
                        <div className="min-w-0">
                          <Text size="xs" c="dimmed">
                            Total Cost
                          </Text>
                          <Text size="sm" fw={500}>
                            <Currency value={match.cost} />
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <IoWallet className="text-blue-600" size={16} />
                        </div>
                        <div className="min-w-0">
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

                  <div className="flex justify-end">
                    {match.isRegistered ? (
                      <Button
                        color="red"
                        variant="light"
                        leftSection={<IoCloseCircle size={18} />}
                        onClick={() => unregisterMatch(match.matchId)}
                        loading={isUnregistering}
                        disabled={isUnregistering}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        color="pink"
                        leftSection={<IoBookmark size={18} />}
                        onClick={() => registerMatch(match.matchId)}
                        loading={isRegistering}
                        disabled={isRegistering}
                        className="w-full sm:w-auto"
                      >
                        Book Now
                      </Button>
                    )}
                  </div>
                </div>
              </Paper>
            ))}
          </Stack>
        )}
      </div>
    </Container>
  );
}

export default MeDashboard;
