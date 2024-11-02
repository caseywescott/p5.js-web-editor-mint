import * as ActionTypes from '../../../constants';

export const multicallRequest = () => ({
    type: ActionTypes.MULTICALL_REQUEST,
  });
  
  export const multicallSuccess = (results) => ({
    type: ActionTypes.MULTICALL_SUCCESS,
    payload: results,
  });
  
  export const multicallFailure = (error) => ({
    type: ActionTypes.MULTICALL_FAILURE,
    payload: error,
  });
