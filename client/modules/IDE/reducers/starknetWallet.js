import * as ActionTypes from '../../../constants';
import { WALLET_CONNECTION_STATUS } from '../hooks/useStarknetWallet';

const initialState = {
  wallet: null,
  error: null,
  status: WALLET_CONNECTION_STATUS.DISCONNECTED
};

const starknetWallet = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_WALLET:
      return {
        ...state,
        wallet: action.wallet,
        status: WALLET_CONNECTION_STATUS.CONNECTED,
        error: null
      };
    case ActionTypes.RESET_WALLET:
      return {
        ...state,
        wallet: null,
        error: null,
        status: WALLET_CONNECTION_STATUS.DISCONNECTED
      };
    case ActionTypes.SET_WALLET_ERROR:
      return {
        ...state,
        error: action.error,
        wallet: null,
        status: WALLET_CONNECTION_STATUS.ERROR
      };
    case ActionTypes.SET_STATUS:
      return {
        ...state,
        status: action.status
      };
    default:
      return state;
  }
};

export default starknetWallet;
