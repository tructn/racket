import { ActionIcon, Button, Table } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";

import { FiTrash } from "react-icons/fi";
import { useApi } from "../../hooks/useApi";
import { ShareUrlModel } from "./models";
import DataTableSkeleton from "../../components/loading/skeleton/data-table-skeleton";
import { QRCodeSVG } from "qrcode.react";
import { IoLinkOutline } from "react-icons/io5";
import { IconTrash } from "@tabler/icons-react";

export default function ShareCodes() {
  const { get, del } = useApi();

  const { data, refetch, isPending } = useQuery({
    queryKey: ["getShareUrls"],
    queryFn: () => get<ShareUrlModel[]>("api/v1/share-codes/urls"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del(`api/v1/share-codes/urls/${id}`),
  });

  return (
    <Table striped highlightOnHover withRowBorders={false}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>QR</Table.Th>
          <Table.Th>Url</Table.Th>
          <Table.Th></Table.Th>
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
                  <QRCodeSVG height={50} width={50} value={item.fullUrl} />
                </Table.Td>
                <Table.Td>
                  <a href={item.fullUrl} target="_blank">
                    {item.fullUrl}
                  </a>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="filled"
                    color="red"
                    aria-label="Trash"
                    onClick={async () => {
                      await deleteMut.mutateAsync(item.id);
                      await refetch();
                    }}
                  >
                    <IconTrash
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.5}
                    />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            );
          })
        )}
      </Table.Tbody>
    </Table>
  );
}
