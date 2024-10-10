import { useDispatch, useSelector } from 'react-redux';

import {
    multicallFailure,
    multicallSuccess,
    multicallRequest
} from '../actions/multicall';
import { connect } from "get-starknet"

export const useMulticall = (calls) => {
    const dispatch = useDispatch();

    const starknet = connect();

    return async () => {
        
        dispatch(multicallRequest())
        
        const results = [];

        try {

            if(!starknet.isConnected) {
                return
            }

            const multicall = await starknet.account?.execute([
                ...calls
            ])

            if(!multicall) {
                return
            }
            
            const result = await provider.waitForTransaction(multicall.transaction_hash)

            results.push({
                success: true, 
                data: result,
            });
    
          dispatch(multicallSuccess(results)); 

        } catch (error) {
          dispatch(multicallFailure(error.message)); 
        }
    }


}