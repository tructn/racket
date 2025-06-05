import { lazy, Suspense, useState } from "react";
import { IoQrCodeOutline } from "react-icons/io5";

import SectionLoading from "@/components/loading/section-loading";
import Page from "@/components/page";
import { rem, Tabs } from "@mantine/core";
import { IconMoneybag, IconTimeline } from "@tabler/icons-react";

type TabType = "outstanding-payments" | "activity-log" | "share-codes";

const OutstandingPayment = lazy(() => import("./outstanding-payment"));
const ActivityLog = lazy(() => import("./activity-log"));
const ShareCodes = lazy(() => import("./sharecodes"));

export default function Reporting() {
  const iconStyle = { width: rem(16), height: rem(16) };
  const [tab, setTab] = useState<TabType>("outstanding-payments");

  return (
    <Page title="Reports">
      <Tabs defaultValue="outstanding-payments">
        <Tabs.List>
          <Tabs.Tab
            value="outstanding-payments"
            leftSection={<IconMoneybag style={iconStyle} />}
            onClick={() => setTab("outstanding-payments")}
          >
            Outstanding Payments
          </Tabs.Tab>
          <Tabs.Tab
            value="activity-log"
            leftSection={<IconTimeline style={iconStyle} />}
            onClick={() => setTab("activity-log")}
          >
            Activities
          </Tabs.Tab>
          <Tabs.Tab
            value="share-codes"
            leftSection={<IoQrCodeOutline style={iconStyle} />}
            onClick={() => setTab("share-codes")}
          >
            Share Codes
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={tab}>
          <Suspense fallback={<SectionLoading />}>
            {tab === "outstanding-payments" && <OutstandingPayment />}
            {tab === "activity-log" && <ActivityLog />}
            {tab === "share-codes" && <ShareCodes />}
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
