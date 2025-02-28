import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { useState } from 'react';
import AssignProjectModal from './AssignProjectModal';

const LIST_PROJECTS = gql`
  query ListProjects {
    listProjects {
      id
      projectName
      description
      status
      startDate
      endDate
      teams {
        id
        teamName
      }
    }
  }
`;

function Projects({ setActiveComponent, refetchList }) {
  const { loading, error, data, refetch } = useQuery(LIST_PROJECTS);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
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

  const handleAssignClick = (project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Project List</h2>
        <Button variant="dark" onClick={() => setActiveComponent('createProject')}>
          Create Project
        </Button>
      </div>

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
          {data?.listProjects.map((project) => (
            <tr key={project.id}>
              <td>{project.projectName}</td>
              <td>{project.description}</td>
              <td>
                <span className={`badge bg-${getStatusBadgeVariant(project.status)}`}>
                  {project.status}
                </span>
              </td>
              <td>{formatDate(project.startDate)}</td>
              <td>{project.endDate ? formatDate(project.endDate) : 'N/A'}</td>
              <td>
                {project.teams.length > 0 ? project.teams.map(team => team.teamName).join(', ') : 'Unassigned'}
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleAssignClick(project)}
                >
                  Assign Teams
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <AssignProjectModal
        show={showAssignModal}
        handleClose={() => setShowAssignModal(false)}
        project={selectedProject}
        refetch={refetch}
      />
    </Container>
  );
}

export default Projects;
