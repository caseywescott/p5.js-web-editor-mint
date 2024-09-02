import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { connect } from 'get-starknet';

// Spinner Animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Spinner Component
const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #333;
  border-radius: 50%;
  align-self: center;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

// Modal and Other Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  position: relative;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 24px;
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-size: 1em;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  resize: vertical;
  font-size: 1em;
`;

const Button = styled.button`
  background-color: #333;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  font-size: 1em;
  align-self: flex-end;
  margin-top: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
  }
`;

const NFTPreview = styled.div`
  width: 100%;
  height: 200px;
  background: url('https://www.w3schools.com/w3images/avatar2.png') center/cover
    no-repeat;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 1.5em;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ArtistAvatar = styled.div`
  width: 100%;
  height: 120px;
  background: url('https://www.w3schools.com/w3images/avatar5.png') center/cover
    no-repeat;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CongratsMessage = styled.div`
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 24px;
  color: #333;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9em;
  margin-top: -10px;
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 1em;
  color: ${(props) => (props.status === 'failed' ? 'red' : 'blue')};
`;

const StatusMessage = styled.p`
  margin-top: 10px;
  font-size: 1.2em;
  text-align: center;
`;

// Transaction Status Block Component
const TransactionStatusBlock = ({ status }) => {
  if (!status) return null;

  return (
    <StatusBlock status={status}>
      {status === 'pending' && <Spinner />}
      <StatusMessage>
        {status === 'pending' && 'Transaction is pending...'}
        {status === 'confirmed' && 'Transaction confirmed!'}
        {status === 'failed' && 'Transaction failed. Please try again.'}
      </StatusMessage>
    </StatusBlock>
  );
};

TransactionStatusBlock.propTypes = {
  status: PropTypes.string.isRequired
};

// NFT Mint Modal Component
const NFTMintModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [nftData, setNftData] = useState({
    name: '',
    description: '',
    artistName: '',
    artistBio: ''
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNftData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validateStep1 = () => {
    let valid = true;
    const newErrors = {};

    if (!nftData.name) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!nftData.description) {
      newErrors.description = 'Description is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateStep2 = () => {
    let valid = true;
    const newErrors = {};

    if (!nftData.artistName) {
      newErrors.artistName = 'Artist name is required';
      valid = false;
    }

    if (!nftData.artistBio) {
      newErrors.artistBio = 'Artist bio is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const resetState = () => {
    setStep(1);
    setLoading(false);
    setTransactionStatus(null);
    setErrors({});
    setNftData({
      name: '',
      description: '',
      artistName: '',
      artistBio: ''
    });
  };

  const handleNext = useCallback(async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setLoading(true);
        setTransactionStatus('pending');
        try {
          const starknet = await connect();
          if (!starknet) {
            throw new Error('Please install a Starknet wallet extension.');
          }
          setStep(3);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setTransactionStatus('confirmed');
          setStep(4);
        } catch (error) {
          console.error('Minting failed', error);
          setTransactionStatus('failed');
          setErrors((prev) => ({
            ...prev,
            minting: error.message || 'Minting failed'
          }));
          setStep(4);
        } finally {
          setLoading(false);
        }
      }
    } else if (step === 4) {
      onClose();
      resetState();
    }
  }, [step, nftData, onClose]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const getButtonLabel = () => {
    if (loading) return <Spinner />;
    return step < 4 ? 'Next' : 'Close';
  };

  const renderStep1 = () => (
    <StyledContent>
      <Column>
        <NFTPreview>
          <span>NFT Preview</span>
        </NFTPreview>
      </Column>
      <Column>
        <SectionTitle>NFT MINT SECTION</SectionTitle>
        <Input
          name="name"
          placeholder="Name"
          onChange={handleInputChange}
          value={nftData.name}
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        <Textarea
          name="description"
          placeholder="Description"
          rows="5"
          onChange={handleInputChange}
          value={nftData.description}
        />
        {errors.description && (
          <ErrorMessage>{errors.description}</ErrorMessage>
        )}
      </Column>
    </StyledContent>
  );

  const renderStep2 = () => (
    <StyledContent>
      <Column>
        <ArtistAvatar />
      </Column>
      <Column>
        <SectionTitle>ARTIST DETAILS</SectionTitle>
        <Input
          name="artistName"
          placeholder="Artist Name"
          onChange={handleInputChange}
          value={nftData.artistName}
        />
        {errors.artistName && <ErrorMessage>{errors.artistName}</ErrorMessage>}
        <Textarea
          name="artistBio"
          placeholder="Artist Bio"
          rows="5"
          onChange={handleInputChange}
          value={nftData.artistBio}
        />
        {errors.artistBio && <ErrorMessage>{errors.artistBio}</ErrorMessage>}
      </Column>
    </StyledContent>
  );

  const renderTransactionStatus = () => (
    <StyledContent>
      <TransactionStatusBlock status={transactionStatus} />
    </StyledContent>
  );

  const renderStep3 = () => (
    <StyledContent>
      <CongratsMessage>
        Congratulations! Your NFT has been minted!
      </CongratsMessage>
    </StyledContent>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderTransactionStatus();
      case 4:
        return renderStep3();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton
          onClick={() => {
            onClose();
            resetState();
          }}
        >
          &times;
        </CloseButton>
        {renderStepContent()}
        <ButtonRow>
          {step > 1 && step < 4 && (
            <Button onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={loading}
            style={{ marginLeft: 'auto' }}
          >
            {getButtonLabel()}
          </Button>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

NFTMintModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default NFTMintModal;
