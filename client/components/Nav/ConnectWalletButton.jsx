import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useConnect, useDisconnect, useAccount } from '@starknet-react/core';
import PropTypes from 'prop-types';

function ConnectButton({ name, func, layout, src }) {
  const [base64DataUrl, setBase64DataUrl] = useState(undefined);

  useEffect(() => {
    const svgToBase64 = (svgString) => {
      if (typeof svgString === 'string') {
        return svgString.startsWith('<svg')
          ? `data:image/svg+xml;base64,${btoa(svgString)}`
          : svgString;
      }
      return svgString.light.startsWith('<svg')
        ? `data:image/svg+xml;base64,${btoa(svgString.light)}`
        : svgString.light;
    };

    setBase64DataUrl(svgToBase64(src));
  }, [src]);

  const buttonStyle = {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    border: '1px solid transparent',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    padding: layout === 'list' ? '12px' : '4px',
    flexDirection: layout === 'list' ? 'row' : 'row',
    justifyContent: layout === 'list' ? 'flex-start' : 'center',
    height: layout === 'list' ? 'auto' : '58px',
    maxWidth: layout === 'list' ? 'none' : 'none'
  };

  const imageStyle = {
    height: '24px',
    width: '24px'
  };

  const nameStyle = {
    fontSize: '14px',
    textTransform: 'capitalize'
  };

  return (
    <button onClick={func} style={buttonStyle}>
      <img
        style={imageStyle}
        src={base64DataUrl || 'https://placehold.co/24x24'}
        alt={`${name} icon`}
      />
      <span style={nameStyle}>{name}</span>
    </button>
  );
}

ConnectButton.propTypes = {
  name: PropTypes.string.isRequired,
  func: PropTypes.func.isRequired,
  layout: PropTypes.oneOf(['list', 'grid']).isRequired,
  src: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      light: PropTypes.string,
      dark: PropTypes.string
    })
  ]).isRequired
};

function ConnectWalletButton({ id, layout }) {
  const [buttonTextState, setButtonTextState] = useState('Connect Wallet');
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const connectPopover = useRef(null);
  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  console.log(
    'Render: isConnected:',
    isConnected,
    'address:',
    address,
    'status:',
    connectStatus
  );

  const showPopover = () => {
    // @ts-expect-error: Expecting an error because React doesn't recognize the popover API.
    connectPopover.current?.showPopover();
    setIsPopoverVisible(true);
  };

  const hidePopover = () => {
    // @ts-expect-error: Expecting an error because React doesn't recognize the popover API.
    if (isPopoverVisible) {
      connectPopover.current?.hidePopover();
      setIsPopoverVisible(false);
    }
  };

  useEffect(() => {
    if (connectStatus === 'connected' || connectStatus === 'error') {
      hidePopover();
    }
  }, [connectStatus]);

  const handleClick = useCallback(() => {
    console.log('Button clicked. isConnected:', isConnected);
    if (isConnected) {
      console.log('Attempting to disconnect...');
      disconnect();
    } else {
      console.log('Showing wallet selection modal...');
      showPopover();
    }
  }, [isConnected, disconnect]);

  useEffect(() => {
    console.log(
      'Effect triggered. Status:',
      connectStatus,
      'isConnected:',
      isConnected,
      'address:',
      address
    );
    if (connectStatus === 'connecting') {
      setButtonTextState('Connecting...');
    } else if (connectStatus === 'error') {
      setButtonTextState('Error connecting');
    } else if (isConnected && address) {
      const shortAddress = `${address.slice(0, 6)}...${address.slice(
        -4
      )} - Logout`;
      setButtonTextState(shortAddress);
    } else {
      setButtonTextState('Connect Wallet');
    }
  }, [address, connectStatus, isConnected]);

  const buttonStyle = {
    padding: '4px 6px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    color: 'gray',
    border: 'gray 1px solid',
    borderRadius: '4px',
    marginRight: '5px'
  };

  const popoverStyle = {
    backgroundColor: 'white',
    width: '45%',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'relative'
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px'
  };

  const connectorsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '25px',
    cursor: 'pointer',
    color: 'gray'
  };

  return (
    <>
      <button onClick={handleClick} id={id} style={buttonStyle}>
        {buttonTextState}
      </button>

      <div
        popover="auto"
        id="connect-modal"
        ref={connectPopover}
        style={popoverStyle}
      >
        <button onClick={hidePopover} style={closeButtonStyle}>
          ×
        </button>
        <h3 style={titleStyle}>Choose your Wallet</h3>
        <div style={connectorsContainerStyle}>
          {connectors.map((connector) => (
            <ConnectButton
              key={connector.id}
              layout={layout}
              name={connector.name}
              func={() => connect({ connector })}
              src={connector.icon}
            />
          ))}
        </div>
      </div>
    </>
  );
}

ConnectWalletButton.propTypes = {
  id: PropTypes.string.isRequired,
  layout: PropTypes.oneOf(['list', 'grid']).isRequired
};

export default ConnectWalletButton;
