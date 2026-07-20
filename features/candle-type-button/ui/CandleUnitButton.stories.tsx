import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CandleUnitButton from "./CandleUnitButton";

const meta: Meta<typeof CandleUnitButton> = {
  title: "features/candle-type-button/CandleUnitButton",
  component: CandleUnitButton,
  args: {
    label: "일",
    value: "days",
    onClick: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CandleUnitButton>;

export const Active: Story = {
  args: { isActive: true },
};

export const Inactive: Story = {
  args: { isActive: false },
};
