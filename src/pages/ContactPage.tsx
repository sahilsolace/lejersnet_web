import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Clock, Send, MapPin } from 'lucide-react';
import { CONTACT } from '@/lib/constants';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/Toast';

export function ContactPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast('Please write a message.', 'error');
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    toast('Message sent – we will get back to you shortly.', 'success');
    setForm({ name: '', email: '', message: '' });
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
        <h1 className="text-xl font-semibold text-ink">Contact LejersNet</h1>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
            <Mail size={16} />
          </div>
          <p className="text-xs text-ink-muted">Email</p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="text-sm font-medium text-ink hover:text-accent"
          >
            {CONTACT.email}
          </a>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center mb-3">
            <Phone size={16} />
          </div>
          <p className="text-xs text-ink-muted">Phone</p>
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
            className="text-sm font-medium text-ink hover:text-accent"
          >
            {CONTACT.phone}
          </a>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-3">
            <Clock size={16} />
          </div>
          <p className="text-xs text-ink-muted">Phone support</p>
          <p className="text-sm font-medium text-ink">{CONTACT.support_hours}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold text-ink mb-4">Send us a message</h2>
        <form onSubmit={send} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Jane Doe"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="jane@example.com"
            />
          </div>
          <Textarea
            label="Message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="How can we help?"
          />
          <Button type="submit" loading={sending} className="w-full sm:w-auto">
            <Send size={16} /> Send message
          </Button>
        </form>
      </Card>

      <Card className="p-4 flex items-center gap-3 bg-navy text-white border-navy">
        <MapPin size={18} className="shrink-0" />
        <p className="text-sm text-white/80">
          LejersNet – helping tenants across Denmark keep their paperwork in order.
        </p>
      </Card>
    </div>
  );
}
