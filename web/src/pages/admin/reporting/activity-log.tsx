import { Table, Paper, Stack, Title, Badge, Group, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import formatter from "@/common/formatter";
import httpService from "@/common/httpservice";
import DataTableSkeleton from "@/components/loading/skeleton/data-table-skeleton";
import { ActivityModel } from "@/types/reports/activity";
import { IoTimeOutline, IoInformationCircleOutline } from "react-icons/io5";

dayjs.extend(relativeTime);

export default function ActivityLog() {
  const { isPending, data } = useQuery({
    queryKey: ["getActivityLog"],
    queryFn: () => httpService.get<ActivityModel[]>("api/v1/activities"),
  });

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "payment":
        return "green";
      case "match":
        return "blue";
      case "user":
        return "violet";
      default:
        return "gray";
    }
  };

  return (
    <Stack gap="lg" mt="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Activity Timeline</Title>
        <Badge size="lg" variant="light" color="blue">
          {data?.length || 0} Activities
        </Badge>
      </Group>

      <Paper withBorder radius="md" p="md">
        <Table striped highlightOnHover withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Activity</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Details</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isPending && <DataTableSkeleton row={3} col={4} />}
            {!isPending &&
              data?.map((item) => {
                const activityColor = getActivityColor(item.typeName);
                return (
                  <Table.Tr key={`${item.typeName}-${item.createdDate}`}>
                    <Table.Td>
                      <Group gap="xs">
                        <IoInformationCircleOutline
                          size={20}
                          className={`text-${activityColor}-500`}
                        />
                        <Text size="sm" fw={500}>
                          {item.typeName}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={activityColor} variant="light">
                        {item.typeName}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IoTimeOutline size={16} className="text-gray-500" />
                        <Text size="sm" c="dimmed">
                          {dayjs(item.createdDate).fromNow()}
                        </Text>
                        <Text size="xs" c="dimmed" span>
                          ({formatter.formatDate(item.createdDate, true)})
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2}>
                        {item.description}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
