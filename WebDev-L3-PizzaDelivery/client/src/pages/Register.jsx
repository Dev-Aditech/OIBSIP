import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Mail } from 'lucide-react';
import api, { getError } from '../api';
import AuthSplit from '../components/AuthSplit';
import PasswordInput from '../components/PasswordInput';
import PasswordRules from '../components/PasswordRules';
import { PillLabel, pillInput, pillBtn } from '../ui';
import { isValidPhone, passwordIsValid } from '../passwordRules';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const STEPS = ['Your details', 'Security'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const emailOk = EMAIL_RE.test(form.email.trim());
  const phoneOk = isValidPhone(form.phone);
  const step1Ok = Boolean(form.name.trim()) && emailOk && phoneOk;
  const passwordOk = passwordIsValid(form.password);
  const matches = form.password === form.confirm;
  const step2Ok = passwordOk && matches;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1 only moves on to step 2 (this also handles the Enter key)
    if (step === 1) {
      if (step1Ok) {
        setError('');
        setStep(2);
      } else {
        setTouched({ ...touched, email: true, phone: true });
      }
      return;
    }

    if (!step1Ok || !step2Ok) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setDone(true);
    } catch (err) {
      const message = getError(err);
      setError(message);
      // Problems with the email or phone belong to step 1
      if (/email|phone/i.test(message)) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthSplit
        heading="Check your"
        accent="email."
        subtitle={`We sent a verification link to ${form.email}`}
        panelHeading="Almost"
        panelAccent="there."
        panelText="Verify your email and you can start building your first pizza."
      >
        <div className="space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8" />
          </div>
          <p className="text-sm text-stone-600">Click the link in the email to activate your account, then log in.</p>
          <p className="text-xs text-stone-500">
            Nothing after a minute? Check spam, or{' '}
            <Link to="/resend-verification" className="text-red-600 font-semibold hover:underline">send it again</Link>.
          </p>
          <Link to="/login" className="inline-block text-red-600 text-sm font-bold uppercase tracking-widest hover:underline">Back to login</Link>
        </div>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit
      heading="Create your"
      accent="account."
      subtitle={step === 1 ? 'Step 1 of 2: tell us about you.' : 'Step 2 of 2: secure your account.'}
      panelHeading="Join the"
      panelAccent="slice club."
      panelText="Build your own pizza, pay securely, save your favourites and follow every order live."
    >
      <ol className="flex items-center mb-5">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const finished = step > n;
          const active = step === n;
          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  finished ? 'bg-emerald-600 text-white' : active ? 'bg-red-600 text-white ring-4 ring-red-100' : 'bg-stone-200 text-stone-500'
                }`}
              >
                {finished ? <Check className="w-4 h-4" /> : n}
              </span>
              <span className={`ml-2 text-[11px] font-bold uppercase tracking-widest ${active ? 'text-stone-900' : 'text-stone-400'}`}>{label}</span>
              {i < STEPS.length - 1 && <span className={`flex-1 h-0.5 mx-4 ${finished ? 'bg-emerald-600' : 'bg-stone-200'}`} />}
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {step === 1 && (
          <>
            <div>
              <PillLabel>Full name</PillLabel>
              <input name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={handleChange} className={pillInput} autoFocus required />
            </div>

            <div>
              <PillLabel>Phone number</PillLabel>
              <input name="phone" type="tel" autoComplete="tel" placeholder="+234 801 234 5678" value={form.phone} onChange={handleChange} onBlur={handleBlur} className={pillInput} required />
              {touched.phone && !phoneOk && (
                <p className="text-xs text-red-600 ml-4 mt-2">Enter a valid phone number (7 to 15 digits, optional + at the start).</p>
              )}
            </div>

            <div>
              <PillLabel>Email address</PillLabel>
              <input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className={pillInput} required />
              {touched.email && !emailOk && <p className="text-xs text-red-600 ml-4 mt-2">Enter a valid email address.</p>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs text-stone-500 ml-4">
              Creating an account for <span className="font-semibold text-stone-800">{form.email}</span>
            </p>

            <div>
              <PillLabel>Password</PillLabel>
              <PasswordInput name="password" autoComplete="new-password" placeholder="Create a strong password" value={form.password} onChange={handleChange} maxLength={72} autoFocus required />
              <PasswordRules password={form.password} />
            </div>

            <div>
              <PillLabel>Confirm password</PillLabel>
              <PasswordInput name="confirm" autoComplete="new-password" placeholder="Type the password again" value={form.confirm} onChange={handleChange} maxLength={72} required />
              {form.confirm && !matches && <p className="text-xs text-red-600 ml-4 mt-2">Passwords do not match.</p>}
              {form.confirm && matches && passwordOk && <p className="text-xs text-emerald-700 ml-4 mt-2">Passwords match.</p>}
            </div>
          </>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        {step === 1 ? (
          <button disabled={!step1Ok} className={pillBtn}>Continue</button>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => { setError(''); setStep(1); }}
              className="sm:w-1/3 flex items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600 hover:bg-stone-100 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button disabled={loading || !step2Ok} className={`${pillBtn} sm:w-2/3`}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        )}
      </form>

      <p className="mt-4 text-center text-xs text-stone-400">
        Already registered?{' '}
        <Link to="/login" className="text-red-600 font-bold uppercase tracking-widest ml-1 hover:underline">Sign in</Link>
      </p>
    </AuthSplit>
  );
}