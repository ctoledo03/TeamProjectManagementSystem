import { useQuery, useMutation, gql } from '@apollo/client';
import { Container, Card, Alert, Spinner, Form, Button } from 'react-bootstrap';

const VIEW_ASSIGNED_PROJECTS = gql`
  query ViewAssignedProjects($userId: ID!) {
    viewAssignedProjects(userId: $userId) {
      id
      projectName
      description
      status
      startDate
      endDate
    }
  }
`;

const UPDATE_PROJECT_STATUS = gql`
  mutation UpdateProjectStatus($projectId: ID!, $status: String!) {
    updateProjectStatus(projectId: $projectId, status: $status) {
      id
      status
    }
  }
`;

function AssignedProjects() {
  // In a real app, you'd get the userId from context or auth state
  const userId = "your-user-id"; 

  const { loading, error, data, refetch } = useQuery(VIEW_ASSIGNED_PROJECTS, {
    variables: { userId }
  });

  const [updateStatus] = useMutation(UPDATE_PROJECT_STATUS);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await updateStatus({
        variables: {
          projectId,
          status: newStatus
        }
      });
      refetch();
    } catch (err) {
      console.error('Error updating project status:', err);
    }
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
          Error loading projects: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">My Assigned Projects</h2>
      {data.viewAssignedProjects.map(project => (
        <Card key={project.id} className="mb-3">
          <Card.Body>
            <Card.Title>{project.projectName}</Card.Title>
            <Card.Text>
              {project.description}<br/>
              <strong>Start Date:</strong> {new Date(Number(project.startDate)).toLocaleDateString()}<br/>
              <strong>End Date:</strong> {project.endDate ? new Date(Number(project.endDate)).toLocaleDateString() : 'Not set'}
            </Card.Text>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={project.status}
                onChange={(e) => handleStatusChange(project.id, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default AssignedProjects;