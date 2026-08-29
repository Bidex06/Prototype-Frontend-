interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  subscriptionEnd: string;
  isTrial: boolean;
  createdAt: string;
}

interface Props {
  users: User[];
}

export default function UserTable({ users }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-border/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Sub Ends</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border hover:bg-border/30">
                <td className="px-4 py-3 text-white text-sm">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-white text-sm">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white text-sm">{user.isTrial ? 'Trial' : 'Premium'}</td>
                <td className="px-4 py-3 text-white text-sm">{user.subscriptionEnd}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}