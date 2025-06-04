import { Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import formatter from "@/common/formatter";
import httpService from "@/common/httpservice";
import DataTableSkeleton from "@/components/loading/skeleton/data-table-skeleton";
import { ActivityModel } from "@/models/reports/activity";

dayjs.extend(relativeTime);

export default function ActivityLog() {
  const { isPending, data } = useQuery({
    queryKey: ["getActivityLog"],
    queryFn: () => httpService.get<ActivityModel[]>("api/v1/activities"),
  });

  return (
    <Table striped highlightOnHover withRowBorders={false}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>From Now</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Created Date</Table.Th>
          <Table.Th>Description</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {isPending && <DataTableSkeleton row={3} col={4} />}
        {!isPending &&
          data?.map((item) => {
            return (
              <Table.Tr>
                <Table.Td>{dayjs(item.createdDate).fromNow()}</Table.Td>
                <Table.Td>{item.typeName}</Table.Td>
                <Table.Td>
                  {formatter.formatDate(item.createdDate, true)}
                </Table.Td>
                <Table.Td>{item.description}</Table.Td>{" "}
              </Table.Tr>
            );
          })}
      </Table.Tbody>
    </Table>
  );
}
