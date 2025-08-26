import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiAlertTriangle,
  FiBarChart2,
  FiArrowLeft,
  FiDownload
} from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
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

const ResultCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const ScoreSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  .score-circle {
    width: 200px;
    height: 200px;
    margin: 0 auto 1rem;
    position: relative;
    
    .score-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      
      .percentage {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1a202c;
        margin: 0;
      }
      
      .label {
        color: #718096;
        font-size: 0.875rem;
        margin: 0;
      }
    }
  }
  
  .exam-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }
  
  .exam-subtitle {
    color: #718096;
    margin-bottom: 1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  
  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    
    &.correct {
      color: #48bb78;
    }
    
    &.incorrect {
      color: #f56565;
    }
    
    &.time {
      color: #4299e1;
    }
    
    &.violation {
      color: #ed8936;
    }
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #718096;
    font-size: 0.875rem;
  }
`;

const QuestionReview = styled.div`
  margin-top: 2rem;
  
  h3 {
    margin: 0 0 1.5rem 0;
    color: #1a202c;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const QuestionItem = styled.div`
  background: ${props => props.correct ? '#f0fff4' : '#fef5e7'};
  border: 1px solid ${props => props.correct ? '#c6f6d5' : '#fed7aa'};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    .question-number {
      font-weight: 600;
      color: #1a202c;
    }
    
    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      
      &.correct {
        color: #38a169;
      }
      
      &.incorrect {
        color: #d69e2e;
      }
    }
  }
  
  .question-text {
    color: #2d3748;
    margin-bottom: 1rem;
    font-weight: 500;
  }
  
  .options {
    display: grid;
    gap: 0.5rem;
  }
  
  .option {
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &.selected {
      background: #e6fffa;
      border-color: #81e6d9;
    }
    
    &.correct {
      background: #f0fff4;
      border-color: #9ae6b4;
    }
    
    &.incorrect {
      background: #fed7d7;
      border-color: #feb2b2;
    }
  }
