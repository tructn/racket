import {
  Button,
  Code,
  CopyButton,
  Modal,
  Table,
  Text,
  Tooltip,
  Paper,
  Group,
  Stack,
  Title,
  Badge,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  IoCheckmarkCircle,
  IoShareSocial,
  IoStatsChart,
  IoPeople,
  IoCash,
} from "react-icons/io5";
import httpService from "@/common/httpservice";
import Currency from "@/components/currency";
import DataTableSkeleton from "@/components/loading/skeleton/data-table-skeleton";
import { useApi } from "@/hooks/useApi";
import { OutstandingPaymentModel } from "@/types/reports/outstanding-payment";

export default function OutstandingPayment() {
  const { get } = useApi();

  const [opened, { open: openShareCodeResult, close: closeShareCodeResult }] =
    useDisclosure(false);
  const [shareCodeUrl, setShareCodeUrl] = useState("");

  const { isPending, data, refetch } = useQuery({
    queryKey: ["getOutstandingPayments"],
    queryFn: () =>
      get<OutstandingPaymentModel[]>("api/v1/reports/outstanding-payments"),
  });

  const totalUnpaid = useMemo(() => {
    if (!data || data.length == 0) return 0;
    return data.map((e) => e.unpaidAmount).reduce((prev, cur) => (cur += prev));
  }, [data]);

  const totalPlayers = useMemo(() => {
    if (!data) return 0;
    return data.length;
  }, [data]);

  const playersWithHighDebt = useMemo(() => {
    if (!data) return 0;
    return data.filter((item) => item.unpaidAmount > 20).length;
  }, [data]);

  const markPaid = (model: OutstandingPaymentModel) => {
    modals.openConfirmModal({
      title: "Mark as Paid",
      centered: true,
      children: (
        <Text>
          Are you sure, this will mark {model.playerName} paid all outstanding
          payments ?
        </Text>
      ),
      labels: { confirm: "Yes", cancel: "No" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        await httpService.put(
          `api/v1/players/${model.playerId}/outstanding-payments/paid`,
          null,
        );
        notifications.show({
          title: "Success",
          message: `Mark player ${model.playerName} paid all outstanding payments successfully`,
          color: "green",
        });
        refetch();
      },
    });
  };

  async function shareToEveryOne() {
    const res = await httpService.post("api/v1/share-codes/urls", {
      url: `${window.location.origin}/anonymous/outstanding-payment-report`,
    });
    setShareCodeUrl(res.fullUrl);
    openShareCodeResult();
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={closeShareCodeResult}
        title="Share Code"
        centered
        size="lg"
      >
        <div className="flex flex-col gap-2">
          <Code>{shareCodeUrl}</Code>
          <CopyButton value={shareCodeUrl}>
            {({ copied, copy }) => (
              <Button color={copied ? "teal" : "blue"} onClick={copy}>
                {copied ? "Copied Share URL" : "Copy Share URL"}
              </Button>
            )}
          </CopyButton>
        </div>
      </Modal>
      <Stack gap="lg" mt="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Outstanding Payments</Title>
          <Tooltip label="Anyone with this link can access to this report">
            <Button
              leftSection={<IoShareSocial size={20} />}
              onClick={shareToEveryOne}
            >
              Share
            </Button>
          </Tooltip>
        </Group>

        <Group grow>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">
                  Total Outstanding
                </Text>
                <Text size="xl" fw={700}>
                  <Currency value={totalUnpaid} />
                </Text>
              </div>
              <IoCash size={32} className="text-blue-500" />
            </Group>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">
                  Total Players
                </Text>
                <Text size="xl" fw={700}>
                  {totalPlayers}
                </Text>
              </div>
              <IoPeople size={32} className="text-green-500" />
            </Group>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">
                  High Debt Players
                </Text>
                <Text size="xl" fw={700}>
                  {playersWithHighDebt}
                </Text>
              </div>
              <IoStatsChart size={32} className="text-rose-500" />
            </Group>
          </Paper>
        </Group>

        <Paper withBorder radius="md" p="md">
          <Text size="sm" fw={500} mb="md">
            Outstanding Payment Details
          </Text>
          <Table striped highlightOnHover withRowBorders={false}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Player Name</Table.Th>
                <Table.Th>Unpaid Amount</Table.Th>
                <Table.Th>Match Count</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isPending && <DataTableSkeleton row={3} col={5} />}
              {data?.map((item) => {
                return (
                  <Table.Tr key={item.playerId}>
                    <Table.Td>
                      <div className="flex flex-col">
                        <span>{item.playerName}</span>
                        <span className="text-sm text-gray-500">
                          {item.email}
                        </span>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <div className="flex items-center gap-2">
                        <Currency value={item.unpaidAmount} />
                        {item.unpaidAmount > 20 && (
                          <Badge color="red" variant="light">
                            High Debt
                          </Badge>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td>{item.matchCount}</Table.Td>
                    <Table.Td className="flex-end flex justify-end space-x-2 text-right">
                      <Button
                        leftSection={<IoCheckmarkCircle size={20} />}
                        onClick={() => markPaid(item)}
                        variant="outline"
                        color="green"
                      >
                        Mark Paid
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
              {totalUnpaid > 0 && (
                <Table.Tr className="bg-gray-50 font-bold">
                  <Table.Td>Total</Table.Td>
                  <Table.Td>
                    <Currency value={totalUnpaid} />
                  </Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td></Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    </>
  );
}
