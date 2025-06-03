import cx from "clsx";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiClock, FiGift, FiMapPin } from "react-icons/fi";
import {
  IoCheckmarkCircle,
  IoFileTrayOutline,
  IoAddCircle,
} from "react-icons/io5";

import { useAuth0 } from "@auth0/auth0-react";
import {
  Badge,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Button,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import formatter from "../../common/formatter";
import { useApi } from "../../hooks/useApi";
import {
  useAttendantRequestsQuery,
  useUpcomingMatches,
} from "../../hooks/useQueries";
import { MatchSummaryModel } from "../../models";

export default function Requests() {
  const api = useApi();
  const { user } = useAuth0();
  const { data: attendantRequests, refetch: refetchAttendants } =
    useAttendantRequestsQuery(user?.sub ?? "");

  const {
    data: matches,
    refetch: refetchMatches,
    isLoading: matchsLoading,
  } = useUpcomingMatches();

  const toggleAttendantClick = async (match: MatchSummaryModel) => {
    try {
      await api.post("api/v1/registrations/attendant-requests", {
        externalUserId: user?.sub,
        lastName: user?.family_name,
        firstName: user?.given_name,
        email: user?.email,
        matchId: match.matchId,
      });

      await Promise.all([refetchAttendants(), refetchMatches()]);

      notifications.show({
        title: "Success",
        message: "You've successfully joined the match!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Unable to join the match. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 px-4 py-6">
      <div className="mb-4">
        <Text size="xl" fw={700} className="mb-1">
          Available Matches
        </Text>
        <Text size="sm" c="dimmed">
          Join matches and play with other players
        </Text>
      </div>

      {matchsLoading ? (
        <Stack gap="md">
          {[1, 2].map((i) => (
            <Paper key={i} withBorder p="md" radius="md">
              <Skeleton height={100} />
            </Paper>
          ))}
        </Stack>
      ) : matches && matches.length > 0 ? (
        <AnimatePresence>
          {matches.map((m) => {
            const isAttended = attendantRequests
              ?.map((r) => r.matchId)
              ?.includes(m.matchId);
            return (
              <motion.div
                key={m.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  className={cx(
                    "mb-4 transition-all duration-300 hover:shadow-md",
                    isAttended && "border-l-4 border-l-green-500",
                  )}
                >
                  <div className="flex flex-col gap-4">
                    {/* Header with Date and Status */}
                    <div className="flex items-center justify-between">
                      <Group gap="xs">
                        <FiCalendar className="text-blue-500" size={20} />
                        <Text fw={600} size="lg">
                          {formatter.formatWeekDay(m.start, false)}
                        </Text>
                      </Group>
                      {isAttended && (
                        <Badge color="green" variant="light" size="lg">
                          You're In!
                        </Badge>
                      )}
                    </div>

                    {/* Location and Time */}
                    <div className="flex flex-col gap-2">
                      <Group gap="xs">
                        <FiMapPin className="text-blue-500" size={18} />
                        <Text size="sm" c="dimmed">
                          {m.sportCenterName}
                        </Text>
                      </Group>

                      <Group gap="xs">
                        <FiClock className="text-blue-500" size={18} />
                        <Text size="sm" c="dimmed">
                          {formatter.formatTime(m.start)} -{" "}
                          {formatter.formatTime(m.end)}
                        </Text>
                      </Group>

                      {isAttended && (
                        <Group gap="xs">
                          <FiGift className="text-pink-500" size={18} />
                          <Text fw={600} c="pink" size="sm">
                            Cost: {formatter.currency(m.individualCost)}
                          </Text>
                        </Group>
                      )}
                    </div>

                    {/* Action Button */}
                    {!dayjs(new Date()).isSame(m.start, "day") && (
                      <div className="flex justify-end">
                        {isAttended ? (
                          <Button
                            variant="light"
                            color="green"
                            leftSection={<IoCheckmarkCircle size={20} />}
                            className="w-full sm:w-auto"
                          >
                            Joined Successfully
                          </Button>
                        ) : (
                          <Button
                            variant="filled"
                            color="blue"
                            leftSection={<IoAddCircle size={20} />}
                            onClick={() => toggleAttendantClick(m)}
                            className="w-full sm:w-auto"
                          >
                            Join Match
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Paper>
              </motion.div>
            );
          })}
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-slate-200 p-8 text-center"
        >
          <IoFileTrayOutline size={48} className="text-slate-400" />
          <Text size="lg" fw={500} c="dimmed">
            No Matches Available
          </Text>
          <Text size="sm" c="dimmed" className="max-w-sm">
            There are no upcoming matches at the moment. Check back soon for new
            opportunities to play!
          </Text>
        </motion.div>
      )}
    </div>
  );
}
