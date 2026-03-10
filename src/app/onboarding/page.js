"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { client as supabase } from "@/api/client";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

export default function OnboardingForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    salary: "",
    rent: "",
    utilities: "",
    otherFixed: "",
  });

  const isEditing = user?.user_metadata?.onboarding_complete === true;

  useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        salary: user.user_metadata.salary || "",
        rent: user.user_metadata.rent || "",
        utilities: user.user_metadata.utilities || "",
        otherFixed: user.user_metadata.otherFixed || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Saving data:", formData);
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          salary: formData.salary,
          rent: formData.rent,
          utilities: formData.utilities,
          otherFixed: formData.otherFixed,
          onboarding_complete: true,
        }
      });

      if (error) throw error;

      // Refresh the session cookies so middleware knows onboarding is done
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to save onboarding details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6 text-white bg-zinc-900 p-8 rounded-3xl border border-purple-500/30"
      >
        <h1 className="text-3xl font-bold text-white mb-6">
          {isEditing ? "Edit your Finances" : "Setup your Finances"}
        </h1>
        
        {/* Income Input */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Monthly Salary</label>
          <input 
            required
            name="salary" 
            type="number"
            value={formData.salary} 
            onChange={handleChange} 
            placeholder="e.g. 5000" 
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl focus:border-purple-500 outline-none" 
          />
        </div>

        {/* Housing Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Monthly Rent</label>
            <input 
              required
              name="rent" 
              type="number"
              value={formData.rent} 
              onChange={handleChange} 
              placeholder="e.g. 1000" 
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl focus:border-purple-500 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Utilities</label>
            <input 
              required
              name="utilities" 
              type="number"
              value={formData.utilities} 
              onChange={handleChange} 
              placeholder="e.g. 150" 
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl focus:border-purple-500 outline-none" 
            />
          </div>
        </div>

        {/* Fixed Costs Input */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Other Subscriptions</label>
          <input 
            name="otherFixed" 
            type="number"
            value={formData.otherFixed} 
            onChange={handleChange} 
            placeholder="e.g. 50" 
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl focus:border-purple-500 outline-none" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Save Updates" : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}