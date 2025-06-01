import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  TextInput,
  Text,
  Avatar,
  Group,
  Stack,
  Paper,
  Loader,
  Center,
} from "@mantine/core";
import { useUserService, UserProfile } from "@/services/userService";
import Page from "@/components/page";

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
    <Page title="Profile">
      <Container size="md" mt="xl">
        <Grid>
          {/* Auth0 Profile Information */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="md" withBorder>
              <Text size="lg" fw={500} mb="md">
                Auth0 Profile
              </Text>
              <Group mb="md">
                <Avatar
                  src={auth0User.picture}
                  alt={auth0User.name}
                  size="lg"
                  radius="xl"
                />
                <Stack gap={0}>
                  <Text size="sm" fw={500}>
                    {auth0User.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {auth0User.email}
                  </Text>
                </Stack>
              </Group>
              <Text size="xs" c="dimmed">
                Auth0 User ID: {auth0User.sub}
              </Text>
            </Paper>
          </Grid.Col>

          {/* Local Profile Information */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="md" withBorder>
              <Text size="lg" fw={500} mb="md">
                Local Profile
              </Text>
              {isEditing ? (
                <Stack mt="md">
                  <TextInput
                    label="Name"
                    value={editedName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedName(e.target.value)
                    }
                    disabled={isLoading}
                  />
                  <TextInput
                    label="Profile Picture URL"
                    value={editedPicture}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedPicture(e.target.value)
                    }
                    disabled={isLoading}
                  />
                  <Group mt="md">
                    <Button onClick={handleSave} loading={isLoading}>
                      Save
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
                <Stack mt="md">
                  <Group>
                    <Avatar
                      src={profile.picture}
                      alt={profile.name}
                      size="lg"
                      radius="xl"
                    />
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>
                        {profile.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {profile.email}
                      </Text>
                    </Stack>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Local User ID: {profile.id}
                  </Text>
                  <Text size="xs" c="dimmed">
                    IDP User ID: {profile.idpUserId}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Created: {new Date(profile.createdAt).toLocaleString()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Last Updated: {new Date(profile.updatedAt).toLocaleString()}
                  </Text>
                  <Button
                    onClick={() => setIsEditing(true)}
                    mt="md"
                    loading={isLoading}
                  >
                    Edit Profile
                  </Button>
                </Stack>
              )}
              {error && (
                <Text c="red" mt="md">
                  {error}
                </Text>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Page>
  );
};

export default ProfilePage;
