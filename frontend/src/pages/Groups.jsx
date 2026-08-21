import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Groups() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState("");
  
  const isDark = localStorage.getItem("theme") === "dark";
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await API.post("/groups", { name, description, skill, admin: user.id });
      alert("Study group created successfully!");
      setName("");
      setDescription("");
      setSkill("");
      fetchGroups();
    } catch (err) {
      alert("Failed to create group");
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await API.post(`/groups/${groupId}/join`, { userId: user.id });
      alert("Successfully joined group!");
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  if (!user) return null;

  // 👈 የ Dark እና Light ሞድ ትክክለኛ ከለሮች
  const bgMain = isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const bgInnerCard = isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800";
  const inputStyle = isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen w-full p-4 sm:p-8 transition-colors duration-200 ${bgMain}`}>
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Group Form */}
        <div className={`p-6 rounded-2xl shadow-lg border h-fit ${bgCard}`}>
          <h2 className="text-lg font-bold mb-4 text-indigo-500">Create Study Group</h2>
          <form onSubmit={handleCreateGroup}>
            <label className="block text-xs font-semibold mb-1">Group Name</label>
            <input type="text" placeholder="e.g. React Learners" value={name} onChange={(e) => setName(e.target.value)} required className={`w-full mb-3 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
            
            <label className="block text-xs font-semibold mb-1">Skill / Topic</label>
            <input type="text" placeholder="e.g. React" value={skill} onChange={(e) => setSkill(e.target.value)} required className={`w-full mb-3 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
            
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea placeholder="What is this group about?" value={description} onChange={(e) => setDescription(e.target.value)} required rows="3" className={`w-full mb-4 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-semibold transition shadow-lg">Create Group</button>
          </form>
        </div>

        {/* Groups List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Available Study Groups</h2>
          {groups.length === 0 ? (
            <p className="text-gray-400 text-sm">No study groups available.</p>
          ) : (
            groups.map((group) => {
              const isMember = group.members?.some(m => m._id === user.id);
              return (
                <div key={group._id} className={`p-5 rounded-2xl shadow-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${bgCard}`}>
                  <div>
                    <h3 className="text-base font-bold">{group.name} <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full ml-2">{group.skill}</span></h3>
                    <p className="text-xs text-gray-400 mt-1">{group.description}</p>
                    <p className="text-[11px] text-gray-500 mt-2">Admin: {group.admin?.name} | Members: {group.members?.length}</p>
                  </div>
                  <div>
                    {isMember ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl font-semibold">Joined</span>
                        <button onClick={() => navigate(`/chat/${group._id}`)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition">Open Chat</button>
                      </div>
                    ) : (
                      <button onClick={() => handleJoinGroup(group._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition">Join Group</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}