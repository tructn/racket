import { Skeleton, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { IoCalendarOutline, IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import Currency from "../../components/currency";
import { useApi } from "../../hooks/useApi";
import { UnpaidModelV2 } from "../../models/reports/unpaid";
import _ from "lodash";

type MatchData = {
  // number of joined players
  playerCount: number;

  // start date of the match
  date: Date;

  // court cost
  cost: number;

  // extra (shuttlecock...)
  additionalCost: number;

  // each player cost
  individualCost: number;

  // total cost = court cost + additional cost
  totalCost: number;
};

type PlayerData = {
  playerName: string;
  matches: MatchData[];
  totalCost: number;
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
  const { isFetching, data, isError } = useQuery({
    retry: false,
    queryKey: ["getPublicUnpaidReport"],
    queryFn: () =>
      get<UnpaidModelV2[]>(
        `api/v1/public/reports/unpaid?shareCode=${shareCode}`,
      ),
  });

  const groupedData = useMemo(() => {
    if (!data) {
      return {};
    }

    return data.reduce(
      (prev, cur) => {
        const {
          playerName,
          matchDate,
          matchCost,
          matchAdditionalCost,
          matchPlayerCount,
        } = cur;
        if (!prev[playerName]) {
          prev[playerName] = {
            playerName: playerName,
            matches: [],
            totalCost: 0,
          };
        }
        prev[playerName].matches.push({
          playerCount: matchPlayerCount,
          date: matchDate,
          cost: matchCost,
          additionalCost: matchAdditionalCost,

          individualCost: (matchCost + matchAdditionalCost) / matchPlayerCount,
          totalCost: matchCost + matchAdditionalCost,
        });
        prev[playerName].totalCost +=
          (matchCost + matchAdditionalCost) / matchPlayerCount;
        return prev;
      },
      {} as Record<string, PlayerData>,
    );
  }, [data]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const normalize = (input: string) => {
    return input
      .normalize("NFD") // Decompose combined characters (e.g., "é" → "é")
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks
  };

  const filterPlayers = useMemo(() => {
    if (!groupedData) return [];

    const dataset = Object.keys(groupedData).map((key) => ({
      playerName: key,
      matches: groupedData[key]?.matches,
      totalCost: groupedData[key]?.totalCost,
    }));

    const orderedData = _.orderBy(dataset, (item) => item.playerName, "asc");
    orderedData.forEach((ds) => {
      if (ds.matches) {
        ds.matches.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      }
    });

    if (search) {
      return dataset?.filter((item) =>
        normalize(item.playerName.toLowerCase()).includes(
          normalize(search.toLowerCase()),
        ),
      );
    }
    return orderedData;
  }, [search, groupedData]);

  //TODO: check 403 instead of isError
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
        <h3 className="text-2xl font-bold text-violet-500">
          Oops! This URL is invalidated! Please contact admin to publish a new
          one.
        </h3>
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
      ) : filterPlayers?.length === 0 ? (
        <div className="rounded-lg border border-dashed border-green-500 bg-green-50 px-5 py-12 text-center text-xl font-bold text-green-500 shadow">
          No Data
        </div>
      ) : (
        filterPlayers?.map((player) => (
          <div
            key={player.playerName}
            className="rounded bg-slate-50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 text-lg">
              <div className="font-semibold">{player.playerName}</div>
              <div className="mx-2 flex-1 border-t border-dashed border-slate-500"></div>
              <div className="font-semibold text-green-500">
                <Currency value={player.totalCost} />
              </div>
            </div>
            <div className="mt-2">
              {player.matches.map((match, i) => (
                <div>
                  <div
                    key={i}
                    className="grid grid-cols-4 justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-1">
                      <IoCalendarOutline />
                      {dayjs(match.date).format("DD/MM/YYYY")}
                    </div>
                    <div>{match.playerCount} players</div>
                    <div className="text-violet-500">
                      <span>Total: </span>
                      <Currency value={match.totalCost} />
                    </div>
                    <div className="text-end text-pink-500">
                      <Currency value={match.individualCost} /> / each
                    </div>
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
