import { useQuery, useMutation, gql } from '@apollo/client';
import { Container, Table, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useState } from 'react';

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

// First, get the current user's data
const GET_ME = gql`
  query Me {
    me {
      id
      username
      role
    }
  }
`;

function AssignedProjects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const { loading: userLoading, error: userError, data: userData } = useQuery(GET_ME);

  const { loading, error, data, refetch } = useQuery(VIEW_ASSIGNED_PROJECTS, {
    variables: { userId: userData?.me?.id },
    skip: !userData?.me?.id,
  });

  const [updateStatus] = useMutation(UPDATE_PROJECT_STATUS, {
    onCompleted: () => {
      setSelectedProject(null);
      refetch();
    }
  });

  if (userLoading || loading) {
    return (
      <Container className="text-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (userError) {
    return (
      <Container>
        <Alert variant="danger">
          Error loading user data: {userError.message}
        </Alert>
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

  const handleStatusUpdate = async (projectId) => {
    try {
      await updateStatus({
        variables: {
          projectId,
          status: newStatus
        }
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <Container>
      <h2 className="mb-4">My Projects</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.viewAssignedProjects.map((project) => (
            <tr key={project.id}>
              <td>{project.projectName}</td>
              <td>{project.description}</td>
              <td>
                {selectedProject === project.id ? (
                  <Form.Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </Form.Select>
                ) : (
                  project.status
                )}
              </td>
              <td>{new Date(project.startDate).toLocaleDateString()}</td>
              <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
              <td>
                {selectedProject === project.id ? (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusUpdate(project.id)}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    Update Status
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AssignedProjects;