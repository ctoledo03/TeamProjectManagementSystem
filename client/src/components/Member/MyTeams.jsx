import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useMutation } from '@apollo/client';

const UPDATE_TEAM_STATUS = gql`
  mutation UpdateTeamStatus($teamId: ID!, $status: String!) {
    updateTeamStatus(teamId: $teamId, status: $status) {
      id
      status
    }
  }
`;

const GET_MY_TEAMS = gql`
  query ViewMyTeams {
    viewMyTeams {
      id
      teamName
      description
      teamSlogan
      status
      members {
        username
      }
      projects {
        id
        projectName
        status
        startDate
        endDate
      }
    }
  }
`;

function MyTeams() {
  const { loading, error, data, refetch } = useQuery(GET_MY_TEAMS);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  const [updateStatus, { loading: updating }] = useMutation(UPDATE_TEAM_STATUS, {
    onCompleted: () => {
      setShowStatusModal(false);
      refetch();
    }
  });
  
  const handleStatusClick = (team) => {
    setSelectedTeam(team);
    setNewStatus(team.status);
    setShowStatusModal(true);
  };
  
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateStatus({
        variables: {
          teamId: selectedTeam.id,
          status: newStatus
        }
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  
  const TEAM_STATUSES = ["Active", "Inactive"];
  
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'secondary';
      default:
        return 'dark';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString();
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
      <style>
        {`
          .badge {
            font-size: 0.9em;
            padding: 0.5em 0.8em;
          }
        `}
      </style>
      <h2 className="mb-4">My Teams</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Description</th>
            <th>Team Slogan</th>
            <th>Status</th>
            <th>Team Members</th>
            <th>Team Projects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.viewMyTeams.map((team) => (
            <tr key={team.id}>
              <td>{team.teamName}</td>
              <td>{team.description}</td>
              <td>{team.teamSlogan}</td>
              <td>
                <span className={`badge bg-${getStatusBadgeVariant(team.status)}`}>
                  {team.status}
                </span>
              </td>
              <td>{team.members.map(member => member.username).join(', ')}</td>
              <td>
                {team.projects && team.projects.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {team.projects.map(project => (
                      <li key={project.id}>
                        <strong>{project.projectName}</strong>
                        <br />
                        <small>
                          Status: {project.status}
                          <br />
                          Start: {formatDate(project.startDate)}
                          <br />
                          End: {formatDate(project.endDate)}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No projects assigned'
                )}
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleStatusClick(team)}
                >
                  Update Status
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Team Status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdate}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Team: {selectedTeam?.teamName}</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {TEAM_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={updating || newStatus === selectedTeam?.status}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default MyTeams; 