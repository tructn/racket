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
  Paper,
  Grid,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { teamService } from "@/services/teamService";
import { Team } from "@/types/team";
import Page from "@/components/page";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit, FiTrash, FiUsers } from "react-icons/fi";

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
      <Stack gap="lg">
        {/* Header Section */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Teams Overview</Title>
            <Button
              leftSection={<FiPlus size={16} />}
              variant="filled"
              onClick={() => setCreateModalOpen(true)}
              loading={createTeamMutation.isPending}
            >
              Create Team
            </Button>
          </Group>

          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Paper p="md" withBorder>
                <Text size="sm" c="dimmed">
                  Total Teams
                </Text>
                <Title order={2}>{teams.length}</Title>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Paper p="md" withBorder>
                <Text size="sm" c="dimmed">
                  Total Members
                </Text>
                <Title order={2}>
                  {teams.reduce((acc, team) => acc + team.members.length, 0)}
                </Title>
              </Paper>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Teams Grid */}
        <Paper withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Team Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Members</Table.Th>
                <Table.Th style={{ width: 120 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {teams.map((team: Team) => (
                <Table.Tr key={team.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <Text fw={500}>{team.name}</Text>
                      <Badge variant="light" color="blue">
                        {team.members.length} Members
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text lineClamp={2} size="sm" c="dimmed">
                      {team.description || "No description"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {team.members.slice(0, 3).map((member) => (
                        <Badge key={member.id} variant="light">
                          {member.name}
                        </Badge>
                      ))}
                      {team.members.length > 3 && (
                        <Badge variant="light">
                          +{team.members.length - 3}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        size="md"
                        variant="light"
                        color="blue"
                        onClick={() => setSelectedTeam(team)}
                        loading={isLoadingTeams}
                      >
                        <FiEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="md"
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteTeam(team.id)}
                        loading={deleteTeamMutation.isPending}
                      >
                        <FiTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      {/* Create Team Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={<Title order={3}>Create Team</Title>}
        size="lg"
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
            <Divider />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createTeamMutation.isPending}>
                Create Team
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Team Details Modal */}
      <Modal
        opened={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        title={
          <Group gap="xs">
            <FiUsers size={20} />
            <Title order={3}>{selectedTeam?.name}</Title>
          </Group>
        }
        size="xl"
      >
        {selectedTeam && (
          <Stack gap="xl">
            <Paper withBorder p="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={4}>Team Information</Title>
                  <Badge size="lg" variant="light" color="blue">
                    {selectedTeam.members.length} Members
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {selectedTeam.description || "No description provided"}
                </Text>
              </Stack>
            </Paper>

            <Paper withBorder>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedTeam.members.map((member) => (
                    <Table.Tr key={member.id}>
                      <Table.Td>{member.name}</Table.Td>
                      <Table.Td>{member.email}</Table.Td>
                      <Table.Td>
                        <Badge variant="light">{member.role}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end">
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
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Stack>
        )}
      </Modal>
    </Page>
  );
}

export default TeamManagement;
