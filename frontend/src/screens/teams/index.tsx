import {
  ActionIcon,
  Button,
  Modal,
  Skeleton,
  Table,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IoAdd, IoPencil, IoSave } from "react-icons/io5";
import { z } from "zod";
import httpService from "../../common/httpservice";
import Page from "../../components/page";

interface Team {
  id: number;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: any[];
}

const schema = z.object({
  id: z.number().nullable(),
  name: z.string({ message: "Name is required" }).min(1),
  description: z.string().optional(),
});

export default function TeamScreen() {
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
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
    data: teams,
    refetch,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await httpService.get("api/v1/teams");
      return response.data;
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

  return (
    <Page title="Team Management">
      <div>
        <Button leftSection={<IoAdd />} variant="default" onClick={openModal}>
          Create Team
        </Button>
      </div>
      <Table striped withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Members</Table.Th>
            <Table.Th
              align="center"
              className="flex items-center justify-center"
            >
              Action
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isPending
            ? // Loading skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Skeleton height={20} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} />
                  </Table.Td>
                  <Table.Td>
                    <div className="flex items-center justify-center">
                      <Skeleton height={20} width={20} radius="xl" />
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))
            : teams.map((team) => (
                <Table.Tr key={team.id}>
                  <Table.Td>{team.name}</Table.Td>
                  <Table.Td>{team.description}</Table.Td>
                  <Table.Td>{team.members.length}</Table.Td>
                  <Table.Td>
                    <div className="flex items-center justify-center gap-2">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => {
                          form.setValues(team);
                          openModal();
                        }}
                      >
                        <IoPencil />
                      </ActionIcon>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={closeModal} title="Create Team">
        <form
          onSubmit={form.onSubmit((values) => createMutation.mutate(values))}
        >
          <TextInput
            label="Team Name"
            placeholder="Enter team name"
            {...form.getInputProps("name")}
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter team description"
            {...form.getInputProps("description")}
          />
          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              leftSection={<IoSave />}
              loading={createMutation.isPending}
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </Page>
  );
}
