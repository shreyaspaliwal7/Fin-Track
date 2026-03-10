import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function IncomeExpenseChart({ transactions }) {
  // Simple grouping by date (or just take raw if it's ordered)
  const dataMap = {};

  transactions.forEach((tx) => {
    // Group by date to keep chart clean
    const dateStr = new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!dataMap[dateStr]) {
      dataMap[dateStr] = { name: dateStr, income: 0, expense: 0 };
    }
    
    if (tx.type === "income") {
      dataMap[dateStr].income += parseFloat(tx.amount);
    } else {
      dataMap[dateStr].expense += parseFloat(tx.amount);
    }
  });

  const chartData = Object.values(dataMap).sort((a,b) => new Date(a.name) - new Date(b.name));

  if (chartData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-purple-500/20 p-6 rounded-2xl h-full min-h-[300px] flex items-center justify-center">
        <p className="text-zinc-500">No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-purple-500/20 p-6 rounded-2xl h-full min-h-[300px]">
      <h2 className="text-zinc-400 font-medium mb-4">Cash Flow (Income vs Expense)</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#18181b", borderColor: "#a855f7", color: "#fff", borderRadius: "12px" }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }}/>
            <Line type="monotone" dataKey="income" name="Income" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
