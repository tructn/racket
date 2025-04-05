import { useAuth0 } from "@auth0/auth0-react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { IoAdd, IoPencil, IoTrash } from "react-icons/io5";

interface Cost {
  id: string;
  teamName: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  createdAt: string;
}

export default function CostsPage() {
  const { user } = useAuth0();
  const { get, post, put, del } = useApi();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [formData, setFormData] = useState({
    teamName: "",
    description: "",
    amount: 0,
    date: "",
    category: "",
  });

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      // In a real implementation, you would fetch costs from your API
      // For now, we'll use mock data
      setCosts([
        {
          id: "1",
          teamName: "Team Alpha",
          description: "Court rental",
          amount: 100,
          date: "2024-03-20",
          category: "Rental",
          createdAt: "2024-03-15",
        },
        {
          id: "2",
          teamName: "Team Beta",
          description: "Equipment purchase",
          amount: 250,
          date: "2024-03-21",
          category: "Equipment",
          createdAt: "2024-03-16",
        },
      ]);
    } catch (error) {
      console.error("Error fetching costs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCost) {
        // Update existing cost
        await put(`/api/v1/costs/${editingCost.id}`, formData);
      } else {
        // Create new cost
        await post("/api/v1/costs", formData);
      }
      fetchCosts();
      close();
      resetForm();
    } catch (error) {
      console.error("Error saving cost:", error);
    }
  };

  const handleEdit = (cost: Cost) => {
    setEditingCost(cost);
    setFormData({
      teamName: cost.teamName,
      description: cost.description,
      amount: cost.amount,
      date: cost.date,
      category: cost.category,
    });
    open();
  };

  const handleDelete = async (costId: string) => {
    if (window.confirm("Are you sure you want to delete this cost?")) {
      try {
        await del(`/api/v1/costs/${costId}`);
        fetchCosts();
      } catch (error) {
        console.error("Error deleting cost:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingCost(null);
    setFormData({
      teamName: "",
      description: "",
      amount: 0,
      date: "",
      category: "",
    });
  };

  const calculateTotal = () => {
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <Group justify="space-between">
        <Title order={2}>Costs</Title>
        <Button
          leftSection={<IoAdd />}
          onClick={() => {
            resetForm();
            open();
          }}
        >
          Add Cost
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="xl" fw={700}>
          Total Costs: ${calculateTotal()}
        </Text>
      </Card>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Team</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {costs.map((cost) => (
            <Table.Tr key={cost.id}>
              <Table.Td>{cost.teamName}</Table.Td>
              <Table.Td>{cost.description}</Table.Td>
              <Table.Td>${cost.amount}</Table.Td>
              <Table.Td>{new Date(cost.date).toLocaleDateString()}</Table.Td>
              <Table.Td>{cost.category}</Table.Td>
              <Table.Td>
                {new Date(cost.createdAt).toLocaleDateString()}
              </Table.Td>
              <Table.Td>
                <Group>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEdit(cost)}
                  >
                    <IoPencil />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(cost.id)}
                  >
                    <IoTrash />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={close}
        title={editingCost ? "Edit Cost" : "Add Cost"}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Team Name"
              placeholder="Enter team name"
              value={formData.teamName}
              onChange={(e) =>
                setFormData({ ...formData, teamName: e.target.value })
              }
              required
            />
            <TextInput
              label="Description"
              placeholder="Enter cost description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
            <NumberInput
              label="Amount"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(value) =>
                setFormData({ ...formData, amount: Number(value) })
              }
              required
              min={0}
            />
            <TextInput
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
            <TextInput
              label="Category"
              placeholder="Enter cost category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">{editingCost ? "Update" : "Add"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
