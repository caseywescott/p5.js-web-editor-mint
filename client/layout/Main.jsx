/* eslint-disable react/react-in-jsx-scope */
import { Outlet } from 'react-router-dom';
// eslint-disable-next-line import/extensions
import { Navbar } from '../components';
// eslint-disable-next-line import/first
import { useState, useEffect } from 'react';
// eslint-disable-next-line import/first
import { connect, disconnect } from 'starknetkit';

const Main = () => {
  const [connection, setConnection] = useState('');
  const [provider, setProvider] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const connectToStarknet = async () => {
      // eslint-disable-next-line no-shadow
      const connection = await connect({ modalMode: 'neverAsk' });

      if (connection && connection.isConnected) {
        setConnection(connection);
        setProvider(connection.account);
        setAddress(connection.selectedAddress);
      }
    };

    connectToStarknet();
  }, []);

  const connectWallet = async () => {
    // eslint-disable-next-line no-shadow
    const connection = await connect();

    if (connection && connection.isConnected) {
      setConnection(connection);
      setProvider(connection.account);
      setAddress(connection.selectedAddress);
    }
  };

  const disconnectWallet = async () => {
    await disconnect();

    setConnection(undefined);
    setProvider(undefined);
    setAddress('');
  };

  return (
    <main className="bg-gradient-to-br from-indigo-900 to-purple-400 h-screen gap-y-8">
      <Navbar
        address={address}
        disconnectWallet={disconnectWallet}
        connectWallet={connectWallet}
        connection={connection}
      />
      <div className="flex flex-col flex-1 items-center justify-center">
        {connection && <Outlet context={[provider]} />}
      </div>
    </main>
  );
};

export default Main;
