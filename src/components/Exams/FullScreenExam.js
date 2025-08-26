import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { FiClock, FiAlertTriangle, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import styled from 'styled-components';
import screenfull from 'screenfull';

const FullScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8fafc;
  z-index: 9999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ExamInfo = styled.div`
  h2 {
    margin: 0;
    color: #1a202c;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0.25rem 0 0 0;
    color: #718096;
    font-size: 0.875rem;
  }
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.warning ? '#fef5e7' : '#f0fff4'};
  color: ${props => props.warning ? '#d69e2e' : '#38a169'};
  border-radius: 8px;
  font-weight: 600;
  
  .time {
    font-size: 1.25rem;
  }
`;

const WarningBanner = styled.div`
  background: #fef5e7;
  color: #d69e2e;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #fed7aa;
  
  .warning-count {
    background: #d69e2e;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.875rem;
  }
`;

const TabSwitchIndicator = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e53e3e;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e53e3e;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .count {
    background: #e53e3e;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }
`;

const DebugPanel = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  z-index: 1000;
  max-width: 300px;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: #ff6b6b;
  }
  
  .debug-item {
    margin-bottom: 0.25rem;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem;
  overflow-y: auto;
`;

const QuestionNav = styled.div`
  h3 {
    margin: 0 0 1rem 0;
    color: #1a202c;
    font-size: 1.125rem;
  }
`;

const QuestionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const QuestionButton = styled.button`
  width: 40px;
  height: 40px;
  border: 2px solid ${props => {
    if (props.current) return '#667eea';
    if (props.answered) return '#48bb78';
    return '#e2e8f0';
  }};
  background: ${props => {
    if (props.current) return '#667eea';
    if (props.answered) return '#48bb78';
    return 'white';
  }};
  color: ${props => props.current || props.answered ? 'white' : '#4a5568'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const QuestionContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const QuestionText = styled.div`
  font-size: 1.125rem;
  color: #1a202c;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const OptionsContainer = styled.div`
  display: grid;
  gap: 1rem;
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
  
  input[type="radio"] {
    margin: 0;
    transform: scale(1.2);
  }
  
  .option-text {
    flex: 1;
    color: #1a202c;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  
  &.danger {
    background: #f56565;
    color: white;
    
    &:hover {
      background: #e53e3e;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #1a202c;
  }
  
  p {
    color: #718096;
    margin-bottom: 2rem;
  }
`;

const FullScreenExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [violations, setViolations] = useState([]);
  const [showFullScreenWarning, setShowFullScreenWarning] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchExam();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examId]);

  useEffect(() => {
    if (exam && examStarted && !examEnded) {
      startTimer();
      setupTabDetection();
    }
  }, [exam, examStarted, examEnded]);

  const fetchExam = async () => {
    try {
      const examDoc = await getDoc(doc(db, 'exams', examId));
      if (examDoc.exists()) {
        const examData = examDoc.data();
        setExam(examData);
        setTimeLeft(examData.duration * 60); // Convert to seconds
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
    }
  };

  const setupTabDetection = () => {
    console.log('Setting up tab detection...');
    
    let lastBlurTime = 0;
    const BLUR_THRESHOLD = 1000; // 1 second threshold to avoid false positives
    
    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.hidden, 'Exam started:', examStarted, 'Exam ended:', examEnded);
      
      if (document.hidden && examStarted && !examEnded) {
        const newTabSwitches = tabSwitches + 1;
        console.log('Tab switch detected! Count:', newTabSwitches);
        
        setTabSwitches(newTabSwitches);
        setShowWarning(true);
        
        // Add violation to local state
        const violation = {
          type: 'tab_switch',
          timestamp: new Date(),
          count: newTabSwitches
        };
        setViolations(prev => [...prev, violation]);
        
        // Log tab switch to Firebase immediately
        logTabSwitch(newTabSwitches);
        
        // Show warning for 5 seconds
        setTimeout(() => setShowWarning(false), 5000);
      }
    };

    // Also detect window focus/blur events
    const handleWindowFocus = () => {
      console.log('Window focused');
      // Reset warning when user returns to the tab
      setShowWarning(false);
    };

    const handleWindowBlur = () => {
      console.log('Window blurred, exam started:', examStarted, 'exam ended:', examEnded);
      
      const currentTime = Date.now();
      
      if (examStarted && !examEnded && (currentTime - lastBlurTime) > BLUR_THRESHOLD) {
        lastBlurTime = currentTime;
        const newTabSwitches = tabSwitches + 1;
        console.log('Window blur detected! Count:', newTabSwitches);
        
        setTabSwitches(newTabSwitches);
        setShowWarning(true);
        
        // Add violation to local state
        const violation = {
          type: 'window_blur',
          timestamp: new Date(),
          count: newTabSwitches
        };
        setViolations(prev => [...prev, violation]);
        
        // Log tab switch to Firebase immediately
        logTabSwitch(newTabSwitches);
        
        // Show warning for 5 seconds
        setTimeout(() => setShowWarning(false), 5000);
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    console.log('Tab detection setup complete');
    
    // Return cleanup function
    return () => {
      console.log('Cleaning up tab detection...');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  };

  const logTabSwitch = async (switchCount) => {
    try {
      console.log('Logging tab switch to Firebase:', switchCount);
      
      const violationData = {
        examId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        type: 'tab_switch',
        timestamp: serverTimestamp(),
        switchCount,
        examTitle: exam?.title || 'Unknown Exam'
      };
      
      console.log('Violation data:', violationData);
      
      const docRef = await addDoc(collection(db, 'examViolations'), violationData);
      console.log('Tab switch logged successfully with ID:', docRef.id);
    } catch (error) {
      console.error('Error logging tab switch:', error);
    }
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleExamEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleExamEnd = async () => {
    setExamEnded(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Calculate score and time taken
    const score = calculateScore();
    const timeTaken = Date.now() - startTimeRef.current;
    
    // Save exam result with complete details
    await submitExam(score, timeTaken);
  };

  const handleManualSubmit = async () => {
    if (window.confirm('Are you sure you want to submit the exam? You cannot change your answers after submission.')) {
      await handleExamEnd();
    }
  };

  const enterFullScreen = async () => {
    try {
      if (screenfull.isEnabled) {
        await screenfull.request();
        setIsFullScreen(true);
        setShowFullScreenWarning(false);
        setExamStarted(true);
        setExamStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error entering full screen:', error);
    }
  };

  const exitFullScreen = async () => {
    try {
      if (screenfull.isFullscreen) {
        await screenfull.exit();
        setIsFullScreen(false);
      }
    } catch (error) {
      console.error('Error exiting full screen:', error);
    }
  };

  const startExam = () => {
    setExamStarted(true);
    startTimeRef.current = Date.now();
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = exam.questions.length;
    
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    return {
      correctAnswers,
      totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      score: correctAnswers
    };
  };

  const submitExam = async (score, timeTaken) => {
    try {
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTimeRef.current) / 1000);
      
      // Check if user has already attempted this exam
      const existingResult = await checkExistingAttempt();
      if (existingResult) {
        alert('You have already attempted this exam. Only one attempt is allowed.');
        navigate('/my-exams');
        return;
      }
      
      const examResult = {
        examId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        examTitle: exam.title,
        answers,
        score: score.score,
        correctAnswers: score.correctAnswers,
        totalQuestions: score.totalQuestions,
        percentage: score.percentage,
        startTime: new Date(startTimeRef.current),
        endTime: new Date(endTime),
        duration,
        timeTaken,
        tabSwitches,
        violations: violations,
        status: 'completed',
        submittedAt: serverTimestamp(),
        // Approval flags - initially false, will be set by admin
        scoreApproved: false,
        answersApproved: false
      };

      await addDoc(collection(db, 'examResults'), examResult);
      
      // Update exam status for this user
      await updateExamStatus();
      
      // Navigate to results page
      navigate(`/exam-result/${examId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  const checkExistingAttempt = async () => {
    try {
      const { query, where, getDocs } = await import('firebase/firestore');
      const resultsQuery = query(
        collection(db, 'examResults'),
        where('examId', '==', examId),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(resultsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking existing attempt:', error);
      return false;
    }
  };

  const updateExamStatus = async () => {
    try {
      // Update user's exam status in the users collection
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        [`examStatus.${examId}`]: {
          status: 'completed',
          completedAt: serverTimestamp()
        }
      });
    } catch (error) {
      console.error('Error updating exam status:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredQuestions = () => {
    return Object.keys(answers).length;
  };

  if (!exam) {
    return <div>Loading exam...</div>;
  }

  if (!examStarted) {
    return (
      <FullScreenContainer>
        <Header>
          <ExamInfo>
            <h2>{exam.title}</h2>
            <p>Ready to start your exam</p>
          </ExamInfo>
        </Header>
        
        <MainContent>
          <QuestionContainer>
            <h3>Exam Instructions</h3>
            <p>{exam.description}</p>
            <ul>
              <li>Duration: {exam.duration} minutes</li>
              <li>Total Questions: {exam.questions.length}</li>
              <li>Total Marks: {exam.totalMarks}</li>
              <li>This exam must be taken in full-screen mode</li>
              <li>Do not switch tabs or windows during the exam</li>
              <li>Tab switching will be recorded and reported</li>
              <li>Only one attempt is allowed per exam</li>
              <li>Ensure you have a stable internet connection</li>
            </ul>
            
            {showFullScreenWarning && (
              <div style={{ 
                background: '#fef5e7', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                border: '1px solid #fed7aa'
              }}>
                <strong>⚠️ Full-Screen Required:</strong> This exam must be taken in full-screen mode. 
                Click "Enter Full-Screen & Start Exam" to begin.
              </div>
            )}
            
            <Button className="primary" onClick={enterFullScreen}>
              <FiEye />
              Enter Full-Screen & Start Exam
            </Button>
          </QuestionContainer>
        </MainContent>
      </FullScreenContainer>
    );
  }

  return (
    <FullScreenContainer>
      <Header>
        <ExamInfo>
          <h2>{exam.title}</h2>
          <p>Question {currentQuestion + 1} of {exam.questions.length}</p>
        </ExamInfo>
        
        <Timer warning={timeLeft <= 300}>
          <FiClock />
          <span className="time">{formatTime(timeLeft)}</span>
        </Timer>
      </Header>

      {showWarning && (
        <WarningBanner>
          <FiAlertTriangle />
          <strong>Warning:</strong> Tab switching detected! This violation has been recorded.
          <span className="warning-count">Count: {tabSwitches}</span>
        </WarningBanner>
      )}

      {examStarted && !examEnded && (
        <TabSwitchIndicator>
          <FiAlertTriangle />
          Tab Switches: <span className="count">{tabSwitches}</span>
        </TabSwitchIndicator>
      )}

      {examStarted && !examEnded && process.env.NODE_ENV === 'development' && (
        <DebugPanel>
          <h4>Debug Info</h4>
          <div className="debug-item">Exam Started: {examStarted ? 'Yes' : 'No'}</div>
          <div className="debug-item">Exam Ended: {examEnded ? 'Yes' : 'No'}</div>
          <div className="debug-item">Tab Switches: {tabSwitches}</div>
          <div className="debug-item">Violations: {violations.length}</div>
          <div className="debug-item">Time Left: {formatTime(timeLeft)}</div>
          <div className="debug-item">Current Question: {currentQuestion + 1}/{exam?.questions?.length}</div>
          <button 
            onClick={() => {
              const newTabSwitches = tabSwitches + 1;
              setTabSwitches(newTabSwitches);
              logTabSwitch(newTabSwitches);
              setShowWarning(true);
              setTimeout(() => setShowWarning(false), 3000);
            }}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              marginTop: '0.5rem'
            }}
          >
            Test Tab Switch
          </button>
        </DebugPanel>
      )}

      <Content>
        <Sidebar>
          <QuestionNav>
            <h3>Question Navigator</h3>
            <QuestionButtons>
              {exam.questions.map((_, index) => (
                <QuestionButton
                  key={index}
                  current={index === currentQuestion}
                  answered={answers[index] !== undefined}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </QuestionButton>
              ))}
            </QuestionButtons>
            
            <div>
              <p>Answered: {getAnsweredQuestions()}/{exam.questions.length}</p>
              <p>Tab Switches: {tabSwitches}</p>
            </div>
          </QuestionNav>
        </Sidebar>

        <MainContent>
          <QuestionContainer>
            <QuestionText>
              <strong>Question {currentQuestion + 1}:</strong> {exam.questions[currentQuestion].question}
            </QuestionText>
            
            <OptionsContainer>
              {exam.questions[currentQuestion].options.map((option, optionIndex) => (
                <Option key={optionIndex}>
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    checked={answers[currentQuestion] === optionIndex}
                    onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                  />
                  <span className="option-text">{option}</span>
                </Option>
              ))}
            </OptionsContainer>
          </QuestionContainer>

          <NavigationButtons>
            <Button 
              className="secondary" 
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div>
              {currentQuestion === exam.questions.length - 1 ? (
                <Button className="danger" onClick={handleManualSubmit}>
                  Submit Exam
                </Button>
              ) : (
                <Button className="primary" onClick={nextQuestion}>
                  Next
                </Button>
              )}
            </div>
          </NavigationButtons>
        </MainContent>
      </Content>

      {showSubmitModal && (
        <SubmitModal>
          <ModalContent>
            <h3>Submit Exam?</h3>
            <p>Are you sure you want to submit your exam? You cannot change your answers after submission.</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button className="secondary" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button className="danger" onClick={handleManualSubmit}>
                Submit Exam
              </Button>
            </div>
          </ModalContent>
        </SubmitModal>
      )}
    </FullScreenContainer>
  );
};

export default FullScreenExam;
