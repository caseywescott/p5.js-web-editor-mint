import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'get-starknet';
import { useSelector } from 'react-redux';
import useIframeContent from '../hooks/useIframeContentMintModal';

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
  z-index: 40;
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
  font-size: 2rem;
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
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 1.5em;
  text-align: center;
  overflow: hidden;
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

const NFTMintModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [nftData, setNftData] = useState({
    name: '',
    description: '',
    artistName: '',
    artistBio: ''
  });
  const files = useSelector((state) => state.files);
  const svgFile = files.find((file) => file.name === 'sketch.js');
  const svgContent = svgFile ? svgFile.content : '';
  const srcDoc = useIframeContent(svgContent);
  const iframeRef = useRef(null);

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

  const handleNext = useCallback(async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setLoading(true);
        try {
          const starknet = await connect();
          if (!starknet) {
            throw new Error('Please install a Starknet wallet extension.');
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setStep(3);
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            minting: error.message || 'Minting failed'
          }));
        } finally {
          setLoading(false);
        }
      }
    } else {
      onClose();
    }
  }, [step, nftData, onClose]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const renderStep1 = () => (
    <StyledContent>
      <Column>
        <NFTPreview>
          <iframe
            title="SVG preview"
            ref={iframeRef}
            srcDoc={srcDoc}
            style={{ width: '100%', height: '500px', border: 'none' }}
          />
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
          onChange={handleInputChange}
          value={nftData.description}
        />
        {errors.description && (
          <ErrorMessage>{errors.description}</ErrorMessage>
        )}
        <ButtonRow>
          <Button onClick={handleBack} disabled>
            Back
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </ButtonRow>
      </Column>
    </StyledContent>
  );

  const renderStep2 = () => (
    <StyledContent>
      <Column>
        <NFTPreview>
          <iframe
            title="SVG preview"
            ref={iframeRef}
            srcDoc={srcDoc}
            style={{ width: '100%', height: '500px', border: 'none' }}
          />
        </NFTPreview>
      </Column>
      <Column>
        <SectionTitle>ARTIST SECTION</SectionTitle>
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
          onChange={handleInputChange}
          value={nftData.artistBio}
        />
        {errors.artistBio && <ErrorMessage>{errors.artistBio}</ErrorMessage>}
        <ButtonRow>
          <Button onClick={handleBack}>Back</Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? 'Minting...' : 'MINT NFT'}
          </Button>
        </ButtonRow>
        {errors.minting && <ErrorMessage>{errors.minting}</ErrorMessage>}
      </Column>
    </StyledContent>
  );

  const renderStep3 = () => (
    <StyledContent>
      <Column>
        <CongratsMessage>
          Congratulations! Your NFT has been minted.
        </CongratsMessage>
        <ButtonRow>
          <Button onClick={onClose}>Close</Button>
        </ButtonRow>
      </Column>
    </StyledContent>
  );

  const renderContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {renderContent()}
      </ModalContent>
    </ModalOverlay>
  );
};

NFTMintModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default NFTMintModal;
