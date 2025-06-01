import { Alert, Button, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { IoChatboxOutline, IoNotificationsCircle } from "react-icons/io5";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import httpService from "@/common/httpservice";
import Page from "@/components/page";
import { useMesssageTemplateQuery } from "@/hooks/useQueries";

export default function Setting() {
  const [template, setTemplate] = useState("");
  const editor = useEditor({
    extensions: [StarterKit, Link],
    onUpdate(e) {
      setTemplate(e.editor.getHTML());
    },
  });

  const { data: messageTemplate, refetch } = useMesssageTemplateQuery();

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
      <Tabs defaultValue="alert">
        <Tabs.List>
          <Tabs.Tab value="alert" leftSection={<IoChatboxOutline />}>
            Message Template
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="alert" className="py-5">
          <Alert icon={<IoNotificationsCircle />} title="Message template">
            <Markdown rehypePlugins={[rehypeRaw]}>{messageTemplate}</Markdown>
          </Alert>
          <div className="grid grid-cols-2 gap-3 py-5">
            <div className="flex flex-col gap-2">
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
            </div>
            <div className="rounded border border-emerald-100 bg-emerald-50 p-3 text-sm">
              <Markdown rehypePlugins={[rehypeRaw]}>{template}</Markdown>
            </div>
          </div>
          <Button variant="outline" onClick={saveMessageTemplate}>
            Save Template
          </Button>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
