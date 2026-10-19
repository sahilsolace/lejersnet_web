import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon, Mail, Lock, Link as LinkIcon, Eye, EyeOff, Shield,
  Ban, CreditCard, MapPin, ShoppingBag, LogOut, ChevronRight, RefreshCw, Copy, Check,
} from 'lucide-react';
import {
  authApi, profileApi, blockApi, useAuth, useDB,
} from '@/lib/store';
import { Avatar } from '@/components/Avatar';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { formatDate, formatDKK } from '@/lib/constants';

export function ProfilePage() {
  const { user } = useAuth();
  const db = useDB();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<'personal' | 'email' | 'password' | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [unblockTarget, setUnblockTarget] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const profileUrl = `lejersnet.com/u/${user.username}`;

  const refresh = async () => {
    setRefreshing(true);
    await authApi.refreshFromWix();
    setRefreshing(false);
    toast('Profile re-synced from Wix.', 'success');
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(`https://${profileUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar name={user.name} src={user.avatar} size={64} />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-ink">{user.name}</p>
            <p className="text-sm text-ink-muted truncate">{user.email}</p>
            {user.bio && <p className="text-sm text-ink-muted mt-2">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge color={user.plan === 'member' ? 'success' : 'muted'}>
                {user.plan === 'member' ? 'Member' : 'Free plan'}
              </Badge>
              <Badge color={user.privacy === 'public' ? 'accent' : 'muted'}>
                {user.privacy === 'public' ? 'Public profile' : 'Private'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={refresh} loading={refreshing}>
            <RefreshCw size={14} /> Refresh from Wix
          </Button>
        </div>
        <p className="text-xs text-ink-muted mt-3">
          Last synced {formatDate(user.synced_at)}
        </p>
      </Card>

      {/* Profile URL */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <LinkIcon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">Profile URL</p>
              <p className="text-sm font-medium text-ink truncate">{profileUrl}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={copyUrl}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Card>

      {/* Privacy toggle */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy/5 text-navy flex items-center justify-center shrink-0">
            <Shield size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">Profile privacy</p>
            <p className="text-xs text-ink-muted">
              {user.privacy === 'public'
                ? 'Anyone can view your public profile.'
                : 'Only you can see your profile.'}
            </p>
          </div>
          <div className="inline-flex bg-bg rounded-xl p-1">
            <button
              onClick={() => profileApi.setPrivacy('private')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                user.privacy === 'private' ? 'bg-white text-navy shadow-sm' : 'text-ink-muted'
              }`}
            >
              Private
            </button>
            <button
              onClick={() => profileApi.setPrivacy('public')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                user.privacy === 'public' ? 'bg-white text-navy shadow-sm' : 'text-ink-muted'
              }`}
            >
              Public
            </button>
          </div>
        </div>
      </Card>

      {/* Editable sections */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide px-1">
          Account
        </p>
        <SettingsRow
          icon={<UserIcon size={16} />}
          title="Personal info"
          subtitle={user.name}
          onClick={() => setEditing('personal')}
        />
        <SettingsRow
          icon={<Mail size={16} />}
          title="Change email"
          subtitle={user.email}
          onClick={() => setEditing('email')}
        />
        <SettingsRow
          icon={<Lock size={16} />}
          title="Change password"
          subtitle="••••••••"
          onClick={() => setEditing('password')}
        />
      </div>

      {/* Blocked members */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide px-1">
          Blocked members
        </p>
        {db.blocks.length === 0 ? (
          <Card className="p-4 text-sm text-ink-muted">No blocked members.</Card>
        ) : (
          db.blocks.map((b) => (
            <Card key={b.id} className="p-3 flex items-center gap-3">
              <Avatar name={b.blocked_name} src={b.blocked_avatar} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{b.blocked_name}</p>
                <p className="text-xs text-ink-muted truncate">{b.blocked_email}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setUnblockTarget(b.id)}>
                Unblock
              </Button>
            </Card>
          ))
        )}
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide px-1">
          Membership
        </p>
        <SettingsRow
          icon={<CreditCard size={16} />}
          title="My Subscriptions"
          subtitle={
            db.subscriptions.length > 0
              ? `${db.subscriptions.length} active`
              : 'No subscription'
          }
          onClick={() => navigate('/profile/subscriptions')}
        />
        <SettingsRow
          icon={<MapPin size={16} />}
          title="My Addresses"
          subtitle={`${db.addresses.length} saved`}
          onClick={() => navigate('/profile/addresses')}
        />
        <SettingsRow
          icon={<ShoppingBag size={16} />}
          title="My Orders"
          subtitle={`${db.orders.length} orders`}
          onClick={() => navigate('/profile/orders')}
        />
      </div>

      {/* Sign out */}
      <Button
        variant="ghost"
        className="w-full !text-danger hover:!bg-danger/5"
        onClick={() => setConfirmSignOut(true)}
      >
        <LogOut size={16} /> Sign out
      </Button>

      {/* Edit modals */}
      <PersonalModal
        open={editing === 'personal'}
        onClose={() => setEditing(null)}
      />
      <EmailModal open={editing === 'email'} onClose={() => setEditing(null)} />
      <PasswordModal open={editing === 'password'} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={!!unblockTarget}
        onClose={() => setUnblockTarget(null)}
        onConfirm={() => {
          if (unblockTarget) {
            blockApi.unblock(unblockTarget);
            toast('Member unblocked.', 'success');
          }
        }}
        title="Unblock member"
        message="They will be able to view your public profile and contact you again."
        confirmLabel="Unblock"
      />

      <ConfirmDialog
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={() => authApi.signOut()}
        title="Sign out"
        message="You'll need to sign in again to access your area."
        confirmLabel="Sign out"
      />
    </div>
  );
}

function SettingsRow({
  icon, title, subtitle, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 bg-card rounded-card border border-border hover:shadow-card transition-shadow text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-navy/5 text-navy flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        {subtitle && <p className="text-xs text-ink-muted truncate">{subtitle}</p>}
      </div>
      <ChevronRight size={16} className="text-ink-muted" />
    </button>
  );
}

function PersonalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: user?.name ?? '', bio: user?.bio ?? '' });
  return (
    <Modal open={open} onClose={onClose} title="Personal info">
      <div className="space-y-3">
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Textarea
          label="Bio"
          rows={3}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="A short bio shown on your public profile."
        />
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              profileApi.updateProfile({ name: form.name, bio: form.bio });
              toast('Personal info updated.', 'success');
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Change email">
      <div className="space-y-3">
        <Input label="New email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Confirm with password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
                toast('Enter a valid email.', 'error');
                return;
              }
              profileApi.changeEmail(email);
              toast('Email updated.', 'success');
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [show, setShow] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title="Change password">
      <div className="space-y-3">
        <Input
          label="Current password"
          type={show ? 'text' : 'password'}
          value={cur}
          onChange={(e) => setCur(e.target.value)}
        />
        <Input
          label="New password"
          type={show ? 'text' : 'password'}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <button
          onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
          {show ? 'Hide passwords' : 'Show passwords'}
        </button>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (next.length < 6) {
                toast('New password must be at least 6 characters.', 'error');
                return;
              }
              profileApi.changePassword();
              toast('Password updated.', 'success');
              onClose();
            }}
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}
