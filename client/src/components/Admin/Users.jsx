import { useQuery, gql } from '@apollo/client';
import { Container, Table, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ChangeRoleModal from './ChangeRoleModal';

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
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  if (refetchList) {
    refetchList.current = refetch;
  }

  const handleRoleClick = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
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
            <th>Actions</th>
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
              <td>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleRoleClick(user)}
                >
                  Change Role
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ChangeRoleModal
        show={showRoleModal}
        handleClose={() => setShowRoleModal(false)}
        user={selectedUser}
        refetch={refetch}
      />
    </Container>
  );
}

export default Users;