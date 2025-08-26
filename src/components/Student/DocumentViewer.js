import React, { useState } from 'react';
import styled from 'styled-components';
import { FiDownload, FiEye, FiFile, FiX } from 'react-icons/fi';

const ViewerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ViewerContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const ViewerTitle = styled.h3`
  margin: 0;
  color: #1a202c;
  font-size: 1.125rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: #e2e8f0;
    color: #4a5568;
  }
`;

const ViewerBody = styled.div`
  padding: 1.5rem;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
`;

const DocumentPreview = styled.div`
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 70vh;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .pdf-placeholder {
    background: #f7fafc;
    border: 2px dashed #cbd5e0;
    border-radius: 8px;
    padding: 3rem;
    margin: 1rem 0;
    
    .pdf-icon {
      font-size: 4rem;
      color: #e53e3e;
      margin-bottom: 1rem;
    }
    
    p {
      color: #4a5568;
      margin: 0;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &.primary {
    background: #4299e1;
    color: white;
    
    &:hover {
      background: #3182ce;
    }
  }
  
  &.secondary {
    background: #e2e8f0;
    color: #4a5568;
    
    &:hover {
      background: #cbd5e0;
    }
  }
`;

const DocumentViewer = ({ document, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(document.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    window.open(document.url, '_blank');
  };

  const isImage = document.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = document.name.match(/\.pdf$/i);

  return (
    <ViewerContainer onClick={onClose}>
      <ViewerContent onClick={(e) => e.stopPropagation()}>
        <ViewerHeader>
          <ViewerTitle>{document.name}</ViewerTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ViewerHeader>
        
        <ViewerBody>
          <DocumentPreview>
            {isImage ? (
              <img src={document.url} alt={document.name} />
            ) : isPDF ? (
              <div className="pdf-placeholder">
                <div className="pdf-icon">
                  <FiFile />
                </div>
                <p>PDF Document</p>
                <p>Click "View" to open in new tab or "Download" to save</p>
              </div>
            ) : (
              <div className="pdf-placeholder">
                <div className="pdf-icon">
                  <FiFile />
                </div>
                <p>Document</p>
                <p>Click "Download" to save the file</p>
              </div>
            )}
          </DocumentPreview>
          
          <ActionButtons>
            {isPDF && (
              <ActionButton className="primary" onClick={handleView}>
                <FiEye />
                View
              </ActionButton>
            )}
            <ActionButton 
              className="secondary" 
              onClick={handleDownload}
              disabled={loading}
            >
              <FiDownload />
              {loading ? 'Downloading...' : 'Download'}
            </ActionButton>
          </ActionButtons>
        </ViewerBody>
      </ViewerContent>
    </ViewerContainer>
  );
};

export default DocumentViewer;
