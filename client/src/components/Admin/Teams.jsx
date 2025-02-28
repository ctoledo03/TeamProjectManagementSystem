import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import AssignUsersModal from './AssignUsersModal';

const LIST_TEAMS = gql`
  query ListTeams {
    listTeams {
      id
      teamName
      description
      status
      createdDate
      teamSlogan
      members {
        id
        username
        email
      }
      projects {
        id
        projectName
      }
    }
  }
`;

function Teams( {setActiveComponent, refetchList} ) {
  const { loading, error, data, refetch } = useQuery(LIST_TEAMS);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  if (refetchList) {
    refetchList.current = refetch;
  }

  const formatDate = (timestamp) => {
    const numericTimestamp = Number(timestamp);
    const date = new Date(numericTimestamp);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAssignClick = (team) => {
    setSelectedTeam(team);
    setShowAssignModal(true);
  };

  const getStatusBadgeVariant = (status) => {
    return status === 'Active' ? 'success' : 'secondary';
  };

  if (loading) {
    return (
      <Container className="text-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          Error loading teams: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Team List</h2>
        <Link onClick={() => setActiveComponent('createTeam')}>
          <Button variant="dark">
            Create Team
          </Button>
        </Link>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Description</th>
            <th>Team Slogan</th>
            <th>Status</th>
            <th>Members</th>
            <th>Projects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.listTeams.map((team) => (
            <tr key={team.id}>
              <td>{team.teamName}</td>
              <td>{team.description}</td>
              <td>{team.teamSlogan}</td>
              <td>
                <span className={`badge bg-${getStatusBadgeVariant(team.status)}`}>
                  {team.status}
                </span>
              </td>
              <td>{team.members?.map(member => member.username).join(', ')}</td>
              <td>{team.projects?.map(project => project.projectName).join(', ')}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleAssignClick(team)}
                >
                  Manage Members
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <AssignUsersModal
        show={showAssignModal}
        handleClose={() => setShowAssignModal(false)}
        team={selectedTeam}
        refetch={refetch}
      />
    </Container>
  );
}

export default Teams;
