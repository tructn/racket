import { Skeleton, Table } from "@mantine/core";
import { FC } from "react";

interface Props {
  row: number;
  col: number;
}

const DataTableSkeleton: FC<Props> = ({ row, col }) => {
  return (
    <>
      {[...Array(row)].map((_, rowIdx) => (
        <Table.Tr key={rowIdx}>
          {[...Array(col)].map((_, colIdx) => (
            <Table.Td key={colIdx}>
              <Skeleton height={20} />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </>
  );
};

export default DataTableSkeleton;
