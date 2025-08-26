import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiUsers, FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiTrash2, FiFile, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import DocumentViewer from './DocumentViewer';

const Container = styled.div`
  display: grid;
  gap: 2rem;
  background: #ffffff;
  min-height: 100vh;
  padding: 2rem;
  margin: -2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
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
    background: #3b82f6;
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
  }
  
  &.secondary {
    background: #ffffff;
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

const SearchAndFilter = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  
  .stat-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    .icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #718096;
    font-size: 0.875rem;
  }
`;

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #f7fafc;
  }
  
  th {
    background: #f7fafc;
    font-weight: 600;
    color: #4a5568;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  td {
    color: #1a202c;
  }
  
  tr:hover {
    background: #f7fafc;
  }
`;

const ActionCell = styled.td`
  display: flex;
  gap: 0.5rem;
`;

const StudentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
`;

const StudentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StudentAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
`;

const StudentInfo = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 0.25rem 0;
    color: #1a202c;
    font-size: 1.125rem;
  }
  
  p {
    margin: 0;
    color: #718096;
    font-size: 0.875rem;
  }
`;

const StudentDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  .label {
    color: #718096;
    font-weight: 500;
  }
  
  .value {
    color: #1a202c;
  }
`;

const DocumentsSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const DocumentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DocumentTag = styled.span`
  background: #f0f4ff;
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #e0e7ff;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  
  h2 {
    margin: 0 0 1.5rem 0;
    color: #1a202c;
  }
