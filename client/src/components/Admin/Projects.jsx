import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Button } from 'react-bootstrap';

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
          </tr>
        </thead>
        <tbody>
          {data?.listProjects.map((project) => (
            <tr key={project.id}>
              <td>{project.projectName}</td>
              <td>{project.description}</td>
              <td>{project.status}</td>
              <td>{formatDate(project.startDate)}</td>
              <td>{project.endDate ? formatDate(project.endDate) : 'N/A'}</td>
              <td>
                {project.teams.length > 0 ? project.teams.map(team => team.teamName).join(', ') : 'Unassigned'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Projects;
