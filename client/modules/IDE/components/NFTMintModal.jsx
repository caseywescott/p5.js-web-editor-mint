import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { CallData, byteArray } from 'starknet';
import { useAccount } from '@starknet-react/core';
import useIframeContent from '../hooks/useIframeContentMintModal';

const contractAddress =
  '0x027eca122e09b05f445a9192be623ed2a42a8486d7a03e4d4ff00abdc036749d';

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
  height: 400px;
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
  height: 100%;
  padding: 24px;
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-bottom: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 1.5em;
  text-align: center;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CongratsMessage = styled.div`
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 24px;
  color: #333;
`;

const CongratsIcon = styled.div`
  font-size: 3em;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 100%;
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
  const [transactionHash, setTransactionHash] = useState(null);
  const { account } = useAccount();
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

  const captureAndConvertSVG = useCallback(() => {
    if (iframeRef.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      const svgElement = iframeDocument.querySelector('svg');

      if (svgElement) {
        // Clone the SVG to avoid modifying the original
        const clonedSvg = svgElement.cloneNode(true);

        // Remove any script elements from the SVG
        const scripts = clonedSvg.getElementsByTagName('script');
        while (scripts[0]) {
          scripts[0].parentNode.removeChild(scripts[0]);
        }

        // Remove the unused xmlns:xlink if it exists
        if (clonedSvg.hasAttribute('xmlns:xlink')) {
          clonedSvg.removeAttribute('xmlns:xlink');
        }

        // Convert the SVG to a string
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clonedSvg);

        // Optional: Remove excess whitespace to minify the SVG string
        svgString = svgString.replace(/\s{2,}/g, ' ').trim();

        // Ensure the SVG string starts with an XML declaration (optional)
        // if (!svgString.startsWith('<?xml')) {
        //   svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
        // }

        return svgString;
      }
    }
    return null;
  }, []);

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

  const buildMetadata = (name, description, svgData) => {
    const processedSvgData = svgData.replace(/"/g, "'");
    const innerJson = `{"name":"${name}","description":"${description}","image":"data:image/svg+xml,${processedSvgData}"}`;
    // return innerJson.replace(/"/g, '\\"');
    return processedSvgData;
  };

  function stringToByteArray(val) {
    if (!val) {
      return '';
    }
    return CallData.compile(byteArray.byteArrayFromString(val)).toString();
  }

  const mint = async () => {
    if (!account) {
      setErrors((prev) => ({
        ...prev,
        minting: 'Please connect your wallet first.'
      }));
      return;
    }

    setLoading(true);
    setErrors({});
    setTransactionHash(null);

    try {
      const svgString = captureAndConvertSVG();
      if (!svgString) {
        throw new Error('Failed to capture SVG content');
      }

      const metadata = buildMetadata(
        nftData.name,
        nftData.description,
        svgString
      );
      const calldataString = stringToByteArray(metadata);
      const calldata = calldataString.split(',');
      console.log('svgstring:', svgString);
      console.log(metadata);
      console.log(calldata);

      const res = await account.execute(
        {
          contractAddress,
          entrypoint: 'mint',
          calldata
        },
        undefined,
        { maxFee: 1000000000000000 }
      );

      setTransactionHash(res.transaction_hash);
      setStep(3);
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        minting: 'An error occurred while minting. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        await mint();
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
        <CongratsIcon>
          <img
            src="https://shorturl.at/bTyXQ"
            alt="Congrats icon"
            style={{
              width: '200px',
              height: '150px',
              alignSelf: 'center',
              margin: '0 auto'
            }}
          />
        </CongratsIcon>
        {transactionHash && <p>Transaction hash: {transactionHash}</p>}
      </Column>
    </StyledContent>
  );

  const renderContent = () => {
    switch (step) {
      case 0:
        return renderStep1();
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
        <CloseButton onClick={onClose}>X</CloseButton>
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
