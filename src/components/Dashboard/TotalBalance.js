import { Settings } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function TotalBalance({ 
  transactions, 
  selectedMonth, 
  selectedYear, 
  setSelectedMonth, 
  setSelectedYear, 
  months,
  userCreatedAt
}) {
  // page.js already injects virtual base transactions based on userMetadata
  // We only need to sum the pre-filtered transactions array now.

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  // --- Date Boundaries Logic ---
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const createdDate = userCreatedAt ? new Date(userCreatedAt) : currentDate;
  const createdYear = createdDate.getFullYear();
  const createdMonth = createdDate.getMonth();

  // Generate valid years from Creation Date to Today
  const validYears = [];
  for (let y = createdYear; y <= currentYear; y++) {
    validYears.push(y);
  }

  // Determine valid months for the actively selected year
  let validMonths = months.map((m, i) => ({ name: m, index: i }));

  if (selectedYear === currentYear) {
    validMonths = validMonths.filter(m => m.index <= currentMonth); // Cant look into future
  }
  
  if (selectedYear === createdYear) {
    validMonths = validMonths.filter(m => m.index >= createdMonth); // Cant look before creation
  }

  // Safe-snap: If user changes year and their currently selected month is now out-of-bounds, snap it.
  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    } else if (selectedYear === createdYear && selectedMonth < createdMonth) {
      setSelectedMonth(createdMonth);
    }
  }, [selectedYear, selectedMonth, currentYear, currentMonth, createdYear, createdMonth, setSelectedMonth]);

  return (
    <div className="bg-zinc-900 border border-purple-500/20 p-6 rounded-2xl flex flex-col justify-between h-full relative">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        
        <div className="flex items-center gap-3">
          <h2 className="text-zinc-400 font-medium">Total Balance</h2>
          <Link 
            href="/onboarding"
            className="bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg shadow-md"
            title="Edit Base Constants"
          >
            <Settings size={16} />
            <span>Edit Fixed Expenses</span>
          </Link>
        </div>
      </div>

      <div className={`text-4xl md:text-5xl font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>
        {balance >= 0 ? "+" : "-"} ₹ {Math.abs(balance).toFixed(2)}
      </div>

      {/* Date Filter Controls */}
      <div className="flex flex-wrap gap-2 md:gap-3 relative z-10 mt-4">
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-2 w-32 focus:border-purple-500 outline-none"
        >
          {validMonths.map((m) => (
            <option key={m.index} value={m.index}>{m.name}</option>
          ))}
        </select>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-2 w-24 focus:border-purple-500 outline-none"
        >
          {validYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-center text-green-400 flex flex-col justify-center">
          <p className="text-sm opacity-80 mb-1">Total Income</p>
          <p className="font-semibold text-lg md:text-xl">+ ₹ {totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center text-red-400 flex flex-col justify-center">
          <p className="text-sm opacity-80 mb-1">Total Expense</p>
          <p className="font-semibold text-lg md:text-xl">- ₹ {totalExpense.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
