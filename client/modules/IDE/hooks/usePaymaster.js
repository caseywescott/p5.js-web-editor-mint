// eslint-disable-next-line import/prefer-default-export
import { useCallback, useEffect, useState } from 'react';
import {
  executeCalls,
  fetchAccountCompatibility,
  fetchAccountsRewards,
  fetchGaslessStatus,
  fetchGasTokenPrices,
  getGasFeesInGasToken,
  SEPOLIA_BASE_URL
} from '@avnu/gasless-sdk';
import { useSelector } from 'react-redux';
import { stark, transaction, RpcProvider } from 'starknet';

const options = { baseUrl: SEPOLIA_BASE_URL };
const initialValue = [
  {
    entrypoint: 'approve',
    contractAddress:
      '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    calldata: [
      '0x0498E484Da80A8895c77DcaD5362aE483758050F22a92aF29A385459b0365BFE',
      '0xf',
      '0x0'
    ]
  }
];

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// eslint-disable-next-line import/prefer-default-export
export const usePaymaster = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [gasTokenPrices, setGasTokenPrices] = useState({});
  const [paymasterRewards, setPaymasterRewards] = useState([]);
  const [calls, setCalls] = useState(JSON.stringify(initialValue, null, 2));
  const [gaslessCompatibility, setGaslessCompatibility] = useState();
  const [maxGasTokenAmount, setMaxGasTokenAmount] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [tx, setTx] = useState('');
  const [loadingTransaction, setLoadingTransacion] = useState(false);
  const wallet = useSelector((state) => state.starknetWallet.wallet);
  const selectedGasTokenPrice = useSelector(
    (state) => state.paymaster.selectedGasTokenPrice
  );

  // Verify is wallet has compatibility with the paymaster
  useEffect(() => {
    if (!wallet) return;
    fetchAccountCompatibility(wallet.account.address, options)
      .then((response) => {
        console.log('fetchAccountCompatibility');
        console.log(response);
        setGaslessCompatibility(response);
      })
      .catch((error) => {
        console.error('Error fetchAccountCompatibility:', error);
      });

    fetchAccountsRewards(wallet.account.address, {
      ...options,
      protocol: 'gasless-sdk'
    })
      .then((response) => {
        console.log('fetchAccountsRewards');
        console.log(response);
        setPaymasterRewards(response);
      })
      .catch((error) => {
        console.error('Error fetchAccountsRewards:', error);
      });
  }, [wallet]);

  // Verify if paymaster service is running
  useEffect(() => {
    fetchGaslessStatus()
      .then((response) => {
        setIsAvailable(response.status);
      })
      .catch((error) => {
        console.error('Error fetchGaslessStatus:', error);
        setIsAvailable(false);
      });
  }, []);

  // Get the list of gas token price
  useEffect(() => {
    // const mainnetOptions = { BASE_URL };
    fetchGasTokenPrices(options)
      .then(setGasTokenPrices)
      .catch((error) => {
        console.error('Error fetchGasTokenPrices:', error);
        setIsAvailable(false);
      });
  }, []);

  // Ideally we should use wallet.provider but estimateInvokeFee doesn't work, it has a bug related to simulations_flags
  const estimateCalls = useCallback(
    async (account, innerCalls) => {
      const provider = new RpcProvider({
        nodeUrl: 'https://free-rpc.nethermind.io/sepolia-juno'
      });
      const { address } = wallet.account;
      const contractVersion = await provider.getContractVersion(address);
      const nonce = await provider.getNonceForAddress(address);
      const details = stark.v3Details({ skipValidate: true });
      const invocation = {
        ...details,
        contractAddress: account.address,
        calldata: transaction.getExecuteCalldata(
          innerCalls,
          contractVersion.cairo
        ),
        signature: []
      };
      return provider.getInvokeEstimateFee(
        { ...invocation },
        { ...details, nonce },
        'pending',
        true
      );
    },
    [wallet]
  );

  useEffect(() => {
    if (
      !wallet ||
      !wallet.account ||
      !selectedGasTokenPrice ||
      !gaslessCompatibility
    )
      return;
    setErrorMessage(undefined);
    if (!isValidJSON(calls)) {
      setErrorMessage('Invalid calls');
      return;
    }
    const parsedCalls = JSON.parse(calls);
    const { account } = wallet;
    estimateCalls(account, parsedCalls).then((fees) => {
      const estimatedGasFeesInGasToken = getGasFeesInGasToken(
        fees.overall_fee,
        selectedGasTokenPrice,
        fees.gas_price,
        fees.data_gas_price ? fees.data_gas_price : '0x1',
        gaslessCompatibility.gasConsumedOverhead,
        gaslessCompatibility.dataGasConsumedOverhead
      );
      setMaxGasTokenAmount(estimatedGasFeesInGasToken);
    });
  }, [
    calls,
    wallet,
    selectedGasTokenPrice,
    gaslessCompatibility,
    estimateCalls
  ]);

  const executeTransaction = async () => {
    if (!wallet) return;
    setLoadingTransacion(true);
    setTx(undefined);
    // eslint-disable-next-line consistent-return
    return executeCalls(
      wallet.account,
      JSON.parse(calls),
      {
        gasTokenAddress: selectedGasTokenPrice.tokenAddress,
        maxGasTokenAmount
      },
      options
    )
      .then((response) => {
        setTx(response.transactionHash);
        setLoadingTransacion(false);
      })
      .catch((error) => {
        setLoadingTransacion(false);
        console.error(error);
      });
  };

  return {
    isAvailable,
    gasTokenPrices,
    setGasTokenPrices,
    paymasterRewards,
    gaslessCompatibility,
    maxGasTokenAmount,
    tx,
    loadingTransaction,
    executeTransaction
  };
};
