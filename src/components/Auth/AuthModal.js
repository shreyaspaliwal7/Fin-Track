'use client'
import { useState } from 'react'
import { client, client as supabase } from '@/api/client'
import { useRouter } from 'next/navigation'

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  if (!isOpen) return null; // Don't render if not open

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // --- LOG IN LOGIC ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error
        };

        // If login is successful, we DO NOT close the modal immediately and instead let page.js handle it once the React context updates `user`.
        // This avoids triggering the `handleClose` alert in page.js synchronously while `user` is still null.
        
        // Let middleware accurately determine where to send the user based on complete state and cookies
        // Also explicitly force a route push if they haven't completed onboarding yet to avoid race conditions.
        if (data?.user?.user_metadata?.onboarding_complete !== true) {
          router.push('/onboarding');
        }

        router.refresh();
      } else {
        // --- SIGN UP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              onboarding_complete: false,
            },
          },
        });

        if (error) {
          throw error;
        }

        // IMPORTANT: Supabase often requires email confirmation.
        // If the user isn't logged in immediately (session is null), 
        // we show a message instead of just closing the modal.
        if (data?.session) {
          router.push('/onboarding'); // Explicitly push new signups to onboarding
          router.refresh(); 
        } else {
          alert("Sign-up successful! Please check your email to confirm your account.");
        }
      }
    } catch (err) {
      if (err.status === 429 || err.message?.includes('rate limit') || err.message?.includes('429')) {
        setError("Too many signup attempts (Rate limited). Please wait a while before trying again.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. The Blurry Backdrop */}
      {/* <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      /> */}

      {/* 2. The Modal Card */}
      <div className="relative max-w-md w-full bg-zinc-900 border border-purple-500/30 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg shadow-lg shadow-purple-600/20">
            {loading ? '...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-purple-400 text-sm hover:underline"
        >
          {isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}
        </button>
      </div>
    </div>
  )
}