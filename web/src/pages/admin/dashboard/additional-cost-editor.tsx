import {
  ActionIcon,
  Button,
  NumberInput,
  Table,
  TextInput,
  Paper,
  Group,
  Text,
  Stack,
} from "@mantine/core";
import React, { useRef, useState } from "react";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { IoSave } from "react-icons/io5";
import { AdditionalCost } from "@/models";

interface Props {
  onSaveClick?: (costs: AdditionalCost[]) => void;
}

const AdditionalCostEditor: React.FC<Props> = ({ onSaveClick }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [costs, setCosts] = useState<AdditionalCost[]>([]);
  const nameRef = useRef<any>(null!);

  const handleRemove = (id: number) => {
    setCosts(costs.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    setCosts([
      ...costs,
      {
        id: costs.length + 1,
        description,
        amount,
      },
    ]);

    setDescription("");
    setAmount(0);
    nameRef.current.focus();
  };

  const handleSave = () => {
    if (onSaveClick) {
      onSaveClick(costs);
    }
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md">
        <form onSubmit={handleSubmit}>
          <Group align="flex-end" gap="sm">
            <TextInput
              ref={nameRef}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              label="Description"
              size="md"
              style={{ flex: 1 }}
            />
            <NumberInput
              value={amount}
              placeholder="Amount"
              onChange={(e) => setAmount(+e)}
              label="Amount"
              size="md"
              min={0}
              decimalScale={2}
              leftSection="£"
              style={{ width: 150 }}
            />
            <ActionIcon
              variant="filled"
              type="submit"
              size="lg"
              color="blue"
              className="mb-1"
            >
              <FiPlusCircle size={18} />
            </ActionIcon>
          </Group>
        </form>

        {costs.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ width: 150 }}>Amount</Table.Th>
                <Table.Th style={{ width: 50 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {costs.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.description}</Table.Td>
                  <Table.Td>£{item.amount.toFixed(2)}</Table.Td>
                  <Table.Td align="right">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleRemove(item.id)}
                    >
                      <FiTrash2 size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No additional costs added yet
          </Text>
        )}

        <Group justify="flex-end">
          <Button
            onClick={handleSave}
            disabled={costs.length === 0}
            leftSection={<IoSave size={18} />}
            size="md"
          >
            Save changes
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default AdditionalCostEditor;
