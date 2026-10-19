import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, Image, AlertTriangle, ChevronRight, Phone, Mail, Clock, MapPin } from 'lucide-react';
import { useAuth, useDB } from '@/lib/store';
import { CATEGORIES, CONTACT, PLAN_PRICE_DKK, formatDate, formatDKK } from '@/lib/constants';
import { Avatar } from '@/components/Avatar';
import { Badge, Button, Card, EmptyState, SectionTitle } from '@/components/ui';
import type { CategoryId, Inspection } from '@/types';

export function HomePage() {
  const { user } = useAuth();
  const db = useDB();

  if (!user) return null;

  const pictureCount = db.media.filter((m) => m.kind === 'PICTURE').length;
  const docCount = db.media.filter((m) => m.kind === 'DOCUMENT').length;
  const isMember = user.plan === 'member';

  const needsAttention = db.inspections
    .map((insp) => {
      const addr = db.addresses.find((a) => a.id === insp.address_id);
      const filled = new Set(
        db.media.filter((m) => m.inspection_id === insp.id).map((m) => m.category_id)
      );
      const missed = CATEGORIES.filter((c) => !filled.has(c.id)).map((c) => c.id);
      return { insp, addr, missed };
    })
    .filter((x) => x.missed.length > 0 && x.addr);

  const greeting = `Good ${timeOfDay()}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <Avatar name={user.name} src={user.avatar} size={44} />
        <div>
          <p className="text-sm text-ink-muted">{greeting},</p>
          <p className="text-lg font-semibold text-ink -mt-0.5">{user.name.split(' ')[0]}</p>
        </div>
        {isMember && (
          <div className="ml-auto">
            <Badge color="success">
              <CheckCircle2 size={12} /> Member
            </Badge>
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-card bg-navy text-white p-6 lg:p-8 shadow-cardLg">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-navy-light/50 blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-xl lg:text-2xl font-bold leading-snug max-w-xl">
            Take control of your tenancy – from the day you move in to the day you move out.
          </h1>
          <p className="mt-3 text-white/70 text-sm max-w-lg">
            Store your lease, photos and important documents securely in one place for only{' '}
            {formatDKK(PLAN_PRICE_DKK)} per month.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {!isMember && (
              <Link to="/subscribe">
                <Button variant="secondary" size="lg">
                  Become a Member Now
                </Button>
              </Link>
            )}
            <Link to="/contact">
              <Button
                size="lg"
                className="!bg-white/10 !text-white hover:!bg-white/20 !border !border-white/20"
              >
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Housing directory shortcut */}
      <Link to="/addresses" className="block">
        <Card className="p-4 flex items-center gap-3 hover:shadow-cardLg transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">View your housing directory</p>
            <p className="text-xs text-ink-muted">
              {db.addresses.length} {db.addresses.length === 1 ? 'address' : 'addresses'} saved
            </p>
          </div>
          <ChevronRight size={18} className="text-ink-muted" />
        </Card>
      </Link>

      {/* Stats */}
      <div>
        <SectionTitle>Your Documents</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/documents">
            <StatCard
              icon={<FileText size={18} />}
              label="Documents Saved"
              value={docCount}
              tint="navy"
            />
          </Link>
          <Link to="/pictures">
            <StatCard
              icon={<Image size={18} />}
              label="Pictures Saved"
              value={pictureCount}
              tint="accent"
            />
          </Link>
        </div>
      </div>

      {/* Needs attention */}
      <div>
        <SectionTitle>
          Needs attention
          {needsAttention.length > 0 && (
            <Badge color="warning" >
              {needsAttention.length}
            </Badge>
          )}
        </SectionTitle>
        {needsAttention.length === 0 ? (
          <Card>
            <EmptyState
              icon={<CheckCircle2 size={24} />}
              title="All caught up"
              description="No missing sections across your inspections."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {needsAttention.map(({ insp, addr, missed }) => (
              <AttentionCard
                key={insp.id}
                insp={insp}
                addressTitle={addr!.title}
                street={addr!.street}
                missed={missed}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contact teaser */}
      <Card className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <Phone size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Need a hand?</p>
          <p className="text-xs text-ink-muted mt-0.5">
            {CONTACT.phone} · {CONTACT.support_hours}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`mailto:${CONTACT.email}`}>
              <Button size="sm" variant="outline">
                <Mail size={14} /> Email
              </Button>
            </a>
            <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>
              <Button size="sm" variant="outline">
                <Phone size={14} /> Call
              </Button>
            </a>
          </div>
        </div>
        <Clock size={16} className="text-ink-muted shrink-0 mt-1" />
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: 'navy' | 'accent';
}) {
  const tintMap = {
    navy: 'bg-navy/5 text-navy',
    accent: 'bg-accent/10 text-accent',
  };
  return (
    <Card className="p-4 hover:shadow-cardLg transition-shadow cursor-pointer h-full">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${tintMap[tint]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </Card>
  );
}

function AttentionCard({
  insp,
  addressTitle,
  street,
  missed,
}: {
  insp: Inspection;
  addressTitle: string;
  street: string;
  missed: CategoryId[];
}) {
  const moveType = insp.type === 'MOVE_IN' ? 'Move-In' : 'Move-Out';
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color="warning">
              <AlertTriangle size={12} /> {missed.length} missing
            </Badge>
            <Badge color="muted">{moveType}</Badge>
          </div>
          <p className="text-sm font-semibold text-ink mt-2 truncate">{addressTitle}</p>
          <p className="text-xs text-ink-muted truncate">{street} · {formatDate(insp.date)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {missed.map((id) => {
          const cat = CATEGORIES.find((c) => c.id === id);
          return (
            <Link
              key={id}
              to={`/upload/${insp.address_id}/${insp.type}?focus=${id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
            >
              {cat?.label} · <span className="underline">Complete now</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
