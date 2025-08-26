import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  FiPlay, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiCalendar,
  FiBarChart2,
  FiBookOpen
} from 'react-icons/fi';
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
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
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

const ExamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const ExamCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ExamHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f7fafc;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #1a202c;
    font-size: 1.25rem;
  }
  
  p {
    margin: 0;
    color: #718096;
    font-size: 0.875rem;
  }
`;

const ExamContent = styled.div`
  padding: 1.5rem;
`;

const ExamInfo = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
  
  svg {
    color: #a0aec0;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.upcoming {
    background: #ebf8ff;
    color: #3182ce;
  }
  
  &.ongoing {
    background: #fef5e7;
    color: #d69e2e;
  }
  
  &.completed {
    background: #f0fff4;
    color: #38a169;
  }
  
  &.expired {
    background: #fed7d7;
    color: #e53e3e;
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
  width: 100%;
  justify-content: center;
  
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
  
  &.success {
    background: #48bb78;
    color: white;
    
    &:hover {
      background: #38a169;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MyExams = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    upcomingExams: 0,
    averageScore: 0
  });

  useEffect(() => {
    fetchMyExams();
  }, []);

  const fetchMyExams = async () => {
    try {
      console.log('Fetching exams for user:', currentUser.uid);
      // Fetch all exams (in a real app, you'd filter by user's batch)
      const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
      const examsSnapshot = await getDocs(examsQuery);
      const examsData = examsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Exams found:', examsData.length);
      
      // Fetch user's exam results (without orderBy to avoid index requirement)
      const resultsQuery = query(
        collection(db, 'examResults'), 
        where('userId', '==', currentUser.uid)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = {};
      
      resultsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        resultsData[data.examId] = data;
      });
      
      // Sort results by submittedAt in JavaScript instead
      const sortedResults = Object.values(resultsData).sort((a, b) => {
        if (a.submittedAt && b.submittedAt) {
          return b.submittedAt.toDate() - a.submittedAt.toDate();
        }
        return 0;
      });
      
      // Convert back to object with examId as key
      const sortedResultsData = {};
      sortedResults.forEach(result => {
        sortedResultsData[result.examId] = result;
      });
      console.log('User results found:', Object.keys(resultsData).length);
      
      setExams(examsData);
      setExamResults(sortedResultsData);
      calculateStats(examsData, sortedResultsData);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Error loading exams: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (examsData, resultsData) => {
    const now = new Date();
    let completed = 0;
    let upcoming = 0;
    let totalScore = 0;
    let scoredExams = 0;
    
    examsData.forEach(exam => {
      const endTime = exam.endTime.toDate();
      const userResult = resultsData[exam.id];
      
      if (userResult) {
        completed++;
        if (userResult.percentage !== undefined) {
          totalScore += userResult.percentage;
          scoredExams++;
        }
      } else if (now > endTime) {
        completed++;
      } else if (now < exam.startTime.toDate()) {
        upcoming++;
      }
    });

    setStats({
      totalExams: examsData.length,
      completedExams: completed,
      upcomingExams: upcoming,
      averageScore: scoredExams > 0 ? Math.round(totalScore / scoredExams) : 0
    });
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = exam.startTime.toDate();
    const endTime = exam.endTime.toDate();
    const userResult = examResults[exam.id];
    
    // If user has completed the exam, show as completed
    if (userResult) {
      return 'completed';
    }
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'completed'; // Time has passed but user didn't take it
  };

  const getUserScore = (examId) => {
    const result = examResults[examId];
    return result ? result.percentage : null;
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleViewResults = (examId) => {
    navigate(`/exam-result/${examId}`);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <h1>My Exams</h1>
          <p>View and take your assigned examinations</p>
        </Header>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiBookOpen style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Loading your exams...</h3>
          <p>Please wait while we fetch your exam data.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>My Exams</h1>
        <p>View and take your assigned examinations</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiBarChart2 />
            </div>
          </div>
          <div className="stat-value">{stats.totalExams}</div>
          <div className="stat-label">Total Exams</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiCheckCircle />
            </div>
          </div>
          <div className="stat-value">{stats.completedExams}</div>
          <div className="stat-label">Completed</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiClock />
            </div>
          </div>
          <div className="stat-value">{stats.upcomingExams}</div>
          <div className="stat-label">Upcoming</div>
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

      <ExamGrid>
        {exams.map((exam) => {
          const status = getExamStatus(exam);
          const userResult = examResults[exam.id];
          const userScore = getUserScore(exam.id);
          const isCompleted = status === 'completed';
          const canTake = status === 'ongoing' && !userResult;
          
          return (
            <ExamCard key={exam.id}>
              <ExamHeader>
                <h3>{exam.title}</h3>
                <p>{exam.description}</p>
              </ExamHeader>
              
              <ExamContent>
                <ExamInfo>
                  <InfoItem>
                    <FiClock />
                    <span>Duration: {exam.duration} minutes</span>
                  </InfoItem>
                  
                  <InfoItem>
                    <FiCalendar />
                    <span>Start: {exam.startTime.toDate().toLocaleString()}</span>
                  </InfoItem>
                  
                  <InfoItem>
                    <FiCalendar />
                    <span>End: {exam.endTime.toDate().toLocaleString()}</span>
                  </InfoItem>
                  
                  <InfoItem>
                    <FiBarChart2 />
                    <span>Total Marks: {exam.totalMarks}</span>
                  </InfoItem>
                </ExamInfo>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <StatusBadge className={status}>
                    {userResult ? 'Completed' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </StatusBadge>
                  
                  {userResult && userScore !== null && (
                    <span style={{ color: '#38a169', fontWeight: 500 }}>
                      Score: {userScore}%
                    </span>
                  )}
                </div>
                
                {canTake && (
                  <Button className="primary" onClick={() => handleStartExam(exam.id)}>
                    <FiPlay />
                    Take Exam
                  </Button>
                )}
                
                {userResult && (
                  <Button className="success" onClick={() => handleViewResults(exam.id)}>
                    <FiCheckCircle />
                    View Results
                  </Button>
                )}
                
                {status === 'upcoming' && (
                  <Button className="secondary" disabled>
                    <FiClock />
                    Not Available Yet
                  </Button>
                )}
                
                {isCompleted && !userResult && (
                  <Button className="secondary" disabled>
                    <FiXCircle />
                    Exam Expired
                  </Button>
                )}
              </ExamContent>
            </ExamCard>
          );
        })}
      </ExamGrid>
      
      {exams.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiBarChart2 style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No exams assigned yet</h3>
          <p>You will see your exams here once they are assigned by your administrator.</p>
        </div>
      )}
    </Container>
  );
};

export default MyExams;
