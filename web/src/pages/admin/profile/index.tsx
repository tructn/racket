import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Card,
  Container,
  TextInput,
  Text,
  Avatar,
  Group,
  Stack,
  Title,
  Loader,
  Center,
  Paper,
} from "@mantine/core";
import { useUserService, UserProfile } from "@/services/userService";
import Page from "@/components/page";
import {
  IoPersonOutline,
  IoMailOutline,
  IoIdCardOutline,
} from "react-icons/io5";

const ProfilePage: React.FC = () => {
  const { user: auth0User, isLoading: isAuth0Loading } = useAuth0();
  const userService = useUserService();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPicture, setEditedPicture] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuth0Loading && auth0User) {
      loadProfile();
    }
  }, [isAuth0Loading, auth0User]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await userService.getCurrentUser();
      setProfile(userProfile);
      setEditedName(userProfile.name);
      setEditedPicture(userProfile.picture);
      setError(null);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedProfile = await userService.updateProfile({
        name: editedName,
        picture: editedPicture,
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuth0Loading || isLoading) {
    return (
      <Page>
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading profile...</Text>
          </Stack>
        </Center>
      </Page>
    );
  }

  if (!auth0User) {
    return (
      <Page>
        <Center h="100vh">
          <Text c="red">Please log in to view your profile.</Text>
        </Center>
      </Page>
    );
  }

  if (!profile) {
    return (
      <Page>
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Text c="red">{error || "Failed to load profile"}</Text>
            <Button onClick={loadProfile}>Retry</Button>
          </Stack>
        </Center>
      </Page>
    );
  }

  return (
    <Page>
      <Container size="lg" className="py-8">
        <Stack gap="xl">
          <Card shadow="sm" p="lg" withBorder>
            <Stack gap="xl">
              <Title order={2}>Profile</Title>
              <Text c="dimmed">Manage your profile information</Text>

              <Group>
                <Avatar
                  src={auth0User.picture}
                  alt={auth0User.name}
                  size="xl"
                  radius="xl"
                />
                <Stack gap={0}>
                  <Text size="lg" fw={500}>
                    {auth0User.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {auth0User.email}
                  </Text>
                </Stack>
              </Group>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
                <Paper withBorder p="md" className="bg-blue-50">
                  <Stack gap="xs">
                    <Group>
                      <IoIdCardOutline className="text-blue-600" size={20} />
                      <Text size="sm" fw={500}>
                        Auth0 User ID
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed" ml={36}>
                      {auth0User.sub}
                    </Text>
                  </Stack>
                </Paper>
              </div>

              {isEditing ? (
                <Stack gap="md">
                  <Text size="lg" fw={500}>
                    Edit Profile
                  </Text>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <TextInput
                      label="Name"
                      value={editedName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditedName(e.target.value)
                      }
                      disabled={isLoading}
                      leftSection={<IoPersonOutline size={16} />}
                    />
                    <TextInput
                      label="Profile Picture URL"
                      value={editedPicture}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditedPicture(e.target.value)
                      }
                      disabled={isLoading}
                      leftSection={<IoMailOutline size={16} />}
                    />
                  </div>
                  <Group mt="md">
                    <Button onClick={handleSave} loading={isLoading}>
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </Group>
                </Stack>
              ) : (
                <Button onClick={() => setIsEditing(true)} loading={isLoading}>
                  Edit Profile
                </Button>
              )}
              {error && (
                <Text c="red" mt="md">
                  {error}
                </Text>
              )}
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
};

export default ProfilePage;
