import React, { useState } from "react";
import { useTheme } from "../ThemeContext";
export default function FindLearners({ learners, loading, onSearch, onSendRequest }) {

    const { isDark } = useTheme();
  const [searchSkill, setSearchSkill] = useState("");

  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const inputStyle = isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchSkill);
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="w-full mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Search learners by skill (e.g., React, JavaScript)..." value={searchSkill} onChange={(e) => setSearchSkill(e.target.value)} className={`flex-1 p-3.5 border rounded-xl shadow-xs text-sm focus:outline-none ${inputStyle}`} />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-medium text-sm transition shadow-lg">Search</button>
        </form>
      </div>

      {/* Available Learning Partners */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Available Learning Partners</h2>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : learners.length === 0 ? (
          <p className="text-gray-400">No learners found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learners.map((learner) => (
              <div key={learner._id} className={`p-5 rounded-2xl shadow-lg border flex flex-col justify-between ${bgCard}`}>
                <div>
                  <h3 className="text-base font-bold">{learner.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{learner.university}</p>
                  <p className="text-xs text-gray-300 mt-3"><strong>Can Teach:</strong> <span className="text-emerald-400">{learner.skillsToTeach?.join(", ") || "None"}</span></p>
                  <p className="text-xs text-gray-300 mt-1"><strong>Wants to Learn:</strong> <span className="text-purple-400">{learner.skillsToLearn?.join(", ") || "None"}</span></p>
                </div>
                <div className="mt-5 flex justify-end">
                  <button onClick={() => onSendRequest(learner._id, learner.skillsToTeach?.[0])} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition">
                    Send Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}