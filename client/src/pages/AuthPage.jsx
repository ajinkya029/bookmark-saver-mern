import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ArrowUpRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await authenticate(mode, form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Unable to connect. Check that the API is running.'); }
    finally { setBusy(false); }
  };
  return <main className="auth-layout">
    <section className="auth-aside">
      <div className="brand brand-light"><span className="brand-mark"><Bookmark size={20} fill="currentColor" /></span> markd.</div>
      <div className="aside-copy">
        <span className="eyebrow"><Sparkles size={14} /> YOUR CORNER OF THE INTERNET</span>
        <h1>Good things<br />are worth <em>keeping.</em></h1>
        <p>One tidy home for all the links you want to come back to. Save now, find them in seconds.</p>
        <div className="mini-preview"><div className="preview-top"><span /><span /><span /><small>your saved space</small></div><div className="preview-lines"><i /><i /><i /></div><div className="preview-foot"><span>✦  Organized, effortlessly</span><span>↗</span></div></div>
      </div>
      <span className="aside-bottom">A little less lost on the internet.</span>
    </section>
    <section className="auth-main">
      <div className="auth-form-wrap">
        <div className="mobile-brand brand"><span className="brand-mark"><Bookmark size={18} fill="currentColor" /></span> markd.</div>
        <div className="form-heading"><span className="eyebrow">WELCOME {isRegister ? 'ABOARD' : 'BACK'}</span><h2>{isRegister ? 'Create your space.' : 'Your links missed you.'}</h2><p>{isRegister ? 'Start collecting the good stuff.' : 'Pick up right where you left off.'}</p></div>
        <form onSubmit={submit} className="auth-form">
          {isRegister && <label>Your name<input name="name" value={form.name} onChange={change} placeholder="Alex Morgan" autoComplete="name" required maxLength="60" /></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" required /></label>
          <label>Password<div className="password-wrap"><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={change} placeholder="At least 8 characters" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength="8" required /><button type="button" className="icon-button password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <ArrowUpRight size={17} /></button>
        </form>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New around here?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        <span className="privacy-note">Your bookmarks are private to your account.</span>
      </div>
    </section>
  </main>;
}
