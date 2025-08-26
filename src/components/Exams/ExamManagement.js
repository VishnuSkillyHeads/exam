import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  where,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  FiArrowLeft,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiBarChart2,
  FiClock,
  FiDownload,
  FiCheck,
  FiX
} from 'react-icons/fi';
import styled from 'styled-components';
import * as XLSX from 'xlsx';

const Container = styled.div`
  display: grid;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  .back-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #667eea;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    
    &:hover {
      background: #f7fafc;
    }
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0;
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
      background: #f7fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4a5568;
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

const ApprovalSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const ApprovalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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
    background: #ffffff;
    color: #1a202c;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
  }
  
  &.success {
    background: #48bb78;
    color: white;
    
    &:hover {
      background: #38a169;
    }
  }
  
  &.danger {
    background: #f56565;
    color: white;
    
    &:hover {
      background: #e53e3e;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsTable = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #1a202c;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f7fafc;
  align-items: center;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.pending {
    background: #fef5e7;
    color: #d69e2e;
  }
  
  &.approved {
    background: #f0fff4;
    color: #38a169;
  }
  
  &.rejected {
    background: #fed7d7;
    color: #e53e3e;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ExamManagement = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingApproval: 0,
    approvedResults: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchExamData();
  }, [examId, userRole]);

  const fetchExamData = async () => {
    try {
      console.log('Fetching exam data for examId:', examId);
      
      // Fetch exam details
      const examDoc = await getDoc(doc(db, 'exams', examId));
      if (examDoc.exists()) {
        const examData = { id: examDoc.id, ...examDoc.data() };
        console.log('Exam data:', examData);
        setExam(examData);
      } else {
        console.log('Exam not found');
      }

      // Fetch exam results
      const resultsQuery = query(
        collection(db, 'examResults'),
        where('examId', '==', examId)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Results data:', resultsData);
      setResults(resultsData);
      calculateStats(resultsData);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      alert('Error loading exam data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (resultsData) => {
    const totalSubmissions = resultsData.length;
    const pendingApproval = resultsData.filter(r => !r.scoreApproved).length;
    const approvedResults = resultsData.filter(r => r.scoreApproved).length;
    
    let totalScore = 0;
    let scoredCount = 0;
    
    resultsData.forEach(result => {
      if (result.percentage !== undefined) {
        totalScore += result.percentage;
        scoredCount++;
      }
    });
    
    const averageScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;

    setStats({
      totalSubmissions,
      pendingApproval,
      approvedResults,
      averageScore
    });
  };

  const handleApproveScores = async () => {
    if (window.confirm('Are you sure you want to approve all scores? This will make results visible to students.')) {
      try {
        const batch = [];
        results.forEach(result => {
          if (!result.scoreApproved) {
            batch.push(updateDoc(doc(db, 'examResults', result.id), {
              scoreApproved: true,
              scoreApprovedAt: new Date()
            }));
          }
        });
        
        await Promise.all(batch);
        await fetchExamData();
        alert('All scores have been approved!');
      } catch (error) {
        console.error('Error approving scores:', error);
        alert('Error approving scores: ' + error.message);
      }
    }
  };

  const handleApproveAnswers = async () => {
    if (window.confirm('Are you sure you want to approve correct answers? This will make answers visible to students.')) {
      try {
        const batch = [];
        results.forEach(result => {
          if (!result.answersApproved) {
            batch.push(updateDoc(doc(db, 'examResults', result.id), {
              answersApproved: true,
              answersApprovedAt: new Date()
            }));
          }
        });
        
        await Promise.all(batch);
        await fetchExamData();
        alert('All correct answers have been approved!');
      } catch (error) {
        console.error('Error approving answers:', error);
        alert('Error approving answers: ' + error.message);
      }
    }
  };

  const handleRejectScores = async () => {
    if (window.confirm('Are you sure you want to reject all scores? This will hide results from students.')) {
      try {
        const batch = [];
        results.forEach(result => {
          batch.push(updateDoc(doc(db, 'examResults', result.id), {
            scoreApproved: false,
            scoreApprovedAt: null
          }));
        });
        
        await Promise.all(batch);
        await fetchExamData();
        alert('All scores have been rejected!');
      } catch (error) {
        console.error('Error rejecting scores:', error);
        alert('Error rejecting scores: ' + error.message);
      }
    }
  };

  const handleRejectAnswers = async () => {
    if (window.confirm('Are you sure you want to reject correct answers? This will hide answers from students.')) {
      try {
        const batch = [];
        results.forEach(result => {
          batch.push(updateDoc(doc(db, 'examResults', result.id), {
            answersApproved: false,
            answersApprovedAt: null
          }));
        });
        
        await Promise.all(batch);
        await fetchExamData();
        alert('All correct answers have been rejected!');
      } catch (error) {
        console.error('Error rejecting answers:', error);
        alert('Error rejecting answers: ' + error.message);
      }
    }
  };

  const handleIndividualApproval = async (resultId, type, approved) => {
    try {
      console.log(`Handling individual approval:`, { resultId, type, approved });
      const updateData = {};
      if (type === 'score') {
        updateData.scoreApproved = approved;
        updateData.scoreApprovedAt = approved ? new Date() : null;
      } else if (type === 'answers') {
        updateData.answersApproved = approved;
        updateData.answersApprovedAt = approved ? new Date() : null;
      }
      
      console.log('Updating with data:', updateData);
      await updateDoc(doc(db, 'examResults', resultId), updateData);
      console.log('Update successful, refreshing data...');
      await fetchExamData();
      
      const action = approved ? 'approved' : 'rejected';
      alert(`${type === 'score' ? 'Score' : 'Answers'} ${action} successfully!`);
    } catch (error) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} ${type}:`, error);
      alert(`Error ${approved ? 'approving' : 'rejecting'} ${type}: ` + error.message);
    }
  };

  const exportResults = () => {
    const exportData = results.map(result => ({
      'Student Name': result.userName || 'Unknown',
      'Email': result.userEmail || 'Unknown',
      'Score': result.percentage || 0,
      'Total Marks': result.totalMarks || 0,
      'Correct Answers': result.correctAnswers || 0,
      'Total Questions': result.totalQuestions || 0,
      'Submitted At': result.submittedAt ? result.submittedAt.toDate().toLocaleString() : 'Unknown',
      'Score Approved': result.scoreApproved ? 'Yes' : 'No',
      'Answers Approved': result.answersApproved ? 'Yes' : 'No'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, `${exam?.title || 'exam'}_results.xlsx`);
  };

  const handleViewResult = (resultId) => {
    // For admin viewing, we need to pass the resultId as a query parameter
    // and modify the ExamResult component to handle admin viewing
    console.log('Admin viewing result:', resultId, 'for exam:', examId);
    const url = `/exam-result/${examId}?resultId=${resultId}&admin=true`;
    console.log('Navigating to:', url);
    navigate(url);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiBarChart2 style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Loading exam management...</h3>
          <p>Please wait while we fetch exam data.</p>
        </div>
      </Container>
    );
  }

  if (!exam) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiXCircle style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Exam not found</h3>
          <p>The exam you're looking for doesn't exist.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <button className="back-button" onClick={() => navigate('/schedule')}>
          <FiArrowLeft />
        </button>
        <h1>Exam Management - {exam.title}</h1>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-value">{stats.totalSubmissions}</div>
          <div className="stat-label">Total Submissions</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiClock />
            </div>
          </div>
          <div className="stat-value">{stats.pendingApproval}</div>
          <div className="stat-label">Pending Approval</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiCheckCircle />
            </div>
          </div>
          <div className="stat-value">{stats.approvedResults}</div>
          <div className="stat-label">Approved Results</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiBarChart2 />
            </div>
          </div>
          <div className="stat-value">{stats.averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </StatCard>
      </StatsGrid>

      <ApprovalSection>
        <h2>Bulk Approval Actions</h2>
        <p>Use these buttons to approve or reject all results at once.</p>
        
        <ApprovalButtons>
          <Button className="success" onClick={handleApproveScores}>
            <FiCheck />
            Approve All Scores
          </Button>
          <Button className="danger" onClick={handleRejectScores}>
            <FiX />
            Reject All Scores
          </Button>
          <Button className="success" onClick={handleApproveAnswers}>
            <FiCheck />
            Approve All Answers
          </Button>
          <Button className="danger" onClick={handleRejectAnswers}>
            <FiX />
            Reject All Answers
          </Button>
          <Button className="secondary" onClick={exportResults}>
            <FiDownload />
            Export Results
          </Button>
          <Button className="primary" onClick={() => navigate(`/exam-result/${examId}?admin=true`)}>
            <FiEye />
            Test Admin View
          </Button>
        </ApprovalButtons>
      </ApprovalSection>

      <ResultsTable>
        <TableHeader>
          <div>Student Name</div>
          <div>Email</div>
          <div>Score</div>
          <div>Submitted</div>
          <div>Score Status</div>
          <div>Answers Status</div>
          <div>Score Actions</div>
          <div>Answer Actions</div>
          <div>View</div>
        </TableHeader>
        
        {results.map((result) => (
          <TableRow key={result.id}>
            <div>{result.userName || 'Unknown'}</div>
            <div>{result.userEmail || 'Unknown'}</div>
            <div>{result.percentage || 0}%</div>
            <div>{result.submittedAt ? result.submittedAt.toDate().toLocaleString() : 'Unknown'}</div>
            <div>
              <StatusBadge className={result.scoreApproved ? 'approved' : 'pending'}>
                {result.scoreApproved ? 'Approved' : 'Pending'}
              </StatusBadge>
            </div>
            <div>
              <StatusBadge className={result.answersApproved ? 'approved' : 'pending'}>
                {result.answersApproved ? 'Approved' : 'Pending'}
              </StatusBadge>
            </div>
            <div>
              <Button 
                className={result.scoreApproved ? "danger" : "success"}
                onClick={() => handleIndividualApproval(result.id, 'score', !result.scoreApproved)}
                style={{ padding: '0.5rem', fontSize: '0.75rem', marginBottom: '0.25rem' }}
              >
                {result.scoreApproved ? 'Reject' : 'Approve'}
              </Button>
            </div>
            <div>
              <Button 
                className={result.answersApproved ? "danger" : "success"}
                onClick={() => handleIndividualApproval(result.id, 'answers', !result.answersApproved)}
                style={{ padding: '0.5rem', fontSize: '0.75rem', marginBottom: '0.25rem' }}
              >
                {result.answersApproved ? 'Reject' : 'Approve'}
              </Button>
            </div>
            <ActionButtons>
              <Button 
                className="primary" 
                onClick={() => handleViewResult(result.id)}
                style={{ padding: '0.5rem', fontSize: '0.875rem' }}
              >
                <FiEye />
                View
              </Button>
            </ActionButtons>
          </TableRow>
        ))}
      </ResultsTable>
      
      {results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiUsers style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No submissions yet</h3>
          <p>No students have submitted this exam yet.</p>
        </div>
      )}
    </Container>
  );
};

export default ExamManagement;
