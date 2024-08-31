import { Helmet } from 'react-helmet';
import React from 'react';
import { useSelector } from 'react-redux';
import { formatUnits } from 'ethers';
import AsteriskIcon from '../../images/p5-asterisk.svg';
import { usePaymaster } from '../../modules/IDE/hooks/usePaymaster';
import GasTokenSelector from './GasTokenSelector';
import Button from '../../common/Button';

function Paymaster() {
  const {
    isAvailable,
    gaslessCompatibility,
    maxGasTokenAmount,
    loadingTransaction,
    executeTransaction,
    tx
  } = usePaymaster();
  const wallet = useSelector((state) => state.starknetWallet.wallet);
  const selectedGasTokenPrice = useSelector(
    (state) => state.paymaster.selectedGasTokenPrice
  );

  console.log('wallet ', wallet);

  return (
    <div className="paymaster__content">
      <Helmet>
        <title> Paymaster </title>
      </Helmet>
      <div className="paymaster__content-column">
        <h3 className="paymaster__content-column-title">Service status</h3>
        <p className="paymaster__content-column-list">
          <AsteriskIcon
            className="paymaster__content-column-asterisk"
            aria-hidden="true"
            focusable="false"
          />
          {isAvailable ? 'Available' : 'Not Available'}
        </p>
        <h3 className="paymaster__content-column-title">Account status</h3>
        <p className="paymaster__content-column-list">
          <AsteriskIcon
            className="paymaster__content-column-asterisk"
            aria-hidden="true"
            focusable="false"
          />
          {wallet
            ? `Connected with account wallet ${String(wallet.account.address)}`
            : 'Not connected'}
        </p>
        <p className="paymaster__content-column-list">
          <AsteriskIcon
            className="paymaster__content-column-asterisk"
            aria-hidden="true"
            focusable="false"
          />
          {gaslessCompatibility
            ? `Is compatible with paymaster`
            : 'Is not compatible with paymaster'}
        </p>
      </div>
      <div className="paymaster__content-column">
        <h3 className="paymaster__content-column-title">Gas tokens</h3>
        <GasTokenSelector />
      </div>
      <div className="paymaster__content-column">
        {maxGasTokenAmount && selectedGasTokenPrice && (
          <p className="paymaster__content-column-list">
            Max gas fees in gas token:{' '}
            {formatUnits(maxGasTokenAmount, selectedGasTokenPrice.decimals)}
          </p>
        )}
      </div>

      <div>
        {wallet && (
          <Button
            disabled={loadingTransaction || !selectedGasTokenPrice}
            onClick={executeTransaction}
          >
            {loadingTransaction ? 'Loading' : 'Execute'}
          </Button>
        )}
        {tx && (
          <a
            href={`https://sepolia.voyager.online/tx/${tx}`}
            target="_blank"
            rel="noreferrer"
          >
            Success:{tx}
          </a>
        )}
      </div>
    </div>
  );
}

export default Paymaster;
