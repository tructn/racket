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
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoAdd, IoPencil, IoTrash, IoWallet } from "react-icons/io5";
import httpService from "@/common/httpservice";
import Page from "@/components/page";
import DataTableSkeleton from "@/components/loading/skeleton/data-table-skeleton";
import formatter from "@/common/formatter";

interface Wallet {
  id: number;
  ownerId: number;
  ownerName: string;
  name: string;
  balance: number;
}

interface WalletFormValues {
  id?: number;
  ownerId: number;
  name: string;
  balance: number;
}

export default function Wallets() {
  const [opened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const queryClient = useQueryClient();

  const form = useForm<WalletFormValues>({
    initialValues: {
      ownerId: 0,
      name: "",
      balance: 0,
    },
    validate: {
      ownerId: (value) => (!value ? "Owner ID is required" : null),
      name: (value) => (!value ? "Wallet name is required" : null),
      balance: (value) => (value < 0 ? "Amount cannot be negative" : null),
    },
  });

  const { data: wallets = [], isLoading } = useQuery<Wallet[]>({
    queryKey: ["getWallets"],
    queryFn: async () => {
      const response = await httpService.get<Wallet[]>("api/v1/wallets");
      return response;
    },
    initialData: [],
  });

  const createOrUpdateMut = useMutation({
    mutationFn: (values: WalletFormValues) => {
      if (form.values.id) {
        return httpService.put(`/api/v1/wallets/${form.values.id}`, values);
      }
      return httpService.post("/api/v1/wallets", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWallets"] });
      form.reset();
      closeDrawer();
      notifications.show({
        title: "Success",
        message: `Wallet ${form.values.id ? "updated" : "created"} successfully`,
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: `Failed to ${form.values.id ? "update" : "create"} wallet`,
        color: "red",
      });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => httpService.del(`/api/v1/wallets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWallets"] });
      notifications.show({
        title: "Success",
        message: "Wallet deleted successfully",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to delete wallet",
        color: "red",
      });
    },
  });

  const handleEdit = (wallet: Wallet) => {
    form.setValues({
      id: wallet.id,
      ownerId: wallet.ownerId,
      name: wallet.name,
      balance: wallet.balance,
    });
    openDrawer();
  };

  const handleDelete = (wallet: Wallet) => {
    modals.openConfirmModal({
      title: "Delete Wallet",
      centered: true,
      children: (
        <Text>
          Are you sure you want to delete this wallet? This action is
          irreversible!
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMut.mutate(wallet.id),
    });
  };

  return (
    <Page title="Wallet Management">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Title order={2}>Wallets</Title>
            <Text size="sm" c="dimmed">
              Manage and monitor user wallets
            </Text>
          </Stack>
          <Button
            leftSection={<IoAdd size={20} />}
            onClick={openDrawer}
            variant="filled"
            color="blue"
          >
            Add New Wallet
          </Button>
        </Group>

        <Paper withBorder radius="md" pos="relative">
          <LoadingOverlay visible={isLoading} />
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "30%" }}>Wallet</Table.Th>
                <Table.Th style={{ width: "25%" }}>Owner</Table.Th>
                <Table.Th style={{ width: "25%" }}>Balance</Table.Th>
                <Table.Th style={{ width: "20%" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading && <DataTableSkeleton row={3} col={4} />}
              {!isLoading &&
                wallets?.map((wallet) => (
                  <Table.Tr key={wallet.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Box className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50">
                          <IoWallet size={18} className="text-pink-500" />
                        </Box>
                        <Box>
                          <Text fw={500} size="sm">
                            {wallet.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            ID: {wallet.id}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {wallet.ownerName}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {formatter.currency(wallet.balance)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Tooltip label="Edit Wallet">
                          <ActionIcon
                            variant="light"
                            color="yellow"
                            onClick={() => handleEdit(wallet)}
                            size="md"
                          >
                            <IoPencil size={16} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Delete Wallet">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDelete(wallet)}
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
              {form.values.id ? "Edit Wallet" : "Create New Wallet"}
            </Title>
            <Text size="sm" c="dimmed">
              {form.values.id
                ? "Update wallet information"
                : "Add a new wallet to the system"}
            </Text>
          </Stack>
        }
        size="md"
      >
        <form
          onSubmit={form.onSubmit((values) => createOrUpdateMut.mutate(values))}
          className="flex flex-col gap-4"
        >
          <TextInput
            label="Wallet Name"
            placeholder="Enter wallet name"
            size="md"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Owner ID"
            placeholder="Enter owner ID"
            size="md"
            {...form.getInputProps("ownerId")}
          />
          <TextInput
            label="Initial Balance"
            type="number"
            placeholder="Enter initial balance"
            size="md"
            {...form.getInputProps("balance")}
          />
          <Button
            type="submit"
            size="md"
            fullWidth
            mt="xl"
            loading={createOrUpdateMut.isPending}
          >
            {form.values.id ? "Update Wallet" : "Create Wallet"}
          </Button>
        </form>
      </Drawer>
    </Page>
  );
}
