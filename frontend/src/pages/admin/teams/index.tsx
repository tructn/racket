import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Card,
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  ActionIcon,
  Modal,
  Table,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconCalendar,
  IconCoin,
} from "@tabler/icons-react";
import { teamService } from "@/services/teamService";
import { Team } from "@/types/team";
import Page from "@/components/page";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function TeamManagement() {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);

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

  const createBookingMutation = useMutation({
    mutationFn: ({
      teamId,
      values,
    }: {
      teamId: number;
      values: typeof bookingForm.values;
    }) => teamService.createBooking(teamId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setBookingModalOpen(false);
      bookingForm.reset();
      notifications.show({
        title: "Success",
        message: "Booking created successfully",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to create booking",
        color: "red",
      });
    },
  });

  const createCostMutation = useMutation({
    mutationFn: ({
      teamId,
      values,
    }: {
      teamId: number;
      values: typeof costForm.values;
    }) => teamService.createCost(teamId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setCostModalOpen(false);
      costForm.reset();
      notifications.show({
        title: "Success",
        message: "Cost added successfully",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to add cost",
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

  const handleCreateBooking = (values: typeof bookingForm.values) => {
    if (!selectedTeam) return;
    createBookingMutation.mutate({ teamId: selectedTeam.id, values });
  };

  const handleCreateCost = (values: typeof costForm.values) => {
    if (!selectedTeam) return;
    createCostMutation.mutate({ teamId: selectedTeam.id, values });
  };

  const handleRemoveMember = (teamId: number, playerId: number) => {
    removeMemberMutation.mutate({ teamId, playerId });
  };

  return (
    <Page title="Team Management">
      <Container size="xl" className="py-8">
        <Group justify="space-between" className="mb-8">
          <Title order={2}>Team Management</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            loading={createTeamMutation.isPending}
          >
            Create Team
          </Button>
        </Group>

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
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteTeam(team.id)}
                      loading={deleteTeamMutation.isPending}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <Text size="sm" color="dimmed">
                  {team.description}
                </Text>
                <Group gap="xs">
                  <Badge color="blue">{team.members.length} Members</Badge>
                  <Badge color="green">{team.bookings.length} Bookings</Badge>
                  <Badge color="orange">{team.costs.length} Costs</Badge>
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

        {/* Create Booking Modal */}
        <Modal
          opened={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          title="Create Booking"
        >
          <form onSubmit={bookingForm.onSubmit(handleCreateBooking)}>
            <Stack gap="md">
              <NumberInput
                label="Court ID"
                placeholder="Enter court ID"
                required
                min={1}
                {...bookingForm.getInputProps("courtId")}
              />
              <TextInput
                label="Start Time"
                type="datetime-local"
                required
                {...bookingForm.getInputProps("startTime")}
              />
              <TextInput
                label="End Time"
                type="datetime-local"
                required
                {...bookingForm.getInputProps("endTime")}
              />
              <Textarea
                label="Description"
                placeholder="Enter booking description"
                {...bookingForm.getInputProps("description")}
              />
              <Button type="submit" loading={createBookingMutation.isPending}>
                Create Booking
              </Button>
            </Stack>
          </form>
        </Modal>

        {/* Create Cost Modal */}
        <Modal
          opened={costModalOpen}
          onClose={() => setCostModalOpen(false)}
          title="Add Cost"
        >
          <form onSubmit={costForm.onSubmit(handleCreateCost)}>
            <Stack gap="md">
              <NumberInput
                label="Amount"
                placeholder="Enter amount"
                required
                min={0}
                decimalScale={2}
                {...costForm.getInputProps("amount")}
              />
              <TextInput
                label="Date"
                type="date"
                required
                {...costForm.getInputProps("date")}
              />
              <Select
                label="Category"
                placeholder="Select category"
                required
                data={[
                  { value: "court", label: "Court" },
                  { value: "equipment", label: "Equipment" },
                  { value: "other", label: "Other" },
                ]}
                {...costForm.getInputProps("category")}
              />
              <Textarea
                label="Description"
                placeholder="Enter cost description"
                required
                {...costForm.getInputProps("description")}
              />
              <Button type="submit" loading={createCostMutation.isPending}>
                Add Cost
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
                            <IconTrash size={16} />
                          </ActionIcon>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div>
                <Group justify="space-between" className="mb-4">
                  <Title order={4}>Bookings</Title>
                  <Button
                    leftSection={<IconCalendar size={16} />}
                    onClick={() => setBookingModalOpen(true)}
                    loading={createBookingMutation.isPending}
                  >
                    New Booking
                  </Button>
                </Group>
                <Table>
                  <thead>
                    <tr>
                      <th>Court</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Status</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeam.bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.courtId}</td>
                        <td>{new Date(booking.startTime).toLocaleString()}</td>
                        <td>{new Date(booking.endTime).toLocaleString()}</td>
                        <td>
                          <Badge
                            color={
                              booking.status === "confirmed"
                                ? "green"
                                : booking.status === "pending"
                                  ? "yellow"
                                  : "red"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td>${booking.totalCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div>
                <Group justify="space-between" className="mb-4">
                  <Title order={4}>Costs</Title>
                  <Button
                    leftSection={<IconCoin size={16} />}
                    onClick={() => setCostModalOpen(true)}
                    loading={createCostMutation.isPending}
                  >
                    Add Cost
                  </Button>
                </Group>
                <Table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeam.costs.map((cost) => (
                      <tr key={cost.id}>
                        <td>{new Date(cost.date).toLocaleDateString()}</td>
                        <td>{cost.category}</td>
                        <td>{cost.description}</td>
                        <td>${cost.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Stack>
          )}
        </Modal>
      </Container>
    </Page>
  );
}

export default TeamManagement;
