import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useMutation, gql, useQuery } from '@apollo/client';

const CREATE_PROJECT = gql`
  mutation CreateProject($projectName: String!, $description: String!, $teamIds: [ID!], $startDate: String!, $endDate: String) {
    createProject(projectName: $projectName, description: $description, teamIds: $teamIds, startDate: $startDate, endDate: $endDate) {
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

const LIST_TEAMS = gql`
  query ListTeams {
    listTeams {
      id
      teamName
    }
  }
`;

function CreateProject({ setActiveComponent, refetchList }) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [error, setError] = useState('');

  const { data: teamData } = useQuery(LIST_TEAMS);

  const [createProject, { loading }] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      if (refetchList.current) {
        refetchList.current();
      }
      setActiveComponent('projects');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        variables: {
          projectName,
          description,
          teamIds: selectedTeams,
          startDate,
          endDate: endDate || null
        }
      });
    } catch (err) {
      // Error handled by onError above
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Create New Project</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Project Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>End Date (Optional)</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Assign Teams (Optional)</Form.Label>
          <Form.Control
            as="select"
            multiple
            value={selectedTeams}
            onChange={(e) => setSelectedTeams([...e.target.selectedOptions].map(option => option.value))}
          >
            {teamData?.listTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.teamName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <Button variant="dark" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </Form>
    </Container>
  );
}

export default CreateProject;