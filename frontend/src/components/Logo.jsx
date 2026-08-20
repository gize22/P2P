import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.png"; // 👈 አዲሱን ሉጎ ከ assets ማምጣት

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <img 
        src={logoImage} 
        alt="P2P Learn Logo" 
        className="w-10 h-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" 
      />
      <div className="flex flex-col">
        <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
          P2P <span className="text-indigo-600 dark:text-indigo-400">Learn</span>
        </span>
        <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">
          Peer Education
        </span>
      </div>
    </Link>
  );
}