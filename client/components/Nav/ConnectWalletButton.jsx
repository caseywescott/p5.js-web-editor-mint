import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useStarknetWallet,
  WALLET_CONNECTION_STATUS
} from '../../modules/IDE/hooks/useStarknetWallet';

function ConnectWalletButton({ id }) {
  const [buttonTextState, setButtonTextState] = useState('Connect Wallet');
  const { connect, reset } = useStarknetWallet();
  const wallet = useSelector((state) => state.starknetWallet.wallet);
  const error = useSelector((state) => state.starknetWallet.error);
  const status = useSelector((state) => state.starknetWallet.status);

  const handleClick = useCallback(() => {
    if (status === 'DISCONNECTED') {
      connect();
    } else if (status === 'CONNECTED') {
      reset();
    }
  }, [status]);

  useEffect(() => {
    if (status === WALLET_CONNECTION_STATUS.CONNECTING) {
      setButtonTextState('Connecting...');
    } else if (status === WALLET_CONNECTION_STATUS.ERROR) {
      // TODO: Improve this
      setButtonTextState(`Error: ${error}`);
    } else if (status === WALLET_CONNECTION_STATUS.CONNECTED) {
      const address = String(wallet.account.address);
      const shortAddress = `${address.slice(0, 6)}...${address.slice(
        -4
      )} - Logout`;
      setButtonTextState(shortAddress);
    } else {
      setButtonTextState('Connect Wallet');
    }
  }, [wallet, error, status]);

  return (
    <>
      <button
        className={classNames('connect-wallet-button')}
        onClick={handleClick}
      >
        {buttonTextState}
      </button>
    </>
  );
}

ConnectWalletButton.propTypes = {
  id: PropTypes.string.isRequired
};

export default ConnectWalletButton;
