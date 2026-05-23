
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';
import * as ReactRouterDOM from 'react-router-dom';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldCheck, Film, Sparkles, Globe, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [method, setMethod] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const authContext = useContext(AuthContext);
  const notificationContext = useContext(NotificationContext);
  const navigate = ReactRouterDOM.useNavigate();

  useEffect(() => {
    if (authContext?.user) {
      navigate('/home');
    }
  }, [authContext, navigate]);
  
  const handleGoogleLogin = async () => {
    setError('');
    try {
      await authContext?.login();
    } catch (err: any) {
      setError(err.message || 'Google Auth failed');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (authMode === 'login') {
        await authContext?.loginWithEmail(email, password);
      } else {
        await authContext?.signupWithEmail(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  if (authContext?.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <motion.div
          animate={{ scale: [0.9, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Spinner size="lg" />
        </motion.div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Preparing your cinema experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10 p-1"
      >
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-8 md:p-14 border border-white/10 overflow-hidden group">
          {/* Subtle glow effect on hover */}
          <div className="absolute -inset-px bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] pointer-events-none"></div>

          <div className="relative z-10 text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <Logo />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-3xl font-black tracking-tight mb-3 uppercase"
            >
              {authMode === 'login' ? 'Welcome Back' : 'Join the Cinema'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 font-medium text-sm px-4"
            >
              {authMode === 'login' 
                ? 'Resume your cinematic journey with AI-powered discovery' 
                : 'Start building your personalized AI movie profile today'}
            </motion.p>
          </div>

          <form onSubmit={handleEmailSubmit} className="relative z-10 space-y-6">
            <AnimatePresence mode="popLayout">
              {authMode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group/input">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Christopher Nolan"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-white placeholder:text-slate-700"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="cinephile@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-white placeholder:text-slate-700"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-cyan-400 transition-colors">Forgot?</button>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-white placeholder:text-slate-700"
                />
              </div>
            </motion.div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              type="submit"
              disabled={authContext?.isLoggingIn}
              className="w-full relative group/btn overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform duration-500 group-hover/btn:scale-110 group-active/btn:scale-95"></div>
              <div className="relative flex items-center justify-center space-x-2 py-5 text-white font-black uppercase tracking-[0.2em] text-xs">
                {authContext?.isLoggingIn ? (
                  <>
                    <Spinner size="sm" />
                    <span className="animate-pulse">Authorizing...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Enter Cinema' : 'Initialize Profile'}</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="relative z-10 text-center mt-8">
            <p className="text-sm font-medium text-slate-500">
              {authMode === 'login' ? "New to Friday Stuff? " : "Already established? "}
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-blue-400 font-bold hover:text-cyan-400 transition-colors"
              >
                Sign {authMode === 'login' ? 'up' : 'in'}
              </button>
            </p>
          </div>

          <div className="relative z-10 flex items-center my-10 px-4">
            <div className="flex-1 border-t border-white/5"></div>
            <span className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">OR</span>
            <div className="flex-1 border-t border-white/5"></div>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={authContext?.isLoggingIn}
              className="group flex items-center justify-center space-x-3 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] text-slate-300 shadow-xl active:scale-[0.98]"
            >
              <Globe className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] opacity-40">
          Powered by TMDb • Gemini AI
        </p>
      </motion.div>


      {/* Terms Modal removed */}
    </div>
  );
};

export default Auth;
