import { useAuth0 } from "@auth0/auth0-react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { IoAdd, IoPencil, IoTrash } from "react-icons/io5";

interface Booking {
  id: string;
  teamName: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export default function BookingsPage() {
  const { user } = useAuth0();
  const { get, post, put, del } = useApi();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    teamName: "",
    courtName: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // In a real implementation, you would fetch bookings from your API
      // For now, we'll use mock data
      setBookings([
        {
          id: "1",
          teamName: "Team Alpha",
          courtName: "Court 1",
          date: "2024-03-20",
          startTime: "14:00",
          endTime: "16:00",
          status: "confirmed",
          createdAt: "2024-03-15",
        },
        {
          id: "2",
          teamName: "Team Beta",
          courtName: "Court 2",
          date: "2024-03-21",
          startTime: "10:00",
          endTime: "12:00",
          status: "pending",
          createdAt: "2024-03-16",
        },
      ]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        // Update existing booking
        await put(`/api/v1/bookings/${editingBooking.id}`, formData);
      } else {
        // Create new booking
        await post("/api/v1/bookings", formData);
      }
      fetchBookings();
      close();
      resetForm();
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      teamName: booking.teamName,
      courtName: booking.courtName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
    open();
  };

  const handleDelete = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await del(`/api/v1/bookings/${bookingId}`);
        fetchBookings();
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingBooking(null);
    setFormData({
      teamName: "",
      courtName: "",
      date: "",
      startTime: "",
      endTime: "",
    });
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <Group justify="space-between">
        <Title order={2}>Bookings</Title>
        <Button
          leftSection={<IoAdd />}
          onClick={() => {
            resetForm();
            open();
          }}
        >
          New Booking
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Team</Table.Th>
            <Table.Th>Court</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Time</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bookings.map((booking) => (
            <Table.Tr key={booking.id}>
              <Table.Td>{booking.teamName}</Table.Td>
              <Table.Td>{booking.courtName}</Table.Td>
              <Table.Td>{new Date(booking.date).toLocaleDateString()}</Table.Td>
              <Table.Td>
                {booking.startTime} - {booking.endTime}
              </Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                {new Date(booking.createdAt).toLocaleDateString()}
              </Table.Td>
              <Table.Td>
                <Group>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEdit(booking)}
                  >
                    <IoPencil />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(booking.id)}
                  >
                    <IoTrash />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={close}
        title={editingBooking ? "Edit Booking" : "New Booking"}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Team Name"
              placeholder="Enter team name"
              value={formData.teamName}
              onChange={(e) =>
                setFormData({ ...formData, teamName: e.target.value })
              }
              required
            />
            <TextInput
              label="Court Name"
              placeholder="Enter court name"
              value={formData.courtName}
              onChange={(e) =>
                setFormData({ ...formData, courtName: e.target.value })
              }
              required
            />
            <TextInput
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
            <TextInput
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
            <TextInput
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              required
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBooking ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
