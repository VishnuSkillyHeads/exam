import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiCalendar,
  FiMail,
  FiBookOpen,
  FiClipboard,
  FiUser,
  FiCheckCircle
} from 'react-icons/fi';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 280px;
  height: 100vh;
  background: #ffffff;
  color: #1a202c;
  padding: 2rem 0;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #f7fafc;
`;

const Logo = styled.div`
  text-align: center;
  padding: 0 2rem 2rem;
  border-bottom: 1px solid #f7fafc;
  margin-bottom: 2rem;
  
  img {
    height: 80px;
    width: auto;
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #1a202c;
  }
  
  p {
    font-size: 0.875rem;
    color: #718096;
    margin: 0.5rem 0 0;
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.6;
    margin: 0 2rem 1rem;
  }
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 2rem;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  
  &:hover {
    background: #f7fafc;
    border-left-color: #e2e8f0;
    color: #1a202c;
  }
  
  &.active {
    background: #f0f4ff;
    border-left-color: #3b82f6;
    color: #1a202c;
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 2rem;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  
  &:hover {
    background: #fef2f2;
    border-left-color: #f56565;
    color: #e53e3e;
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
`;

const Sidebar = () => {
  const { userRole, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <SidebarContainer>
      <Logo>
                 <img src="https://www.skillyheads.com/static/media/skillyheads_dark_lr.a7e22f009d6d16a19214.png" alt="Skillyheads Logo" />
        <h2>Exam Portal</h2>
        <p>College Placement</p>
      </Logo>

      <NavSection>
        <h3>Main</h3>
        <NavItem to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
          <FiHome />
          Dashboard
        </NavItem>
        
        {userRole === 'admin' && (
          <>
            <NavItem to="/batches" className={isActive('/batches') ? 'active' : ''}>
              <FiUsers />
              Manage Batches
            </NavItem>
            <NavItem to="/students" className={isActive('/students') ? 'active' : ''}>
              <FiUsers />
              Manage Students
            </NavItem>
            <NavItem to="/exams" className={isActive('/exams') ? 'active' : ''}>
              <FiFileText />
              Create Exams
            </NavItem>

          </>
        )}
        
        <NavItem to="/my-exams" className={isActive('/my-exams') ? 'active' : ''}>
          <FiBookOpen />
          My Exams
        </NavItem>
        
        <NavItem to="/profile" className={isActive('/profile') ? 'active' : ''}>
          <FiUser />
          Profile
        </NavItem>
        
        <NavItem to="/schedule" className={isActive('/schedule') ? 'active' : ''}>
          <FiCalendar />
          Exam Schedule
        </NavItem>
      </NavSection>

      {userRole === 'admin' && (
        <NavSection>
          <h3>Reports</h3>
          <NavItem to="/reports" className={isActive('/reports') ? 'active' : ''}>
            <FiBarChart2 />
            View Reports
          </NavItem>
          <NavItem to="/publish-results" className={isActive('/publish-results') ? 'active' : ''}>
            <FiCheckCircle />
            Publish Results
          </NavItem>
          <NavItem to="/analytics" className={isActive('/analytics') ? 'active' : ''}>
            <FiClipboard />
            Analytics
          </NavItem>
        </NavSection>
      )}

      {userRole === 'admin' && (
        <NavSection>
          <h3>Settings</h3>
          <NavItem to="/settings" className={isActive('/settings') ? 'active' : ''}>
            <FiSettings />
            System Settings
          </NavItem>
        </NavSection>
      )}

      <LogoutButton onClick={handleLogout}>
        <FiLogOut />
        Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
