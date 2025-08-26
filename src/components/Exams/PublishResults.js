import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiBarChart2
} from 'react-icons/fi';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #718096;
    margin: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
    
    .stat-icon {
      font-size: 1.5rem;
      color: #667eea;
    }
    
    .stat-title {
      font-weight: 600;
      color: #1a202c;
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

const ExamSelector = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #1a202c;
    font-size: 1.125rem;
  }
  
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    background: #ffffff;
    
    &:focus {
      outline: none;
      border-color: #4a5568;
      box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
    }
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
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #1a202c;
  font-size: 0.875rem;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  
  &:hover {
    background: #f7fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .student-name {
    font-weight: 500;
    color: #1a202c;
  }
  
  .score {
    font-weight: 600;
    color: #1a202c;
  }
  
  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    
    &.approved {
      color: #38a169;
    }
    
    &.pending {
      color: #d69e2e;
    }
    
    &.rejected {
      color: #e53e3e;
    }
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  
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
    transform: none !important;
  }
`;

const BulkActions = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #1a202c;
    font-size: 1.125rem;
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #4a5568;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #cbd5e0;
  }
`;

const PublishResults = () => {
  const { userRole } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalResults: 0,
    scoreApproved: 0,
    scorePending: 0,
    answersApproved: 0,
    answersPending: 0
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchResults();
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const examsQuery = query(collection(db, 'exams'));
      const examsSnapshot = await getDocs(examsQuery);
      const examsData = examsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExams(examsData);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchResults = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const resultsQuery = query(
        collection(db, 'examResults'),
        where('examId', '==', selectedExam)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by submission date (newest first)
      resultsData.sort((a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate());
      
      setResults(resultsData);
      calculateStats(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (resultsData) => {
    const stats = {
      totalResults: resultsData.length,
      scoreApproved: resultsData.filter(r => r.scoreApproved).length,
      scorePending: resultsData.filter(r => !r.scoreApproved).length,
      answersApproved: resultsData.filter(r => r.answersApproved).length,
      answersPending: resultsData.filter(r => !r.answersApproved).length
    };
    setStats(stats);
  };

  const handleApproveScores = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const pendingResults = results.filter(r => !r.scoreApproved);
      
      pendingResults.forEach(result => {
        const resultRef = doc(db, 'examResults', result.id);
        batch.update(resultRef, { scoreApproved: true });
      });
      
      await batch.commit();
      await fetchResults(); // Refresh data
    } catch (error) {
      console.error('Error approving scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAnswers = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const pendingResults = results.filter(r => !r.answersApproved);
      
      pendingResults.forEach(result => {
        const resultRef = doc(db, 'examResults', result.id);
        batch.update(resultRef, { answersApproved: true });
      });
      
      await batch.commit();
      await fetchResults(); // Refresh data
    } catch (error) {
      console.error('Error approving answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectScores = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const approvedResults = results.filter(r => r.scoreApproved);
      
      approvedResults.forEach(result => {
        const resultRef = doc(db, 'examResults', result.id);
        batch.update(resultRef, { scoreApproved: false });
      });
      
      await batch.commit();
      await fetchResults(); // Refresh data
    } catch (error) {
      console.error('Error rejecting scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAnswers = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const approvedResults = results.filter(r => r.answersApproved);
      
      approvedResults.forEach(result => {
        const resultRef = doc(db, 'examResults', result.id);
        batch.update(resultRef, { answersApproved: false });
      });
      
      await batch.commit();
      await fetchResults(); // Refresh data
    } catch (error) {
      console.error('Error rejecting answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualApproval = async (resultId, type, approved) => {
    setLoading(true);
    try {
      const resultRef = doc(db, 'examResults', resultId);
      await updateDoc(resultRef, { [type]: approved });
      await fetchResults(); // Refresh data
    } catch (error) {
      console.error('Error updating individual approval:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (resultId) => {
    window.open(`/exam-result/${selectedExam}?resultId=${resultId}&admin=true`, '_blank');
  };

  const exportResults = () => {
    if (!results.length) return;
    
    const exportData = results.map(result => ({
      'Student Name': result.userName || result.userEmail,
      'Email': result.userEmail,
      'Score': `${result.percentage}%`,
      'Correct Answers': result.correctAnswers,
      'Total Questions': result.totalQuestions,
      'Time Taken (seconds)': result.duration,
      'Tab Switches': result.tabSwitches,
      'Score Approved': result.scoreApproved ? 'Yes' : 'No',
      'Answers Approved': result.answersApproved ? 'Yes' : 'No',
      'Submitted At': result.submittedAt?.toDate().toLocaleString() || 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    
    const exam = exams.find(e => e.id === selectedExam);
    const fileName = `exam-results-${exam?.title || selectedExam}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (userRole !== 'admin') {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FiAlertTriangle style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '1rem' }} />
          <h2>Access Denied</h2>
          <p>Only administrators can access this page.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Publish Results</h1>
        <p>Manage and publish exam results for students</p>
      </Header>

      <ExamSelector>
        <h3>Select Exam</h3>
        <select 
          value={selectedExam} 
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="">Choose an exam...</option>
          {exams.map(exam => (
            <option key={exam.id} value={exam.id}>
              {exam.title} ({exam.questions?.length || 0} questions)
            </option>
          ))}
        </select>
      </ExamSelector>

      {selectedExam && (
        <>
          <StatsGrid>
            <StatCard>
              <div className="stat-header">
                <div className="stat-icon">
                  <FiBarChart2 />
                </div>
                <div className="stat-title">Total Results</div>
              </div>
              <div className="stat-value">{stats.totalResults}</div>
              <div className="stat-label">Students who took the exam</div>
            </StatCard>

            <StatCard>
              <div className="stat-header">
                <div className="stat-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-title">Scores Approved</div>
              </div>
              <div className="stat-value">{stats.scoreApproved}</div>
              <div className="stat-label">Students can see their scores</div>
            </StatCard>

            <StatCard>
              <div className="stat-header">
                <div className="stat-icon">
                  <FiClock />
                </div>
                <div className="stat-title">Scores Pending</div>
              </div>
              <div className="stat-value">{stats.scorePending}</div>
              <div className="stat-label">Awaiting score approval</div>
            </StatCard>

            <StatCard>
              <div className="stat-header">
                <div className="stat-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-title">Answers Approved</div>
              </div>
              <div className="stat-value">{stats.answersApproved}</div>
              <div className="stat-label">Students can see correct answers</div>
            </StatCard>

            <StatCard>
              <div className="stat-header">
                <div className="stat-icon">
                  <FiClock />
                </div>
                <div className="stat-title">Answers Pending</div>
              </div>
              <div className="stat-value">{stats.answersPending}</div>
              <div className="stat-label">Awaiting answer approval</div>
            </StatCard>
          </StatsGrid>

          <BulkActions>
            <h3>Bulk Actions</h3>
            <div className="actions-grid">
              <Button 
                className="success" 
                onClick={handleApproveScores}
                disabled={loading || stats.scorePending === 0}
              >
                <FiCheckCircle />
                Approve All Scores ({stats.scorePending})
              </Button>
              
              <Button 
                className="success" 
                onClick={handleApproveAnswers}
                disabled={loading || stats.answersPending === 0}
              >
                <FiCheckCircle />
                Approve All Answers ({stats.answersPending})
              </Button>
              
              <Button 
                className="danger" 
                onClick={handleRejectScores}
                disabled={loading || stats.scoreApproved === 0}
              >
                <FiXCircle />
                Reject All Scores ({stats.scoreApproved})
              </Button>
              
              <Button 
                className="danger" 
                onClick={handleRejectAnswers}
                disabled={loading || stats.answersApproved === 0}
              >
                <FiXCircle />
                Reject All Answers ({stats.answersApproved})
              </Button>
              
              <Button 
                className="primary" 
                onClick={exportResults}
                disabled={loading || results.length === 0}
              >
                <FiDownload />
                Export Results
              </Button>
              
              <Button 
                className="secondary" 
                onClick={fetchResults}
                disabled={loading}
              >
                <FiRefreshCw />
                Refresh Data
              </Button>
            </div>
          </BulkActions>

          <ResultsTable>
            <TableHeader>
              <div>Student</div>
              <div>Score</div>
              <div>Submitted</div>
              <div>Score Status</div>
              <div>Answer Status</div>
              <div>Score Actions</div>
              <div>Answer Actions</div>
              <div>View</div>
            </TableHeader>

            {loading ? (
              <LoadingSpinner>
                <FiRefreshCw className="spinner" />
                Loading results...
              </LoadingSpinner>
            ) : results.length === 0 ? (
              <EmptyState>
                <div className="empty-icon">
                  <FiBarChart2 />
                </div>
                <h3>No Results Found</h3>
                <p>No students have taken this exam yet.</p>
              </EmptyState>
            ) : (
              results.map(result => (
                <TableRow key={result.id}>
                  <div className="student-name">
                    {result.userName || result.userEmail}
                  </div>
                  <div className="score">
                    {result.percentage}%
                  </div>
                  <div>
                    {formatDate(result.submittedAt)}
                  </div>
                  <div className={`status ${result.scoreApproved ? 'approved' : 'pending'}`}>
                    {result.scoreApproved ? (
                      <>
                        <FiCheckCircle />
                        Approved
                      </>
                    ) : (
                      <>
                        <FiClock />
                        Pending
                      </>
                    )}
                  </div>
                  <div className={`status ${result.answersApproved ? 'approved' : 'pending'}`}>
                    {result.answersApproved ? (
                      <>
                        <FiCheckCircle />
                        Approved
                      </>
                    ) : (
                      <>
                        <FiClock />
                        Pending
                      </>
                    )}
                  </div>
                  <div className="actions">
                    {result.scoreApproved ? (
                      <Button 
                        className="danger" 
                        onClick={() => handleIndividualApproval(result.id, 'scoreApproved', false)}
                        disabled={loading}
                      >
                        <FiXCircle />
                        Reject
                      </Button>
                    ) : (
                      <Button 
                        className="success" 
                        onClick={() => handleIndividualApproval(result.id, 'scoreApproved', true)}
                        disabled={loading}
                      >
                        <FiCheckCircle />
                        Approve
                      </Button>
                    )}
                  </div>
                  <div className="actions">
                    {result.answersApproved ? (
                      <Button 
                        className="danger" 
                        onClick={() => handleIndividualApproval(result.id, 'answersApproved', false)}
                        disabled={loading}
                      >
                        <FiXCircle />
                        Reject
                      </Button>
                    ) : (
                      <Button 
                        className="success" 
                        onClick={() => handleIndividualApproval(result.id, 'answersApproved', true)}
                        disabled={loading}
                      >
                        <FiCheckCircle />
                        Approve
                      </Button>
                    )}
                  </div>
                  <div className="actions">
                    <Button 
                      className="secondary" 
                      onClick={() => handleViewResult(result.id)}
                    >
                      <FiEye />
                      View
                    </Button>
                  </div>
                </TableRow>
              ))
            )}
          </ResultsTable>
        </>
      )}
    </Container>
  );
};

export default PublishResults;
