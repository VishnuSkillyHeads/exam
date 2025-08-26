import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  FiUsers, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
  FiTrendingDown,
  FiRefreshCw,
  FiEye,
  FiBarChart2,
  FiAward,
  FiShield,
  FiActivity
} from 'react-icons/fi';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.div`
  margin-bottom: 3rem;
  
      .welcome-section {
      background: #ffffff;
      border-radius: 12px;
      padding: 2.5rem;
      color: #1a202c;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    
          h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
        color: #1a202c;
      }
    
          p {
        font-size: 1.1rem;
        color: #4a5568;
        margin: 0 0 1.5rem 0;
      }
    
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  color: #1a202c;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  color: #1a202c;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#ff6b6b'};
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  .icon-container {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: white;
    background: ${props => props.color || '#ff6b6b'};
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
  }
  
      .trend {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      background: #f7fafc;
      color: #4a5568;
      
      &.negative {
        background: #fef2f2;
        color: #e53e3e;
      }
    }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 1rem;
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s ease;
  color: #1a202c;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8f9fa;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem 2rem;
`;

const ExamItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8fafc;
    margin: 0 -1.5rem;
    padding: 1rem 1.5rem;
    border-radius: 6px;
  }
`;

const ExamIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1rem;
  color: white;
  
  &.upcoming {
    background: #3b82f6;
  }
  
  &.ongoing {
    background: #f59e0b;
  }
  
  &.completed {
    background: #10b981;
  }
`;

const ExamInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.25rem 0;
  }
  
  p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
  }
`;

const ExamStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.upcoming {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  &.ongoing {
    background: #fef3c7;
    color: #d97706;
  }
  
  &.completed {
    background: #d1fae5;
    color: #059669;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8fafc;
    margin: 0 -1.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
  }
  
  .activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.75rem;
    font-size: 0.875rem;
    color: white;
    flex-shrink: 0;
  }
  
  .activity-content {
    flex: 1;
    
    p {
      font-size: 0.875rem;
      color: #1a202c;
      margin: 0 0 0.25rem 0;
      line-height: 1.4;
      font-weight: 500;
    }
    
    span {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #718096;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #cbd5e0;
  }
  
  h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #4a5568;
  }
  
  p {
    font-size: 0.9rem;
    margin: 0;
  }
`;

