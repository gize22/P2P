import React, { useState } from "react";

export default function FindLearners({ learners, loading, onSearch, onSendRequest }) {
  const [searchSkill, setSearchSkill] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchSkill);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
  <input
    type="text"
    placeholder="Search learners by skill..."
    value={searchSkill}
    onChange={(e) => setSearchSkill(e.target.value)}
    className="flex-1 p-3 border rounded-lg shadow-sm text-sm focus:outline-none"
  />
  <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium text-sm">
    Search
  </button>
</form>
      </div>

      {/* Learners List */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Learning Partners</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : learners.length === 0 ? (
          <p className="text-gray-500">No learners found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learners.map((learner) => (
              <div key={learner._id} className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{learner.name}</h3>
                  <p className="text-sm text-indigo-500 font-medium">{learner.university}</p>
                  <p className="text-sm text-gray-600 mt-2"><strong>Can Teach:</strong> {learner.skillsToTeach?.join(", ") || "None"}</p>
                  <p className="text-sm text-gray-600"><strong>Wants to Learn:</strong> {learner.skillsToLearn?.join(", ") || "None"}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => onSendRequest(learner._id, learner.skillsToTeach?.[0])}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                  >
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