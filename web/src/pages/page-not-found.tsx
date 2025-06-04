import Page from "@/components/page";

function PageNotFound() {
  return (
    <Page>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col">
          <span className="text-center text-4xl font-bold text-emerald-700">
            Page Not Found
          </span>
        </div>
      </div>
    </Page>
  );
}

export default PageNotFound;
