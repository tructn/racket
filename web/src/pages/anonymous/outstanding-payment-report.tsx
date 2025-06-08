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
import { TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

type PlayerPaymentMatchModel = {
  date: Date;
  matchCost: number;
  additionalCost: number;
  matchPlayerCount: number;
  totalPlayerPaidFor: number;
  individualCost: number;
};

type PlayerPaymentModel = {
  playerId: number;
  playerName: string;
  playerEmail: string;
  playerTotalCost: number;
  matches: PlayerPaymentMatchModel[];
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
  const { isFetching, data, isError } = useQuery<PlayerPaymentModel[]>({
    retry: false,
    queryKey: ["getOutstandingPaymentReport"],
    queryFn: () =>
      get<PlayerPaymentModel[]>(
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
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <div className="relative w-full max-w-4xl">
          <iframe
            src="https://giphy.com/embed/gj0QdZ9FgqGhOBNlFS"
            width="100%"
            height="600"
            frameBorder="0"
            className="giphy-embed transform rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
            allowFullScreen
          ></iframe>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-white/80 px-4 py-2 shadow-md">
            <a
              href="https://giphy.com/gifs/lol-laugh-laughing-gj0QdZ9FgqGhOBNlFS"
              className="text-sm text-violet-600 transition-colors hover:text-violet-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              via GIPHY
            </a>
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <h3 className="text-4xl font-bold text-red-600">
            Oops! Something went wrong
          </h3>
          <p className="text-lg text-red-500">
            Don't worry, even our system needs a coffee break sometimes!
            <br />
            Try refreshing the page or come back later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-red-500 px-6 py-2 text-white shadow-md transition-colors hover:bg-red-600 hover:shadow-lg"
          >
            Refresh Page
          </button>
        </div>
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
                        <div className="flex items-center gap-1 text-slate-600">
                          <span>•</span>
                          <span>Paid for {match.totalPlayerPaidFor}</span>
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
