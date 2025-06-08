import {
  Button,
  Card,
  Container,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import {
  IoChatboxOutline,
  IoNotificationsCircle,
  IoSave,
  IoInformationCircleOutline,
} from "react-icons/io5";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import httpService from "@/common/httpservice";
import Page from "@/components/page";
import { useMesssageTemplateQuery } from "@/hooks/useQueries";

const TEMPLATE_VARIABLES = [
  { name: "cost", description: "Match cost per section" },
  { name: "customSection", description: "Custom section information" },
  { name: "additionalCost", description: "Additional costs for the match" },
  { name: "individualCost", description: "Cost per individual player" },
  { name: "totalPlayer", description: "Total number of players" },
];

export default function Setting() {
  const [template, setTemplate] = useState("");
  const editor = useEditor({
    extensions: [StarterKit, Link],
    onUpdate(e) {
      setTemplate(e.editor.getHTML());
    },
  });

  const { data: messageTemplate, refetch } = useMesssageTemplateQuery();

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.commands.insertContent(`{{${variable}}}`);
    }
  };

  const saveMessageTemplate = async () => {
    if (!template) {
      notifications.show({
        title: "Error",
        message: "Please provide message template",
        color: "red",
      });
      return;
    }

    await httpService.post(`api/v1/settings/message-template`, {
      template,
    });

    refetch();

    notifications.show({
      title: "Success",
      message: "Update template success",
      color: "green",
    });
  };

  return (
    <Page>
      <Container size="lg" className="py-8">
        <Stack gap="xl">
          <div>
            <Title order={2}>Settings</Title>
            <Text c="dimmed">Manage your application settings</Text>
          </div>

          <Card shadow="sm" p="lg" withBorder>
            <Tabs defaultValue="alert">
              <Tabs.List>
                <Tabs.Tab value="alert" leftSection={<IoChatboxOutline />}>
                  Message Template
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="alert" className="py-5">
                <Stack gap="md">
                  <Paper withBorder p="md" className="bg-blue-50">
                    <Group>
                      <IoNotificationsCircle
                        className="text-blue-600"
                        size={24}
                      />
                      <div>
                        <Text fw={500} size="lg">
                          Current Template
                        </Text>
                        <Text size="sm" c="dimmed">
                          This is your active message template
                        </Text>
                      </div>
                    </Group>
                    <div className="mt-4">
                      <Markdown rehypePlugins={[rehypeRaw]}>
                        {messageTemplate}
                      </Markdown>
                    </div>
                  </Paper>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card withBorder shadow="sm" className="lg:col-span-2">
                      <Text fw={500} mb="md">
                        Edit Template
                      </Text>
                      <RichTextEditor editor={editor}>
                        <RichTextEditor.Toolbar sticky stickyOffset={60}>
                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold />
                            <RichTextEditor.Italic />
                            <RichTextEditor.Underline />
                            <RichTextEditor.Strikethrough />
                            <RichTextEditor.ClearFormatting />
                            <RichTextEditor.Highlight />
                            <RichTextEditor.Code />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.H1 />
                            <RichTextEditor.H2 />
                            <RichTextEditor.H3 />
                            <RichTextEditor.H4 />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Blockquote />
                            <RichTextEditor.Hr />
                            <RichTextEditor.BulletList />
                            <RichTextEditor.OrderedList />
                            <RichTextEditor.Subscript />
                            <RichTextEditor.Superscript />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Link />
                            <RichTextEditor.Unlink />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.AlignLeft />
                            <RichTextEditor.AlignCenter />
                            <RichTextEditor.AlignJustify />
                            <RichTextEditor.AlignRight />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Undo />
                            <RichTextEditor.Redo />
                          </RichTextEditor.ControlsGroup>
                        </RichTextEditor.Toolbar>

                        <RichTextEditor.Content className="min-h-[300px]" />
                      </RichTextEditor>
                    </Card>

                    <Card withBorder shadow="sm">
                      <Stack>
                        <Group>
                          <IoInformationCircleOutline size={20} />
                          <Text fw={500}>Template Variables</Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          Click on a variable to insert it into your template
                        </Text>
                        <ScrollArea h={300}>
                          <Stack gap="xs">
                            {TEMPLATE_VARIABLES.map((variable) => (
                              <Paper
                                key={variable.name}
                                p="xs"
                                withBorder
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => insertVariable(variable.name)}
                              >
                                <Group justify="space-between">
                                  <Badge variant="light" color="blue">
                                    {variable.name}
                                  </Badge>
                                </Group>
                                <Text size="sm" mt={4}>
                                  {variable.description}
                                </Text>
                              </Paper>
                            ))}
                          </Stack>
                        </ScrollArea>
                      </Stack>
                    </Card>
                  </div>

                  <Card withBorder shadow="sm">
                    <Text fw={500} mb="md">
                      Preview
                    </Text>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                      <Markdown rehypePlugins={[rehypeRaw]}>
                        {template}
                      </Markdown>
                    </div>
                  </Card>

                  <Group justify="flex-end">
                    <Button
                      leftSection={<IoSave />}
                      onClick={saveMessageTemplate}
                      variant="filled"
                      color="blue"
                    >
                      Save Template
                    </Button>
                  </Group>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
