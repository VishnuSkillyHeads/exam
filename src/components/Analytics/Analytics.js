import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiClock, 
  FiUsers, 
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiBarChart2,
  FiCalendar
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #ffffff;
  min-height: 100vh;
  margin: -2rem;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
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
    justify-content: space-between;
    margin-bottom: 1rem;
    
    .icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }
    
    .trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      
      &.positive {
        color: #38a169;
      }
      
      &.negative {
        color: #e53e3e;
      }
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  
  h3 {
    margin: 0 0 1.5rem 0;
    color: #1a202c;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const RecentSubmissions = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  
  h3 {
    margin: 0 0 1.5rem 0;
    color: #1a202c;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SubmissionTable = styled.table`
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

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  &.completed {
    background: #f0fff4;
    color: #38a169;
  }
  
  &.in-progress {
    background: #fef5e7;
    color: #d69e2e;
  }
  
  &.not-started {
    background: #f7fafc;
    color: #718096;
  }
`;

const ViolationsTable = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  
  h3 {
    margin: 0 0 1.5rem 0;
    color: #1a202c;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ViolationCard = styled.div`
  background: #fef5e7;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  .violation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    
    .user-info {
      font-weight: 600;
      color: #d69e2e;
    }
    
    .timestamp {
      font-size: 0.875rem;
      color: #718096;
    }
  }
  
  .violation-details {
    color: #4a5568;
    font-size: 0.875rem;
  }
`;

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalExams: 0,
    totalStudents: 0,
    completedExams: 0,
    inProgressExams: 0,
    notStartedExams: 0,
    averageScore: 0,
    averageTime: 0,
    totalViolations: 0,
    recentSubmissions: [],
    violations: [],
    examStats: [],
    scoreDistribution: [],
    timeDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch exam results
      const resultsQuery = query(
        collection(db, 'examResults'),
        orderBy('submittedAt', 'desc'),
        limit(50)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const results = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch violations
      const violationsQuery = query(
        collection(db, 'examViolations'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const violationsSnapshot = await getDocs(violationsQuery);
      const violations = violationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch exams
      const examsQuery = query(collection(db, 'exams'));
      const examsSnapshot = await getDocs(examsQuery);
      const exams = examsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate analytics
      const totalExams = exams.length;
      const completedExams = results.length;
      const averageScore = results.length > 0 
        ? results.reduce((sum, result) => sum + (result.percentage || 0), 0) / results.length 
        : 0;
      const averageTime = results.length > 0
        ? results.reduce((sum, result) => sum + (result.duration || 0), 0) / results.length
        : 0;
      const totalViolations = violations.length;

      // Fetch all students from users collection
      const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      const totalStudents = studentsSnapshot.size;

      // Calculate score distribution
      const scoreRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '50-59': 0,
        '0-49': 0
      };

      results.forEach(result => {
        const score = result.percentage || 0;
        if (score >= 90) scoreRanges['90-100']++;
        else if (score >= 80) scoreRanges['80-89']++;
        else if (score >= 70) scoreRanges['70-79']++;
        else if (score >= 60) scoreRanges['60-69']++;
        else if (score >= 50) scoreRanges['50-59']++;
        else scoreRanges['0-49']++;
      });

      // Calculate time distribution
      const timeRanges = {
        '0-30 min': 0,
        '30-60 min': 0,
        '60-90 min': 0,
        '90+ min': 0
      };

      results.forEach(result => {
        const time = result.duration || 0;
        if (time <= 30) timeRanges['0-30 min']++;
        else if (time <= 60) timeRanges['30-60 min']++;
        else if (time <= 90) timeRanges['60-90 min']++;
        else timeRanges['90+ min']++;
      });

      setAnalytics({
        totalExams,
        totalStudents,
        completedExams,
        inProgressExams: 0, // This would need to be calculated from active sessions
        notStartedExams: totalExams - completedExams,
        averageScore: Math.round(averageScore),
        averageTime: Math.round(averageTime / 60), // Convert to minutes
        totalViolations,
        recentSubmissions: results.slice(0, 10),
        violations: violations.slice(0, 10),
        examStats: exams,
        scoreDistribution: Object.entries(scoreRanges).map(([range, count]) => ({
          range,
          count
        })),
        timeDistribution: Object.entries(timeRanges).map(([range, count]) => ({
          range,
          count
        }))
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <Container>
      <Header>
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive overview of exam performance and student activity</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#3b82f6' }}>
              <FiUsers />
            </div>
            <div className="trend positive">
              <FiTrendingUp />
              +12%
            </div>
          </div>
          <div className="stat-value">{analytics.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#10b981' }}>
              <FiCheckCircle />
            </div>
            <div className="trend positive">
              <FiTrendingUp />
              +8%
            </div>
          </div>
          <div className="stat-value">{analytics.completedExams}</div>
          <div className="stat-label">Completed Exams</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#f59e0b' }}>
              <FiBarChart2 />
            </div>
            <div className="trend positive">
              <FiTrendingUp />
              +5%
            </div>
          </div>
          <div className="stat-value">{analytics.averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#ef4444' }}>
              <FiAlertTriangle />
            </div>
            <div className="trend negative">
              <FiTrendingDown />
              -3%
            </div>
          </div>
          <div className="stat-value">{analytics.totalViolations}</div>
          <div className="stat-label">Tab Switch Violations</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#06b6d4' }}>
              <FiClock />
            </div>
            <div className="trend positive">
              <FiTrendingUp />
              +2%
            </div>
          </div>
          <div className="stat-value">{formatTime(analytics.averageTime)}</div>
          <div className="stat-label">Average Time</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#8b5cf6' }}>
              <FiCalendar />
            </div>
            <div className="trend positive">
              <FiTrendingUp />
              +15%
            </div>
          </div>
          <div className="stat-value">{analytics.totalExams}</div>
          <div className="stat-label">Total Exams</div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <h3>
            <FiBarChart2 />
            Score Distribution
          </h3>
          <Doughnut
            data={{
              labels: analytics.scoreDistribution.map(item => item.range),
              datasets: [
                {
                  data: analytics.scoreDistribution.map(item => item.count),
                  backgroundColor: [
                    '#48bb78',
                    '#38a169',
                    '#ed8936',
                    '#dd6b20',
                    '#f56565',
                    '#e53e3e'
                  ],
                  borderWidth: 2,
                  borderColor: '#fff'
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </ChartCard>

        <ChartCard>
          <h3>
            <FiClock />
            Time Distribution
          </h3>
          <Bar
            data={{
              labels: analytics.timeDistribution.map(item => item.range),
              datasets: [
                {
                  label: 'Number of Students',
                  data: analytics.timeDistribution.map(item => item.count),
                  backgroundColor: 'rgba(102, 126, 234, 0.8)',
                  borderColor: 'rgba(102, 126, 234, 1)',
                  borderWidth: 1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </ChartCard>
      </ChartsGrid>

      <RecentSubmissions>
        <h3>
          <FiCheckCircle />
          Recent Submissions
        </h3>
        <SubmissionTable>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Time Taken</th>
              <th>Tab Switches</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {analytics.recentSubmissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.userName || submission.userEmail}</td>
                <td>{submission.examTitle}</td>
                <td>
                  <strong>{submission.percentage}%</strong>
                  <br />
                  <small>({submission.correctAnswers}/{submission.totalQuestions})</small>
                </td>
                <td>{formatTime(submission.duration)}</td>
                <td>
                  <span style={{ color: submission.tabSwitches > 0 ? '#e53e3e' : '#38a169' }}>
                    {submission.tabSwitches}
                  </span>
                </td>
                <td>
                  <StatusBadge className="completed">
                    Completed
                  </StatusBadge>
                </td>
                <td>{formatDate(submission.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </SubmissionTable>
      </RecentSubmissions>

      <ViolationsTable>
        <h3>
          <FiAlertTriangle />
          Recent Tab Switch Violations
        </h3>
        {analytics.violations.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
            No violations recorded
          </p>
        ) : (
          analytics.violations.map((violation) => (
            <ViolationCard key={violation.id}>
              <div className="violation-header">
                <div className="user-info">
                  {violation.userEmail}
                </div>
                <div className="timestamp">
                  {formatDate(violation.timestamp)}
                </div>
              </div>
              <div className="violation-details">
                <strong>Exam ID:</strong> {violation.examId}
                <br />
                <strong>Violation Type:</strong> Tab Switch
              </div>
            </ViolationCard>
          ))
        )}
      </ViolationsTable>
    </Container>
  );
};

export default Analytics;
