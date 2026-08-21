import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext"; 

 // 👈 ከ Dashboard የሚመጡትን ፕሮፖዎች (Props) እዚህ ጋር መቀበል አለበት
export default function RequestsList({ myRequests, mySessions, onUpdateStatus, onOpenSessionModal, onOpenReviewModal, onCompleteSession }) {
    const { isDark } = useTheme();
  const navigate = useNavigate();

  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const bgInnerCard = isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800";

  return (
    <div className="space-y-6 w-full mb-8">
      {/* Learning Requests */}
      <div className={`w-full p-6 rounded-2xl shadow-lg border ${bgCard}`}>
        <h2 className="text-lg font-bold mb-4">Learning Requests & Connections</h2>
        {myRequests.length === 0 ? (
          <p className="text-sm text-gray-400">No requests found.</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => {
              const otherUser = req.isReceiver ? req.sender : req.receiver;
              const otherUserId = otherUser?._id;

              return (
                <div key={req._id} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${bgInnerCard}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {otherUser?.name} <span className="text-xs text-gray-400 font-normal">({otherUser?.university})</span>
                      </p>
                      <p className="text-xs text-gray-400">Skill: <strong className="text-indigo-400">{req.skill}</strong> | Message: {req.message}</p>
                      <p className="text-xs mt-1">
                        Status: <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{req.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                    {req.isReceiver && req.status === "pending" && (
                      <>
                        <button onClick={() => onUpdateStatus(req._id, "accepted")} className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">Accept</button>
                        <button onClick={() => onUpdateStatus(req._id, "rejected")} className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">Reject</button>
                      </>
                    )}

                    {req.status === "accepted" && (
                      <div className="flex gap-2">
                        <button onClick={() => onOpenSessionModal(req)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">Schedule Session</button>
                        {otherUserId && (
                          <button onClick={() => navigate(`/private-chat/${otherUserId}`)} className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">
                            <span>Direct Chat</span>
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

      {/* My Learning Sessions */}
      <div className={`w-full p-6 rounded-2xl shadow-lg border ${bgCard}`}>
        <h2 className="text-lg font-bold mb-4">My Learning Sessions</h2>
        {mySessions.length === 0 ? (
          <p className="text-sm text-gray-400">No scheduled sessions.</p>
        ) : (
          <div className="space-y-3">
            {mySessions.map((session) => (
              <div key={session._id} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 ${bgInnerCard}`}>
                <div>
                  <p className="text-sm font-bold text-indigo-400">Topic: {session.skill}</p>
                  <p className="text-xs text-gray-300">Teacher: {session.teacher?.name} | Learner: {session.learner?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">📅 Date: {session.date} | ⏰ Time: {session.time}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full">{session.status}</span>
                  {session.status === "scheduled" && (
                    <button onClick={() => onCompleteSession(session._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition">
                      Complete Session ✓
                    </button>
                  )}
                  {session.status === "completed" && onOpenReviewModal &&(
                    <button onClick={() => onOpenReviewModal(session)} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition">
                      Leave Review ⭐
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}