import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { pillInput } from '../ui';

// A password box with a show/hide button
export default function PasswordInput({ className = pillInput, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={`${className} pr-14`} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-4 flex items-center text-stone-400 hover:text-red-600"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}