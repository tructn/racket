import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { IoRefresh, IoPersonAdd, IoRadio, IoSync } from "react-icons/io5";

import httpService from "@/common/httpservice";
import Page from "@/components/page";
import useAuth0Users, { User } from "@/hooks/useAuth0Users";
import {
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Modal,
  TextInput,
  NumberInput,
  Skeleton,
  Switch,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";

interface PlayerProfileModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rank: number;
}

function UsersPage() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(180);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { users, isLoading } = useAuth0Users();

  const form = useForm<PlayerProfileModel>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      rank: 0,
    },
    validate: {
      firstName: (value) => (!value ? "First name is required" : null),
      lastName: (value) => (!value ? "Last name is required" : null),
      email: (value) =>
        !value
          ? "Email is required"
          : /^\S+@\S+$/.test(value)
            ? null
            : "Invalid email",
      phone: (value) => (!value ? "Phone is required" : null),
      rank: (value) => (value < 0 ? "Rank must be positive" : null),
    },
  });

  const syncUsersMutation = useMutation({
    mutationFn: (variables: { isAutoSync: boolean }) =>
      httpService.post("/api/v1/users/auth0/sync", {}),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setLastSyncTime(new Date());

      // Only show notification for manual syncs
      if (!variables.isAutoSync) {
        notifications.show({
          title: "Success",
          message: "Users synchronized successfully",
          color: "green",
        });
      }
    },
    onError: (error, variables) => {
      // Only show notification for manual syncs
      if (!variables.isAutoSync) {
        notifications.show({
          title: "Error",
          message: "Failed to sync users",
          color: "red",
        });
      }
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  const convertToPlayerMutation = useMutation({
    mutationFn: (data: PlayerProfileModel & { userId: string }) =>
      httpService.post("/api/v1/players", {
        ...data,
        externalUserId: data.userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        title: "Success",
        message: "Player created successfully",
        color: "green",
      });
      setSelectedUser(null);
      form.reset();
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: "Failed to create player",
        color: "red",
      });
    },
  });

  const handleSyncUsers = (isAutoSync = false) => {
    setIsSyncing(true);
    syncUsersMutation.mutate({ isAutoSync });
  };

  useEffect(() => {
    let intervalId: number;

    if (autoSync) {
      handleSyncUsers(true);

      intervalId = setInterval(() => {
        handleSyncUsers(true);
      }, syncInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoSync, syncInterval]);

  const handleUpdatePlayerProfile = (user: User) => {
    setSelectedUser(user);
    form.setValues({
      firstName: user.firstName,
      lastName: user.lastName || "",
      email: user.email,
      phone: "",
      rank: 0,
    });
  };

  const handleSubmit = (values: PlayerProfileModel) => {
    if (selectedUser?.id) {
      convertToPlayerMutation.mutate({
        ...values,
        userId: selectedUser.id,
      });
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <Table.Tr key={index}>
            <Table.Td>
              <Group gap="sm">
                <Skeleton height={40} circle />
                <div>
                  <Skeleton height={20} width={120} mb={5} />
                  <Skeleton height={15} width={80} />
                </div>
              </Group>
            </Table.Td>
            <Table.Td>
              <Skeleton height={20} width={180} />
            </Table.Td>
            <Table.Td>
              <Skeleton height={20} width={120} />
            </Table.Td>
            <Table.Td>
              <Skeleton height={32} width={80} />
            </Table.Td>
          </Table.Tr>
        ));
    }

    return users?.map((user: User) => (
      <Table.Tr key={user.id}>
        <Table.Td>
          <Group gap="sm">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.firstName}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#f1f3f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="sm" fw={500}>
                  {user.firstName?.[0]?.toUpperCase() || "?"}
                </Text>
              </div>
            )}
            <div>
              <Text fw={500}>
                {user.firstName} {user.lastName}
              </Text>
              <Text size="xs" c="dimmed">
                {user.id}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text>{user.email}</Text>
        </Table.Td>
        <Table.Td>
          <Text>
            {dayjs(user.lastLogin).format("DD-MM-YYYY HH:mm A") || "Never"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Button
            variant="transparent"
            size="sm"
            leftSection={<IoPersonAdd />}
            onClick={() => handleUpdatePlayerProfile(user)}
            disabled={isLoading}
          >
            Player Profile
          </Button>
        </Table.Td>
      </Table.Tr>
    ));
  };

  return (
    <Page title="User Management" breadcrumbs={true}>
      <Stack gap="lg">
        <Card withBorder shadow="sm" p="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>User Accounts</Title>
            <Group>
              <Group gap="xs">
                <Switch
                  label="Auto Sync"
                  checked={autoSync}
                  onChange={(event) => setAutoSync(event.currentTarget.checked)}
                  disabled={isLoading}
                  size="md"
                  color="blue"
                  thumbIcon={
                    autoSync ? (
                      <IoSync
                        className="animate-spin"
                        size="0.8rem"
                        color="white"
                        stroke="3"
                      />
                    ) : (
                      <IoSync size="0.8rem" color="white" stroke="3" />
                    )
                  }
                />
                <NumberInput
                  value={syncInterval}
                  onChange={(value) => setSyncInterval(Number(value))}
                  min={5}
                  max={300}
                  disabled={!autoSync || isLoading}
                  size="xs"
                  w={80}
                />
                {lastSyncTime && (
                  <Text size="xs" c="dimmed" style={{ alignSelf: "center" }}>
                    Last sync: {dayjs(lastSyncTime).format("HH:mm:ss")}
                  </Text>
                )}
              </Group>
              <Button
                leftSection={<IoRefresh />}
                onClick={() => handleSyncUsers(false)}
                loading={isSyncing}
                disabled={isLoading}
              >
                Sync Users
              </Button>
            </Group>
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Last Login</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderTableContent()}</Table.Tbody>
          </Table>
        </Card>
      </Stack>

      <Modal
        opened={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          form.reset();
        }}
        title="Player Profile"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              {...form.getInputProps("lastName")}
            />
            <TextInput
              label="Email"
              placeholder="Enter email"
              required
              {...form.getInputProps("email")}
            />
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              required
              {...form.getInputProps("phone")}
            />
            <NumberInput
              label="Rank"
              placeholder="Enter player rank"
              min={0}
              required
              {...form.getInputProps("rank")}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setSelectedUser(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={convertToPlayerMutation.isPending}>
                Create Player
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Page>
  );
}

export default UsersPage;
