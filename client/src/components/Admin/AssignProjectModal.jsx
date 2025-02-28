import { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, ListGroup } from 'react-bootstrap';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TEAMS = gql`
  query ListTeams {
    listTeams {
      id
      teamName
    }
  }
`;

const ASSIGN_PROJECT = gql`
  mutation AssignProjectToTeam($projectId: ID!, $teamIds: [ID!]) {
    assignProjectToTeam(projectId: $projectId, teamIds: $teamIds) {
      id
      projectName
      teams {
        id
        teamName
      }
    }
  }
`;

function AssignProjectModal({ show, handleClose, project, refetch }) {
  const [selectedTeams, setSelectedTeams] = useState([]);
  
  const { data: teamsData } = useQuery(GET_TEAMS);
  
  useEffect(() => {
    if (project?.teams) {
      setSelectedTeams(project.teams.map(team => team.id));
    }
  }, [project]);
  
  const [assignProject, { loading }] = useMutation(ASSIGN_PROJECT, {
    onCompleted: () => {
      handleClose();
      refetch();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignProject({
        variables: {
          projectId: project.id,
          teamIds: selectedTeams
        }
      });
    } catch (err) {
      console.error('Error assigning project:', err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Teams to {project?.projectName}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <h6>Currently Assigned Teams:</h6>
            {project?.teams?.length > 0 ? (
              <ListGroup>
                {project.teams.map(team => (
                  <ListGroup.Item key={team.id} className="d-flex justify-content-between align-items-center">
                    {team.teamName}
                    <Badge bg="primary" pill>Assigned</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted">No teams currently assigned</p>
            )}
          </div>

          <Form.Group>
            <Form.Label>Modify Team Assignments</Form.Label>
            <Form.Control
              as="select"
              multiple
              value={selectedTeams}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedTeams(values);
              }}
              className="mb-2"
              style={{ minHeight: '150px' }}
            >
              {teamsData?.listTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.teamName}
                  {selectedTeams.includes(team.id) ? ' (Currently Assigned)' : ''}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              <ul className="mb-0">
                <li>Hold Ctrl/Cmd to select multiple teams</li>
                <li>Unselect a team to remove its assignment</li>
                <li>Select new teams to add assignments</li>
              </ul>
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating Assignments...' : 'Update Team Assignments'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AssignProjectModal; 