import { SET_SELECTED_GAS_PRICE } from '../../../constants';

const initialState = {
  selectedGasTokenPrice: null
};

const paymaster = (state = initialState, action) => {
  switch (action.type) {
    case SET_SELECTED_GAS_PRICE:
      return {
        ...state,
        selectedGasTokenPrice: action.selectedGasTokenPrice
      };
    default:
      return state;
  }
};

export default paymaster;
