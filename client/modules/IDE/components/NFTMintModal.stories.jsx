import React from 'react';
import { action } from '@storybook/addon-actions';
import NFTMintModal from './NFTMintModal';

export default {
  title: 'Components/NFTMintModal',
  component: NFTMintModal,
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' }
  }
};

const Template = (args) => <NFTMintModal {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: action('onClose')
};

export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
  onClose: action('onClose')
};
