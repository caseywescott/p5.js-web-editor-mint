import { useCallback } from 'react';
import {
  connect as getStarknetWallet,
  disconnect as resetStarknetWallet
} from 'get-starknet';
import { useDispatch, useSelector } from 'react-redux';
import {
  setWallet,
  resetWallet,
  setWalletError,
  setStatus
  // eslint-disable-next-line import/extensions
} from '../actions/starknetWallet';

export const WALLET_CONNECTION_STATUS = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR'
};

// eslint-disable-next-line import/prefer-default-export
export const useStarknetWallet = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.starknetWallet.status);

  const connect = useCallback(
    async ({ autoConnect } = {}) => {
      const doConnect = async () => {
        try {
          dispatch(setStatus(WALLET_CONNECTION_STATUS.CONNECTING));
          const wallet = await getStarknetWallet({
            modalOptions: { theme: 'dark' },
            ...(autoConnect ? { showList: false } : {})
          });
          if (wallet) {
            dispatch(setWallet(wallet));
          } else {
            // this case may happen if popup is closed before connection
            dispatch(setStatus(WALLET_CONNECTION_STATUS.DISCONNECTED));
          }
        } catch (error) {
          dispatch(setWalletError(error));
        }
      };

      if (
        status !== WALLET_CONNECTION_STATUS.CONNECTED &&
        status !== WALLET_CONNECTION_STATUS.CONNECTING
      ) {
        await doConnect();
      }
    },
    [status]
  );

  const reset = () => {
    resetStarknetWallet({ clearLastWallet: true, clearDefaultWallet: true });
    dispatch(resetWallet());
  };

  return {
    status,
    connect,
    reset
  };
};
