import React from 'react';
import './UsersList.css';

const UsersList = ({ users }) => {
  return (
    <div className="users-list">
      <div className="users-list-header">
        <h3>👥 Users in Room ({users.length})</h3>
      </div>
      <div className="users-list-content">
        {users.length === 0 ? (
          <p className="no-users">No other users in the room</p>
        ) : (
          <ul>
            {users.map((user, index) => (
              <li key={index} className="user-item">
                <span className="user-status-indicator"></span>
                <span className="user-name">{user.name}</span>
                {user.isYou && <span className="user-tag">You</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UsersList;
