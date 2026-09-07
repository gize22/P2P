import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";

export default function Profile() {

  const { isDark } = useTheme();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    bio: "",
    skillsToTeach: "",
    skillsToLearn: "",
  });
  const [message, setMessage] = useState("");
  
  // 👈 የእራስዎ ሪቪዮች (Reviews & Ratings) ስቴት
  const [myReviews, setMyReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

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

    // 👈 የእራስዎን ሪቪዮች ከባክኤንድ ማምጣት
    API.get("/admin/reviews")
      .then((res) => {
        const filtered = res.data.filter(
          (rev) => (rev.reviewedUser?._id || rev.reviewedUser) === parsedUser.id
        );
        setMyReviews(filtered);
      })
      .catch((err) => console.error("Error fetching reviews", err));

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

  // 👈 የ Dark እና Light ሞድ ትክክለኛ ከለሮች
  const bgMain = isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const inputStyle = isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400";

  // 👈 አማካይ ራቲንግ ማስያዣ
  const avgRating = myReviews.length > 0 
    ? (myReviews.reduce((acc, r) => acc + Number(r.rating), 0) / myReviews.length).toFixed(1) 
    : "No ratings yet";

  return (
    <div className={`min-h-screen w-full p-4 sm:p-8 transition-colors duration-200 ${bgMain}`}>
      <Navbar user={user} />

      <div className="max-w-xl mx-auto space-y-6 mt-6">
        
        {/* 👈 የእራስዎ ራቲንግ እና ሪቪዮች ማሳያ ካርድ */}
        <div className={`p-6 rounded-3xl shadow-xl border text-center ${bgCard}`}>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">My Rating & Feedback</h3>
          <div className="text-3xl font-extrabold text-amber-500 mt-2 flex items-center justify-center gap-2">
            ⭐ {avgRating} <span className="text-xs text-gray-400 font-normal">({myReviews.length} reviews)</span>
          </div>
          
          {myReviews.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-left max-h-40 overflow-y-auto">
              {myReviews.map((rev) => (
                <div key={rev._id} className="p-2.5 rounded-xl bg-black/10 dark:bg-white/5 text-xs">
                  <div className="flex justify-between font-semibold text-indigo-400 mb-1">
                    <span>From: {rev.reviewer?.name || "Student"}</span>
                    <span>⭐ {rev.rating}/5</span>
                  </div>
                  <p className="text-gray-300 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        <div className={`p-8 rounded-3xl shadow-2xl border ${bgCard}`}>
          <h2 className="text-2xl font-extrabold mb-6 text-indigo-500 text-center tracking-tight">Edit Profile</h2>
          {message && <p className="mb-4 text-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 ${inputStyle}`} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">University</label>
              <input type="text" name="university" value={formData.university} onChange={handleChange} required className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 ${inputStyle}`} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Bio (Short Description)</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 ${inputStyle}`} placeholder="Tell something about yourself..." />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Skills to Teach (comma separated)</label>
              <input type="text" name="skillsToTeach" value={formData.skillsToTeach} onChange={handleChange} className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 ${inputStyle}`} placeholder="e.g. React, JavaScript, Python" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Skills to Learn (comma separated)</label>
              <input type="text" name="skillsToLearn" value={formData.skillsToLearn} onChange={handleChange} className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 ${inputStyle}`} placeholder="e.g. Node.js, MongoDB" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-lg mt-2">
              Save Changes
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}