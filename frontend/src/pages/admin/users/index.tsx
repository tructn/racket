import { useState } from "react";
import Page from "@/components/page";
import { Button, Table, Text, Group, ActionIcon, Stack } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IoRefresh, IoTrash, IoCheckmark, IoClose } from "react-icons/io5";
import httpService from "@/common/httpservice";
import BreadcrumbsComponent from "@/components/breadcrumbs";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isActive: boolean;
  lastLogin?: string;
}

function UsersPage() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () =>
      httpService.get("/api/admin/users").then((res: any) => res.data),
  });

  const syncUsersMutation = useMutation({
    mutationFn: () => httpService.post("/api/admin/users/sync", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({
        title: "Success",
        message: "Users synchronized successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: "Failed to sync users",
        color: "red",
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      httpService.put(`/api/admin/users/${userId}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({
        title: "Success",
        message: "User status updated successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: "Failed to update user status",
        color: "red",
      });
    },
  });

  const handleSyncUsers = () => {
    setIsSyncing(true);
    syncUsersMutation.mutate();
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const breadcrumbItems = [
    { title: "Admin", href: "/admin" },
    { title: "Management", href: "/admin/management" },
    { title: "Users" },
  ];

  return (
    <Page title="User Management" breadcrumbs={false}>
      <BreadcrumbsComponent items={breadcrumbItems} />
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Manage Users
          </Text>
          <Button
            leftSection={<IoRefresh />}
            onClick={handleSyncUsers}
            loading={isSyncing}
          >
            Sync with Auth0
          </Button>
        </Group>

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>
                  <Group gap="sm">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        style={{ width: 30, height: 30, borderRadius: "50%" }}
                      />
                    )}
                    <Text>{user.name}</Text>
                  </Group>
                </td>
                <td>{user.email}</td>
                <td>
                  <Text c={user.isActive ? "green" : "red"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Text>
                </td>
                <td>{user.lastLogin || "Never"}</td>
                <td>
                  <Group gap={4}>
                    <ActionIcon
                      color={user.isActive ? "red" : "green"}
                      onClick={() =>
                        handleToggleUserStatus(user.id, user.isActive)
                      }
                    >
                      {user.isActive ? <IoClose /> : <IoCheckmark />}
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Page>
  );
}

export default UsersPage;
