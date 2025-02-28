import { useState, useRef } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import MyProjects from './MyProjects';
import MyTeams from './MyTeams';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

function MemberDashboard() {
  const [activeComponent, setActiveComponent] = useState('projects');
  const navigate = useNavigate();

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      navigate('/');
    }
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'projects':
        return <MyProjects />;
      case 'teams':
        return <MyTeams />;
      default:
        return <MyProjects />;
    }
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Member Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                onClick={() => setActiveComponent('projects')} 
                active={activeComponent === 'projects'}
              >
                My Projects
              </Nav.Link>
              <Nav.Link 
                onClick={() => setActiveComponent('teams')} 
                active={activeComponent === 'teams'}
              >
                My Teams
              </Nav.Link>
            </Nav>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {renderComponent()}
      </Container>
    </div>
  );
}

export default MemberDashboard;
