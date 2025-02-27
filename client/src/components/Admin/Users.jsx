import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const VIEW_USERS = gql`
  query ViewUsers {
    viewUsers {
      id
      username
      email
      role
    }
  }
`;

function Users({ setActiveComponent, refetchList }) {
  const { loading, error, data, refetch } = useQuery(VIEW_USERS);

  if (refetchList) {
    refetchList.current = refetch;
  }

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
          Error loading users: {error.message}
        </Alert>
      </Container>
    );
  }

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'MEMBER':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">User List</h2>
        <Link onClick={() => setActiveComponent('createUser')}>
          <Button variant="dark">
            Create User
          </Button>
        </Link>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {data?.viewUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Users;