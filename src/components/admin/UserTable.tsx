import { useState } from 'react';
import { api } from '../../services/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isAutoTradeEnabled: boolean;
  subscriptionEnd: string | null;
  isTrial: boolean;
  isSubscriptionActive: boolean;
  createdAt: string;
}

interface UserDetails {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isAutoTradeEnabled: boolean;
  lastLoginAt: string | null;
  subscription: {
    plan: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isTrial: boolean;
    trialEndDate: string | null;
  } | null;
}

interface Props {
  users: User[];
  onStatusChanged: () => void;
}

export default function UserTable({
  users,
  onStatusChanged,
}: Props) {
  const [processingUserId, setProcessingUserId] =
    useState<number | null>(null);

  const [actionError, setActionError] = useState('');

  const [selectedUser, setSelectedUser] =
    useState<UserDetails | null>(null);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState('');

  const handleStatusChange = async (user: User) => {
    const action = user.isActive
      ? 'deactivate'
      : 'activate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    setProcessingUserId(user.id);
    setActionError('');

    try {
      if (user.isActive) {
        await api.put(
          `/admin/users/${user.id}/deactivate`
        );
      } else {
        await api.put(
          `/admin/users/${user.id}/activate`
        );
      }

      onStatusChanged();
    } catch (error) {
      console.error(
        `Failed to ${action} user:`,
        error
      );

      setActionError(
        `Failed to ${action} user. Please try again.`
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleViewDetails = async (userId: number) => {
    setLoadingDetails(true);
    setDetailsError('');
    setSelectedUser(null);

    try {
      const response = await api.get<UserDetails>(
        `/admin/users/${userId}`
      );

      setSelectedUser(response.data);
    } catch (error) {
      console.error(
        'Failed to load user details:',
        error
      );

      setDetailsError(
        'Failed to load user details. Please try again.'
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedUser(null);
    setDetailsError('');
  };

  return (
    <div className="admin-table-container">

      {actionError && (
        <div className="admin-action-error">
          {actionError}
        </div>
      )}

      {detailsError && (
        <div className="admin-action-error">
          {detailsError}
        </div>
      )}

      {loadingDetails && (
        <div className="admin-user-details-loading">
          Loading user details...
        </div>
      )}

      {selectedUser && (
        <div className="admin-user-details-panel">

          <div className="admin-user-details-header">
            <div>
              <h2>
                {selectedUser.firstName}{' '}
                {selectedUser.lastName}
              </h2>

              <p>
                User ID: {selectedUser.id}
              </p>
            </div>

            <button
              type="button"
              className="admin-details-close-button"
              onClick={closeDetails}
            >
              Close
            </button>
          </div>

          <div className="admin-user-details-grid">

            <div className="admin-detail-item">
              <span>Email</span>
              <strong>{selectedUser.email}</strong>
            </div>

            <div className="admin-detail-item">
              <span>Role</span>
              <strong>{selectedUser.role}</strong>
            </div>

            <div className="admin-detail-item">
              <span>Account Status</span>
              <strong>
                {selectedUser.isActive
                  ? 'Active'
                  : 'Inactive'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Email Verified</span>
              <strong>
                {selectedUser.isEmailVerified
                  ? 'Yes'
                  : 'No'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Auto Trading</span>
              <strong>
                {selectedUser.isAutoTradeEnabled
                  ? 'Enabled'
                  : 'Disabled'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Last Login</span>
              <strong>
                {selectedUser.lastLoginAt
                  ? new Date(
                      selectedUser.lastLoginAt
                    ).toLocaleString()
                  : 'Never'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Subscription Plan</span>
              <strong>
                {selectedUser.subscription
                  ? selectedUser.subscription.plan
                  : 'No subscription'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Subscription Status</span>
              <strong>
                {selectedUser.subscription?.isActive
                  ? 'Active'
                  : 'Inactive'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Trial</span>
              <strong>
                {selectedUser.subscription?.isTrial
                  ? 'Yes'
                  : 'No'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Subscription Start</span>
              <strong>
                {selectedUser.subscription
                  ? new Date(
                      selectedUser.subscription.startDate
                    ).toLocaleDateString()
                  : 'N/A'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Subscription End</span>
              <strong>
                {selectedUser.subscription
                  ? new Date(
                      selectedUser.subscription.endDate
                    ).toLocaleDateString()
                  : 'N/A'}
              </strong>
            </div>

            <div className="admin-detail-item">
              <span>Trial End</span>
              <strong>
                {selectedUser.subscription?.trialEndDate
                  ? new Date(
                      selectedUser.subscription.trialEndDate
                    ).toLocaleDateString()
                  : 'N/A'}
              </strong>
            </div>

          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-user-table">

          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Sub Ends</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const isProcessing =
                processingUserId === user.id;

              return (
                <tr key={user.id}>

                  <td>
                    {user.firstName}{' '}
                    {user.lastName}
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={
                        user.isActive
                          ? 'admin-status active'
                          : 'admin-status inactive'
                      }
                    >
                      {user.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    {user.isTrial
                      ? 'Trial'
                      : 'Premium'}
                  </td>

                  <td>
                    {user.subscriptionEnd
                      ? new Date(
                          user.subscriptionEnd
                        ).toLocaleDateString()
                      : 'No subscription'}
                  </td>

                  <td>
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <div className="admin-user-actions">

                      <button
                        type="button"
                        className="admin-action-button view"
                        onClick={() =>
                          handleViewDetails(user.id)
                        }
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className={
                          user.isActive
                            ? 'admin-action-button deactivate'
                            : 'admin-action-button activate'
                        }
                        onClick={() =>
                          handleStatusChange(user)
                        }
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? 'Processing...'
                          : user.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}