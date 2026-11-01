import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getError } from '../api';
import AuthSplit from '../components/AuthSplit';
import { pillBtn } from '../ui';

export default function VerifyEmail() {
  const { token } = useParams();
  const [state, setState] = useState({ status: 'loading', message: '' });
  const called = useRef(false); // React dev mode runs effects twice

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    api
      .get(`/auth/verify/${token}`)
      .then(({ data }) => setState({ status: 'success', message: data.message }))
      .catch((err) => setState({ status: 'error', message: getError(err) }));
  }, [token]);

  return (
    <AuthSplit
      heading="Email"
      accent="verification."
      subtitle={state.status === 'loading' ? 'Checking your link...' : undefined}
      panelHeading="Welcome"
      panelAccent="aboard."
      panelText="Verifying your email keeps your account and your orders secure."
    >
      <div className="space-y-6">
        {state.status === 'loading' && <p className="text-sm text-stone-500">Verifying your email...</p>}
        {state.status === 'success' && <p role="status" className="text-sm text-emerald-700">{state.message}</p>}
        {state.status === 'error' && (
          <>
            <p role="alert" className="text-sm text-red-600">{state.message}</p>
            <Link to="/resend-verification" className="inline-block text-red-600 text-sm font-bold uppercase tracking-widest hover:underline">
              Request a new link
            </Link>
          </>
        )}
        <Link to="/login" className={`${pillBtn} block text-center`}>Go to login</Link>
      </div>
    </AuthSplit>
  );
}