import React from "react";
import { Container, Grid, Paper, Text, Title } from "@mantine/core";
import { useAuth0 } from "@auth0/auth0-react";
import { IoCalendar, IoList, IoTime } from "react-icons/io5";

function MeDashboard() {
  const { user } = useAuth0();

  return (
    <Container size="lg" className="py-8">
      <div className="mb-8">
        <Title order={2}>Welcome back, {user?.name}!</Title>
        <Text c="dimmed">Here's an overview of your activities</Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="sm" p="md" className="h-full">
            <div className="flex items-center gap-3">
              <IoCalendar className="text-blue-600" size={24} />
              <div>
                <Text size="lg" fw={500}>
                  Upcoming Bookings
                </Text>
                <Text size="sm" c="dimmed">
                  View your court bookings
                </Text>
              </div>
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="sm" p="md" className="h-full">
            <div className="flex items-center gap-3">
              <IoList className="text-blue-600" size={24} />
              <div>
                <Text size="lg" fw={500}>
                  My Requests
                </Text>
                <Text size="sm" c="dimmed">
                  Track your pending requests
                </Text>
              </div>
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="sm" p="md" className="h-full">
            <div className="flex items-center gap-3">
              <IoTime className="text-blue-600" size={24} />
              <div>
                <Text size="lg" fw={500}>
                  My Schedule
                </Text>
                <Text size="sm" c="dimmed">
                  View your activity schedule
                </Text>
              </div>
            </div>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default MeDashboard;