`;

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const snapshot = await getDocs(studentsQuery);
      console.log('Students snapshot:', snapshot.size, 'documents');
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by name in JavaScript instead
      const sortedStudentsData = studentsData.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      console.log('Students data:', sortedStudentsData);
      setStudents(sortedStudentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error loading students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = !filterBranch || student.branch === filterBranch;
    const matchesSection = !filterSection || student.section === filterSection;
    
    return matchesSearch && matchesBranch && matchesSection;
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStudents.map(student => ({
      Name: student.name,
      Email: student.email,
      'Roll Number': student.rollNumber,
      Branch: student.branch,
      Section: student.section,
      Phone: student.phone,
      Address: student.address,
      'Batch Name': student.batchName,
      'Created At': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : ''
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students.xlsx');
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', studentId));
        setStudents(students.filter(s => s.id !== studentId));
        alert('Student deleted successfully!');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student. Please try again.');
      }
    }
  };

  const getUniqueBranches = () => [...new Set(students.map(s => s.branch).filter(Boolean))];
  const getUniqueSections = () => [...new Set(students.map(s => s.section).filter(Boolean))];

  const totalStudents = students.length;
  const studentsWithDocuments = students.filter(s => s.documents && Object.values(s.documents).some(doc => doc && (Array.isArray(doc) ? doc.length > 0 : doc)));
  const studentsWithResume = students.filter(s => s.documents?.resume);

  if (loading) {
    return (
      <Container>
        <Header>
          <h1>Student Management</h1>
        </Header>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiUsers style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Loading students...</h3>
          <p>Please wait while we fetch student data.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Student Management</h1>
        <ActionButtons>
          <Button className="secondary" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}>
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button>
          <Button className="secondary" onClick={exportToExcel}>
            <FiDownload />
            Export Excel
          </Button>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </StatCard>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiFile />
            </div>
          </div>
          <div className="stat-value">{studentsWithDocuments.length}</div>
          <div className="stat-label">Students with Documents</div>
        </StatCard>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiFile />
            </div>
          </div>
          <div className="stat-value">{studentsWithResume.length}</div>
          <div className="stat-label">Students with Resume</div>
        </StatCard>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-value">{getUniqueBranches().length}</div>
          <div className="stat-label">Branches</div>
        </StatCard>
      </StatsGrid>

      <SearchAndFilter>
        <SearchInput
          type="text"
          placeholder="Search by name, email, or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
          <option value="">All Branches</option>
          {getUniqueBranches().map(branch => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
          <option value="">All Sections</option>
          {getUniqueSections().map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </FilterSelect>
      </SearchAndFilter>

      {filteredStudents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiUsers style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No students found</h3>
          <p>{students.length === 0 ? 'No students have been registered yet.' : 'No students match your search criteria.'}</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll Number</th>
                    <th>Branch</th>
                    <th>Section</th>
                    <th>Phone</th>
                    <th>Documents</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.branch}</td>
                  <td>{student.section}</td>
                  <td>{student.phone}</td>
                  <td>
                    {student.documents && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {student.documents.resume && <DocumentTag>Resume</DocumentTag>}
                        {student.documents.certificates?.length > 0 && <DocumentTag>Certificates ({student.documents.certificates.length})</DocumentTag>}
                        {student.documents.projects?.length > 0 && <DocumentTag>Projects ({student.documents.projects.length})</DocumentTag>}
                        {student.documents.transcripts?.length > 0 && <DocumentTag>Transcripts ({student.documents.transcripts.length})</DocumentTag>}
                      </div>
                    )}
                  </td>
                  <ActionCell>
                    <Button 
                      className="primary" 
                      onClick={() => handleViewStudent(student)}
                      style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                    >
                      <FiEye />
                    </Button>
                    <Button 
                      className="danger" 
                      onClick={() => handleDeleteStudent(student.id)}
                      style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                    >
                      <FiTrash2 />
                    </Button>
                  </ActionCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      ) : (
        <div>
          {filteredStudents.map((student) => (
            <StudentCard key={student.id}>
              <StudentHeader>
                <StudentAvatar>
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </StudentAvatar>
                <StudentInfo>
                  <h3>{student.name}</h3>
                  <p>{student.email}</p>
                  <p>Roll Number: {student.rollNumber}</p>
                </StudentInfo>
                <ActionButtons>
                  <Button 
                    className="primary" 
                    onClick={() => handleViewStudent(student)}
                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <FiEye />
                  </Button>
                  <Button 
                    className="danger" 
                    onClick={() => handleDeleteStudent(student.id)}
                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <FiTrash2 />
                  </Button>
                </ActionButtons>
              </StudentHeader>
              
              <StudentDetails>
                <DetailItem>
                  <FiMapPin className="label" />
                  <span className="label">Branch:</span>
                  <span className="value">{student.branch}</span>
                </DetailItem>
                <DetailItem>
                  <FiUsers className="label" />
                  <span className="label">Section:</span>
                  <span className="value">{student.section}</span>
                </DetailItem>
                <DetailItem>
                  <FiPhone className="label" />
                  <span className="label">Phone:</span>
                  <span className="value">{student.phone || 'Not provided'}</span>
                </DetailItem>
                <DetailItem>
                  <FiMail className="label" />
                  <span className="label">Batch:</span>
                  <span className="value">{student.batchName || 'Not assigned'}</span>
                </DetailItem>
              </StudentDetails>
              
              {student.documents && (
                <DocumentsSection>
                  <h4>Documents</h4>
                  <DocumentList>
                    {student.documents.resume && <DocumentTag>Resume</DocumentTag>}
                    {student.documents.certificates?.length > 0 && <DocumentTag>Certificates ({student.documents.certificates.length})</DocumentTag>}
                    {student.documents.projects?.length > 0 && <DocumentTag>Projects ({student.documents.projects.length})</DocumentTag>}
                    {student.documents.transcripts?.length > 0 && <DocumentTag>Transcripts ({student.documents.transcripts.length})</DocumentTag>}
                  </DocumentList>
                </DocumentsSection>
              )}
            </StudentCard>
          ))}
        </div>
      )}
        </>
      )}

      {showModal && selectedStudent && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Student Details - {selectedStudent.name}</h2>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Name:</strong> {selectedStudent.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedStudent.email}
                </div>
                <div>
                  <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                </div>
                <div>
                  <strong>Branch:</strong> {selectedStudent.branch}
                </div>
                <div>
                  <strong>Section:</strong> {selectedStudent.section}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}
                </div>
                <div>
                  <strong>Address:</strong> {selectedStudent.address || 'Not provided'}
                </div>
                <div>
                  <strong>Batch:</strong> {selectedStudent.batchName || 'Not assigned'}
                </div>
              </div>
            </div>
            
            {selectedStudent.documents && (
              <div>
                <h3>Documents</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedStudent.documents.resume && (
                    <div>
                      <strong>Resume:</strong> {selectedStudent.documents.resume.name}
                      <Button 
                        className="secondary" 
                        onClick={() => setViewingDocument(selectedStudent.documents.resume)}
                        style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        <FiEye /> View
                      </Button>
                    </div>
                  )}
                  
                  {selectedStudent.documents.certificates?.length > 0 && (
                    <div>
                      <strong>Certificates ({selectedStudent.documents.certificates.length}):</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        {selectedStudent.documents.certificates.map((cert, index) => (
                          <div key={index} style={{ marginBottom: '0.5rem' }}>
                            {cert.name}
                            <Button 
                              className="secondary" 
                              onClick={() => setViewingDocument(cert)}
                              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            >
                              <FiEye /> View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedStudent.documents.projects?.length > 0 && (
                    <div>
                      <strong>Projects ({selectedStudent.documents.projects.length}):</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        {selectedStudent.documents.projects.map((project, index) => (
                          <div key={index} style={{ marginBottom: '0.5rem' }}>
                            {project.name}
                            <Button 
                              className="secondary" 
                              onClick={() => setViewingDocument(project)}
                              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            >
                              <FiEye /> View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedStudent.documents.transcripts?.length > 0 && (
                    <div>
                      <strong>Transcripts ({selectedStudent.documents.transcripts.length}):</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        {selectedStudent.documents.transcripts.map((transcript, index) => (
                          <div key={index} style={{ marginBottom: '0.5rem' }}>
                            {transcript.name}
                            <Button 
                              className="secondary" 
                              onClick={() => setViewingDocument(transcript)}
                              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            >
                              <FiEye /> View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <Button className="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
      
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </Container>
  );
};

export default StudentManagement;
