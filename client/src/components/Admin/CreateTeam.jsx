import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useMutation, gql } from '@apollo/client';
import TeamList from './Teams';

const CREATE_TEAM_MUTATION = gql`
  mutation CreateTeam($teamName: String!, $description: String!, $teamSlogan: String!) {
    createTeam(teamName: $teamName, description: $description, teamSlogan: $teamSlogan) {
      id
      teamName
      description
      teamSlogan
      createdDate
      status
    }
  }
`;

function CreateTeam({ setActiveComponent, refetchList }) {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [teamSlogan, setTeamSlogan] = useState('');
  const [error, setError] = useState('');

  const [createTeam, { loading }] = useMutation(CREATE_TEAM_MUTATION, {
    onCompleted: () => {
      if (refetchList?.current) {
        refetchList.current();
      }
      setActiveComponent('teams');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await createTeam({
        variables: {
          teamName,
          description,
          teamSlogan
        }
      });
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Create New Team</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Team Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter team description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Team Slogan</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter team slogan"
            value={teamSlogan}
            onChange={(e) => setTeamSlogan(e.target.value)}
            required
          />
        </Form.Group>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <Button variant="dark" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </Form>
    </Container>
  );
}

export default CreateTeam;
