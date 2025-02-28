import { useState, useRef } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import CreateTeam from './CreateTeam';
import CreateUser from './CreateUser';
import CreateProject from './CreateProject';
import Teams from './Teams';
import Projects from './Projects';
import Users from './Users';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

function AdminDashboard() {
  const [activeComponent, setActiveComponent] = useState('projects');
  const refetchList = useRef(null);
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
            return <Projects setActiveComponent={setActiveComponent} refetchList={refetchList}/>;
        case 'teams':
            return <Teams setActiveComponent={setActiveComponent} refetchList={refetchList}/>;
        case 'users':
            return <Users setActiveComponent={setActiveComponent} refetchList={refetchList}/>;

        case 'createProject':
            return <CreateProject setActiveComponent={setActiveComponent} refetchList={refetchList}/>;
        case 'createTeam':
            return <CreateTeam setActiveComponent={setActiveComponent} refetchList={refetchList}/>;
        case 'createUser':
            return <CreateUser setActiveComponent={setActiveComponent} refetchList={refetchList}/>;

        default:
            return <Projects setActiveComponent={setActiveComponent} refetchList={refetchList}/>;
    }
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Admin Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">

              <Nav.Link onClick={() => setActiveComponent('projects')} active={activeComponent === 'projects'}>
                Projects
              </Nav.Link>

              <Nav.Link onClick={() => setActiveComponent('teams')} active={activeComponent === 'teams'}>
                Teams
              </Nav.Link>

              <Nav.Link onClick={() => setActiveComponent('users')} active={activeComponent === 'users'}>
                Manage Users
              </Nav.Link>

            </Nav>
            <Button 
              variant="outline-light" 
              onClick={handleLogout}
            >
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

export default AdminDashboard;
