import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IoAdd,
  IoArrowDown,
  IoArrowUp,
  IoWallet,
  IoArrowBackCircleOutline,
} from "react-icons/io5";
import httpService from "@/common/httpservice";
import formatter from "@/common/formatter";
import SectionLoading from "@/components/loading/section-loading";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

enum TransactionType {
  IN = 1,
  OUT = 2,
}

interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  description: string;
  createdAt: string;
}

interface Wallet {
  id: number;
  name: string;
  balance: number;
  transactions: Transaction[];
}

export default function MeWallet() {
  const navigate = useNavigate();
  const {
    data: wallet,
    isLoading,
    error,
  } = useQuery<Wallet>({
    queryKey: ["getMyWallet"],
    queryFn: () => httpService.get<Wallet>("api/v1/me/wallet"),
    retry: false,
  });

  if (isLoading) {
    return <SectionLoading />;
  }

  if (error instanceof AxiosError && error.response?.status === 404) {
    return (
      <Container size="lg" className="py-8">
        <div className="mb-8">
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>My Wallet</Title>
              <Text c="dimmed">
                Manage your wallet balance and transactions
              </Text>
            </div>
            <ActionIcon
              variant="transparent"
              size="lg"
              onClick={() => navigate(-1)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <IoArrowBackCircleOutline size={30} />
            </ActionIcon>
          </Group>
        </div>

        <Paper shadow="sm" p="xl" withBorder className="text-center">
          <Stack align="center" gap="md">
            <Box className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <IoWallet size={40} className="text-blue-600" />
            </Box>
            <Title order={3}>No Wallet Found</Title>
            <Text c="dimmed" size="lg">
              You don't have a wallet yet. Create one to start managing your
              funds.
            </Text>
            <Button
              leftSection={<IoAdd size={20} />}
              size="md"
              variant="light"
              color="blue"
              mt="md"
            >
              Create Wallet
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      <div className="mb-8">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>My Wallet</Title>
            <Text c="dimmed">Manage your wallet balance and transactions</Text>
          </div>
          <ActionIcon
            variant="transparent"
            size="lg"
            onClick={() => navigate(-1)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <IoArrowBackCircleOutline size={30} />
          </ActionIcon>
        </Group>
      </div>

      {/* Wallet Summary Card */}
      <Paper shadow="sm" p="md" withBorder className="mb-8">
        <Group justify="space-between" align="center">
          <Group gap="xl">
            <Box className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <IoWallet size={32} className="text-blue-600" />
            </Box>
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Current Balance
              </Text>
              <Title order={2}>
                {formatter.currency(wallet?.balance || 0)}
              </Title>
            </Stack>
          </Group>
          <Button
            leftSection={<IoAdd size={20} />}
            variant="light"
            color="blue"
          >
            Add Funds
          </Button>
        </Group>
      </Paper>

      {/* Transaction History */}
      <Paper shadow="sm" withBorder>
        <Box p="md" className="border-b border-gray-100">
          <Group justify="space-between">
            <Group gap={2}>
              <Box className="rounded-full bg-blue-50 p-2 text-blue-500">
                <IoWallet size={20} />
              </Box>
              <Title order={3} className="text-slate-800">
                Transaction History
              </Title>
            </Group>
            <Badge size="lg" variant="light" color="blue">
              {wallet?.transactions?.length || 0} Transactions
            </Badge>
          </Group>
        </Box>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "20%" }}>Date</Table.Th>
              <Table.Th style={{ width: "40%" }}>Description</Table.Th>
              <Table.Th style={{ width: "20%" }}>Type</Table.Th>
              <Table.Th style={{ width: "20%" }}>Amount</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!wallet?.transactions?.length ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
                    <Text size="lg" c="dimmed">
                      No transactions yet
                    </Text>
                  </div>
                </Table.Td>
              </Table.Tr>
            ) : (
              wallet?.transactions?.map((transaction) => (
                <Table.Tr key={transaction.id}>
                  <Table.Td>
                    <Text size="sm">
                      {formatter.formatDate(new Date(transaction.createdAt))}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{transaction.description}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="sm"
                      variant="light"
                      color={
                        transaction.type === TransactionType.IN
                          ? "green"
                          : "red"
                      }
                      leftSection={
                        transaction.type === TransactionType.IN ? (
                          <IoArrowDown size={14} />
                        ) : (
                          <IoArrowUp size={14} />
                        )
                      }
                    >
                      {transaction.type === TransactionType.IN ? "In" : "Out"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      size="sm"
                      fw={500}
                      c={
                        transaction.type === TransactionType.IN
                          ? "green"
                          : "red"
                      }
                    >
                      {transaction.type === TransactionType.IN ? "+" : "-"}
                      {formatter.currency(transaction.amount)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}
