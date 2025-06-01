import { Accordion, Badge, Group, Stack, Text } from "@mantine/core";
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
      <div className="flex h-32 items-center justify-center gap-3 rounded-lg border border-dashed bg-slate-50/50">
        <IoBeerOutline size={24} className="text-slate-400" />
        <Text size="lg" c="dimmed" fw={500}>
          No matches, enjoy your beer!
        </Text>
      </div>
    );
  }

  return (
    <Accordion
      variant="separated"
      defaultValue={expandFirstItem ? `${matches[0].matchId}` : null}
      className="space-y-3"
    >
      {matches &&
        matches.map((m, idx) => {
          return !m ? (
            <span key={idx}>Match not available</span>
          ) : (
            <Accordion.Item
              key={m.matchId}
              value={`${m.matchId}`}
              className="rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <Accordion.Control
                icon={<FiMapPin className="text-blue-500" />}
                className="hover:bg-slate-50"
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="md" wrap="nowrap">
                    <Stack gap={2}>
                      <Text fw={700} size="sm" c="dimmed">
                        {dayjs(m.start).format("DD/MM dddd")}
                      </Text>
                      <Text fw={500} size="sm">
                        {m.sportCenterName || "N/A"}
                      </Text>
                    </Stack>
                    <Badge color="pink" variant="light" className="font-medium">
                      {formatter.formatTime(m.start)}
                    </Badge>
                  </Group>
                  <Badge color="green" variant="light" className="font-medium">
                    {m.court.toLowerCase().includes("court")
                      ? m.court
                      : `Court ${m.court}`}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel className="bg-slate-50/50">
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
