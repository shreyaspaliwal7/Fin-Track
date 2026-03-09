'use client';
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthModal from "@/components/Auth/AuthModal";
import OnboardingForm from "@/app/onboarding/page";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  useEffect(() => {
    // If loading is finished and there is no user, show the modal
    if (!loading && !user) {
    setIsAuthOpen(true);
  }
  
  // OPTIONAL: If the user suddenly becomes available, close the modal automatically
  if (user) {
    setIsAuthOpen(false);
  }
  }, [user, loading])

  const handleClose = () => {
  // If there is no user, do nothing (prevent closing)
  if (!user) {
    alert("Login required to access the dashboard");
    return;
  }
  setIsAuthOpen(false);
  redirect('/onboarding');
  // If user exists, allow the modal to close
};

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      {/* Your Page Content */}
      <div className={`p-8 transition-all duration-700 ${!user ? 'blur-xl' : 'blur-none'}`}>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 mt-2">Welcome to your finance tracker.</p>

        {user && (
          <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-purple-500/20">
            <p>Hello, {user.user_metadata?.full_name || user.email}!</p>
          </div>
        )}
      </div>

      {/* The Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleClose}
      />
      {/* <OnboardingForm
        onBoardOpen={!loading && user && !user.user_metadata?.onboarding_complete}
        OnBoardClose={handleCloseOnboarding}
      /> */}
    </main>
  );
}
