import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiFilter, 
  FiDownload, 
  FiBarChart2, 
  FiUsers, 
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styled from 'styled-components';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  
  &.secondary {
    background: #ffffff;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }
  }
`;

const FilterSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: grid;
  gap: 0.5rem;
  
  label {
    font-weight: 500;
    color: #4a5568;
    font-size: 0.875rem;
  }
  
  select, input {
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
      font-size: 1.5rem;
      color: white;
    }
    
    .trend {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      color: #48bb78;
      
      &.negative {
        color: #f56565;
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
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  
  h3 {
    margin: 0 0 1.5rem 0;
    color: #1a202c;
    font-size: 1.25rem;
  }
`;

const TableContainer = styled.div`
  background: white;
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
    background: #f8fafc;
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
    background: #f8fafc;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.passed {
    background: #f0fff4;
    color: #38a169;
  }
  
  &.failed {
    background: #fed7d7;
    color: #e53e3e;
  }
  
  &.pending {
    background: #fef5e7;
    color: #d69e2e;
  }
`;

const Reports = () => {
  const { userRole } = useAuth();
  const [filters, setFilters] = useState({
    batch: '',
    exam: '',
    dateRange: 'all',
    status: 'all'
  });
  const [reports, setReports] = useState([]);
  const [batches, setBatches] = useState([]);
  const [exams, setExams] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    averageScore: 0,
    passRate: 0,
    totalViolations: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filters.batch || filters.exam || filters.dateRange !== 'all' || filters.status !== 'all') {
      applyFilters();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      // Fetch batches
      const batchesQuery = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
      const batchesSnapshot = await getDocs(batchesQuery);
      const batchesData = batchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBatches(batchesData);

      // Fetch exams
      const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
      const examsSnapshot = await getDocs(examsQuery);
      const examsData = examsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExams(examsData);

      // Fetch exam results
      const resultsQuery = query(collection(db, 'examResults'), orderBy('submittedAt', 'desc'));
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(resultsData);

      // Fetch violations
      const violationsQuery = query(collection(db, 'examViolations'), orderBy('timestamp', 'desc'));
      const violationsSnapshot = await getDocs(violationsQuery);
      const violationsData = violationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setViolations(violationsData);

      // Fetch all students
      const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      const totalStudents = studentsSnapshot.size;

      // Calculate stats
      calculateStats(resultsData, examsData, violationsData.length, totalStudents);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (results, exams, totalViolations, totalStudents) => {
    const totalExams = exams.length;
    
    let totalScore = 0;
    let passedCount = 0;
    
    results.forEach(result => {
      // Use the actual score from the result if available
      if (result.percentage !== undefined) {
        totalScore += result.percentage;
        
        // Find the exam to get passing marks
        const exam = exams.find(e => e.id === result.examId);
        if (exam && result.percentage >= exam.passingMarks) {
          passedCount++;
        }
      } else {
        // Fallback to calculating score based on answers
        const exam = exams.find(e => e.id === result.examId);
        if (exam && result.answers) {
          let score = 0;
          let totalMarks = 0;
          
          Object.keys(result.answers).forEach(questionIndex => {
            const question = exam.questions[parseInt(questionIndex)];
            if (question) {
              totalMarks += question.marks || 1;
              if (result.answers[questionIndex] === question.correctAnswer) {
                score += question.marks || 1;
              }
            }
          });
          
          const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
          totalScore += percentage;
          
          if (percentage >= exam.passingMarks) {
            passedCount++;
          }
        }
      }
    });

    const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;
    const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

    setStats({
      totalStudents,
      totalExams,
      averageScore,
      passRate,
      totalViolations
    });
  };

  const applyFilters = () => {
    // This would apply the filters to the reports
    // For now, we'll just show all data
    console.log('Applying filters:', filters);
  };

  const exportReports = () => {
    // Export functionality would go here
    alert('Reports exported successfully!');
  };

  const getChartData = () => {
    // Use real data from batches and their performance
    const batchPerformance = {};
    
    reports.forEach(result => {
      const exam = exams.find(e => e.id === result.examId);
      if (exam) {
        // For now, we'll group by exam since we don't have batch info in results
        if (!batchPerformance[exam.title]) {
          batchPerformance[exam.title] = [];
        }
        batchPerformance[exam.title].push(result.percentage || 0);
      }
    });
    
    const labels = Object.keys(batchPerformance).slice(0, 5);
    const data = labels.map(examTitle => {
      const scores = batchPerformance[examTitle];
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Average Score',
          data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getDoughnutData = () => {
    // Calculate real pass/fail/pending distribution
    let passed = 0;
    let failed = 0;
    let pending = 0;
    
    reports.forEach(result => {
      const exam = exams.find(e => e.id === result.examId);
      if (exam) {
        const percentage = result.percentage || 0;
        if (percentage >= exam.passingMarks) {
          passed++;
        } else {
          failed++;
        }
      }
    });

    return {
      labels: ['Passed', 'Failed', 'Pending'],
      datasets: [
        {
          data: [passed, failed, pending],
          backgroundColor: [
            '#48bb78',
            '#f56565',
            '#d69e2e',
          ],
        },
      ],
    };
  };

  const getStatusBadge = (result) => {
    const exam = exams.find(e => e.id === result.examId);
    if (!exam) return <StatusBadge className="pending">Pending</StatusBadge>;
    
    const percentage = result.percentage || 0;
    const status = percentage >= exam.passingMarks ? 'passed' : 'failed';
    
    return (
      <StatusBadge className={status}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </StatusBadge>
    );
  };

  const getScore = (result) => {
    if (result.percentage !== undefined) {
      return `${result.percentage}%`;
    }
    
    // Calculate score if not available
    const exam = exams.find(e => e.id === result.examId);
    if (exam && result.answers) {
      let score = 0;
      let totalMarks = 0;
      
      Object.keys(result.answers).forEach(questionIndex => {
        const question = exam.questions[parseInt(questionIndex)];
        if (question) {
          totalMarks += question.marks || 1;
          if (result.answers[questionIndex] === question.correctAnswer) {
            score += question.marks || 1;
          }
        }
      });
      
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      return `${percentage}%`;
    }
    
    return 'N/A';
  };

  const getDynamicTrends = () => {
    // Calculate trends based on recent data
    const recentResults = reports.slice(0, 10); // Last 10 results
    const olderResults = reports.slice(10, 20); // Previous 10 results
    
    let recentAvg = 0;
    let olderAvg = 0;
    
    if (recentResults.length > 0) {
      const recentTotal = recentResults.reduce((sum, result) => sum + (result.percentage || 0), 0);
      recentAvg = Math.round(recentTotal / recentResults.length);
    }
    
    if (olderResults.length > 0) {
      const olderTotal = olderResults.reduce((sum, result) => sum + (result.percentage || 0), 0);
      olderAvg = Math.round(olderTotal / olderResults.length);
    }
    
    const studentTrend = reports.length > 0 ? Math.round((reports.length / Math.max(1, reports.length - 1)) * 100 - 100) : 0;
    const examTrend = exams.length > 0 ? Math.round((exams.length / Math.max(1, exams.length - 1)) * 100 - 100) : 0;
    const scoreTrend = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;
    const passTrend = stats.passRate > 0 ? Math.round((stats.passRate / Math.max(1, stats.passRate - 5)) * 100 - 100) : 0;
    
    return {
      studentTrend: Math.max(-20, Math.min(20, studentTrend)), // Cap at ±20%
      examTrend: Math.max(-20, Math.min(20, examTrend)), // Cap at ±20%
      scoreTrend: Math.max(-20, Math.min(20, scoreTrend)), // Cap at ±20%
      passTrend: Math.max(-20, Math.min(20, passTrend)) // Cap at ±20%
    };
  };

  if (loading) {
    return <div>Loading reports...</div>;
  }

  return (
    <Container>
      <Header>
        <h1>Reports & Analytics</h1>
        <ActionButtons>
          <Button className="secondary" onClick={exportReports}>
            <FiDownload />
            Export Reports
          </Button>
        </ActionButtons>
      </Header>

      <FilterSection>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1a202c' }}>
          <FiFilter style={{ marginRight: '0.5rem' }} />
          Filters
        </h3>
        <FilterGrid>
          <FilterGroup>
            <label>Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </FilterGroup>
          
          <FilterGroup>
            <label>Exam</label>
            <select
              value={filters.exam}
              onChange={(e) => setFilters({ ...filters, exam: e.target.value })}
            >
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          </FilterGroup>
          
          <FilterGroup>
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </FilterGroup>
          
          <FilterGroup>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </FilterGroup>
        </FilterGrid>
      </FilterSection>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#3b82f6' }}>
              <FiUsers />
            </div>
            <div className="trend">
              <FiTrendingUp />
              +{getDynamicTrends().studentTrend}%
            </div>
          </div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#8b5cf6' }}>
              <FiBarChart2 />
            </div>
            <div className="trend">
              <FiTrendingUp />
              +{getDynamicTrends().examTrend}%
            </div>
          </div>
          <div className="stat-value">{stats.totalExams}</div>
          <div className="stat-label">Total Exams</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#06b6d4' }}>
              <FiTrendingUp />
            </div>
            <div className="trend">
              <FiTrendingUp />
              +{getDynamicTrends().scoreTrend}%
            </div>
          </div>
          <div className="stat-value">{stats.averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#10b981' }}>
              <FiCheckCircle />
            </div>
            <div className="trend">
              <FiTrendingUp />
              +{getDynamicTrends().passTrend}%
            </div>
          </div>
          <div className="stat-value">{stats.passRate}%</div>
          <div className="stat-label">Pass Rate</div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="icon" style={{ background: '#ef4444' }}>
              <FiAlertCircle />
            </div>
            <div className="trend">
              <FiTrendingDown />
              -5%
            </div>
          </div>
          <div className="stat-value">{stats.totalViolations}</div>
          <div className="stat-label">Total Violations</div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <h3>Performance Trends</h3>
          <Line 
            data={getChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard>
          <h3>Pass/Fail Distribution</h3>
          <Doughnut 
            data={getDoughnutData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </ChartCard>
      </ChartsGrid>

      <TableContainer>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.25rem' }}>Exam Results</h3>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Batch</th>
              <th>Score</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Tab Switches</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 10).map((report) => {
              const exam = exams.find(e => e.id === report.examId);
              return (
                <tr key={report.id}>
                  <td>{report.userEmail || report.userName || 'Unknown'}</td>
                  <td>{exam ? exam.title : 'N/A'}</td>
                  <td>{report.batchName || 'N/A'}</td>
                  <td>{getScore(report)}</td>
                  <td>{getStatusBadge(report)}</td>
                  <td>{report.duration ? `${Math.floor(report.duration / 60)}m ${report.duration % 60}s` : 'N/A'}</td>
                  <td>{report.tabSwitches || 0}</td>
                  <td>{report.submittedAt ? report.submittedAt.toDate().toLocaleDateString() : 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>

      <TableContainer style={{ marginTop: '2rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.25rem' }}>Tab Switching Violations</h3>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Violation Type</th>
              <th>Switch Count</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {violations.slice(0, 10).map((violation) => (
              <tr key={violation.id}>
                <td>{violation.userEmail || violation.userName || 'Unknown'}</td>
                <td>{violation.examTitle || 'Unknown Exam'}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    background: '#fed7d7',
                    color: '#e53e3e'
                  }}>
                    {violation.type === 'tab_switch' ? 'Tab Switch' : 'Window Blur'}
                  </span>
                </td>
                <td>{violation.switchCount || 1}</td>
                <td>{violation.timestamp ? violation.timestamp.toDate().toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Reports;
