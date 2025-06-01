import { lazy, Suspense, useState } from "react";
import Page from "@/components/page";
import {
  useArchivedMatchesQuery,
  useFutureMatchesQuery,
  useTodayMatchesQuery,
} from "@/hooks/useQueries";
import {
  IoArchiveOutline,
  IoCalendarClearOutline,
  IoTodayOutline,
} from "react-icons/io5";
import { Tabs } from "@mantine/core";
import SectionLoading from "@/components/loading/section-loading";

const MatchSection = lazy(() => import("./match-section"));

function Dashboard() {
  const [activeTab, setActiveTab] = useState("today");

  const { data: archivedMatches, isPending: archivedMatchesLoading } =
    useArchivedMatchesQuery(activeTab === "archived");

  const { data: futureMatches, isPending: futureMatchesLoading } =
    useFutureMatchesQuery(activeTab === "future");

  const { data: todayMatches, isPending: todayMatchesLoading } =
    useTodayMatchesQuery(activeTab === "today");

  return (
    <Page title="Dashboard">
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || "today")}
      >
        <Tabs.List>
          <Tabs.Tab value="today" leftSection={<IoTodayOutline />}>
            Today
          </Tabs.Tab>
          <Tabs.Tab value="future" leftSection={<IoCalendarClearOutline />}>
            Future
          </Tabs.Tab>
          <Tabs.Tab value="archived" leftSection={<IoArchiveOutline />}>
            Archived
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="today" pt="md">
          <Suspense fallback={<SectionLoading />}>
            <MatchSection
              icon={<IoTodayOutline />}
              title="Today"
              isLoading={todayMatchesLoading}
              matches={todayMatches}
              expandFirstItem={true}
            />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="future" pt="md">
          <Suspense fallback={<SectionLoading />}>
            <MatchSection
              icon={<IoCalendarClearOutline />}
              title="Future"
              isLoading={futureMatchesLoading}
              matches={futureMatches}
              expandFirstItem={true}
            />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="archived" pt="md">
          <Suspense fallback={<SectionLoading />}>
            <MatchSection
              icon={<IoArchiveOutline />}
              title="Archived"
              isLoading={archivedMatchesLoading}
              matches={archivedMatches}
            />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}

export default Dashboard;
