import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, KeyRound, Mail, User as UserIcon, Lock, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { Button, Input } from '@/components/ui';
import { Spinner } from '@/components/Spinner';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', token: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Please enter your name.';
    if (mode !== 'reset' && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = 'Enter a valid email.';
    if (mode === 'reset' && !form.token.trim()) e.token = 'Enter the token from your email.';
    if ((mode === 'signin' || mode === 'signup' || mode === 'reset') && form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'signin') {
        await authApi.signIn(form.email, form.password);
        toast('Welcome back!', 'success');
        navigate('/');
      } else if (mode === 'signup') {
        await authApi.signUp(form.name, form.email, form.password);
        toast('Account created – welcome to LejersNet.', 'success');
        navigate('/');
      } else if (mode === 'forgot') {
        await authApi.forgotPassword(form.email);
        toast('Reset link sent to your email.', 'info');
        setMode('reset');
      } else if (mode === 'reset') {
        await authApi.resetPassword(form.token, form.password);
        toast('Password updated. You can sign in now.', 'success');
        setMode('signin');
      }
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const social = async (p: 'google' | 'facebook') => {
    setSocialLoading(p);
    try {
      await authApi.social(p);
      toast(`Signed in with ${p === 'google' ? 'Google' : 'Facebook'}.`, 'success');
      navigate('/');
    } catch {
      toast('Social sign-in failed.', 'error');
    } finally {
      setSocialLoading(null);
    }
  };

  const titleMap = {
    signin: 'Sign in to your account',
    signup: 'Create your LejersNet account',
    forgot: 'Reset your password',
    reset: 'Set a new password',
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg">
      {/* Left brand panel */}
      <div className="relative lg:w-1/2 bg-navy text-white p-8 lg:p-12 flex flex-col justify-between overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-navy-light/40 blur-3xl" />
        <div className="absolute bottom-0 -left-12 w-60 h-60 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Home size={18} />
          </div>
          <span className="font-semibold tracking-tight text-lg">LejersNet</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-2xl lg:text-4xl font-bold leading-tight">
            Take control of your tenancy – from the day you move in to the day you move out.
          </h1>
          <p className="mt-4 text-white/70 text-sm lg:text-base">
            Store your lease, photos and important documents securely in one place for only 49 DKK per month.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Lease & contracts', 'Move-in / Move-out', 'Photo evidence', 'All in one place'].map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">
          lejersnet.com · Members area
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {mode === 'reset' && (
            <button
              onClick={() => setMode('signin')}
              className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
            >
              <ArrowLeft size={14} /> Back to sign in
            </button>
          )}
          <h2 className="text-xl font-semibold text-ink">{titleMap[mode]}</h2>
          <p className="text-sm text-ink-muted mt-1">
            {mode === 'signin' && 'Welcome back – your tenancy, organised.'}
            {mode === 'signup' && 'Start your 14-day satisfaction guarantee today.'}
            {mode === 'forgot' && "We'll email you a reset link."}
            {mode === 'reset' && 'Paste the token from your email and choose a new password.'}
          </p>

          {mode !== 'reset' && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => social('google')}
                  loading={socialLoading === 'google'}
                  className="!border-border !text-ink"
                >
                  {socialLoading !== 'google' && <GoogleIcon />}
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => social('facebook')}
                  loading={socialLoading === 'facebook'}
                  className="!border-border !text-ink"
                >
                  {socialLoading !== 'facebook' && <FacebookIcon />}
                  Facebook
                </Button>
              </div>
              <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
                <div className="flex-1 h-px bg-border" />
                or use email
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <Field icon={<UserIcon size={16} />} error={errors.name}>
                <Input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  aria-label="Full name"
                />
              </Field>
            )}
            {mode !== 'reset' && (
              <Field icon={<Mail size={16} />} error={errors.email}>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  aria-label="Email"
                />
              </Field>
            )}
            {mode === 'reset' && (
              <Field icon={<KeyRound size={16} />} error={errors.token}>
                <Input
                  placeholder="Reset token"
                  value={form.token}
                  onChange={(e) => set('token', e.target.value)}
                  aria-label="Reset token"
                />
              </Field>
            )}
            {mode !== 'forgot' && (
              <Field icon={<Lock size={16} />} error={errors.password}>
                <Input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  aria-label="Password"
                />
              </Field>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {mode === 'signin' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'forgot' && 'Send reset link'}
              {mode === 'reset' && 'Update password'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-muted">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-accent font-medium hover:underline">
                  Sign up
                </button>
              </>
            ) : mode === 'signup' ? (
              <>
                Already a member?{' '}
                <button onClick={() => setMode('signin')} className="text-accent font-medium hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Remember your password?{' '}
                <button onClick={() => setMode('signin')} className="text-accent font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, error, children }: { icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className={error ? '' : ''}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/60 pointer-events-none">
          {icon}
        </span>
        <div className="[&_input]:pl-9">{children}</div>
      </div>
      {error && <span className="block text-xs text-danger mt-1 pl-1">{error}</span>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

export function MockAuthScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Spinner size={28} />
    </div>
  );
}
