import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom"; // 👈 ሪኮርድ ለማድረግ የተጨመረ

export default function Groups() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState("");
  const navigate = useNavigate(); // 👈 ለቻት ሩም ማዘዋወሪያ

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Group Form */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-lg font-bold mb-4 text-indigo-600">Create Study Group</h2>
          <form onSubmit={handleCreateGroup}>
            <input type="text" placeholder="Group Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mb-3 p-2 border rounded text-sm" />
            <input type="text" placeholder="Skill / Topic (e.g. React)" value={skill} onChange={(e) => setSkill(e.target.value)} required className="w-full mb-3 p-2 border rounded text-sm" />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full mb-3 p-2 border rounded text-sm" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700">Create Group</button>
          </form>
        </div>

        {/* Groups List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-700">Available Study Groups</h2>
          {groups.length === 0 ? (
            <p className="text-gray-500">No study groups available.</p>
          ) : (
            groups.map((group) => {
              const isMember = group.members?.some(m => m._id === user.id);
              return (
                <div key={group._id} className="p-4 bg-white rounded-lg shadow border flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-bold text-gray-800">{group.name} <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded ml-2">{group.skill}</span></h3>
                    <p className="text-xs text-gray-600 mt-1">{group.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Admin: {group.admin?.name} | Members: {group.members?.length}</p>
                  </div>
                  <div>
                    {isMember ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded font-semibold">Joined</span>
                        <button onClick={() => navigate(`/chat/${group._id}`)} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700">Open Chat</button>
                      </div>
                    ) : (
                      <button onClick={() => handleJoinGroup(group._id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Join Group</button>
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