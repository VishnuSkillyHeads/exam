import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiUsers } from 'react-icons/fi';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 2rem;
`;

const SignupCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
`;

const Header = styled.div`
  text-align: center;
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

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  position: relative;
  
  .input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    z-index: 1;
  }
  
  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      color: #4a5568;
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RoleSelection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const RoleCard = styled.div`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f0f4ff' : 'white'};
  text-align: center;
  
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
  
  .role-icon {
    font-size: 2rem;
    color: #667eea;
    margin-bottom: 0.5rem;
  }
  
  .role-title {
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.25rem;
  }
  
  .role-description {
    font-size: 0.875rem;
    color: #718096;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #e53e3e;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #f0fff4;
  color: #38a169;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  
  p {
    color: #718096;
    margin: 0 0 1rem 0;
  }
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      await signup(formData.email, formData.password, userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  return (
    <Container>
      <SignupCard>
        <Header>
          <h1>Create Account</h1>
          <p>Join the exam portal to get started</p>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <FormGrid>
            <FormGroup>
              <FiUser className="input-icon" />
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <FiMail className="input-icon" />
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <FiLock className="input-icon" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
              {showPassword ? (
                <FiEyeOff 
                  className="toggle-password" 
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FiEye 
                  className="toggle-password" 
                  onClick={() => setShowPassword(true)}
                />
              )}
            </FormGroup>

            <FormGroup>
              <FiLock className="input-icon" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
              {showConfirmPassword ? (
                <FiEyeOff 
                  className="toggle-password" 
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <FiEye 
                  className="toggle-password" 
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </FormGroup>
          </FormGrid>

          <div>
            <label style={{ fontWeight: 500, color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
              Select Role
            </label>
            <RoleSelection>
              <RoleCard
                selected={formData.role === 'student'}
                onClick={() => handleRoleSelect('student')}
              >
                <div className="role-icon">
                  <FiUser />
                </div>
                <div className="role-title">Student</div>
                <div className="role-description">Take exams and view results</div>
              </RoleCard>
              
              <RoleCard
                selected={formData.role === 'admin'}
                onClick={() => handleRoleSelect('admin')}
              >
                <div className="role-icon">
                  <FiUsers />
                </div>
                <div className="role-title">Admin</div>
                <div className="role-description">Manage exams and batches</div>
              </RoleCard>
            </RoleSelection>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>

        <Footer>
          <p>Already have an account?</p>
          <Link to="/login">Sign in to your account</Link>
        </Footer>
      </SignupCard>
    </Container>
  );
};

export default Signup;
