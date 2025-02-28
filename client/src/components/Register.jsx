import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const REGISTER_MUTATION = gql`
  mutation Register(
    $username: String!, 
    $email: String!, 
    $password: String!,
    $registrationCode: String
  ) {
    register(
      username: $username, 
      email: $email, 
      password: $password,
      registrationCode: $registrationCode
    ) {
      id
      username
      email
      role
    }
  }
`;

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      // Redirect to login after successful registration
      navigate('/');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register({
        variables: {
          username,
          email,
          password,
          registrationCode: registrationCode || undefined
        }
      });
    } catch (err) {
      // Error handled by onError above
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">Register</h2>
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
          <Form.Label>Registration Code (Optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter registration code if you have one"
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value)}
          />
          <Form.Text className="text-muted">
            Leave empty for regular member registration
          </Form.Text>
        </Form.Group>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </div>

        <div className="text-center mt-3">
          Already have an account? <Link to="/">Login here</Link>
        </div>
      </Form>
    </Container>
  );
}

export default Register; 