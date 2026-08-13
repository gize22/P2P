import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    bio: "",
    skillsToTeach: "",
    skillsToLearn: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // ከ Backend የዩሰሩን ወቅታዊ መረጃ ማምጣት
    API.get(`/users/${parsedUser.id}`)
      .then((res) => {
        const u = res.data;
        setFormData({
          name: u.name || "",
          university: u.university || "",
          bio: u.bio || "",
          skillsToTeach: u.skillsToTeach ? u.skillsToTeach.join(", ") : "",
          skillsToLearn: u.skillsToLearn ? u.skillsToLearn.join(", ") : "",
        });
      })
      .catch((err) => console.error("Error fetching profile", err));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        university: formData.university,
        bio: formData.bio,
        skillsToTeach: formData.skillsToTeach.split(",").map((s) => s.trim()).filter(Boolean),
        skillsToLearn: formData.skillsToLearn.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await API.put(`/users/${user.id}`, payload);
      
      // LocalStorage ማዘመን
      const updatedUserObj = { ...user, name: res.data.user.name, university: res.data.user.university };
      localStorage.setItem("user", JSON.stringify(updatedUserObj));
      setUser(updatedUserObj);

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar user={user} />

      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow border mt-6">
        <h2 className="text-2xl font-bold mb-6 text-indigo-600 text-center">Edit Profile</h2>
        {message && <p className="mb-4 text-center text-sm font-semibold text-green-600 bg-green-50 p-2 rounded">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">University</label>
            <input type="text" name="university" value={formData.university} onChange={handleChange} required className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">Bio (Short Description)</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Tell something about yourself..." />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">Skills to Teach (comma separated)</label>
            <input type="text" name="skillsToTeach" value={formData.skillsToTeach} onChange={handleChange} className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. React, JavaScript, Python" />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 mb-1">Skills to Learn (comma separated)</label>
            <input type="text" name="skillsToLearn" value={formData.skillsToLearn} onChange={handleChange} className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Node.js, MongoDB" />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded hover:bg-indigo-700 font-medium text-sm transition shadow">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}