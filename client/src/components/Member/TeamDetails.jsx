import { useQuery, gql } from '@apollo/client';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';

const VIEW_TEAM_DETAILS = gql`
  query ViewTeamDetails($teamId: ID!) {
    viewTeamDetails(teamId: $teamId) {
      id
      teamName
      description
      teamSlogan
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
  // In a real app, you'd get the teamId from context or route params
  const teamId = "your-team-id"; 
  
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

  const team = data.viewTeamDetails;

  return (
    <Container>
      <h2 className="mb-4">Team Details</h2>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{team.teamName}</Card.Title>
          <Card.Text>
            <strong>Description:</strong> {team.description}<br/>
            <strong>Team Slogan:</strong> {team.teamSlogan}<br/>
            <strong>Status:</strong> {team.status}
          </Card.Text>
        </Card.Body>
      </Card>

      <h3 className="mb-3">Team Members</h3>
      <div className="mb-4">
        {team.members.map(member => (
          <Card key={member.id} className="mb-2">
            <Card.Body>
              <Card.Title>{member.username}</Card.Title>
              <Card.Text>{member.email}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>

      <h3 className="mb-3">Team Projects</h3>
      <div>
        {team.projects.map(project => (
          <Card key={project.id} className="mb-2">
            <Card.Body>
              <Card.Title>{project.projectName}</Card.Title>
              <Card.Text>Status: {project.status}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
}

export default TeamDetails;