import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy,
  where 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  FiCalendar, 
  FiClock, 
  FiFileText, 
  FiUsers,
  FiPlay,
  FiEye,
  FiBarChart2
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

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: #f7fafc;
  padding: 0.5rem;
  border-radius: 8px;
`;

const FilterTab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1a202c' : '#718096'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background: ${props => props.active ? 'white' : '#e2e8f0'};
  }
`;

const ExamSchedule = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [stats, setStats] = useState({
    totalExams: 0,
    upcomingExams: 0,
    ongoingExams: 0,
    completedExams: 0
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      console.log('Fetching exams for schedule...');
      const examsQuery = query(collection(db, 'exams'), orderBy('startTime', 'asc'));
      const examsSnapshot = await getDocs(examsQuery);
      const examsData = examsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Exams found:', examsData.length);
      setExams(examsData);
      calculateStats(examsData);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Error loading exam schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (examsData) => {
    const now = new Date();
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    
    examsData.forEach(exam => {
      const startTime = exam.startTime.toDate();
      const endTime = exam.endTime.toDate();
      
      if (now < startTime) {
        upcoming++;
      } else if (now >= startTime && now <= endTime) {
        ongoing++;
      } else {
        completed++;
      }
    });

    setStats({
      totalExams: examsData.length,
      upcomingExams: upcoming,
      ongoingExams: ongoing,
      completedExams: completed
    });
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = exam.startTime.toDate();
    const endTime = exam.endTime.toDate();
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'completed';
  };

  const getFilteredExams = () => {
    if (activeFilter === 'all') return exams;
    
    return exams.filter(exam => {
      const status = getExamStatus(exam);
      return status === activeFilter;
    });
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleViewResults = (examId) => {
    navigate(`/exam-result/${examId}`);
  };

  const handleManageExam = (examId) => {
    navigate(`/exam-management/${examId}`);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <h1>Exam Schedule</h1>
          <p>View upcoming and scheduled examinations</p>
        </Header>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiCalendar style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Loading exam schedule...</h3>
          <p>Please wait while we fetch exam data.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Exam Schedule</h1>
        <p>{userRole === 'admin' ? 'Manage and view all examinations' : 'View your upcoming examinations'}</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiFileText />
            </div>
          </div>
          <div className="stat-value">{stats.totalExams}</div>
          <div className="stat-label">Total Exams</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiCalendar />
            </div>
          </div>
          <div className="stat-value">{stats.upcomingExams}</div>
          <div className="stat-label">Upcoming</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiClock />
            </div>
          </div>
          <div className="stat-value">{stats.ongoingExams}</div>
          <div className="stat-label">Ongoing</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon">
              <FiBarChart2 />
            </div>
          </div>
          <div className="stat-value">{stats.completedExams}</div>
          <div className="stat-label">Completed</div>
        </StatCard>
      </StatsGrid>

      <FilterTabs>
        <FilterTab 
          active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')}
        >
          All Exams
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'upcoming'} 
          onClick={() => setActiveFilter('upcoming')}
        >
          Upcoming
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'ongoing'} 
          onClick={() => setActiveFilter('ongoing')}
        >
          Ongoing
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'completed'} 
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </FilterTab>
      </FilterTabs>

      <ExamGrid>
        {getFilteredExams().map((exam) => {
          const status = getExamStatus(exam);
          const isAdmin = userRole === 'admin';
          const canTake = status === 'ongoing';
          const isCompleted = status === 'completed';
          
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
                  
                  {exam.batchName && (
                    <InfoItem>
                      <FiUsers />
                      <span>Batch: {exam.batchName}</span>
                    </InfoItem>
                  )}
                </ExamInfo>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <StatusBadge className={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </StatusBadge>
                </div>
                
                {isAdmin ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      className="primary" 
                      onClick={() => handleManageExam(exam.id)}
                      style={{ flex: 1 }}
                    >
                      <FiEye />
                      Manage
                    </Button>
                    {canTake && (
                      <Button 
                        className="secondary" 
                        onClick={() => handleStartExam(exam.id)}
                        style={{ flex: 1 }}
                      >
                        <FiPlay />
                        Take
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {canTake && (
                      <Button className="primary" onClick={() => handleStartExam(exam.id)}>
                        <FiPlay />
                        Take Exam
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <Button className="success" onClick={() => handleViewResults(exam.id)}>
                        <FiBarChart2 />
                        View Results
                      </Button>
                    )}
                    
                    {status === 'upcoming' && (
                      <Button className="secondary" disabled>
                        <FiClock />
                        Not Available Yet
                      </Button>
                    )}
                  </>
                )}
              </ExamContent>
            </ExamCard>
          );
        })}
      </ExamGrid>
      
      {getFilteredExams().length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <FiCalendar style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No exams found</h3>
          <p>{activeFilter === 'all' ? 'No exams have been created yet.' : `No ${activeFilter} exams found.`}</p>
        </div>
      )}
    </Container>
  );
};

export default ExamSchedule;
