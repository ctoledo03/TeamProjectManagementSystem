import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useMutation, gql } from '@apollo/client';

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      username
      email
      role
    }
  }
`;

function ChangeRoleModal({ show, handleClose, user, refetch }) {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'MEMBER');
  
  const [updateRole, { loading }] = useMutation(UPDATE_USER_ROLE, {
    onCompleted: () => {
      handleClose();
      refetch();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateRole({
        variables: {
          userId: user.id,
          role: selectedRole
        }
      });
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Role for {user?.username}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Role</Form.Label>
            <Form.Control
              as="select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </Form.Control>
            <Form.Text className="text-muted">
              Current role: {user?.role}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || selectedRole === user?.role}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ChangeRoleModal; 