'use client';

import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/extensions
import { ArgentMobileConnector } from 'starknetkit/argentMobile';
// eslint-disable-next-line import/extensions
import { WebWalletConnector } from 'starknetkit/webwallet';
import { mainnet, sepolia } from '@starknet-react/chains';
import {
  StarknetConfig,
  argent,
  braavos,
  publicProvider,
  useInjectedConnectors
} from '@starknet-react/core';

export default function StarknetProvider({ children }) {
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'always'
  });

  const connectors = [
    ...injected,
    new WebWalletConnector({ url: 'https://web.argent.xyz' }),
    ArgentMobileConnector.init({
      options: {
        dappName: 'Example dapp',
        projectId: 'example-project-id',
        url: 'example-project-url'
      },
      inAppBrowserOptions: {}
    })
  ];
  const chains = [mainnet, sepolia];

  return (
    <StarknetConfig
      chains={chains}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  );
}

StarknetProvider.propTypes = {
  children: PropTypes.node.isRequired
};
