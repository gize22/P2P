import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
    skillsToTeach: "",
    skillsToLearn: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // skills ዎችን ወደ Array መቀየር (በኮማ የተለዩትን)
      const payload = {
        ...formData,
        skillsToTeach: formData.skillsToTeach.split(",").map((s) => s.trim()),
        skillsToLearn: formData.skillsToLearn.split(",").map((s) => s.trim()),
      };

      await API.post("/auth/register", payload);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Register - Peer Learning</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
        <input type="text" name="university" placeholder="University" onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
        <input type="text" name="skillsToTeach" placeholder="Skills to Teach (comma separated)" onChange={handleChange} className="w-full mb-3 p-2 border rounded" />
        <input type="text" name="skillsToLearn" placeholder="Skills to Learn (comma separated)" onChange={handleChange} className="w-full mb-4 p-2 border rounded" />

        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Register</button>
        <p className="mt-4 text-sm text-center">Already have an account? <Link to="/login" className="text-indigo-600">Login</Link></p>
      </form>
    </div>
  );
}