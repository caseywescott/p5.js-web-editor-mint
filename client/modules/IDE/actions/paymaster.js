import { SET_SELECTED_GAS_PRICE } from '../../../constants';

// eslint-disable-next-line import/prefer-default-export
export const setSelectedGasTokenPrice = (gasTokenPrice) => ({
  type: SET_SELECTED_GAS_PRICE,
  selectedGasTokenPrice: gasTokenPrice
});
