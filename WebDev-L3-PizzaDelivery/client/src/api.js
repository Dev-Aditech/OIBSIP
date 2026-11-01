import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach the login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// The sentence shown to someone whose account is suspended
export const suspensionMessage = (data) => {
  const until = data?.until ? new Date(data.until).toLocaleString() : '';
  const reason = data?.reason ? ` Reason: ${data.reason}` : '';
  return until ? `Your account is suspended until ${until}.${reason}` : `Your account is suspended.${reason}`;
};

// An expired token, a deleted account or a suspended account all send the person back to log in
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    const suspended = status === 403 && data?.code === 'ACCOUNT_SUSPENDED';
    const isLoginRequest = err.config?.url === '/auth/login'; // the login page shows its own message

    if ((status === 401 || suspended) && !isLoginRequest) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (suspended) sessionStorage.setItem('authNotice', suspensionMessage(data));
      else if (data?.code === 'ACCOUNT_DELETED') sessionStorage.setItem('authNotice', 'This account no longer exists.');
      window.location.href = user?.role === 'admin' ? '/admin/login' : '/login';
    }
    return Promise.reject(err);
  }
);

export const getError = (err) =>
  err.response?.data?.message || 'Cannot reach the server. Is it running?';

export default api;