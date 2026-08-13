import React from "react";
import { useNavigate } from "react-router-dom";

export default function RequestsList({ myRequests, mySessions, onUpdateStatus, onOpenSessionModal }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-5xl mx-auto mb-8">
      {/* Learning Requests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Learning Requests & Connections</h2>
        {myRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No requests found.</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => {
              const otherUser = req.isReceiver ? req.sender : req.receiver;
              const otherUserId = otherUser?._id;

              return (
                <div key={req._id} className="p-4 border rounded flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-3">
                    {/* የዩሰሩ Profile Initial (Avatar) */}
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                      {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      {/* የዩሰሩ ስም (Name) እና ዩኒቨርሲቲ */}
                      <p className="text-sm font-bold text-gray-800">
                        {otherUser?.name} <span className="text-xs text-gray-500 font-normal">({otherUser?.university})</span>
                      </p>
                      <p className="text-xs text-gray-600">Skill: <strong>{req.skill}</strong> | Message: {req.message}</p>
                      <p className="text-xs mt-1">
                        Status: <span className={`font-bold ${req.status === 'accepted' ? 'text-green-600' : req.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{req.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* መቀበያ (Receiver) ከሆነ Accept/Reject አሳይ */}
                    {req.isReceiver && req.status === "pending" && (
                      <>
                        <button onClick={() => onUpdateStatus(req._id, "accepted")} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Accept</button>
                        <button onClick={() => onUpdateStatus(req._id, "rejected")} className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">Reject</button>
                      </>
                    )}

                    {/* ከተቀበለ (Accepted) Session ማቀናበር እና Direct Chat ከ ኖቲፊኬሽን ባጅ ጋር */}
                    {req.status === "accepted" && (
                      <div className="flex gap-2 items-center">
                        <button onClick={() => onOpenSessionModal(req)} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700">Schedule Session</button>
                        
                        {otherUserId && (
                          <button 
                            onClick={() => navigate(`/private-chat/${otherUserId}`)} 
                            className="relative bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <span>Direct Chat</span>
                            {/* አዲስ መልእክት ሲኖር የሚታይ "New" Badge ኖቲፊኬሽን */}
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
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
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4 text-gray-700">My Learning Sessions</h2>
        {mySessions.length === 0 ? (
          <p className="text-sm text-gray-500">No scheduled sessions.</p>
        ) : (
          <div className="space-y-3">
            {mySessions.map((session) => (
              <div key={session._id} className="p-4 border rounded flex justify-between items-center bg-indigo-50">
                <div>
                  <p className="text-sm font-bold text-indigo-900">Topic: {session.skill}</p>
                  <p className="text-xs text-gray-700">Teacher: {session.teacher?.name} | Learner: {session.learner?.name}</p>
                  <p className="text-xs text-gray-600 mt-1">📅 Date: {session.date} | ⏰ Time: {session.time}</p>
                </div>
                <span className="text-xs font-bold uppercase bg-indigo-200 text-indigo-800 px-2 py-1 rounded">{session.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}