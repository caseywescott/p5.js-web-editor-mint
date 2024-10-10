import * as ActionTypes from '../../../constants';

const initialState = {
    loading: false,
    results: [],
    error: null,
  };
  
  const multicallReducer = (state = initialState, action) => {
    switch (action.type) {
      case ActionTypes.MULTICALL_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case ActionTypes.MULTICALL_SUCCESS:
        return {
          ...state,
          loading: false,
          results: action.payload,
        };
      case ActionTypes.MULTICALL_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default multicallReducer;