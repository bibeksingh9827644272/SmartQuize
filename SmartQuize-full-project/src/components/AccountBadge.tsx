import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../data/auth';
import { useToast } from './Toast';

interface AccountBadgeProps {
  tone?: 'light' | 'dark';
  className?: string;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SQ';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AccountBadge({ tone = 'light', className }: AccountBadgeProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();

  if (!user) return null;

  const handleSignOut = () => {
    logout();
    notify('Signed out. Your local exams and results are still here.', 'info');
    navigate(`/login?role=${user.role}`, { replace: true });
  };

  return (
    <div
      className={`account-badge account-badge--${tone}${className ? ` ${className}` : ''}`}
      title={`${user.email} · ${user.phone}`}
    >
      <span className="account-avatar" aria-hidden="true">
        {initialsFor(user.name)}
      </span>
      <span className="account-copy">
        <strong>{user.name}</strong>
        <em>{user.role === 'admin' ? 'Admin · Teacher' : 'Student'}</em>
      </span>
      <button
        type="button"
        className="account-signout"
        onClick={handleSignOut}
        aria-label={`Sign out of ${user.name}'s account`}
        title="Sign out"
      >
        <LogOut size={15} />
      </button>
    </div>
  );
}
