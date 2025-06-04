import Page from "@/components/page";
import Requests from "@/components/requests";

export default function RequestsPage() {
  return (
    <Page title="Attendant Requests">
      <div className="flex items-center justify-center">
        <Requests />
      </div>
    </Page>
  );
}
