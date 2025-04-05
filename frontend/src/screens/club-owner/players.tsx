import { useAuth0 } from "@auth0/auth0-react";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Modal,
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

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  teamCount: number;
  createdAt: string;
}

export default function PlayersPage() {
  const { user } = useAuth0();
  const { get, post, put, del } = useApi();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      // In a real implementation, you would fetch players from your API
      // For now, we'll use mock data
      setPlayers([
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1234567890",
          teamCount: 2,
          createdAt: "2024-03-15",
        },
        {
          id: "2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+0987654321",
          teamCount: 1,
          createdAt: "2024-03-16",
        },
      ]);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        // Update existing player
        await put(`/api/v1/players/${editingPlayer.id}`, formData);
      } else {
        // Create new player
        await post("/api/v1/players", formData);
      }
      fetchPlayers();
      close();
      resetForm();
    } catch (error) {
      console.error("Error saving player:", error);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      phone: player.phone,
    });
    open();
  };

  const handleDelete = async (playerId: string) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        await del(`/api/v1/players/${playerId}`);
        fetchPlayers();
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingPlayer(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
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
        <Title order={2}>Players</Title>
        <Button
          leftSection={<IoAdd />}
          onClick={() => {
            resetForm();
            open();
          }}
        >
          Add Player
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Teams</Table.Th>
            <Table.Th>Joined</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {players.map((player) => (
            <Table.Tr key={player.id}>
              <Table.Td>
                {player.firstName} {player.lastName}
              </Table.Td>
              <Table.Td>{player.email}</Table.Td>
              <Table.Td>{player.phone}</Table.Td>
              <Table.Td>{player.teamCount}</Table.Td>
              <Table.Td>
                {new Date(player.createdAt).toLocaleDateString()}
              </Table.Td>
              <Table.Td>
                <Group>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEdit(player)}
                  >
                    <IoPencil />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(player.id)}
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
        title={editingPlayer ? "Edit Player" : "Add Player"}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
            <TextInput
              label="Email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">{editingPlayer ? "Update" : "Add"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
