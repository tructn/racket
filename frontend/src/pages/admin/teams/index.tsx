import { useState } from "react";
import {
  Title,
  Button,
  Group,
  Text,
  Card,
  Stack,
  TextInput,
  Textarea,
  ActionIcon,
  Modal,
  Table,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { teamService } from "@/services/teamService";
import { Team } from "@/types/team";
import Page from "@/components/page";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi";

function TeamManagement() {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const teamForm = useForm({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
    },
  });

  const bookingForm = useForm({
    initialValues: {
      courtId: 0,
      startTime: "",
      endTime: "",
      description: "",
    },
    validate: {
      courtId: (value) => (value <= 0 ? "Court is required" : null),
      startTime: (value) => (!value ? "Start time is required" : null),
      endTime: (value) => (!value ? "End time is required" : null),
    },
  });

  const costForm = useForm({
    initialValues: {
      amount: 0,
      description: "",
      date: "",
      category: "",
    },
    validate: {
      amount: (value) => (value <= 0 ? "Amount must be greater than 0" : null),
      description: (value) => (!value ? "Description is required" : null),
      date: (value) => (!value ? "Date is required" : null),
      category: (value) => (!value ? "Category is required" : null),
    },
  });

  // Queries
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamService.getTeams(),
  });

  // Mutations
  const createTeamMutation = useMutation({
    mutationFn: (values: typeof teamForm.values) =>
      teamService.createTeam(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setCreateModalOpen(false);
      teamForm.reset();
      notifications.show({
        title: "Success",
        message: "Team created successfully",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to create team",
        color: "red",
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (teamId: number) => teamService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      notifications.show({
        title: "Success",
        message: "Team deleted successfully",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to delete team",
        color: "red",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: number; playerId: number }) =>
      teamService.removePlayer(teamId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      notifications.show({
        title: "Success",
        message: "Member removed successfully",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to remove member",
        color: "red",
      });
    },
  });

  const handleCreateTeam = (values: typeof teamForm.values) => {
    createTeamMutation.mutate(values);
  };

  const handleDeleteTeam = (teamId: number) => {
    deleteTeamMutation.mutate(teamId);
  };

  const handleRemoveMember = (teamId: number, playerId: number) => {
    removeMemberMutation.mutate({ teamId, playerId });
  };

  return (
    <Page title="Team Management">
      <div className="flex justify-start">
        <Button
          leftSection={<FiPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
          loading={createTeamMutation.isPending}
        >
          Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: Team) => (
          <Card key={team.id} shadow="sm" p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>{team.name}</Title>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => setSelectedTeam(team)}
                    loading={isLoadingTeams}
                  >
                    <FiEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDeleteTeam(team.id)}
                    loading={deleteTeamMutation.isPending}
                  >
                    <FiTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Text size="sm" color="dimmed">
                {team.description}
              </Text>
              <Group gap="xs">
                <Badge color="blue">{team.members.length} Members</Badge>
              </Group>
            </Stack>
          </Card>
        ))}
      </div>

      {/* Create Team Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Team"
      >
        <form onSubmit={teamForm.onSubmit(handleCreateTeam)}>
          <Stack gap="md">
            <TextInput
              label="Team Name"
              placeholder="Enter team name"
              required
              {...teamForm.getInputProps("name")}
            />
            <Textarea
              label="Description"
              placeholder="Enter team description"
              {...teamForm.getInputProps("description")}
            />
            <Button type="submit" loading={createTeamMutation.isPending}>
              Create Team
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Team Details Modal */}
      <Modal
        opened={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        title={selectedTeam?.name}
        size="xl"
      >
        {selectedTeam && (
          <Stack gap="xl">
            <div>
              <Title order={4} className="mb-4">
                Members
              </Title>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTeam.members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() =>
                            handleRemoveMember(selectedTeam.id, member.id)
                          }
                          loading={removeMemberMutation.isPending}
                        >
                          <FiTrash size={16} />
                        </ActionIcon>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Stack>
        )}
      </Modal>
    </Page>
  );
}

export default TeamManagement;
