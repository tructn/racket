import { useAuth0 } from "@auth0/auth0-react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { IoAdd, IoPencil, IoTrash } from "react-icons/io5";

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

export default function TeamsPage() {
  const { user } = useAuth0();
  const { get, post, put, del } = useApi();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // In a real implementation, you would fetch teams from your API
      // For now, we'll use mock data
      setTeams([
        {
          id: "1",
          name: "Team Alpha",
          description: "Our premier team",
          memberCount: 8,
          createdAt: "2024-03-15",
        },
        {
          id: "2",
          name: "Team Beta",
          description: "Development team",
          memberCount: 6,
          createdAt: "2024-03-16",
        },
      ]);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        // Update existing team
        await put(`/api/v1/teams/${editingTeam.id}`, formData);
      } else {
        // Create new team
        await post("/api/v1/teams", formData);
      }
      fetchTeams();
      close();
      resetForm();
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
    });
    open();
  };

  const handleDelete = async (teamId: string) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await del(`/api/v1/teams/${teamId}`);
        fetchTeams();
      } catch (error) {
        console.error("Error deleting team:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingTeam(null);
    setFormData({
      name: "",
      description: "",
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
        <Title order={2}>Teams</Title>
        <Button
          leftSection={<IoAdd />}
          onClick={() => {
            resetForm();
            open();
          }}
        >
          Create Team
        </Button>
      </Group>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{team.name}</Text>
              <Group>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => handleEdit(team)}
                >
                  <IoPencil />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(team.id)}
                >
                  <IoTrash />
                </ActionIcon>
              </Group>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              {team.description}
            </Text>
            <Group justify="space-between">
              <Text size="sm">Members: {team.memberCount}</Text>
              <Text size="sm" c="dimmed">
                Created: {new Date(team.createdAt).toLocaleDateString()}
              </Text>
            </Group>
          </Card>
        ))}
      </div>

      <Modal
        opened={opened}
        onClose={close}
        title={editingTeam ? "Edit Team" : "Create Team"}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Team Name"
              placeholder="Enter team name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <TextInput
              label="Description"
              placeholder="Enter team description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">{editingTeam ? "Update" : "Create"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
