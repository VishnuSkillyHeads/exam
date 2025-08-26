import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import styled from 'styled-components';
import { FiUpload, FiUser, FiFile, FiCamera, FiEdit3, FiSave, FiX, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DocumentViewer from './DocumentViewer';

const ProfileContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const ProfileImage = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e2e8f0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  
  h1 {
    margin: 0 0 0.5rem 0;
    color: #1a202c;
    font-size: 1.875rem;
  }
  
  p {
    margin: 0;
    color: #718096;
    font-size: 1rem;
  }
`;

const UploadSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #1a202c;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UploadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const UploadCard = styled.div`
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    border-color: #4299e1;
    background: #f7fafc;
  }
  
  &.uploaded {
    border-color: #48bb78;
    background: #f0fff4;
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: #718096;
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  color: #4a5568;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
  
  &:hover {
    background: #3182ce;
  }
  
  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const FileList = styled.div`
  margin-top: 1rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .file-name {
    font-weight: 500;
    color: #2d3748;
  }
  
  .file-size {
    font-size: 0.875rem;
    color: #718096;
  }
  
  .remove-btn {
    background: #fed7d7;
    color: #c53030;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    
    &:hover {
      background: #feb2b2;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
  
  .progress {
    height: 100%;
    background: #48bb78;
    transition: width 0.3s;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
  
  &.secondary {
    background: white;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }
  }
  
  &.danger {
    background: #f56565;
    color: white;
    
    &:hover {
      background: #e53e3e;
    }
  }
`;

const StudentProfile = () => {
  const { currentUser, userRole } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: '',
    section: '',
    phone: '',
    address: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState({
    resume: null,
    certificates: [],
    projects: [],
    transcripts: []
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editing, setEditing] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          rollNumber: userData.rollNumber || '',
          branch: userData.branch || '',
          section: userData.section || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
        setProfileImage(userData.profileImage || null);
        setDocuments(userData.documents || {
          resume: null,
          certificates: [],
          projects: [],
          transcripts: []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile image must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const imageRef = ref(storage, `profile-images/${currentUser.uid}/${file.name}`);
      const uploadTask = uploadBytes(imageRef, file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await uploadTask;
      clearInterval(progressInterval);
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(imageRef);
      setProfileImage(downloadURL);

      // Update in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileImage: downloadURL
      });

      toast.success('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDocumentUpload = async (event, documentType) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} must be less than 10MB`);
          continue;
        }

        const fileRef = ref(storage, `documents/${currentUser.uid}/${documentType}/${file.name}`);
        await uploadBytes(fileRef);
        const downloadURL = await getDownloadURL(fileRef);

        uploadedFiles.push({
          name: file.name,
          url: downloadURL,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Update documents state
      setDocuments(prev => ({
        ...prev,
        [documentType]: documentType === 'resume' ? uploadedFiles[0] : [...(prev[documentType] || []), ...uploadedFiles]
      }));

      // Update in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        documents: {
          ...documents,
          [documentType]: documentType === 'resume' ? uploadedFiles[0] : [...(documents[documentType] || []), ...uploadedFiles]
        }
      });

      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeDocument = async (documentType, index) => {
    try {
      const updatedDocuments = { ...documents };
      
      if (documentType === 'resume') {
        updatedDocuments.resume = null;
      } else {
        updatedDocuments[documentType] = updatedDocuments[documentType].filter((_, i) => i !== index);
      }

      setDocuments(updatedDocuments);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        documents: updatedDocuments
      });

      toast.success('Document removed successfully!');
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  const saveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), profile);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileImage>
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <FiUser size={48} color="#718096" />
          )}
          {userRole === 'student' && (
            <label className="upload-overlay">
              <FiCamera size={24} color="white" />
              <FileInput
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </ProfileImage>
        
        <ProfileInfo>
          <h1>{profile.name || 'Student Name'}</h1>
          <p>{profile.email}</p>
          <p>Roll Number: {profile.rollNumber}</p>
          <p>Branch: {profile.branch} | Section: {profile.section}</p>
        </ProfileInfo>
      </ProfileHeader>

      {userRole === 'student' && (
        <UploadSection>
          <SectionTitle>
            <FiUpload />
            Document Uploads
          </SectionTitle>
        
        <UploadGrid>
          {/* Resume Upload */}
          <UploadCard className={documents.resume ? 'uploaded' : ''}>
            <UploadIcon>
              <FiFile />
            </UploadIcon>
            <UploadText>
              <h3>Resume</h3>
              <p>Upload your latest resume (PDF, DOC, DOCX)</p>
            </UploadText>
            <FileInput
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleDocumentUpload(e, 'resume')}
              disabled={uploading}
            />
            <UploadButton
              onClick={() => document.querySelector('input[accept=".pdf,.doc,.docx"]').click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </UploadButton>
            
            {documents.resume && (
              <FileList>
                <FileItem>
                  <div className="file-info">
                    <FiFile />
                    <div>
                      <div className="file-name">{documents.resume.name}</div>
                      <div className="file-size">{formatFileSize(documents.resume.size)}</div>
                    </div>
                  </div>
                                     <div>
                     <button
                       className="view-btn"
                       onClick={() => setViewingDocument(documents.resume)}
                       style={{ background: '#4299e1', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                     >
                       <FiEye />
                     </button>
                     <button
                       className="remove-btn"
                       onClick={() => removeDocument('resume')}
                     >
                       <FiX />
                     </button>
                   </div>
                </FileItem>
              </FileList>
            )}
          </UploadCard>

          {/* Certificates Upload */}
          <UploadCard className={documents.certificates?.length > 0 ? 'uploaded' : ''}>
            <UploadIcon>
              <FiFile />
            </UploadIcon>
            <UploadText>
              <h3>Certificates</h3>
              <p>Upload your certificates and achievements</p>
            </UploadText>
            <FileInput
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleDocumentUpload(e, 'certificates')}
              disabled={uploading}
            />
            <UploadButton
              onClick={() => document.querySelector('input[accept=".pdf,.jpg,.jpeg,.png"]').click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Certificates'}
            </UploadButton>
            
            {documents.certificates?.length > 0 && (
              <FileList>
                {documents.certificates.map((file, index) => (
                  <FileItem key={index}>
                    <div className="file-info">
                      <FiFile />
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                                         <div>
                       <button
                         className="view-btn"
                         onClick={() => setViewingDocument(file)}
                         style={{ background: '#4299e1', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                       >
                         <FiEye />
                       </button>
                       <button
                         className="remove-btn"
                         onClick={() => removeDocument('certificates', index)}
                       >
                         <FiX />
                       </button>
                     </div>
                  </FileItem>
                ))}
              </FileList>
            )}
          </UploadCard>

          {/* Projects Upload */}
          <UploadCard className={documents.projects?.length > 0 ? 'uploaded' : ''}>
            <UploadIcon>
              <FiFile />
            </UploadIcon>
            <UploadText>
              <h3>Projects</h3>
              <p>Upload your project files and documentation</p>
            </UploadText>
            <FileInput
              type="file"
              accept=".pdf,.zip,.rar,.doc,.docx"
              multiple
              onChange={(e) => handleDocumentUpload(e, 'projects')}
              disabled={uploading}
            />
            <UploadButton
              onClick={() => document.querySelector('input[accept=".pdf,.zip,.rar,.doc,.docx"]').click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Projects'}
            </UploadButton>
            
            {documents.projects?.length > 0 && (
              <FileList>
                {documents.projects.map((file, index) => (
                  <FileItem key={index}>
                    <div className="file-info">
                      <FiFile />
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                                         <div>
                       <button
                         className="view-btn"
                         onClick={() => setViewingDocument(file)}
                         style={{ background: '#4299e1', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                       >
                         <FiEye />
                       </button>
                       <button
                         className="remove-btn"
                         onClick={() => removeDocument('projects', index)}
                       >
                         <FiX />
                       </button>
                     </div>
                  </FileItem>
                ))}
              </FileList>
            )}
          </UploadCard>

          {/* Transcripts Upload */}
          <UploadCard className={documents.transcripts?.length > 0 ? 'uploaded' : ''}>
            <UploadIcon>
              <FiFile />
            </UploadIcon>
            <UploadText>
              <h3>Transcripts</h3>
              <p>Upload your academic transcripts and marksheets</p>
            </UploadText>
            <FileInput
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleDocumentUpload(e, 'transcripts')}
              disabled={uploading}
            />
            <UploadButton
              onClick={() => document.querySelector('input[accept=".pdf,.jpg,.jpeg,.png"]').click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Transcripts'}
            </UploadButton>
            
            {documents.transcripts?.length > 0 && (
              <FileList>
                {documents.transcripts.map((file, index) => (
                  <FileItem key={index}>
                    <div className="file-info">
                      <FiFile />
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                                         <div>
                       <button
                         className="view-btn"
                         onClick={() => setViewingDocument(file)}
                         style={{ background: '#4299e1', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                       >
                         <FiEye />
                       </button>
                       <button
                         className="remove-btn"
                         onClick={() => removeDocument('transcripts', index)}
                       >
                         <FiX />
                       </button>
                     </div>
                  </FileItem>
                ))}
              </FileList>
            )}
          </UploadCard>
        </UploadGrid>

                 {uploading && (
           <ProgressBar>
             <div className="progress" style={{ width: `${uploadProgress}%` }} />
           </ProgressBar>
         )}
       </UploadSection>
               )}
         
         {userRole === 'admin' && documents && (
           <UploadSection>
             <SectionTitle>
               <FiFile />
               Student Documents
             </SectionTitle>
             
             <div style={{ display: 'grid', gap: '1rem' }}>
               {documents.resume && (
                 <div style={{ 
                   padding: '1rem', 
                   background: '#f0f4ff', 
                   borderRadius: '8px',
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center'
                 }}>
                   <div>
                     <strong>Resume:</strong> {documents.resume.name}
                   </div>
                   <Button 
                     className="secondary" 
                     onClick={() => setViewingDocument(documents.resume)}
                     style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                   >
                     <FiEye /> View
                   </Button>
                 </div>
               )}
               
               {documents.certificates?.length > 0 && (
                 <div style={{ 
                   padding: '1rem', 
                   background: '#f0f4ff', 
                   borderRadius: '8px'
                 }}>
                   <strong>Certificates ({documents.certificates.length}):</strong>
                   <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.5rem' }}>
                     {documents.certificates.map((cert, index) => (
                       <div key={index} style={{ 
                         display: 'flex', 
                         justifyContent: 'space-between', 
                         alignItems: 'center',
                         padding: '0.5rem',
                         background: 'white',
                         borderRadius: '4px'
                       }}>
                         <span>{cert.name}</span>
                         <Button 
                           className="secondary" 
                           onClick={() => setViewingDocument(cert)}
                           style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                         >
                           <FiEye /> View
                         </Button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               {documents.projects?.length > 0 && (
                 <div style={{ 
                   padding: '1rem', 
                   background: '#f0f4ff', 
                   borderRadius: '8px'
                 }}>
                   <strong>Projects ({documents.projects.length}):</strong>
                   <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.5rem' }}>
                     {documents.projects.map((project, index) => (
                       <div key={index} style={{ 
                         display: 'flex', 
                         justifyContent: 'space-between', 
                         alignItems: 'center',
                         padding: '0.5rem',
                         background: 'white',
                         borderRadius: '4px'
                       }}>
                         <span>{project.name}</span>
                         <Button 
                           className="secondary" 
                           onClick={() => setViewingDocument(project)}
                           style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                         >
                           <FiEye /> View
                         </Button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               {documents.transcripts?.length > 0 && (
                 <div style={{ 
                   padding: '1rem', 
                   background: '#f0f4ff', 
                   borderRadius: '8px'
                 }}>
                   <strong>Transcripts ({documents.transcripts.length}):</strong>
                   <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.5rem' }}>
                     {documents.transcripts.map((transcript, index) => (
                       <div key={index} style={{ 
                         display: 'flex', 
                         justifyContent: 'space-between', 
                         alignItems: 'center',
                         padding: '0.5rem',
                         background: 'white',
                         borderRadius: '4px'
                       }}>
                         <span>{transcript.name}</span>
                         <Button 
                           className="secondary" 
                           onClick={() => setViewingDocument(transcript)}
                           style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                         >
                           <FiEye /> View
                         </Button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               {!documents.resume && !documents.certificates?.length && !documents.projects?.length && !documents.transcripts?.length && (
                 <div style={{ 
                   padding: '1rem', 
                   background: '#f7fafc', 
                   borderRadius: '8px',
                   textAlign: 'center',
                   color: '#718096'
                 }}>
                   No documents uploaded yet.
                 </div>
               )}
             </div>
           </UploadSection>
         )}
         
         {viewingDocument && (
           <DocumentViewer
             document={viewingDocument}
             onClose={() => setViewingDocument(null)}
           />
         )}
       </ProfileContainer>
     );
 };

export default StudentProfile;
