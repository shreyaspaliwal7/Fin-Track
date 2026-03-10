import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

export default function ExpensePieChart({ transactions }) {
  const expenseMap = {};

  transactions.forEach((tx) => {
    if (tx.type === "expense") {
      const cat = tx.category || "Uncategorized";
      expenseMap[cat] = (expenseMap[cat] || 0) + parseFloat(tx.amount);
    }
  });

  const chartData = Object.keys(expenseMap).map((key) => ({
    name: key,
    value: expenseMap[key],
  })).sort((a,b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-purple-500/20 p-6 rounded-2xl h-full min-h-[300px] flex items-center justify-center">
        <p className="text-zinc-500">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-purple-500/20 p-6 rounded-2xl h-full min-h-[300px] flex flex-col">
      <h2 className="text-zinc-400 font-medium mb-4">Expenses by Category</h2>
      <div className="w-full flex-grow text-sm">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: "#18181b", borderColor: "#a855f7", color: "#fff", borderRadius: "12px", border: "1px solid #3f3f46" }}
              itemStyle={{ color: "#fff", fontSize: "14px" }}
              formatter={(value) => `₹${value.toFixed(2)}`}
            />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: "#a1a1aa" }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
