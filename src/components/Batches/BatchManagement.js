import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiUpload, FiPlus, FiEdit, FiTrash2, FiDownload, FiUsers } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import styled from 'styled-components';

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

const FileInput = styled.input`
  display: none;
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
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  
  h2 {
    margin: 0 0 1.5rem 0;
    color: #1a202c;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 0.5rem;
  
  label {
    font-weight: 500;
    color: #4a5568;
  }
  
  input, select, textarea {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    branch: '',
    academicYear: '',
    totalStudents: 0,
    description: ''
  });
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const batchesQuery = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(batchesQuery);
      const batchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBatches(batchesData);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await readExcelFile(file);
      await importBatchesFromExcel(data);
    } catch (error) {
      console.error('Error importing batches:', error);
      alert('Error importing batches. Please check the file format.');
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  const importBatchesFromExcel = async (data) => {
    const batchesToAdd = data.map(row => ({
      name: row.name || row.Name || row.BATCH_NAME,
      section: row.section || row.Section || row.SECTION,
      branch: row.branch || row.Branch || row.BRANCH,
      academicYear: row.academicYear || row['Academic Year'] || row.ACADEMIC_YEAR,
      totalStudents: parseInt(row.totalStudents || row['Total Students'] || row.TOTAL_STUDENTS) || 0,
      description: row.description || row.Description || row.DESCRIPTION || '',
      createdAt: new Date()
    }));

    for (const batch of batchesToAdd) {
      await addDoc(collection(db, 'batches'), batch);
    }

    await fetchBatches();
    alert(`Successfully imported ${batchesToAdd.length} batches!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBatch) {
        await updateDoc(doc(db, 'batches', editingBatch.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'batches'), {
          ...formData,
          createdAt: new Date()
        });
      }
      
      setShowModal(false);
      setEditingBatch(null);
      setFormData({
        name: '',
        section: '',
        branch: '',
        academicYear: '',
        totalStudents: 0,
        description: ''
      });
      await fetchBatches();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Error saving batch. Please try again.');
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      section: batch.section,
      branch: batch.branch,
      academicYear: batch.academicYear,
      totalStudents: batch.totalStudents,
      description: batch.description
    });
    setShowModal(true);
  };

  const handleDelete = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await deleteDoc(doc(db, 'batches', batchId));
        await fetchBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Error deleting batch. Please try again.');
      }
    }
  };

  const handleAddStudent = (batch) => {
    setSelectedBatch(batch);
    setShowStudentModal(true);
    setStudentFormData({
      name: '',
      email: '',
      rollNumber: '',
      phone: '',
      address: ''
    });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBatch) return;

    try {
      // Create user account for the student
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../../firebase/config');
      
      // Generate a temporary password (student can change later)
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        studentFormData.email,
        tempPassword
      );

      // Add student data to Firestore
      const studentData = {
        uid: userCredential.user.uid,
        name: studentFormData.name,
        email: studentFormData.email,
        rollNumber: studentFormData.rollNumber,
        phone: studentFormData.phone,
        address: studentFormData.address,
        batchId: selectedBatch.id,
        batchName: selectedBatch.name,
        branch: selectedBatch.branch,
        section: selectedBatch.section,
        role: 'student',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'users'), studentData);

      // Update batch student count
      const updatedBatch = {
        ...selectedBatch,
        totalStudents: (selectedBatch.totalStudents || 0) + 1
      };
      
      await updateDoc(doc(db, 'batches', selectedBatch.id), {
        totalStudents: updatedBatch.totalStudents
      });

      // Update local state
      setBatches(batches.map(batch => 
        batch.id === selectedBatch.id ? updatedBatch : batch
      ));

      setShowStudentModal(false);
      setSelectedBatch(null);
      setStudentFormData({
        name: '',
        email: '',
        rollNumber: '',
        phone: '',
        address: ''
      });

      alert(`Student added successfully! Temporary password: ${tempPassword}`);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student. Please try again.');
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(batches);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Batches');
    XLSX.writeFile(workbook, 'batches.xlsx');
  };

  const totalStudents = batches.reduce((sum, batch) => sum + batch.totalStudents, 0);
  const uniqueBranches = [...new Set(batches.map(batch => batch.branch))].length;
  const uniqueSections = [...new Set(batches.map(batch => batch.section))].length;

  return (
    <Container>
      <Header>
        <h1>Batch Management</h1>
        <ActionButtons>
          <Button className="secondary" onClick={exportToExcel}>
            <FiDownload />
            Export
          </Button>
          <label>
            <FileInput
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
            <Button className="secondary" as="span">
              <FiUpload />
              Import Excel
            </Button>
          </label>
          <Button className="primary" onClick={() => setShowModal(true)}>
            <FiPlus />
            Add Batch
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
          <div className="stat-value">{batches.length}</div>
          <div className="stat-label">Total Batches</div>
        </StatCard>
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
              <FiUsers />
            </div>
          </div>
          <div className="stat-value">{uniqueBranches}</div>
          <div className="stat-label">Branches</div>
        </StatCard>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-value">{uniqueSections}</div>
          <div className="stat-label">Sections</div>
        </StatCard>
      </StatsGrid>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Batch Name</th>
              <th>Section</th>
              <th>Branch</th>
              <th>Academic Year</th>
              <th>Students</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td>{batch.name}</td>
                <td>{batch.section}</td>
                <td>{batch.branch}</td>
                <td>{batch.academicYear}</td>
                <td>{batch.totalStudents}</td>
                <td>{batch.description}</td>
                <ActionCell>
                  <Button 
                    className="primary" 
                    onClick={() => handleAddStudent(batch)}
                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <FiPlus />
                  </Button>
                  <Button 
                    className="secondary" 
                    onClick={() => handleEdit(batch)}
                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <FiEdit />
                  </Button>
                  <Button 
                    className="danger" 
                    onClick={() => handleDelete(batch.id)}
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

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Batch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Chemical">Chemical</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label>Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="e.g., 2024-2025"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Total Students</label>
                <input
                  type="number"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: parseInt(e.target.value) })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </FormGroup>
              
              <FormActions>
                <Button 
                  type="button" 
                  className="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  {editingBatch ? 'Update' : 'Create'} Batch
                </Button>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {showStudentModal && (
        <Modal onClick={() => setShowStudentModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Add Student to {selectedBatch?.name}</h2>
            <Form onSubmit={handleStudentSubmit}>
              <FormGroup>
                <label>Full Name</label>
                <input
                  type="text"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Email</label>
                <input
                  type="email"
                  value={studentFormData.email}
                  onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Roll Number</label>
                <input
                  type="text"
                  value={studentFormData.rollNumber}
                  onChange={(e) => setStudentFormData({ ...studentFormData, rollNumber: e.target.value })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={studentFormData.phone}
                  onChange={(e) => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                />
              </FormGroup>
              
              <FormGroup>
                <label>Address</label>
                <textarea
                  value={studentFormData.address}
                  onChange={(e) => setStudentFormData({ ...studentFormData, address: e.target.value })}
                  rows="3"
                />
              </FormGroup>
              
              <FormActions>
                <Button 
                  type="button" 
                  className="secondary"
                  onClick={() => setShowStudentModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  Add Student
                </Button>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default BatchManagement;
