import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: ({ login }) => {
      if (login.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({
        variables: {
          username,
          password,
        },
      });
    } catch (err) {
      // Error is handled by onError above
    }
  };

  return (
    <div style={{ minWidth: '100vw', minHeight: '100vh' }}>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Team/Project Management System</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Container>
      </Navbar>

      <Container className="mt-5">
        <div className="d-flex justify-content-center">
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <h2 className="text-center mb-4">Sign in to your account</h2>
            
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
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              <div className="d-grid gap-2">
                <Button
                  variant="dark"
                  type="submit"
                  disabled={loading}
                  className="mt-3"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Login;