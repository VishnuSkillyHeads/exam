import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiPlus, FiTrash2, FiMail, FiClock, FiUsers } from 'react-icons/fi';
import styled from 'styled-components';
import { sendExamInvitation, extractEmailsFromBatch } from '../../utils/emailService';

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
    font-size: 2.5rem;
    font-weight: 800;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
  }
`;

const Form = styled.form`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f7fafc;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
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
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const QuestionSection = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: #f8fafc;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h4 {
    margin: 0;
    color: #1a202c;
  }
`;

const OptionGroup = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  input[type="radio"] {
    margin: 0;
  }
  
  input[type="text"] {
    flex: 1;
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
  
  &.primary {
    background: #3b82f6;
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
`;

const BatchSelection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const BatchCard = styled.div`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f0f4ff' : 'white'};
  
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: #1a202c;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #718096;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

const ExamCreation = () => {
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    startTime: '',
    endTime: '',
    totalMarks: 100,
    passingMarks: 40,
    selectedBatches: [],
    questions: [
      {
        id: 1,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

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
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map((opt, idx) => 
                idx === optionIndex ? value : opt
              )
            }
          : q
      )
    }));
  };

  const toggleBatchSelection = (batchId) => {
    setFormData(prev => ({
      ...prev,
      selectedBatches: prev.selectedBatches.includes(batchId)
        ? prev.selectedBatches.filter(id => id !== batchId)
        : [...prev.selectedBatches, batchId]
    }));
  };

  const sendEmailInvitations = async () => {
    try {
      setEmailStatus('Fetching student emails...');
      
      // Get all student emails from selected batches
      const allEmails = [];
      
      for (const batchId of formData.selectedBatches) {
        const batch = batches.find(b => b.id === batchId);
        if (batch) {
          setEmailStatus(`Fetching emails from batch: ${batch.name}...`);
          const batchEmails = await extractEmailsFromBatch(batch);
          allEmails.push(...batchEmails);
        }
      }
      
      // Remove duplicates
      const uniqueEmails = [...new Set(allEmails)];
      
      if (uniqueEmails.length === 0) {
        setEmailStatus('No student emails found for the selected batches.');
        alert('No student emails found for the selected batches.');
        return;
      }
      
      console.log('Sending invitations to:', uniqueEmails);
      setEmailStatus(`Sending ${uniqueEmails.length} email invitations...`);
      
      // Send invitations
      const result = await sendExamInvitation(formData, uniqueEmails);
      
      if (result.success) {
        setEmailStatus(result.message);
        alert(`${result.message}`);
      } else {
        setEmailStatus(`Error: ${result.error || 'Unknown error'}`);
        alert(`Error sending email invitations: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      setEmailStatus(`Error: ${error.message}`);
      alert('Error sending email invitations. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.selectedBatches.length === 0) {
      alert('Please select at least one batch for the exam.');
      return;
    }

    if (formData.questions.length === 0) {
      alert('Please add at least one question to the exam.');
      return;
    }

    try {
      setIsSubmitting(true);
      setEmailStatus('');
      
      const examData = {
        ...formData,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        createdAt: new Date(),
        status: 'scheduled'
      };

      await addDoc(collection(db, 'exams'), examData);
      
      // Send email invitations
      await sendEmailInvitations();
      
      alert('Exam created successfully! Email invitations have been sent.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        duration: 60,
        startTime: '',
        endTime: '',
        totalMarks: 100,
        passingMarks: 40,
        selectedBatches: [],
        questions: [
          {
            id: 1,
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            marks: 1
          }
        ]
      });
      setEmailStatus('');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Error creating exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Header>
        <h1>Create New Exam</h1>
        <p>Set up a new examination with questions and assign batches</p>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <h3>Basic Information</h3>
          <FormGrid>
            <FormGroup>
              <label>Exam Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter exam title"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                min="1"
                required
              />
            </FormGroup>
          </FormGrid>
          
          <FormGroup>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter exam description"
              required
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <h3>Schedule & Settings</h3>
          <FormGrid>
            <FormGroup>
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <label>End Time</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <label>Total Marks</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value))}
                min="1"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <label>Passing Marks</label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value))}
                min="1"
                max={formData.totalMarks}
                required
              />
            </FormGroup>
          </FormGrid>
        </FormSection>

        <FormSection>
          <h3>Assign Batches</h3>
          <BatchSelection>
            {batches.map((batch) => (
              <BatchCard
                key={batch.id}
                selected={formData.selectedBatches.includes(batch.id)}
                onClick={() => toggleBatchSelection(batch.id)}
              >
                <h4>{batch.name}</h4>
                <p>{batch.branch} - {batch.section}</p>
                <p>{batch.totalStudents} students</p>
              </BatchCard>
            ))}
          </BatchSelection>
        </FormSection>

        <FormSection>
          <h3>Questions</h3>
          {formData.questions.map((question, index) => (
            <QuestionSection key={question.id}>
              <QuestionHeader>
                <h4>Question {index + 1}</h4>
                <Button
                  type="button"
                  className="danger"
                  onClick={() => removeQuestion(question.id)}
                  style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  <FiTrash2 />
                  Remove
                </Button>
              </QuestionHeader>
              
              <FormGroup>
                <label>Question</label>
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </FormGroup>
              
              <OptionGroup>
                <label>Options</label>
                {question.options.map((option, optionIndex) => (
                  <OptionItem key={optionIndex}>
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === optionIndex}
                      onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      required
                    />
                  </OptionItem>
                ))}
              </OptionGroup>
              
              <FormGroup>
                <label>Marks for this question</label>
                <input
                  type="number"
                  value={question.marks}
                  onChange={(e) => updateQuestion(question.id, 'marks', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </FormGroup>
            </QuestionSection>
          ))}
          
          <Button type="button" className="secondary" onClick={addQuestion}>
            <FiPlus />
            Add Question
          </Button>
        </FormSection>

        {emailStatus && (
          <div style={{
            background: emailStatus.includes('Error') ? '#fed7d7' : '#f0fff4',
            color: emailStatus.includes('Error') ? '#e53e3e' : '#38a169',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {emailStatus}
          </div>
        )}
        
        <FormActions>
          <Button type="button" className="secondary" disabled={isSubmitting}>
            Save as Draft
          </Button>
          <Button type="submit" className="primary" disabled={isSubmitting}>
            <FiMail />
            {isSubmitting ? 'Creating Exam...' : 'Create Exam & Send Invitations'}
          </Button>
        </FormActions>
      </Form>
    </Container>
  );
};

export default ExamCreation;
