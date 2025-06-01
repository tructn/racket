import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

import { Skeleton, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import Currency from "@/components/currency";
import { useApi } from "@/hooks/useApi";
import { normalizeText } from "@/utils";

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
  playerTotalCost: number;
  matches: MatchDetails[];
};

const PlayerLoading = () => (
  <>
    <Skeleton height={50} circle />
    <Skeleton height={15} radius="xl" />
    <Skeleton height={15} mt={6} radius="xl" />
    <Skeleton height={15} mt={6} width="70%" radius="xl" />
  </>
);

export default function Page() {
  const { get } = useApi();
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get("share-code");
  const { isFetching, data, isError } = useQuery<PlayerGrouping[]>({
    retry: false,
    queryKey: ["getPublicUnpaidReportV2"],
    queryFn: () =>
      get<PlayerGrouping[]>(
        `api/v2/public/reports/unpaid?shareCode=${shareCode}`,
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
      <div className="flex flex-col items-center text-center">
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
        <h3 className="text-2xl font-bold text-violet-500">Error Occured</h3>
      </div>
    );
  }

  return (
    <div className="m-auto flex flex-col justify-center gap-4 p-4 lg:w-1/2 xl:w-1/3">
      <TextInput
        leftSection={<IoSearch size={24} />}
        size="md"
        placeholder="Search player..."
        onChange={handleSearch}
      />
      {isFetching ? (
        Array.from({ length: 3 }).map((_, index) => (
          <PlayerLoading key={index} />
        ))
      ) : filterGroupingData?.length === 0 ? (
        <div className="rounded-lg bg-green-50 px-5 py-12 text-center text-xl font-bold text-green-500">
          No Data
        </div>
      ) : (
        filterGroupingData?.map((player) => (
          <div
            key={player.playerName}
            className="rounded bg-slate-50 p-2 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 text-lg">
              <div className="font-semibold">{player.playerName}</div>
              <div className="mx-2 flex-1 border-t border-dashed border-slate-500"></div>
              <div className="font-semibold text-green-500">
                <Currency value={player.playerTotalCost} />
              </div>
            </div>
            <div className="mt-2">
              {player.matches.map((match, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 justify-between gap-3 text-sm"
                >
                  <div>{dayjs(match.date).format("DD/MM/YYYY")}</div>
                  <div className="flex items-center gap-1">
                    <Currency value={match.matchCost} />
                    <span>/</span>
                    <span>{match.matchPlayerCount}</span>
                  </div>
                  <div className="text-end text-pink-500">
                    <Currency value={match.individualCost} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
