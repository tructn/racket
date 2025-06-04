import { FC, ReactNode } from "react";
import BreadcrumbsComponent from "@/components/breadcrumbs";
import { Group } from "@mantine/core";

interface PageProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: boolean;
}

const Page: FC<PageProps> = ({ title, children, breadcrumbs = true }) => {
  return (
    <div className="m-2 flex w-full flex-col rounded bg-white p-6">
      <Group justify="space-between" align="center" className="mb-2">
        {breadcrumbs && <BreadcrumbsComponent />}
        {title && <div className="text-2xl font-bold">{title}</div>}
      </Group>
      <div className="flex h-full w-full flex-col gap-2 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Page;
