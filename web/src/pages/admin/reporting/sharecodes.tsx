import {
  ActionIcon,
  Table,
  Paper,
  Stack,
  Title,
  Group,
  Text,
  Button,
  Tooltip,
  Badge,
} from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useApi } from "@/hooks/useApi";
import { ShareUrlModel } from "./models";
import DataTableSkeleton from "@/components/loading/skeleton/data-table-skeleton";
import { QRCodeSVG } from "qrcode.react";
import { IconTrash, IconExternalLink, IconCopy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export default function ShareCodes() {
  const { get, del } = useApi();

  const { data, refetch, isPending } = useQuery({
    queryKey: ["getShareUrls"],
    queryFn: () => get<ShareUrlModel[]>("api/v1/share-codes/urls"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del(`api/v1/share-codes/urls/${id}`),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifications.show({
      title: "Success",
      message: "URL copied to clipboard",
      color: "green",
    });
  };

  return (
    <Stack gap="lg" mt="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Share Codes</Title>
        <Badge size="lg" variant="light" color="blue">
          {data?.length || 0} Active Links
        </Badge>
      </Group>

      <Paper withBorder radius="md" p="md">
        <Text size="sm" fw={500} mb="md">
          Shared Links
        </Text>
        <Table striped highlightOnHover withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>QR Code</Table.Th>
              <Table.Th>Shared Link</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isPending ? (
              <DataTableSkeleton row={3} col={3} />
            ) : (
              data?.map((item) => {
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td width={100}>
                      <div className="inline-block rounded-lg bg-white p-2">
                        <QRCodeSVG
                          height={80}
                          width={80}
                          value={item.fullUrl}
                        />
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" align="center">
                        <Text size="sm" fw={500} className="break-all">
                          {item.fullUrl}
                        </Text>
                        <Group gap="xs">
                          <Tooltip label="Copy URL">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => copyToClipboard(item.fullUrl)}
                            >
                              <IconCopy size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Open in new tab">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              component="a"
                              href={item.fullUrl}
                              target="_blank"
                            >
                              <IconExternalLink size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Delete share code">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={async () => {
                            await deleteMut.mutateAsync(item.id);
                            await refetch();
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
