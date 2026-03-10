import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, Plus, Trash2, Download } from "lucide-react";
import { client as supabase } from "@/api/client";

export default function TransactionTable({ user, transactions, setTransactions }) {
  const fileInputRef = useRef(null);
  
  const EXPENSE_CATEGORIES = [
    "Food & Dining", "Rent/Housing", "Utilities", "Transportation", 
    "Entertainment", "Health & Fitness", "Shopping", "Education", 
    "Personal Care", "Debt/Loans", "Savings/Investments", "Miscellaneous"
  ];
  
  const INCOME_CATEGORIES = [
    "Salary", "Business", "Investments", "Gifts", "Other"
  ];

  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: EXPENSE_CATEGORIES[0],
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    const processData = async (dataArray) => {
      const parsedData = dataArray.map(row => {
        let txDate = row.Date || row.date;
        let formattedDate = new Date().toISOString().split("T")[0];

        if (txDate) {
          if (txDate instanceof Date) {
            formattedDate = txDate.toISOString().split("T")[0];
          } else if (typeof txDate === "number") {
            // Excel epoch mapping fallback
            formattedDate = new Date(Math.round((txDate - 25569) * 86400 * 1000)).toISOString().split("T")[0];
          } else {
             try {
                formattedDate = new Date(txDate).toISOString().split("T")[0];
             } catch(e) {}
          }
        }

        return {
          user_id: user.id,
          date: formattedDate,
          description: row.Description || row.description || "Uploaded",
          amount: parseFloat(row.Amount || row.amount || 0),
          type: (row.Type || row.type || "expense").toLowerCase(),
          category: row.Category || row.category || "Uncategorized"
        };
      });
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(parsedData)
        .select();

      if (error) {
        console.error("Upload Error:", error);
        alert("Error saving file to database.");
      } else if (data) {
        setTransactions(prev => [...data, ...prev]);
      }
    };

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          processData(results.data);
        }
      });
    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { cellDates: true });
        processData(jsonData);
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Unsupported file format. Please upload a CSV or Excel file.");
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description || !user) return;

    const txPayload = {
      ...newTx,
      amount: parseFloat(newTx.amount),
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([txPayload])
      .select()
      .single();

    if (error) {
      console.error("Insert Error:", error);
      alert("Error saving transaction!");
    } else if (data) {
      setTransactions(prev => [data, ...prev]);
      setNewTx({ ...newTx, description: "", amount: "" }); // reset
    }
  };

  const deleteTx = async (id) => {
    if (String(id).startsWith('v-')) {
      alert("Virtual default transactions cannot be directly deleted. Edit your Onboarding Setup instead.");
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Delete Error:", error);
      alert("Error deleting transaction!");
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="bg-zinc-900 border border-purple-500/20 rounded-2xl flex flex-col h-full overflow-hidden min-h-[300px] md:min-h-[400px]">
      
      {/* Header & Controls */}
      <div className="p-4 md:p-6 border-b border-zinc-800 flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white">Transactions</h2>
        <div className="flex flex-wrap gap-3">
          <a 
            href="/template.csv" 
            download="FinanceTrack_Template.csv"
            className="flex items-center gap-2 bg-transparent hover:bg-zinc-800 text-sm xl:text-xs text-zinc-400 hover:text-purple-400 px-3 py-2 rounded-lg transition-colors border border-zinc-800 hover:border-purple-500/50"
            title="Download an example CSV template"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Get Template</span>
          </a>
          <input 
            type="file" 
            accept=".csv, .xls, .xlsx" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 px-4 py-2 rounded-lg transition-colors border border-zinc-700"
          >
            <Upload size={16} />
            Csv / Excel Upload
          </button>
        </div>
      </div>

      {/* Add Single Transaction Form */}
      <form onSubmit={handleAddTransaction} className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-col md:flex-row gap-3 items-stretch md:items-end w-full pb-4">
        <div className="w-full md:flex-1">
          <label className="text-xs text-zinc-500 mb-1 block">Date</label>
          <input type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-purple-500 outline-none" />
        </div>
        <div className="w-full md:flex-2">
          <label className="text-xs text-zinc-500 mb-1 block">Description</label>
          <input type="text" placeholder="Coffee..." value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-purple-500 outline-none" />
        </div>
        <div className="w-full md:w-24">
          <label className="text-xs text-zinc-500 mb-1 block">Type</label>
          <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-purple-500 outline-none">
            <option value="expense">Exp</option>
            <option value="income">Inc</option>
          </select>
        </div>
        <div className="w-full md:flex-1">
          <label className="text-xs text-zinc-500 mb-1 block">Category</label>
          <select 
            value={newTx.category} 
            onChange={e => setNewTx({...newTx, category: e.target.value})} 
            className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-purple-500 outline-none"
          >
            {(newTx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-28">
          <label className="text-xs text-zinc-500 mb-1 block">Amount</label>
          <input type="number" step="0.01" placeholder="0.00" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-purple-500 outline-none" />
        </div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center h-[38px] w-full md:w-auto md:aspect-square">
          <Plus size={20} />
          <span className="md:hidden ml-2 font-medium">Add Transaction</span>
        </button>
      </form>

      {/* Table Data */}
      <div className="overflow-y-auto flex-1 max-h-[400px]">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No transactions yet. Add one or upload a CSV.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-zinc-400 min-w-[600px]">
              <thead className="text-xs uppercase bg-zinc-800/50 text-zinc-500 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 text-xs text-zinc-300">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} ₹ {parseFloat(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => deleteTx(tx.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
