import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useMutation } from '@apollo/client';

const UPDATE_PROJECT_STATUS = gql`
  mutation UpdateProjectStatus($projectId: ID!, $status: String!) {
    updateProjectStatus(projectId: $projectId, status: $status) {
      id
      status
    }
  }
`;

const GET_MY_PROJECTS = gql`
  query ViewAssignedProjects {
    viewAssignedProjects {
      id
      projectName
      description
      status
      startDate
      endDate
      teams {
        id
        teamName
        status
      }
    }
  }
`;

function MyProjects() {
  const { loading, error, data, refetch } = useQuery(GET_MY_PROJECTS);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  const [updateStatus, { loading: updating }] = useMutation(UPDATE_PROJECT_STATUS, {
    onCompleted: () => {
      setShowStatusModal(false);
      refetch();
    }
  });
  
  const handleStatusClick = (project) => {
    setSelectedProject(project);
    setNewStatus(project.status);
    setShowStatusModal(true);
  };
  
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateStatus({
        variables: {
          projectId: selectedProject.id,
          status: newStatus
        }
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  
  const PROJECT_STATUSES = [
    "Pending",
    "Planning",
    "In Progress",
    "In Review",
    "Testing",
    "On Hold",
    "Completed",
    "Cancelled"
  ];
  
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'In Review':
        return 'info';
      case 'Testing':
        return 'warning';
      case 'On Hold':
        return 'secondary';
      case 'Cancelled':
        return 'danger';
      case 'Planning':
        return 'info';
      case 'Pending':
        return 'dark';
      default:
        return 'secondary';
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString();
  };

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
      <h2 className="mb-4">My Projects</h2>
      {data?.viewAssignedProjects.length === 0 ? (
        <Alert variant="info">
          You are not assigned to any projects yet.
        </Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Teams</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.viewAssignedProjects.map((project) => (
              <tr key={project.id}>
                <td>{project.projectName}</td>
                <td>{project.description}</td>
                <td>
                  <span className={`badge bg-${getStatusBadgeVariant(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td>{formatDate(project.startDate)}</td>
                <td>{formatDate(project.endDate)}</td>
                <td>{project.teams?.map(team => team.teamName).join(', ')}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleStatusClick(project)}
                  >
                    Update Status
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Project Status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdate}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Project: {selectedProject?.projectName}</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {PROJECT_STATUSES.map(status => (
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
              disabled={updating || newStatus === selectedProject?.status}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default MyProjects; 