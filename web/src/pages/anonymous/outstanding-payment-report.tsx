import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  IoSearch,
  IoPerson,
  IoCalendar,
  IoPeople,
  IoWallet,
} from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

import Currency from "@/components/currency";
import { useApi } from "@/hooks/useApi";
import { normalizeText } from "@/utils";
import { Skeleton, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

type MatchDetails = {
  date: Date;
  matchCost: number;
  additionalCost: number;
  matchPlayerCount: number;
  individualCost: number;
};

type PlayerGrouping = {
  playerId: number;
  playerName: string;
  playerEmail: string;
  playerTotalCost: number;
  matches: MatchDetails[];
};

const PlayerLoading = () => (
  <div className="animate-pulse">
    <div className="mb-4 h-16 rounded-lg bg-slate-100"></div>
    <div className="space-y-2">
      <div className="h-4 w-3/4 rounded bg-slate-100"></div>
      <div className="h-4 w-1/2 rounded bg-slate-100"></div>
    </div>
  </div>
);

export default function OutstandingReport() {
  const { get } = useApi();
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get("share-code");
  const { isFetching, data, isError } = useQuery<PlayerGrouping[]>({
    retry: false,
    queryKey: ["getOutstandingPaymentReport"],
    queryFn: () =>
      get<PlayerGrouping[]>(
        `api/v1/anonymous/reports/outstanding-payments?shareCode=${shareCode}`,
      ),
    initialData: [],
  });

  const filterGroupingData = useMemo(() => {
    if (search) {
      return (
        data?.filter((item) =>
          normalizeText(item.playerName.toLowerCase()).includes(
            normalizeText(search.toLowerCase()),
          ),
        ) ?? []
      );
    }
    return data;
  }, [search, data]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <iframe
          src="https://giphy.com/embed/gj0QdZ9FgqGhOBNlFS"
          width="378"
          height="480"
          frameBorder="0"
          className="giphy-embed"
          allowFullScreen
        ></iframe>
        <p>
          <a href="https://giphy.com/gifs/lol-laugh-laughing-gj0QdZ9FgqGhOBNlFS">
            via GIPHY
          </a>
        </p>
        <h3 className="mt-4 text-2xl font-bold text-violet-500">
          Error Occurred
        </h3>
        <p className="mt-2 text-slate-600">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="m-auto flex flex-col justify-center gap-6 p-4 lg:w-2/3 xl:w-1/2">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Outstanding Payments
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          View and track payment details for all players
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <TextInput
          leftSection={<IoSearch size={20} className="text-slate-400" />}
          size="md"
          placeholder="Search by player name..."
          onChange={handleSearch}
          className="w-full"
        />
        {search && (
          <p className="mt-1 text-xs text-slate-500">
            Showing {filterGroupingData?.length} results
          </p>
        )}
      </div>

      {/* Content */}
      {isFetching ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlayerLoading key={index} />
          ))}
        </div>
      ) : filterGroupingData?.length === 0 ? (
        <div className="rounded-lg bg-green-50 px-5 py-12 text-center">
          <div className="text-xl font-bold text-green-600">All Clear!</div>
          <p className="mt-1 text-sm text-green-700">
            No outstanding payments found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filterGroupingData?.map((player) => (
            <div
              key={player.playerId}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md"
            >
              {/* Player Header */}
              <div className="border-b border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <IoPerson className="text-blue-600" size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-800">
                        {player.playerName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{player.playerEmail}</span>
                        <span>•</span>
                        <span>{player.matches.length} matches</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5">
                    <IoWallet className="text-green-600" size={18} />
                    <span className="font-semibold text-green-700">
                      <Currency value={player.playerTotalCost} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="divide-y divide-slate-100">
                {player.matches.map((match, i) => (
                  <div key={i} className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <IoCalendar className="text-slate-400" />
                        <span className="text-slate-600">
                          {dayjs(match.date).format("DD/MM/YYYY")}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1 text-slate-600">
                          <IoPeople className="text-slate-400" />
                          <span>{match.matchPlayerCount} players</span>
                        </div>
                      </div>
                      <div className="text-slate-600">
                        Match Cost: <Currency value={match.matchCost} />
                      </div>
                      <div className="text-right font-medium text-pink-600">
                        Your Share: <Currency value={match.individualCost} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-4 text-center text-sm text-slate-500">
        Contact the match organizer to settle your payment
      </div>
    </div>
  );
}
