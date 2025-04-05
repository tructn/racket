import { useAuth0 } from "@auth0/auth0-react";
import { Skeleton } from "@mantine/core";
import cx from "clsx";
import dayjs from "dayjs";
import { FiCalendar, FiClock, FiGift, FiMapPin } from "react-icons/fi";
import { IoCheckmarkCircle, IoFileTrayOutline } from "react-icons/io5";
import formatter from "../../common/formatter";
import {
  useAttendantRequestsQuery,
  useUpcomingMatches,
} from "../../hooks/useQueries";
import { MatchSummaryModel } from "../../models";
import { useApi } from "../../hooks/useApi";
import { notifications } from "@mantine/notifications";

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
        message: "Successfully joined the match!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to join the match. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 px-2 py-5 md:w-2/3 xl:w-1/3">
      {matchsLoading ? (
        <>
          <div className="flex items-center justify-between rounded bg-slate-100 px-3 py-3">
            <Skeleton height={30} />
          </div>
          <div className="flex items-center justify-between rounded bg-slate-100 px-3 py-3">
            <Skeleton height={30} />
          </div>
        </>
      ) : matches && matches.length > 0 ? (
        matches.map((m) => {
          const isAttended = attendantRequests
            ?.map((r) => r.matchId)
            ?.includes(m.matchId);
          return (
            <div
              key={m.matchId}
              className="flex items-center justify-between rounded bg-slate-100 px-3 py-3"
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 font-bold">
                  <FiCalendar />
                  <span>{formatter.formatWeekDay(m.start, false)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMapPin />
                  <span>{m.sportCenterName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock />
                  <span>{formatter.formatTime(m.start)}</span>
                  <span>-</span>
                  <span>{formatter.formatTime(m.end)}</span>
                </div>
                {isAttended && (
                  <div className="flex items-center space-x-2 font-bold text-pink-500">
                    <FiGift />
                    <span>{formatter.currency(m.individualCost)}</span>
                  </div>
                )}
              </div>

              {!dayjs(new Date()).isSame(m.start, "day") && (
                <button
                  onClick={() => toggleAttendantClick(m)}
                  className={cx(
                    "rounded-full ring-2 ring-offset-1 transition-all active:translate-y-1",
                    isAttended
                      ? "animate-pulse text-green-500 ring-green-500"
                      : "text-slate-300 ring-slate-300",
                  )}
                >
                  <IoCheckmarkCircle size={50} />
                </button>
              )}
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center">
          <IoFileTrayOutline size={30} />
          <span>No Match Available</span>
        </div>
      )}
    </div>
  );
}
