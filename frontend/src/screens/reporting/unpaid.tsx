import {
  Button,
  Code,
  CopyButton,
  Modal,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { IoCheckmarkCircle, IoShareSocial } from "react-icons/io5";
import httpService from "../../common/httpservice";
import Currency from "../../components/currency";
import DataTableSkeleton from "../../components/loading/skeleton/data-table-skeleton";
import { useApi } from "../../hooks/useApi";
import { UnpaidModel } from "../../models/reports/unpaid";

export default function UnpaidReport() {
  const { get } = useApi();

  const [opened, { open: openShareCodeResult, close: closeShareCodeResult }] =
    useDisclosure(false);
  const [shareCodeUrl, setShareCodeUrl] = useState("");

  const { isPending, data, refetch } = useQuery({
    queryKey: ["getUnpaidReport"],
    queryFn: () => get<UnpaidModel[]>("api/v1/reports/unpaid"),
  });

  const totalUnpaid = useMemo(() => {
    if (!data || data.length == 0) return 0;
    return data.map((e) => e.unpaidAmount).reduce((prev, cur) => (cur += prev));
  }, [data]);

  const markPaid = (model: UnpaidModel) => {
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
      url: `${window.location.origin}/public/outstanding-report`,
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
      <div className="flex flex-col gap-2 py-3">
        <div className="flex items-center justify-end gap-2 px-2">
          <Tooltip label="Anyone with this link can access to this report">
            <Button
              leftSection={<IoShareSocial size={20} />}
              onClick={shareToEveryOne}
              variant="outline"
            >
              Share
            </Button>
          </Tooltip>
        </div>

        <Table striped highlightOnHover withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Unpaid Amount</Table.Th>
              <Table.Th>Attendant Count</Table.Th>
              <Table.Th>Synthetic Costs</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isPending && <DataTableSkeleton row={3} col={5} />}
            {data?.map((item) => {
              return (
                <Table.Tr key={item.playerId}>
                  <Table.Td>{item.playerName}</Table.Td>
                  <Table.Td
                    className={clsx(
                      "font-bold",
                      item.unpaidAmount > 20
                        ? "text-rose-500"
                        : "text-emerald-500",
                    )}
                  >
                    <Currency value={item.unpaidAmount} />
                  </Table.Td>
                  <Table.Td>{item.matchCount}</Table.Td>
                  <Table.Td>{item.registrationSummary}</Table.Td>
                  <Table.Td className="flex-end flex justify-end space-x-2 text-right">
                    <Button
                      leftSection={<IoCheckmarkCircle size={20} />}
                      onClick={() => markPaid(item)}
                      variant="outline"
                    >
                      Paid
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
            {totalUnpaid > 0 && (
              <Table.Tr className="font-bold">
                <Table.Td>Total</Table.Td>
                <Table.Td>
                  <Currency value={totalUnpaid} />
                </Table.Td>
                <Table.Td></Table.Td>
                <Table.Td></Table.Td>
                <Table.Td></Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>
    </>
  );
}
