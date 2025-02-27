import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useMutation, gql } from '@apollo/client';

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!, $role: String!) {
    createUser(username: $username, email: $email, password: $password, role: $role) {
      id
      username
      email
      role
    }
  }
`;

function CreateUser({ setActiveComponent, refetchList }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');

  const [createUser, { loading }] = useMutation(CREATE_USER_MUTATION, {
    onCompleted: () => {
      if (refetchList.current) {
        refetchList.current();
      }
      setActiveComponent('users');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await createUser({
        variables: {
          username,
          email,
          password,
          role
        }
      });
    } catch (err) {

    }
  };

  return (
    <Container>
      <h2 className="mb-4">Create New User</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Form.Select>
        </Form.Group>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <Button 
          variant="dark" 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </Form>
    </Container>
  );
}

export default CreateUser;
