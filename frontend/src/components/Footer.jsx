import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-2 rounded-xl font-bold text-base shadow-md">P2P</div>
            <span className="text-xl font-extrabold text-white tracking-tight">P2P <span className="text-indigo-400">Learn</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A next-generation peer-to-peer learning platform designed for university students to teach, learn, collaborate in study groups, and grow together.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/" className="hover:text-indigo-400 transition">Home</Link></li>
            <li><Link to="/how-it-works" className="hover:text-indigo-400 transition">How It Works</Link></li>
            <li><Link to="/login" className="hover:text-indigo-400 transition">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-indigo-400 transition">Create Account</Link></li>
          </ul>
        </div>

        {/* Col 3: Contact Us */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contact Us</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <span>📍</span> tulu Awuliya , Ethiopia
            </li>
            <li className="flex items-center gap-2">
              <span>📧</span>gizachewkassa22@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span> +251 957837318
            </li>
          </ul>
        </div>


      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} P2P Learn Platform. All rights reserved. Built for collaborative success.</p>
      </div>
    </footer>
  );
}