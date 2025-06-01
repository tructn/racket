import { Skeleton, Title } from "@mantine/core";
import React from "react";
import { IoPlanetOutline } from "react-icons/io5";
import { MatchSummaryModel } from "../../models";
import MatchList from "./match-list";

interface Props {
  title: string;
  matches?: MatchSummaryModel[];
  isLoading?: boolean;
  icon?: React.ReactNode;
  expandFirstItem?: boolean;
}

const MatchSection: React.FC<Props> = ({
  title,
  matches,
  isLoading,
  icon,
  expandFirstItem,
}) => {
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <Skeleton height={24} circle />
          <div className="flex flex-1 items-center gap-3">
            <Skeleton height={20} className="w-32" radius="xl" />
            <Skeleton height={20} className="w-24" radius="xl" />
            <Skeleton height={20} className="w-20" radius="xl" />
            <Skeleton height={20} className="flex-1" radius="xl" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-blue-50 p-2 text-blue-500">
          {icon || <IoPlanetOutline size={20} />}
        </div>
        <Title order={3} className="text-slate-800">
          {title}
        </Title>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : matches ? (
        <MatchList matches={matches} expandFirstItem={expandFirstItem} />
      ) : null}
    </div>
  );
};

export default MatchSection;
