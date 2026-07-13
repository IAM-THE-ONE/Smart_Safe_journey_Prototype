import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { ShieldAlert, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { auth as firebaseAuth, hasConfig as hasFirebase } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GoogleSignInButton: React.FC<{
  clientId: string;
  onSuccess: (res: any) => void;
  onError: (msg: string) => void;
}> = ({ clientId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await authAPI.googleLogin(tokenResponse.access_token);
        onSuccess(res);
      } catch (err: any) {
        onError(err.response?.data?.error || err.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => onError('Google sign-in popup closed or failed'),
  });

  if (!clientId) {
    return (
      <button type="button" disabled
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-400 font-medium text-sm cursor-not-allowed">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google Sign-In (not configured)
      </button>
    );
  }

  return (
    <button type="button" onClick={() => login()} disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium text-sm transition-all disabled:opacity-50">
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SafeVoyage AI</h1>
          <p className="text-blue-200/80 mt-1 text-sm">AI-Powered Smart Tourism Safety Platform</p>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3.5 rounded-xl mb-4 text-sm">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email or Username</label>
              <input
                type="text"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-3 text-gray-400">or continue with</span>
            </div>
          </div>

          {true ? (
            <GoogleOAuthProvider clientId={CLIENT_ID || 'dummy'}>
              <GoogleSignInButton
                clientId={CLIENT_ID}
                onSuccess={(res) => {
                  localStorage.setItem('access_token', res.data.tokens.access);
                  localStorage.setItem('refresh_token', res.data.tokens.refresh);
                  window.location.href = '/';
                }}
                onError={(msg) => setError(msg)}
              />
            </GoogleOAuthProvider>
          ) : null}

          {hasFirebase && (
            <div className="mt-3">
              <button type="button"
                onClick={async () => {
                  try {
                    const provider = new GoogleAuthProvider();
                    const result = await signInWithPopup(firebaseAuth!, provider);
                    const idToken = await result.user.getIdToken();
                    const res = await authAPI.firebaseAuth(idToken);
                    localStorage.setItem('access_token', res.data.tokens.access);
                    localStorage.setItem('refresh_token', res.data.tokens.refresh);
                    window.location.href = '/';
                  } catch (err: any) {
                    if (err.code === 'auth/popup-closed-by-user') return;
                    setError(err.message || 'Firebase sign-in failed');
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium text-sm transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#FF9100" d="M12 2L2 7l2 9 8 6 8-6 2-9-10-5z"/>
                </svg>
                Sign in with Firebase
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Create one</Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                <p className="font-medium text-gray-900 dark:text-white">Admin</p>
                <p className="text-gray-400 font-mono mt-0.5">admin@safevoyage.com</p>
                <p className="text-gray-400 font-mono">admin123</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                <p className="font-medium text-gray-900 dark:text-white">Police</p>
                <p className="text-gray-400 font-mono mt-0.5">police@test.com</p>
                <p className="text-gray-400 font-mono">police123</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                <p className="font-medium text-gray-900 dark:text-white">Tourist</p>
                <p className="text-gray-400 font-mono mt-0.5">tourist@test.com</p>
                <p className="text-gray-400 font-mono">tourist123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
