"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/lib/onBoardschema";

export default function BigOnboardingForm() {
  const [onBoardOpen, setonBoardOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange"
  });

  // Only render anything if onBoardOpen is true
  if (!onBoardOpen) return null;

  const validateAndNext = async (fields) => {
    const isValid = await trigger(fields);
    if (isValid) setStep((s) => s + 1);
  };

  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);
      // Add your backend action call here
      if (typeof onBoardClose === 'function') {
        onBoardClose();
      } else {
        console.error("onBoardClose prop was not passed correctly!");
      }
    } catch (error) {
      console.error("Submission failed", error);
    } // Close modal after submission
  };
  // const onBoardOpen =()=>{
  //   if(loading && user && !user.user_metadata?.onboarding_complete){
  //     return true
  //   }
  // }
  const onBoardClose = () => {
    setonBoardOpen(false);
  };

  return (
    /* Main Fixed Wrapper */
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

      {/* 1. The Blurry Backdrop (Separate from the card) */}
      {/* <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onBoardClose}
      /> */}

      {/* 2. The Form Card (Relative to stay above backdrop) */}
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-purple-500/30 p-8 md:p-12 shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-300">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-white">

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-purple-500' : 'bg-zinc-800'}`} />
            ))}
          </div>

          {/* STEP 1: INCOME */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Step 1: Income</h2>
                <p className="text-zinc-400 mt-2">Let's start with your monthly earnings.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Monthly Salary</label>
                <input
                  {...register("salary")}
                  placeholder="e.g. 5000"
                  className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl focus:border-purple-500 outline-none transition-all"
                />
                {errors.salary && <p className="text-red-500 text-xs">{errors.salary.message}</p>}
              </div>
              <button type="button" onClick={() => validateAndNext(["salary"])} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg shadow-purple-600/20">Next</button>
            </div>
          )}

          {/* STEP 2: HOUSING */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Step 2: Housing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input {...register("rent")} placeholder="Monthly Rent" className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
                <input {...register("utilities")} placeholder="Utilities" className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/2 border border-zinc-700 text-zinc-400 p-4 rounded-xl hover:bg-zinc-800">Back</button>
                <button type="button" onClick={() => validateAndNext(["rent", "utilities"])} className="w-1/2 bg-purple-600 text-white p-4 rounded-xl">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-bold text-white">Step 3: Fixed Costs</h2>
                <p className="text-zinc-400 text-sm mt-1">Almost done! Enter any recurring subscriptions.</p>
              </div>

              <div className="space-y-2">
                <input
                  {...register("otherFixed")}
                  type="number" // Ensure it's a number if your schema expects it
                  placeholder="Other Subscriptions (Netflix, Gym, etc.)"
                  className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                />
                {errors.otherFixed && <p className="text-red-500 text-xs">{errors.otherFixed.message}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/2 border border-zinc-700 text-zinc-400 p-4 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading} // Prevent double-clicking
                  className="w-1/2 bg-green-600 hover:bg-green-700 text-white font-bold p-4 rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-50 transition-all"
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}