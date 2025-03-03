import { Accordion, Badge } from "@mantine/core";
import dayjs from "dayjs";
import React, { Suspense } from "react";
import { FiMapPin } from "react-icons/fi";
import { IoBeerOutline } from "react-icons/io5";
import formatter from "../../common/formatter";
import SectionLoading from "../../components/loading/section-loading";
import { MatchSummaryModel } from "../../models";
import MatchListContent from "./match-list-content";

interface Prop {
  matches: MatchSummaryModel[];
  expandFirstItem?: boolean;
}

const MatchList: React.FC<Prop> = ({ matches, expandFirstItem }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center gap-2 rounded-lg border border-dashed">
        <IoBeerOutline /> No matches, enjoy your beer!
      </div>
    );
  }

  return (
    <Accordion
      variant="separated"
      defaultValue={expandFirstItem ? `${matches[0].matchId}` : null}
    >
      {matches &&
        matches.map((m, idx) => {
          return !m ? (
            <span key={idx}>Match not available</span>
          ) : (
            <Accordion.Item key={m.matchId} value={`${m.matchId}`}>
              <Accordion.Control icon={<FiMapPin />}>
                <div className="flex items-center justify-between px-5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">
                      {dayjs(m.start).format("DD/MM dddd")}
                    </span>
                    <span>{m.sportCenterName || "N/A"}</span>
                    <Badge color="pink">{formatter.formatTime(m.start)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color="green" variant="light">
                      {m.court.toLowerCase().includes("court")
                        ? m.court
                        : `Court ${m.court}`}
                    </Badge>
                  </div>
                </div>
              </Accordion.Control>
              <Accordion.Panel>
                <Suspense fallback={<SectionLoading />}>
                  <MatchListContent match={m} />
                </Suspense>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
    </Accordion>
  );
};

export default MatchList;
