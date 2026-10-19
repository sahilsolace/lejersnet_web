import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, Shield, CreditCard, Lock, CheckCircle2, XCircle, Sparkles,
} from 'lucide-react';
import { subscriptionApi, orderApi, useAuth } from '@/lib/store';
import { PLAN_PRICE_DKK, formatDKK } from '@/lib/constants';
import { Button, Card, Input } from '@/components/ui';
import { useToast } from '@/components/Toast';

type Step = 'plan' | 'checkout' | 'processing' | 'success' | 'failure';

const BENEFITS = [
  'Store your lease and contracts securely',
  'Unlimited move-in / move-out photo records',
  'Side-by-side move-in vs move-out comparisons',
  'Access from any device, anywhere',
  '14-day satisfaction guarantee',
];

export function SubscribePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('plan');
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    card: '4242 4242 4242 4242',
    expiry: '12 / 28',
    cvc: '123',
    country: 'Denmark',
  });

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    // Mock payment provider (Stripe test mode interface)
    await new Promise((r) => setTimeout(r, 1400));
    const ok = form.card.replace(/\s/g, '').startsWith('4242');
    if (!ok) {
      setStep('failure');
      return;
    }
    const sub = subscriptionApi.create('LejersNet Membership', PLAN_PRICE_DKK);
    orderApi.create('LejersNet Membership', PLAN_PRICE_DKK, `Visa •••• ${form.card.slice(-4)}`);
    setStep('success');
    void sub;
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-bg text-ink-muted"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-ink">
          {step === 'plan' && 'Become a Member'}
          {step === 'checkout' && 'Checkout'}
          {step === 'processing' && 'Processing payment…'}
          {step === 'success' && 'Welcome to LejersNet'}
          {step === 'failure' && 'Payment failed'}
        </h1>
      </div>

      {/* Progress */}
      {(step === 'plan' || step === 'checkout') && (
        <div className="flex items-center gap-2 text-xs">
          <StepDot active={step === 'plan'} done={step === 'checkout'} n={1} label="Plan" />
          <div className="flex-1 h-px bg-border" />
          <StepDot active={step === 'checkout'} n={2} label="Payment" />
        </div>
      )}

      {step === 'plan' && (
        <>
          <Card className="p-6 bg-navy text-white border-navy relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-accent" />
                <span className="text-xs font-medium uppercase tracking-wide text-white/60">
                  Membership
                </span>
              </div>
              <p className="text-3xl font-bold">
                {formatDKK(PLAN_PRICE_DKK)}
                <span className="text-base font-medium text-white/60"> / month</span>
              </p>
              <p className="text-sm text-white/70 mt-2">No commitment · cancel anytime</p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-ink mb-3">Your member benefits</p>
            <ul className="space-y-2.5">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </span>
                  <span className="text-sm text-ink">{b}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 flex items-start gap-3 bg-success/5 border-success/20">
            <Shield size={18} className="text-success shrink-0 mt-0.5" />
            <p className="text-sm text-ink">
              <span className="font-semibold">14-day satisfaction guarantee.</span> Try LejersNet
              risk-free. Not happy? Get a full refund within 14 days.
            </p>
          </Card>

          <Button size="lg" className="w-full" onClick={() => setStep('checkout')}>
            Continue to checkout
          </Button>
        </>
      )}

      {step === 'checkout' && (
        <form onSubmit={pay} className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink mb-3">Billing details</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <Input
                label="Country"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <CreditCard size={16} /> Payment details
            </p>
            <div className="space-y-3">
              <Input
                label="Card number"
                value={form.card}
                onChange={(e) => setForm((f) => ({ ...f, card: e.target.value }))}
                placeholder="4242 4242 4242 4242"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiry"
                  value={form.expiry}
                  onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
                  placeholder="MM / YY"
                />
                <Input
                  label="CVC"
                  value={form.cvc}
                  onChange={(e) => setForm((f) => ({ ...f, cvc: e.target.value }))}
                  placeholder="123"
                />
              </div>
              <p className="text-xs text-ink-muted flex items-center gap-1.5">
                <Lock size={12} /> Test mode – use 4242 4242 4242 4242 to succeed.
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-bg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">LejersNet Membership – monthly</span>
              <span className="text-ink font-medium">{formatDKK(PLAN_PRICE_DKK)}</span>
            </div>
            <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Total today</span>
              <span className="text-lg font-bold text-ink">{formatDKK(PLAN_PRICE_DKK)}</span>
            </div>
          </Card>

          <Button type="submit" size="lg" className="w-full">
            <Lock size={16} /> Pay {formatDKK(PLAN_PRICE_DKK)}
          </Button>
        </form>
      )}

      {step === 'processing' && (
        <Card className="p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-bg flex items-center justify-center mb-4">
            <div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-ink">Charging your card…</p>
          <p className="text-xs text-ink-muted mt-1">Please don't close this page.</p>
        </Card>
      )}

      {step === 'success' && (
        <Card className="p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-lg font-semibold text-ink">Payment successful</h2>
          <p className="text-sm text-ink-muted mt-1 max-w-sm">
            Your LejersNet membership is now active. A receipt has been added to My Orders.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              View subscription
            </Button>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </Card>
      )}

      {step === 'failure' && (
        <Card className="p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4">
            <XCircle size={28} />
          </div>
          <h2 className="text-lg font-semibold text-ink">Payment failed</h2>
          <p className="text-sm text-ink-muted mt-1 max-w-sm">
            Your card was declined. Try the test card 4242 4242 4242 4242 or contact your bank.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={() => setStep('checkout')}>Try again</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function StepDot({
  active, done, n, label,
}: {
  active: boolean;
  done?: boolean;
  n: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
          done
            ? 'bg-success text-white'
            : active
            ? 'bg-navy text-white'
            : 'bg-bg text-ink-muted'
        }`}
      >
        {done ? <Check size={12} /> : n}
      </span>
      <span className={`text-xs font-medium ${active || done ? 'text-ink' : 'text-ink-muted'}`}>
        {label}
      </span>
    </div>
  );
}
