import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Quarter: Story = {
  args: {
    value: 25,
  },
};

export const Half: Story = {
  args: {
    value: 50,
  },
};

export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const Interactive: Story = {
  args: {
    value: 33,
  },
  parameters: {
    controls: {
      value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    },
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <p className="text-sm text-gray-600 mb-2">Small (h-1)</p>
        <Progress value={60} className="h-1" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Default (h-2)</p>
        <Progress value={60} />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Large (h-3)</p>
        <Progress value={60} className="h-3" />
      </div>
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Upload Progress</span>
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Download Progress</span>
          <span>45%</span>
        </div>
        <Progress value={45} />
      </div>
    </div>
  ),
};