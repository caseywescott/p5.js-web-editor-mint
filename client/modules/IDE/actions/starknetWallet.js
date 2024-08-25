import * as ActionTypes from '../../../constants';

export const setWallet = (wallet) => ({
  type: ActionTypes.SET_WALLET,
  wallet
});

export const resetWallet = () => ({
  type: ActionTypes.RESET_WALLET
});

export const setWalletError = (error) => ({
  type: ActionTypes.SET_WALLET_ERROR,
  error
});

export const setStatus = (status) => ({
  type: ActionTypes.SET_STATUS,
  status
});
