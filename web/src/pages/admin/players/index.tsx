import {
  ActionIcon,
  Button,
  Drawer,
  Table,
  Text,
  TextInput,
  Tooltip,
  Paper,
  Group,
  Stack,
  Title,
  Badge,
  Box,
  LoadingOverlay,
  Container,
  Card,
  Flex,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IoAdd,
  IoCalculatorOutline,
  IoPencil,
  IoSave,
  IoTrash,
  IoPerson,
} from "react-icons/io5";
import { z } from "zod";
import formatter from "@/common/formatter";
import httpService from "@/common/httpservice";
import Page from "@/components/page";
import DataTableSkeleton from "@/components/loading/skeleton/data-table-skeleton";
import { PlayerSummaryModel, UpdatePlayerModel } from "./models";

const schema = z.object({
  id: z.number().nullable(),
  firstName: z.string({ message: "First name is required" }).min(1),
  lastName: z.string({ message: "Last name is required" }).min(1),
});

function Players() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      id: 0,
      firstName: "",
      lastName: "",
    },
    validate: zodResolver(schema),
  });

  const [opened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const {
    isPending,
    data: players,
    refetch,
  } = useQuery({
    queryKey: ["getPlayers"],
    queryFn: () => httpService.get<PlayerSummaryModel[]>("api/v1/players"),
  });

  const createOrUpdateMut = useMutation({
    mutationFn: (model: UpdatePlayerModel) => {
      if (model.id) {
        return httpService.put(`api/v1/players/${model.id}`, model);
      }
      return httpService.post("api/v1/players", model);
    },
    onSuccess(_data, _variables, _context) {
      form.reset();
      refetch();
      closeDrawer();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (model: PlayerSummaryModel) => {
      return httpService.del(`api/v1/players/${model.id}`);
    },
    onSuccess(_data, _variables, _context) {
      refetch();
    },
    onError(err, _) {
      notifications.show({
        title: "Error",
        message: "Unable to delete player.",
        color: "red",
      });
    },
  });

  const openAccountMut = useMutation({
    mutationFn(model: PlayerSummaryModel) {
      return httpService.post(`api/v1/players/${model.id}/accounts`, {});
    },
    onSuccess(_data, _variables, _context) {
      notifications.show({
        title: "Success",
        message: `Account open success`,
        color: "green",
      });
    },
    onError(err, _) {
      notifications.show({
        title: "Error",
        message: "Unable to open account for player",
        color: "red",
      });
    },
  });

  const editClick = (model: PlayerSummaryModel) => {
    form.setValues(model);
    openDrawer();
  };

  const deleteClick = (model: PlayerSummaryModel) => {
    modals.openConfirmModal({
      title: "Delete Player ?",
      centered: true,
      children: (
        <Text>
          Are you sure you want to delete {model.firstName}. This action is
          irreversable!
        </Text>
      ),
      labels: { confirm: "Yes", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        deleteMut.mutate(model);
      },
    });
  };

  const openNewAccount = async (model: PlayerSummaryModel) => {
    await openAccountMut.mutateAsync(model);
  };

  return (
    <Page title="Players Management">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Title order={2}>Players</Title>
            <Text size="sm" c="dimmed">
              Manage and monitor player accounts
            </Text>
          </Stack>
          <Button
            leftSection={<IoAdd size={20} />}
            onClick={openDrawer}
            variant="filled"
            color="blue"
          >
            Add New Player
          </Button>
        </Group>

        <Paper withBorder radius="md" pos="relative">
          <LoadingOverlay visible={isPending} />
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "30%" }}>Player</Table.Th>
                <Table.Th style={{ width: "25%" }}>Email</Table.Th>
                <Table.Th style={{ width: "20%" }}>Created At</Table.Th>
                <Table.Th style={{ width: "15%" }}>SSO</Table.Th>
                <Table.Th style={{ width: "10%" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isPending && <DataTableSkeleton row={3} col={5} />}
              {!isPending &&
                players?.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Box className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <IoPerson size={18} className="text-blue-500" />
                        </Box>
                        <Box>
                          <Text fw={500} size="sm">
                            {item.firstName} {item.lastName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            ID: {item.id}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" className="truncate">
                        {item.email}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {formatter.formatDate(item.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {item.externalUserId && (
                        <Badge variant="light" color="blue" size="sm">
                          {item.externalUserId.substring(
                            0,
                            item.externalUserId.lastIndexOf("|"),
                          )}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Tooltip label="Open New Account">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => openNewAccount(item)}
                            size="md"
                          >
                            <IoCalculatorOutline size={16} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Edit Player">
                          <ActionIcon
                            variant="light"
                            color="yellow"
                            onClick={() => editClick(item)}
                            size="md"
                          >
                            <IoPencil size={16} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Delete Player">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => deleteClick(item)}
                            size="md"
                          >
                            <IoTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      <Drawer
        position="right"
        opened={opened}
        onClose={closeDrawer}
        title={
          <Stack gap={0}>
            <Title order={3}>
              {form.values.id ? "Edit Player" : "Create New Player"}
            </Title>
            <Text size="sm" c="dimmed">
              {form.values.id
                ? "Update player information"
                : "Add a new player to the system"}
            </Text>
          </Stack>
        }
        size="md"
      >
        <form
          onSubmit={form.onSubmit((model) => createOrUpdateMut.mutate(model))}
          className="flex flex-col gap-4"
        >
          <TextInput
            label="First name"
            placeholder="Enter first name"
            size="md"
            {...form.getInputProps("firstName")}
          />
          <TextInput
            label="Last name"
            placeholder="Enter last name"
            size="md"
            {...form.getInputProps("lastName")}
          />
          <Button
            leftSection={<IoSave size={20} />}
            type="submit"
            size="md"
            fullWidth
            mt="xl"
          >
            Save Changes
          </Button>
        </form>
      </Drawer>
    </Page>
  );
}

export default Players;