`;

const ViolationSection = styled.div`
  background: #fef5e7;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #d69e2e;
    font-size: 1.125rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .violation-details {
    color: #744210;
    font-size: 0.875rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
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
`;

const ExamResult = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const [result, setResult] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const resultId = urlParams.get('resultId');
  const isAdminView = urlParams.get('admin') === 'true' || userRole === 'admin';

  useEffect(() => {
    fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    try {
      console.log('Fetching result with params:', { examId, resultId, isAdminView, userRole });
      let resultData;
      
      if (isAdminView && resultId) {
        // Admin viewing specific result
        console.log('Admin viewing specific result:', resultId);
        const resultDoc = await getDoc(doc(db, 'examResults', resultId));
        if (resultDoc.exists()) {
          resultData = resultDoc.data();
          console.log('Admin result data:', resultData);
          setResult(resultData);
        } else {
          console.log('Result document not found');
        }
      } else if (isAdminView && !resultId) {
        // Admin viewing without specific result - show first result for this exam
        console.log('Admin viewing without specific result - fetching first result for exam');
        const resultsQuery = query(
          collection(db, 'examResults'),
          where('examId', '==', examId)
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        
        if (!resultsSnapshot.empty) {
          resultData = resultsSnapshot.docs[0].data();
          console.log('Admin viewing first result:', resultData);
          setResult(resultData);
        } else {
          console.log('No results found for this exam');
        }
      } else {
        // Student viewing their own result
        console.log('Student viewing own result');
        const resultsQuery = query(
          collection(db, 'examResults'),
          where('examId', '==', examId),
          where('userId', '==', currentUser.uid)
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        
        if (!resultsSnapshot.empty) {
          resultData = resultsSnapshot.docs[0].data();
          console.log('Student result data:', resultData);
          setResult(resultData);
        } else {
          console.log('No results found for student');
        }
      }
      
      // Fetch exam details
      if (resultData) {
        const examDoc = await getDoc(doc(db, 'exams', examId));
        if (examDoc.exists()) {
          const examData = examDoc.data();
          console.log('Exam data:', examData);
          setExam(examData);
        }
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return '#48bb78';
    if (percentage >= 80) return '#38a169';
    if (percentage >= 70) return '#ed8936';
    if (percentage >= 60) return '#dd6b20';
    return '#f56565';
  };

  const downloadResult = () => {
    if (!result || !exam) return;
    
    const resultText = `
Exam Result Report
==================

Exam: ${exam.title}
Student: ${result.userName || result.userEmail}
Date: ${formatDate(result.submittedAt)}

Score: ${result.percentage}% (${result.correctAnswers}/${result.totalQuestions})
Time Taken: ${formatTime(result.duration)}
Tab Switches: ${result.tabSwitches}

Detailed Results:
${exam.questions.map((question, index) => {
  const userAnswer = result.answers[index];
  const isCorrect = userAnswer === question.correctAnswer;
  return `
Question ${index + 1}: ${isCorrect ? '✓' : '✗'}
${question.question}
Your Answer: ${question.options[userAnswer] || 'Not answered'}
${(result.answersApproved || isAdminView) ? `Correct Answer: ${question.options[question.correctAnswer]}` : 'Correct Answer: Not yet available'}
`;
}).join('\n')}
    `;
    
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-result-${exam.title}-${result.userName}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return <div>Loading result...</div>;
  }

  if (!result) {
    return (
      <Container>
        <Header>
          <button className="back-button" onClick={() => navigate(isAdminView ? '/schedule' : '/my-exams')}>
            <FiArrowLeft />
          </button>
          <h1>Result Not Found</h1>
        </Header>
        <ResultCard>
          <p>No result found for this exam. Please check if you have completed the exam.</p>
          <Button className="primary" onClick={() => navigate(isAdminView ? '/schedule' : '/my-exams')}>
            {isAdminView ? 'Back to Schedule' : 'Back to My Exams'}
          </Button>
        </ResultCard>
      </Container>
    );
  }

  // Check if score is approved (skip for admin viewing)
  console.log('Approval check:', { scoreApproved: result.scoreApproved, isAdminView, userRole });
  if (!result.scoreApproved && !isAdminView) {
    return (
      <Container>
        <Header>
          <button className="back-button" onClick={() => navigate(isAdminView ? '/schedule' : '/my-exams')}>
            <FiArrowLeft />
          </button>
          <h1>Result Pending Approval</h1>
        </Header>
        <ResultCard>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FiClock style={{ fontSize: '3rem', marginBottom: '1rem', color: '#d69e2e' }} />
            <h3>Results Not Yet Available</h3>
            <p>Your exam results are currently being reviewed by your instructor. You will be able to view your results once they are approved.</p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#718096' }}>
              Exam completed on: {formatDate(result.submittedAt)}
            </p>
          </div>
          <Button className="primary" onClick={() => navigate(isAdminView ? '/schedule' : '/my-exams')}>
            {isAdminView ? 'Back to Schedule' : 'Back to My Exams'}
          </Button>
        </ResultCard>
      </Container>
    );
  }

  const scoreColor = getScoreColor(result.percentage);

  return (
    <Container>
      {/* Debug Panel - Remove this in production */}
      {userRole === 'admin' && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <strong>Debug Info:</strong><br/>
          User Role: {userRole}<br/>
          Is Admin View: {isAdminView ? 'Yes' : 'No'}<br/>
          Result ID: {resultId || 'None'}<br/>
          Score Approved: {result?.scoreApproved ? 'Yes' : 'No'}<br/>
          Answers Approved: {result?.answersApproved ? 'Yes' : 'No'}<br/>
          URL: {window.location.href}
        </div>
      )}
      
      <Header>
        <button className="back-button" onClick={() => navigate(isAdminView ? '/schedule' : '/my-exams')}>
          <FiArrowLeft />
        </button>
        <h1>Exam Result {isAdminView && <span style={{ fontSize: '1rem', color: '#667eea', fontWeight: 'normal' }}>(Admin View)</span>}</h1>
      </Header>

      <ResultCard>
        <ScoreSection>
          <div className="score-circle">
            <Doughnut
              data={{
                labels: ['Score', 'Remaining'],
                datasets: [
                  {
                    data: [result.percentage, 100 - result.percentage],
                    backgroundColor: [scoreColor, '#e2e8f0'],
                    borderWidth: 0
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                cutout: '70%'
              }}
            />
            <div className="score-text">
              <div className="percentage">{result.percentage}%</div>
              <div className="label">Score</div>
            </div>
          </div>
          
          <div className="exam-title">{exam?.title}</div>
          <div className="exam-subtitle">Completed on {formatDate(result.submittedAt)}</div>
        </ScoreSection>

        <StatsGrid>
          <StatCard>
            <div className="stat-icon correct">
              <FiCheckCircle />
            </div>
            <div className="stat-value">{result.correctAnswers}</div>
            <div className="stat-label">Correct Answers</div>
          </StatCard>

          <StatCard>
            <div className="stat-icon incorrect">
              <FiXCircle />
            </div>
            <div className="stat-value">{result.totalQuestions - result.correctAnswers}</div>
            <div className="stat-label">Incorrect Answers</div>
          </StatCard>

          <StatCard>
            <div className="stat-icon time">
              <FiClock />
            </div>
            <div className="stat-value">{formatTime(result.duration)}</div>
            <div className="stat-label">Time Taken</div>
          </StatCard>

          <StatCard>
            <div className="stat-icon violation">
              <FiAlertTriangle />
            </div>
            <div className="stat-value">{result.tabSwitches}</div>
            <div className="stat-label">Tab Switches</div>
          </StatCard>
        </StatsGrid>

        {result.tabSwitches > 0 && (
          <ViolationSection>
            <h3>
              <FiAlertTriangle />
              Tab Switch Violations Detected
            </h3>
            <div className="violation-details">
              You switched tabs {result.tabSwitches} time(s) during this exam. 
              This information has been recorded and may be reviewed by your instructor.
            </div>
          </ViolationSection>
        )}

        <QuestionReview>
          <h3>
            <FiBarChart2 />
            Question Review
          </h3>
          
          {console.log('Answers approval check:', { answersApproved: result.answersApproved, isAdminView })}
          {!result.answersApproved && !isAdminView && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              background: '#fef5e7', 
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <FiClock style={{ fontSize: '2rem', marginBottom: '1rem', color: '#d69e2e' }} />
              <h4>Correct Answers Pending Approval</h4>
              <p>Your answers are shown below, but correct answers will be displayed once they are approved by your instructor.</p>
            </div>
          )}
          
          {isAdminView && (
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              background: '#e6fffa', 
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid #81e6d9'
            }}>
              <h4 style={{ color: '#2c7a7b', margin: '0 0 0.5rem 0' }}>Admin View</h4>
              <p style={{ color: '#2c7a7b', margin: 0, fontSize: '0.875rem' }}>
                You are viewing this result as an administrator. All answers and scores are visible.
              </p>
            </div>
          )}
          
          {exam?.questions.map((question, index) => {
            const userAnswer = result.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <QuestionItem key={index} correct={isCorrect}>
                <div className="question-header">
                  <div className="question-number">Question {index + 1}</div>
                  <div className={`status ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? (
                      <>
                        <FiCheckCircle />
                        Correct
                      </>
                    ) : (
                      <>
                        <FiXCircle />
                        Incorrect
                      </>
                    )}
                  </div>
                </div>
                
                <div className="question-text">{question.question}</div>
                
                <div className="options">
                  {question.options.map((option, optionIndex) => {
                    let optionClass = 'option';
                    if (optionIndex === userAnswer) {
                      optionClass += ' selected';
                    }
                    // Show correct answers if approved or if admin is viewing
                    if ((result.answersApproved || isAdminView) && optionIndex === question.correctAnswer) {
                      optionClass += ' correct';
                    } else if (optionIndex === userAnswer && !isCorrect) {
                      optionClass += ' incorrect';
                    }
                    
                    return (
                      <div key={optionIndex} className={optionClass}>
                        {optionIndex === userAnswer && <FiCheckCircle />}
                        {(result.answersApproved || isAdminView) && optionIndex === question.correctAnswer && optionIndex !== userAnswer && <FiCheckCircle />}
                        {optionIndex === userAnswer && !isCorrect && <FiXCircle />}
                        {option}
                      </div>
                    );
                  })}
                </div>
              </QuestionItem>
            );
          })}
        </QuestionReview>

        <ActionButtons>
          <Button className="secondary" onClick={() => navigate(isAdminView ? '/schedule' : '/my-exams')}>
            {isAdminView ? 'Back to Schedule' : 'Back to My Exams'}
          </Button>
          <Button className="primary" onClick={downloadResult}>
            <FiDownload />
            Download Result
          </Button>
        </ActionButtons>
      </ResultCard>
    </Container>
  );
};

export default ExamResult;
