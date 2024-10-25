import { useCallback } from 'react';
import { useConnect, useDisconnect, useAccount } from '@starknet-react/core';
import { useDispatch, useSelector } from 'react-redux';
import {
  setWallet,
  resetWallet,
  setWalletError,
  setStatus
} from '../actions/starknetWallet';

export const WALLET_CONNECTION_STATUS = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR'
};

export const useStarknetWallet = () => {
  const dispatch = useDispatch();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const status = useSelector((state) => state.starknetWallet.status);

  const connectWallet = useCallback(async () => {
    try {
      dispatch(setStatus(WALLET_CONNECTION_STATUS.CONNECTING));
      await connect();
      if (isConnected && address) {
        dispatch(setWallet({ account: { address } }));
      } else {
        dispatch(setStatus(WALLET_CONNECTION_STATUS.DISCONNECTED));
      }
    } catch (error) {
      dispatch(setWalletError(error));
    }
  }, [connect, isConnected, address]);

  const reset = useCallback(() => {
    disconnect();
    dispatch(resetWallet());
  }, [disconnect]);

  return {
    status,
    connect: connectWallet,
    reset
  };
};
