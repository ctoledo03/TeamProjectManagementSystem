import { useQuery, gql } from '@apollo/client';
import { Container, Card, ListGroup, Alert, Spinner } from 'react-bootstrap';

const VIEW_TEAM_DETAILS = gql`
  query ViewTeamDetails($teamId: ID!) {
    viewTeamDetails(teamId: $teamId) {
      id
      teamName
      description
      status
      members {
        id
        username
        email
      }
      projects {
        id
        projectName
        status
      }
    }
  }
`;

function TeamDetails() {
  // TODO: Get teamId from user context or props
  const teamId = "your-team-id"; // This should come from context/props
  
  const { loading, error, data } = useQuery(VIEW_TEAM_DETAILS, {
    variables: { teamId }
  });

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
          Error loading team details: {error.message}
        </Alert>
      </Container>
    );
  }

  const team = data?.viewTeamDetails;

  return (
    <Container>
      <h2 className="mb-4">Team Details</h2>
      <Card className="mb-4">
        <Card.Header as="h5">{team?.teamName}</Card.Header>
        <Card.Body>
          <Card.Text>{team?.description}</Card.Text>
          <Card.Text>Status: {team?.status}</Card.Text>
        </Card.Body>
      </Card>

      <h3 className="mb-3">Team Members</h3>
      <ListGroup className="mb-4">
        {team?.members.map(member => (
          <ListGroup.Item key={member.id}>
            {member.username} - {member.email}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <h3 className="mb-3">Team Projects</h3>
      <ListGroup>
        {team?.projects.map(project => (
          <ListGroup.Item key={project.id}>
            {project.projectName} - Status: {project.status}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}

export default TeamDetails;