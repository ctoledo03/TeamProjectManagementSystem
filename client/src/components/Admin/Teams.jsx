import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
            <th>Status</th>
            <th>Created Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.listTeams.map((team) => (
            <tr key={team.id}>
              <td>{team.teamName}</td>
              <td>{team.description}</td>
              <td>{team.status}</td>
              <td>{formatDate(team.createdDate)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Teams;
