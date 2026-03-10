'use client';
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import AuthModal from "@/components/Auth/AuthModal";
import OnboardingForm from "@/app/onboarding/page";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { client as supabase } from "@/api/client";
import TotalBalance from "@/components/Dashboard/TotalBalance";
import IncomeExpenseChart from "@/components/Dashboard/IncomeExpenseChart";
import ExpensePieChart from "@/components/Dashboard/ExpensePieChart";
import TransactionTable from "@/components/Dashboard/TransactionTable";
import ExportPDFButton from "@/components/Dashboard/ExportPDFButton";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  // Date Controls
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Supabase Initial Fetch
  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Error fetching transactions:", error);
      } else if (data) {
        setTransactions(data);
      }
    };
    fetchTransactions();
  }, [user]);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Derived filtered & virtual transactions
  const getCombinedTransactions = () => {
    if (!user || !user.user_metadata) return [];

    const meta = user.user_metadata;
    const virtualTx = [];
    
    // Virtual date setter (1st of the selected month)
    const vYear = selectedYear;
    const vMonth = String(selectedMonth + 1).padStart(2, '0');
    const virtualDate = `${vYear}-${vMonth}-01`;

    if (meta.salary) virtualTx.push({ id: 'v-sal', date: virtualDate, description: 'Monthly Salary', amount: meta.salary, type: 'income', category: 'Salary' });
    if (meta.rent) virtualTx.push({ id: 'v-rent', date: virtualDate, description: 'Monthly Rent', amount: meta.rent, type: 'expense', category: 'Rent' });
    if (meta.utilities) virtualTx.push({ id: 'v-util', date: virtualDate, description: 'Utilities', amount: meta.utilities, type: 'expense', category: 'Utilities' });
    if (meta.otherFixed) virtualTx.push({ id: 'v-fixed', date: virtualDate, description: 'Fixed Subscriptions', amount: meta.otherFixed, type: 'expense', category: 'Subscriptions' });

    // Filter manual transactions by the selected month & year
    const filteredManual = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    return [...virtualTx, ...filteredManual];
  };

  const combinedTransactions = getCombinedTransactions();

  useEffect(() => {
    // If loading is finished and there is no user, show the modal
    if (!loading && !user) {
    setIsAuthOpen(true);
  }
  
  // OPTIONAL: If the user suddenly becomes available, close the modal automatically
  if (user) {
    setIsAuthOpen(false);
    
    // IMMEDIATELY route un-onboarded users as soon as user state is detected 
    // This catches new signups and persistent sessions that bypass the modal Close button
    if (user.user_metadata?.onboarding_complete !== true) {
      router.push('/onboarding');
    }
  }
  }, [user, loading, router])

  const handleClose = () => {
    // If there is no user, do nothing (prevent closing)
    if (!user) {
      alert("Login required to access the dashboard");
      return;
    }
    setIsAuthOpen(false);
    
    // Check onboarding status properly from metadata before routing
    if (user.user_metadata?.onboarding_complete !== true) {
      router.push('/onboarding');
    }
    // If user exists, allow the modal to close
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      {/* Your Page Content */}
      <div className={`p-4 md:p-8 transition-all duration-700 ${!user ? 'blur-xl' : 'blur-none'} max-w-7xl mx-auto`}>
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4 mt-2">
          <p className="text-zinc-400">Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!</p>
          {user && (
            <ExportPDFButton 
              transactions={combinedTransactions} 
              selectedMonth={selectedMonth} 
              selectedYear={selectedYear} 
              months={MONTHS} 
            />
          )}
        </div>

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-12">
            
            <div className="lg:col-span-2 flex flex-col gap-6">
              <TotalBalance 
                transactions={combinedTransactions} 
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                setSelectedMonth={setSelectedMonth}
                setSelectedYear={setSelectedYear}
                months={MONTHS}
                userCreatedAt={user.created_at}
              />
              <ExpensePieChart transactions={combinedTransactions} />
            </div>

            <div className="lg:col-span-3 flex flex-col gap-6">
              <IncomeExpenseChart transactions={combinedTransactions} />
              <TransactionTable user={user} transactions={combinedTransactions} setTransactions={setTransactions} />
            </div>

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
