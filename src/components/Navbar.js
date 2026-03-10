'use client'
// import { useAuth } from '@/context/AuthContext'
import { client } from '@/api/client'
import { AuthContext } from './context/AuthProvider'
import useAuth from '@/hooks/useAuth'

export default function Navbar() {
  const { user } = useAuth()

  const handleSignOut = async () => {
    await client.auth.signOut()
  }

  // Extract name from metadata or fallback to email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  return (
    <nav className="top-0 w-full z-40 border-b border-purple-500/20 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2">
          <img src="/Gemini_Generated_Image_lxbsxvlxbsxvlxbs-removebg-preview.png" alt="Finance Tracker Logo" className="w-32 md:w-48" />
        </div>

        {/* Right Side: Profile Info */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-sm hidden md:block">
                Hi, <span className="text-white font-medium">{displayName}....</span>
              </span>
              
              {/* Circular Profile "Logo" / Avatar */}
              <div className="group relative">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500/50 bg-zinc-800 flex items-center justify-center text-purple-400 font-bold cursor-pointer hover:border-purple-400 transition-all">
                  {displayName?.charAt(0).toUpperCase()}
                </div>

                {/* Dropdown on Hover (Optional Sign Out) */}
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl">
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-sm">Not signed in</div>
          )}
        </div>

      </div>
    </nav>
  )
}