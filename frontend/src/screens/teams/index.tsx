import {
  ActionIcon,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IoAdd,
  IoPencil,
  IoSave,
  IoTrash,
  IoPeople,
  IoPerson,
} from "react-icons/io5";
import { z } from "zod";
import httpService from "../../common/httpservice";
import Page from "../../components/page";
import { useState } from "react";

interface Team {
  id: number;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: any[];
  owner?: {
    name: string;
    email: string;
  };
}

const schema = z.object({
  id: z.number().nullable(),
  name: z.string({ message: "Name is required" }).min(1),
  description: z.string().optional(),
});

export default function TeamScreen() {
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      id: 0,
      name: "",
      description: "",
    },
    validate: zodResolver(schema),
  });

  const {
    isPending,
    data: teams = [],
    refetch,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const result = await httpService.get("api/v1/teams");
      return result ?? [];
    },
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      httpService.post("api/v1/teams", values),
    onSuccess: () => {
      refetch();
      closeModal();
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (teamId: number) => httpService.del(`api/v1/teams/${teamId}`),
    onSuccess: () => {
      refetch();
      closeDeleteModal();
      setSelectedTeam(null);
    },
  });

  const handleDelete = (team: Team) => {
    setSelectedTeam(team);
    openDeleteModal();
  };

  return (
    <Page title="Teams Management">
      <Stack gap="lg">
        <Card padding="xs">
          <Grid>
            {isPending
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={index}>
                    <Card withBorder>
                      <Stack>
                        <Skeleton height={24} width="60%" />
                        <Skeleton height={20} width="80%" />
                        <Skeleton height={20} width="40%" />
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))
              : [
                  ...teams.map((team) => (
                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={team.id}>
                      <Card withBorder>
                        <Stack>
                          <Group justify="space-between">
                            <Text fw={500} size="lg">
                              {team.name}
                            </Text>
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => {
                                  form.setValues(team);
                                  openModal();
                                }}
                              >
                                <IoPencil size={18} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => handleDelete(team)}
                              >
                                <IoTrash size={18} />
                              </ActionIcon>
                            </Group>
                          </Group>
                          <Text size="sm" c="dimmed">
                            {team.description || "No description"}
                          </Text>
                          <Group gap="xs">
                            <Group gap={4}>
                              <IoPeople size={14} />
                              <Text size="sm">
                                {team.members?.length || 0} members
                              </Text>
                            </Group>
                            <Group gap={4}>
                              <IoPerson size={14} />
                              <Text size="sm" c="dimmed">
                                Created by:{" "}
                                {team.owner?.name ||
                                  team.owner?.email ||
                                  "Unknown"}
                              </Text>
                            </Group>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  )),
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key="new-team">
                    <Card
                      withBorder
                      style={{
                        borderStyle: "dashed",
                        cursor: "pointer",
                        height: "100%",
                      }}
                      onClick={openModal}
                    >
                      <Stack
                        align="center"
                        justify="center"
                        style={{ height: "100%" }}
                      >
                        <IoAdd size={32} />
                        <Text size="sm" fw={500}>
                          Create New Team
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>,
                ]}
          </Grid>
        </Card>

        <Modal
          opened={opened}
          onClose={closeModal}
          title={form.values.id ? "Edit Team" : "Create Team"}
          size="md"
        >
          <form
            onSubmit={form.onSubmit((values) => createMutation.mutate(values))}
          >
            <Stack gap="md">
              <TextInput
                label="Team Name"
                placeholder="Enter team name"
                {...form.getInputProps("name")}
                required
              />
              <Textarea
                label="Description"
                placeholder="Enter team description"
                minRows={3}
                {...form.getInputProps("description")}
              />
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  onClick={closeModal}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftSection={<IoSave size={18} />}
                  loading={createMutation.isPending}
                >
                  {form.values.id ? "Update" : "Create"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        <Modal
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          title="Delete Team"
          size="md"
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to delete team "{selectedTeam?.name}"? This
              action cannot be undone.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={closeDeleteModal}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() =>
                  selectedTeam && deleteMutation.mutate(selectedTeam.id)
                }
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Page>
  );
}