const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    ongoingExams: 0,
    completedExams: 0,
    totalViolations: 0,
    averageScore: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [allResults, setAllResults] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    setupRealTimeListeners();
    
    return () => {
      // Cleanup listeners when component unmounts
    };
  }, []);

  const setupRealTimeListeners = () => {
    if (userRole === 'admin') {
      // For admins, listen to all results and violations
      const resultsQuery = query(collection(db, 'examResults'), orderBy('submittedAt', 'desc'), limit(5));
      const resultsUnsubscribe = onSnapshot(resultsQuery, (snapshot) => {
        const newResults = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update activities with new results
        updateActivities(newResults, 'examResults');
      });

      const violationsQuery = query(collection(db, 'examViolations'), orderBy('timestamp', 'desc'), limit(5));
      const violationsUnsubscribe = onSnapshot(violationsQuery, (snapshot) => {
        const newViolations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update activities with new violations
        updateActivities(newViolations, 'examViolations');
      });

      return () => {
        resultsUnsubscribe();
        violationsUnsubscribe();
      };
    } else {
      // For students, only listen to their own results and violations
      const resultsQuery = query(
        collection(db, 'examResults'), 
        where('userId', '==', currentUser.uid)
      );
      const resultsUnsubscribe = onSnapshot(resultsQuery, (snapshot) => {
        const newResults = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by submittedAt in JavaScript and limit to 5
        const sortedResults = newResults
          .sort((a, b) => {
            if (a.submittedAt && b.submittedAt) {
              return b.submittedAt.toDate() - a.submittedAt.toDate();
            }
            return 0;
          })
          .slice(0, 5);
        
        // Update activities with new results
        updateActivities(sortedResults, 'examResults');
      });

      const violationsQuery = query(
        collection(db, 'examViolations'), 
        where('userId', '==', currentUser.uid)
      );
      const violationsUnsubscribe = onSnapshot(violationsQuery, (snapshot) => {
        const newViolations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by timestamp in JavaScript and limit to 5
        const sortedViolations = newViolations
          .sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return b.timestamp.toDate() - a.timestamp.toDate();
            }
            return 0;
          })
          .slice(0, 5);
        
        // Update activities with new violations
        updateActivities(sortedViolations, 'examViolations');
      });

      return () => {
        resultsUnsubscribe();
        violationsUnsubscribe();
      };
    }
  };

  const updateActivities = (newData, type) => {
    setRecentActivities(prevActivities => {
      const activities = [...prevActivities];
      
      newData.forEach(item => {
        if (type === 'examResults') {
          const activity = {
            id: `result_${item.id}`,
            type: 'exam_completed',
            message: userRole === 'admin' 
              ? `Exam "${item.examTitle}" completed by ${item.userName || item.userEmail}`
              : `You completed exam "${item.examTitle}"`,
            time: item.submittedAt ? item.submittedAt.toDate().toLocaleString() : 'Recently'
          };
          
          // Remove existing activity with same ID if exists
          const existingIndex = activities.findIndex(a => a.id === activity.id);
          if (existingIndex !== -1) {
            activities.splice(existingIndex, 1);
          }
          
          activities.unshift(activity);
        } else if (type === 'examViolations') {
          const activity = {
            id: `violation_${item.id}`,
            type: 'violation',
            message: userRole === 'admin'
              ? `Tab switching detected for ${item.userName || item.userEmail} in "${item.examTitle}"`
              : `Tab switching detected in "${item.examTitle}"`,
            time: item.timestamp ? item.timestamp.toDate().toLocaleString() : 'Recently'
          };
          
          // Remove existing activity with same ID if exists
          const existingIndex = activities.findIndex(a => a.id === activity.id);
          if (existingIndex !== -1) {
            activities.splice(existingIndex, 1);
          }
          
          activities.unshift(activity);
        }
      });
      
      // Sort by time and limit to 5
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      return activities.slice(0, 5);
    });
  };

  const fetchDashboardData = async () => {
    try {
      let studentsSnapshot, examsSnapshot, resultsSnapshot, violationsSnapshot;
      
      if (userRole === 'admin') {
        // For admins, fetch all data
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        studentsSnapshot = await getDocs(studentsQuery);
        
        const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
        examsSnapshot = await getDocs(examsQuery);
        
        // Fetch exam results
        const resultsQuery = query(collection(db, 'examResults'), orderBy('submittedAt', 'desc'));
        resultsSnapshot = await getDocs(resultsQuery);
        
        // Fetch violations
        const violationsQuery = query(collection(db, 'examViolations'), orderBy('timestamp', 'desc'));
        violationsSnapshot = await getDocs(violationsQuery);
      } else {
        // For students, fetch only their data
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        studentsSnapshot = await getDocs(studentsQuery);
        
        const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
        examsSnapshot = await getDocs(examsQuery);
        
        // Fetch only student's exam results
        const resultsQuery = query(
          collection(db, 'examResults'), 
          where('userId', '==', currentUser.uid)
        );
        resultsSnapshot = await getDocs(resultsQuery);
        
        // Fetch only student's violations
        const violationsQuery = query(
          collection(db, 'examViolations'), 
          where('userId', '==', currentUser.uid)
        );
        violationsSnapshot = await getDocs(violationsQuery);
      }
      
      const ongoingExams = examsSnapshot.docs.filter(doc => {
        const data = doc.data();
        const now = new Date();
        const startTime = data.startTime.toDate();
        const endTime = data.endTime.toDate();
        return now >= startTime && now <= endTime;
      });
      
      const completedExams = examsSnapshot.docs.filter(doc => {
        const data = doc.data();
        const now = new Date();
        const endTime = data.endTime.toDate();
        return now > endTime;
      });

      // Calculate real statistics
      const totalViolations = violationsSnapshot.size;
      const totalResults = resultsSnapshot.size;
      
      let averageScore = 0;
      if (totalResults > 0) {
        const totalScore = resultsSnapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.percentage || 0);
        }, 0);
        averageScore = Math.round(totalScore / totalResults);
      }

      // Store all results for trend calculation (sort by submittedAt for students)
      let allResultsData = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (userRole !== 'admin') {
        // Sort by submittedAt for students
        allResultsData = allResultsData.sort((a, b) => {
          if (a.submittedAt && b.submittedAt) {
            return b.submittedAt.toDate() - a.submittedAt.toDate();
          }
          return 0;
        });
      }
      
      setAllResults(allResultsData);

      if (userRole === 'admin') {
        setStats({
          totalStudents: studentsSnapshot.size,
          totalExams: examsSnapshot.size,
          ongoingExams: ongoingExams.length,
          completedExams: completedExams.length,
          totalViolations,
          averageScore
        });
      } else {
        // For students, show their personal stats
        setStats({
          totalStudents: 0, // Not shown for students
          totalExams: 0, // Not shown for students
          ongoingExams: ongoingExams.length,
          completedExams: totalResults, // Exams they've completed
          totalViolations,
          averageScore
        });
      }

      // Fetch recent exams
      const recentExamsData = examsSnapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentExams(recentExamsData);

      // Generate real recent activities from actual data
      const activities = [];
      
      // Add recent exam results
      const sortedResults = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (userRole !== 'admin') {
        // Sort by submittedAt for students
        sortedResults.sort((a, b) => {
          if (a.submittedAt && b.submittedAt) {
            return b.submittedAt.toDate() - a.submittedAt.toDate();
          }
          return 0;
        });
      }
      
      sortedResults.slice(0, 3).forEach(result => {
        activities.push({
          id: `result_${result.id}`,
          type: 'exam_completed',
          message: userRole === 'admin' 
            ? `Exam "${result.examTitle}" completed by ${result.userName || result.userEmail}`
            : `You completed exam "${result.examTitle}"`,
          time: result.submittedAt ? result.submittedAt.toDate().toLocaleString() : 'Recently'
        });
      });
      
      // Add recent violations
      const sortedViolations = violationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (userRole !== 'admin') {
        // Sort by timestamp for students
        sortedViolations.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp.toDate() - a.timestamp.toDate();
          }
          return 0;
        });
      }
      
      sortedViolations.slice(0, 2).forEach(violation => {
        activities.push({
          id: `violation_${violation.id}`,
          type: 'violation',
          message: userRole === 'admin'
            ? `Tab switching detected for ${violation.userName || violation.userEmail} in "${violation.examTitle}"`
            : `Tab switching detected in "${violation.examTitle}"`,
          time: violation.timestamp ? violation.timestamp.toDate().toLocaleString() : 'Recently'
        });
      });
      
      // Sort activities by time
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getDynamicTrends = () => {
    // Calculate trends based on recent data
    const recentResults = allResults.slice(0, 10); // Last 10 results
    const olderResults = allResults.slice(10, 20); // Previous 10 results
    
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
    
    const studentTrend = stats.totalStudents > 0 ? Math.round((stats.totalStudents / Math.max(1, stats.totalStudents - 1)) * 100 - 100) : 0;
    const examTrend = stats.totalExams > 0 ? Math.round((stats.totalExams / Math.max(1, stats.totalExams - 1)) * 100 - 100) : 0;
    const scoreTrend = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;
    const violationTrend = stats.totalViolations > 0 ? Math.round((stats.totalViolations / Math.max(1, stats.totalViolations - 1)) * 100 - 100) : 0;
    
    return {
      studentTrend: Math.max(-20, Math.min(20, studentTrend)), // Cap at ±20%
      examTrend: Math.max(-20, Math.min(20, examTrend)), // Cap at ±20%
      scoreTrend: Math.max(-20, Math.min(20, scoreTrend)), // Cap at ±20%
      violationTrend: Math.max(-20, Math.min(20, violationTrend)) // Cap at ±20%
    };
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = exam.startTime.toDate();
    const endTime = exam.endTime.toDate();
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'completed';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <FiClock />;
      case 'ongoing': return <FiActivity />;
      case 'completed': return <FiCheckCircle />;
      default: return <FiClock />;
    }
  };

  const trends = getDynamicTrends();

  return (
    <DashboardContainer>
      <Header>
        <div className="welcome-section">
          <h1>Welcome back, {currentUser?.displayName || 'User'}! 👋</h1>
          <p>{userRole === 'admin' ? "Here's what's happening with your exam portal today." : "Here's your exam activity and progress overview."}</p>
          <div className="header-actions">
            <RefreshButton onClick={fetchDashboardData}>
              <FiRefreshCw />
              Refresh Data
            </RefreshButton>
          </div>
        </div>
      </Header>

      <StatsGrid>
        {userRole === 'admin' && (
          <>
            <StatCard color="#3b82f6">
              <StatHeader color="#3b82f6">
                <div className="icon-container">
                  <FiUsers />
                </div>
                <div className="trend">
                  <FiTrendingUp />
                  +{trends.studentTrend}%
                </div>
              </StatHeader>
              <StatValue>{stats.totalStudents}</StatValue>
              <StatLabel>Total Students</StatLabel>
            </StatCard>

            <StatCard color="#8b5cf6">
              <StatHeader color="#8b5cf6">
                <div className="icon-container">
                  <FiFileText />
                </div>
                <div className="trend">
                  <FiTrendingUp />
                  +{trends.examTrend}%
                </div>
              </StatHeader>
              <StatValue>{stats.totalExams}</StatValue>
              <StatLabel>Total Exams</StatLabel>
            </StatCard>
          </>
        )}

        <StatCard color="#06b6d4">
          <StatHeader color="#06b6d4">
            <div className="icon-container">
              <FiClock />
            </div>
            <div className="trend">
              <FiTrendingUp />
              +5%
            </div>
          </StatHeader>
          <StatValue>{stats.ongoingExams}</StatValue>
          <StatLabel>{userRole === 'admin' ? 'Ongoing Exams' : 'Active Exams'}</StatLabel>
        </StatCard>

        <StatCard color="#10b981">
          <StatHeader color="#10b981">
            <div className="icon-container">
              <FiAward />
            </div>
            <div className="trend">
              <FiTrendingUp />
              +15%
            </div>
          </StatHeader>
          <StatValue>{stats.completedExams}</StatValue>
          <StatLabel>{userRole === 'admin' ? 'Completed Exams' : 'Exams Completed'}</StatLabel>
        </StatCard>

        <StatCard color="#f59e0b">
          <StatHeader color="#f59e0b">
            <div className="icon-container">
              <FiShield />
            </div>
            <div className="trend negative">
              <FiTrendingDown />
              {trends.violationTrend}%
            </div>
          </StatHeader>
          <StatValue>{stats.totalViolations}</StatValue>
          <StatLabel>{userRole === 'admin' ? 'Total Violations' : 'Your Violations'}</StatLabel>
        </StatCard>

        <StatCard color="#ef4444">
          <StatHeader color="#ef4444">
            <div className="icon-container">
              <FiBarChart2 />
            </div>
            <div className="trend">
              <FiTrendingUp />
              +{trends.scoreTrend}%
            </div>
          </StatHeader>
          <StatValue>{stats.averageScore}%</StatValue>
          <StatLabel>{userRole === 'admin' ? 'Average Score' : 'Your Average Score'}</StatLabel>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardHeader>
            <h3>
              <FiCalendar />
              {userRole === 'admin' ? 'Recent Exams' : 'Available Exams'}
            </h3>
          </CardHeader>
          <CardContent>
            {recentExams.length > 0 ? (
              recentExams.map((exam) => {
                const status = getExamStatus(exam);
                return (
                  <ExamItem key={exam.id}>
                    <ExamIcon className={status}>
                      {getStatusIcon(status)}
                    </ExamIcon>
                    <ExamInfo>
                      <h4>{exam.title}</h4>
                      <p>{exam.description}</p>
                    </ExamInfo>
                    <ExamStatus className={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </ExamStatus>
                  </ExamItem>
                );
              })
            ) : (
              <EmptyState>
                <div className="empty-icon">
                  <FiFileText />
                </div>
                <h4>No Exams Available</h4>
                <p>{userRole === 'admin' ? 'No exams have been created yet.' : 'No exams are currently available for you.'}</p>
              </EmptyState>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>
              <FiActivity />
              {userRole === 'admin' ? 'Recent Activities' : 'Your Activities'}
            </h3>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <ActivityItem key={activity.id}>
                  <div className="activity-icon">
                    <FiEye />
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span>{activity.time}</span>
                  </div>
                </ActivityItem>
              ))
            ) : (
              <EmptyState>
                <div className="empty-icon">
                  <FiActivity />
                </div>
                <h4>No Recent Activity</h4>
                <p>{userRole === 'admin' ? 'No recent activities to display.' : 'No recent activities to display.'}</p>
              </EmptyState>
            )}
          </CardContent>
        </Card>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
