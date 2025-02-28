import { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, ListGroup } from 'react-bootstrap';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_USERS = gql`
  query ViewUsers {
    viewUsers {
      id
      username
      email
      role
    }
  }
`;

const ASSIGN_USERS = gql`
  mutation AssignUsersToTeam($teamId: ID!, $userIds: [ID!]) {
    assignUsersToTeam(teamId: $teamId, userIds: $userIds) {
      id
      teamName
      members {
        id
        username
        email
      }
    }
  }
`;

function AssignUsersModal({ show, handleClose, team, refetch }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const { data: usersData } = useQuery(GET_USERS);
  
  useEffect(() => {
    if (team?.members) {
      setSelectedUsers(team.members.map(member => member.id));
    }
  }, [team]);
  
  const [assignUsers, { loading }] = useMutation(ASSIGN_USERS, {
    onCompleted: () => {
      handleClose();
      refetch();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignUsers({
        variables: {
          teamId: team.id,
          userIds: selectedUsers
        }
      });
    } catch (err) {
      console.error('Error assigning users:', err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Members to {team?.teamName}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <h6>Current Team Members:</h6>
            {team?.members?.length > 0 ? (
              <ListGroup>
                {team.members.map(member => (
                  <ListGroup.Item key={member.id} className="d-flex justify-content-between align-items-center">
                    {member.username} ({member.email})
                    <Badge bg="primary" pill>Member</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted">No members currently assigned</p>
            )}
          </div>

          <Form.Group>
            <Form.Label>Modify Team Members</Form.Label>
            <Form.Control
              as="select"
              multiple
              value={selectedUsers}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedUsers(values);
              }}
              className="mb-2"
              style={{ minHeight: '150px' }}
            >
              {usersData?.viewUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                  {selectedUsers.includes(user.id) ? ' (Current Member)' : ''}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              <ul className="mb-0">
                <li>Hold Ctrl/Cmd to select multiple users</li>
                <li>Unselect a user to remove them from the team</li>
                <li>Select new users to add them to the team</li>
              </ul>
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating Members...' : 'Update Team Members'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AssignUsersModal; 