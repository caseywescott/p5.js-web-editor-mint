import { useState, useEffect } from 'react';
import iframeHtmlTemplate from '../../../utils/mintModalIframeUtils';

const useIframeContent = (svgContent) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const content = iframeHtmlTemplate(svgContent);
    setSrcDoc(content);
  }, [svgContent]);

  return srcDoc;
};

export default useIframeContent;
