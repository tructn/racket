import { Skeleton, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { IoCalendarOutline, IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import Currency from "@/components/currency";
import { useApi } from "@/hooks/useApi";
import { UnpaidModel } from "@/types/reports/unpaid";

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
    queryFn: async () => {
      const res = await get<UnpaidModel[]>(
        `api/v1/public/reports/unpaid?shareCode=${shareCode}`,
      );
      //TODO: return raw from API
      return res.map((model) => {
        return {
          ...model,
          dates: model.registrationSummary.split(",").map((d) => {
            const segments = d.split(":");
            return {
              date: segments[0],
              cost: segments[1],
            };
          }),
        };
      });
    },
  });

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const normalize = (input: string) => {
    return input
      .normalize("NFD") // Decompose combined characters (e.g., "é" → "é")
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks
  };

  const filterPlayers = useMemo(() => {
    if (search) {
      return data?.filter((item) =>
        normalize(item.playerName.toLowerCase()).includes(
          normalize(search.toLowerCase()),
        ),
      );
    }
    return data;
  }, [search, data]);

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
        filterPlayers?.map((item) => (
          <div
            key={item.playerId}
            className="rounded bg-slate-50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 text-lg">
              <div className="font-semibold">{item.playerName}</div>
              <div className="mx-2 flex-1 border-t border-dashed border-slate-500"></div>
              <div className="font-semibold text-green-500">
                <Currency value={item.unpaidAmount} />
              </div>
            </div>
            <div className="mt-2">
              {item.dates.map((record, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-1">
                    <IoCalendarOutline />
                    {record.date}
                  </div>
                  <div>{record.cost}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
