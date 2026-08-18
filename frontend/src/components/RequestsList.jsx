import React from "react";
import { useNavigate } from "react-router-dom";

export default function RequestsList({ myRequests, mySessions, onUpdateStatus, onOpenSessionModal }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto mb-8">
      {/* Learning Requests */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-200">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Learning Requests & Connections</h2>
        {myRequests.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">No requests found.</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => {
              const otherUser = req.isReceiver ? req.sender : req.receiver;
              const otherUserId = otherUser?._id;

              return (
                <div key={req._id} className="p-4 border border-gray-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 dark:bg-slate-950/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {otherUser?.name} <span className="text-xs text-gray-500 dark:text-slate-400 font-normal">({otherUser?.university})</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-slate-300">Skill: <strong className="text-indigo-600 dark:text-indigo-400">{req.skill}</strong> | Message: {req.message}</p>
                      <p className="text-xs mt-1">
                        Status: <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : req.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>{req.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                    {req.isReceiver && req.status === "pending" && (
                      <>
                        <button onClick={() => onUpdateStatus(req._id, "accepted")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">Accept</button>
                        <button onClick={() => onUpdateStatus(req._id, "rejected")} className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">Reject</button>
                      </>
                    )}

                    {req.status === "accepted" && (
                      <div className="flex gap-2">
                        <button onClick={() => onOpenSessionModal(req)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">Schedule Session</button>
                        {otherUserId && (
                          <button onClick={() => navigate(`/private-chat/${otherUserId}`)} className="relative bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs">
                            <span>Direct Chat</span>
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Sessions */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-200">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">My Learning Sessions</h2>
        {mySessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">No scheduled sessions.</p>
        ) : (
          <div className="space-y-3">
            {mySessions.map((session) => (
              <div key={session._id} className="p-4 border border-indigo-100 dark:border-slate-800 rounded-xl flex justify-between items-center bg-indigo-50/50 dark:bg-slate-950/50">
                <div>
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400">Topic: {session.skill}</p>
                  <p className="text-xs text-gray-700 dark:text-slate-300">Teacher: {session.teacher?.name} | Learner: {session.learner?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">📅 Date: {session.date} | ⏰ Time: {session.time}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 rounded-full">{session.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}