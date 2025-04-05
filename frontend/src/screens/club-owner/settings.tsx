import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

interface Settings {
  clubName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  businessHours: string;
}

export default function SettingsPage() {
  const { user } = useAuth0();
  const { get, put } = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    clubName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    businessHours: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // In a real implementation, you would fetch settings from your API
      // For now, we'll use mock data
      setSettings({
        clubName: "Tennis Club",
        address: "123 Tennis Court, Sports City",
        phone: "+1234567890",
        email: "info@tennisclub.com",
        website: "www.tennisclub.com",
        businessHours: "9:00 AM - 9:00 PM",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await put("/api/v1/settings", settings);
      // Show success message or handle success case
    } catch (error) {
      console.error("Error saving settings:", error);
      // Show error message or handle error case
    } finally {
      setSaving(false);
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
      <Title order={2}>Settings</Title>
      <Text color="dimmed">Manage your club settings and preferences</Text>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Club Name"
              placeholder="Enter club name"
              value={settings.clubName}
              onChange={(e) =>
                setSettings({ ...settings, clubName: e.target.value })
              }
              required
            />
            <TextInput
              label="Address"
              placeholder="Enter club address"
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              required
            />
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
              required
            />
            <TextInput
              label="Email"
              placeholder="Enter email address"
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
              required
            />
            <TextInput
              label="Website"
              placeholder="Enter website URL"
              value={settings.website}
              onChange={(e) =>
                setSettings({ ...settings, website: e.target.value })
              }
            />
            <TextInput
              label="Business Hours"
              placeholder="Enter business hours"
              value={settings.businessHours}
              onChange={(e) =>
                setSettings({ ...settings, businessHours: e.target.value })
              }
              required
            />
            <Group justify="flex-end">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </div>
  );
}
