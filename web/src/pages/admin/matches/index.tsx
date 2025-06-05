import dayjs from "dayjs";
import {
  IoAdd,
  IoDuplicate,
  IoPencil,
  IoSave,
  IoTrash,
  IoSearch,
  IoFilter,
} from "react-icons/io5";
import { z } from "zod";

import {
  ActionIcon,
  Button,
  Drawer,
  NumberInput,
  Select,
  Table,
  Text,
  TextInput,
  Group,
  Paper,
  Stack,
  Title,
  Badge,
  Grid,
  Textarea,
  Divider,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";

import httpService from "@/common/httpservice";
import Currency from "@/components/currency";
import Page from "@/components/page";
import { useSportCenterValueLabelQuery } from "@/hooks/useQueries";
import { CreateOrUpdateMatchModel } from "@/types";
import { MatchModel } from "./models";
import DataTableSkeleton from "@/components/loading/skeleton/data-table-skeleton";

const schema = z.object({
  matchId: z.number().nullable(),
  start: z.date({ message: "Start date is required" }),
  end: z.date({ message: "End date is required" }),
  sportCenterId: z.string({ message: "Sport center is required" }),
  court: z.string(),
  customSection: z.number().nullable(),
});

function Matches() {
  const [
    isMatchDrawerOpened,
    { open: openMatchDrawer, close: closeMatchDrawer },
  ] = useDisclosure(false);

  const {
    data: matches,
    isPending: matchesLoading,
    refetch,
  } = useQuery({
    queryKey: ["getMatches"],
    queryFn: () => httpService.get<MatchModel[]>("api/v1/matches"),
  });

  const { data: sportCenterOptions } = useSportCenterValueLabelQuery();

  const form = useForm<CreateOrUpdateMatchModel>({
    mode: "uncontrolled",
    initialValues: {
      matchId: null,
      start: dayjs(new Date()).set("hour", 9).set("minute", 0).toDate(),
      end: dayjs(new Date()).set("hour", 11).set("minute", 0).toDate(),
      // Mantine <Select/> received default value as string
      sportCenterId: "0",
      court: "",
      customSection: null,
    },
    validate: zodResolver(schema),
  });

  const deleteMatch = (matchId: number) =>
    modals.openConfirmModal({
      title: "Delete your match",
      centered: true,
      children: (
        <Text>
          Are you sure you want to delete this match. This action is
          irreversable!
        </Text>
      ),
      labels: { confirm: "Delete Match", cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        await httpService.del(`api/v1/matches/${matchId}`);
        refetch();
      },
    });

  const editMatch = (match: MatchModel) => {
    form.setValues({
      matchId: match.matchId,
      start: new Date(match.start),
      end: new Date(match.end),
      sportCenterId: match.sportCenterId.toString(),
      court: match.court,
      customSection: match.customSection,
    });
    openMatchDrawer();
  };

  const cloneMatch = (match: MatchModel) => {
    modals.openConfirmModal({
      title: "Clone",
      centered: true,
      children: <Text>Want to clone {match.sportCenterName} match ?</Text>,
      labels: { confirm: "Yes", cancel: "No" },
      confirmProps: { color: "green" },
      onConfirm: async () => {
        await httpService.post(`api/v1/matches/${match.matchId}/clone`, null);
        refetch();
      },
    });
  };

  return (
    <>
      <Page title="Matches Management">
        <Stack gap="lg">
          {/* Header Section */}
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>Matches Overview</Title>
              <Button
                leftSection={<IoAdd />}
                variant="filled"
                onClick={openMatchDrawer}
              >
                Create Match
              </Button>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Paper p="md" withBorder>
                  <Text size="sm" c="dimmed">
                    Total Matches
                  </Text>
                  <Title order={2}>{matches?.length || 0}</Title>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Paper p="md" withBorder>
                  <Text size="sm" c="dimmed">
                    Active Today
                  </Text>
                  <Title order={2}>
                    {matches?.filter((m) =>
                      dayjs(m.start).isSame(dayjs(), "day"),
                    ).length || 0}
                  </Title>
                </Paper>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Table Section */}
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Sport Center</Table.Th>
                  <Table.Th>Court</Table.Th>
                  <Table.Th>Start</Table.Th>
                  <Table.Th>End</Table.Th>
                  <Table.Th>How many Sections?</Table.Th>
                  <Table.Th>Cost /sec</Table.Th>
                  <Table.Th>Minutes /sec</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th style={{ width: 120 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {matchesLoading && <DataTableSkeleton row={3} col={10} />}
                {matches &&
                  matches.map((item) => {
                    const isToday = dayjs(item.start).isSame(dayjs(), "day");
                    return (
                      <Table.Tr key={item.matchId}>
                        <Table.Td>
                          <Badge variant="light">{item.matchId}</Badge>
                        </Table.Td>
                        <Table.Td>{item.sportCenterName || "N/A"}</Table.Td>
                        <Table.Td>{item.court || "N/A"}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {dayjs(item.start).format("DD/MM/YYYY hh:mm")}
                            {isToday && (
                              <Badge color="green" size="sm">
                                Today
                              </Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          {item.end &&
                            dayjs(item.end).format("DD/MM/YYYY hh:mm")}
                        </Table.Td>
                        <Table.Td>{item.customSection || "N/A"}</Table.Td>
                        <Table.Td>
                          <Currency value={item.costPerSection} />
                        </Table.Td>
                        <Table.Td>{item.minutePerSection || "N/A"}</Table.Td>
                        <Table.Td>
                          <Currency value={item.cost} />
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            <ActionIcon
                              size="md"
                              variant="light"
                              color="blue"
                              onClick={() => editMatch(item)}
                            >
                              <IoPencil size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="md"
                              variant="light"
                              color="green"
                              onClick={() => cloneMatch(item)}
                            >
                              <IoDuplicate size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="md"
                              variant="light"
                              color="red"
                              onClick={() => deleteMatch(item.matchId!)}
                            >
                              <IoTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>
      </Page>

      <Drawer
        position="right"
        opened={isMatchDrawerOpened}
        onClose={closeMatchDrawer}
        title={
          <Title order={3}>
            {form.values.matchId ? "Edit Match" : "Create Match"}
          </Title>
        }
        size="lg"
      >
        <form
          onSubmit={form.onSubmit(async (model) => {
            if (model.matchId) {
              await httpService.put(`api/v1/matches/${model.matchId}`, model);
            } else {
              await httpService.post("api/v1/matches", {
                ...model,
                sportCenterId: +model.sportCenterId,
              });
            }
            refetch();
            form.reset();
            closeMatchDrawer();
          })}
        >
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <DateTimePicker
                  label="Start (date/time)"
                  required
                  {...form.getInputProps("start")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateTimePicker
                  label="End (date/time)"
                  required
                  {...form.getInputProps("end")}
                />
              </Grid.Col>
            </Grid>

            <Divider />

            <Select
              label="Sport center"
              placeholder="Pick value"
              data={sportCenterOptions}
              nothingFoundMessage="No sport center"
              clearable
              searchable
              {...form.getInputProps("sportCenterId")}
            />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Court"
                  placeholder="Add court..."
                  {...form.getInputProps("court")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Custom Section"
                  placeholder="How many section in today match..."
                  {...form.getInputProps("customSection")}
                />
              </Grid.Col>
            </Grid>

            <Divider />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeMatchDrawer}>
                Cancel
              </Button>
              <Button
                variant="filled"
                leftSection={<IoSave size={16} />}
                type="submit"
              >
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </>
  );
}

export default Matches;
