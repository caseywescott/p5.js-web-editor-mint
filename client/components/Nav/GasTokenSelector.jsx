import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { usePaymaster } from '../../modules/IDE/hooks/usePaymaster';
import { setSelectedGasTokenPrice } from '../../modules/IDE/actions/paymaster';

// TODO: Improve this mapping in an own component. The component should request the address to get the token name
const ADDRESS_TO_TOKEN = {
  '0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080': 'USDC'
};

const GasTokenSelector = () => {
  const { gasTokenPrices } = usePaymaster();
  const [selectedToken, setSelectedToken] = useState(null);
  const dispatch = useDispatch();

  const handleSelection = (gasTokenPrice) => {
    setSelectedToken(gasTokenPrice.tokenAddress);
    dispatch(setSelectedGasTokenPrice(gasTokenPrice));
    console.log(`Selected token: ${gasTokenPrice.tokenAddress}`);
  };

  return (
    <>
      {gasTokenPrices && gasTokenPrices.length > 0 ? (
        <>
          {gasTokenPrices.map((gasTokenPrice) => (
            <div
              className="toolbar__autorefresh"
              key={gasTokenPrice.tokenAddress}
            >
              <input
                id={gasTokenPrice.tokenAddress}
                className="checkbox__autorefresh"
                type="radio"
                name="gasToken"
                checked={selectedToken === gasTokenPrice.tokenAddress}
                onChange={() => handleSelection(gasTokenPrice)}
              />
              <label
                htmlFor={gasTokenPrice.tokenAddress}
                className="toolbar__autorefresh-label"
              >
                {ADDRESS_TO_TOKEN[gasTokenPrice.tokenAddress]}
              </label>
            </div>
          ))}
          <p className="paymaster__content-column-list">Select a gas token</p>
        </>
      ) : (
        <p className="paymaster__content-column-list">
          No gas tokens available
        </p>
      )}
    </>
  );
};

export default GasTokenSelector;
