import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WarningCautionTag from "./WarningCautionTag";

const meta: Meta<typeof WarningCautionTag> = {
  title: "entities/warning-caution-tag/WarningCautionTag",
  component: WarningCautionTag,
};

export default meta;

type Story = StoryObj<typeof WarningCautionTag>;

export const Warning: Story = {
  args: { type: "WARN" },
};

export const Caution: Story = {
  args: { type: "CAUT" },
};
