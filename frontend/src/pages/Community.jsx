import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");

  const isDark = localStorage.getItem("theme") === "dark";
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchQuestions();
  }, [navigate]);

  const fetchQuestions = async () => {
    try {
      const res = await API.get("/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions", err);
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    try {
      await API.post("/questions", {
        title,
        content,
        author: user.id,
        tags: tags ? tags.split(",") : []
      });
      setTitle("");
      setContent("");
      setTags("");
      alert("Question posted successfully!");
      fetchQuestions();
    } catch (err) {
      alert("Failed to post question");
    }
  };

  const handleSelectQuestion = async (q) => {
    setSelectedQuestion(q);
    try {
      const res = await API.get(`/questions/${q._id}`);
      setAnswers(res.data.answers);
    } catch (err) {
      console.error("Error fetching answers", err);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      const res = await API.post(`/questions/${selectedQuestion._id}/answers`, {
        content: newAnswer,
        author: user.id
      });
      setAnswers([...answers, res.data.answer]);
      setNewAnswer("");
    } catch (err) {
      alert("Failed to post answer");
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
        {/* Left: Post Question Form */}
        <div className={`p-6 rounded-2xl shadow-lg border h-fit ${bgCard}`}>
          <h2 className="text-lg font-bold mb-4 text-indigo-500">Ask a Question</h2>
          <form onSubmit={handlePostQuestion}>
            <label className="block text-xs font-semibold mb-1">Title</label>
            <input type="text" placeholder="What's your question?" value={title} onChange={(e) => setTitle(e.target.value)} required className={`w-full mb-3 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
            
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea placeholder="Describe your problem..." value={content} onChange={(e) => setContent(e.target.value)} required rows="4" className={`w-full mb-3 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
            
            <label className="block text-xs font-semibold mb-1">Tags (comma separated)</label>
            <input type="text" placeholder="e.g. React, Node.js" value={tags} onChange={(e) => setTags(e.target.value)} className={`w-full mb-4 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-semibold transition shadow-lg">Post Question</button>
          </form>
        </div>

        {/* Right: Questions Feed & Answers */}
        <div className="md:col-span-2 space-y-4">
          {selectedQuestion ? (
            /* Question Detail & Answers View */
            <div className={`p-6 rounded-2xl shadow-lg border ${bgCard}`}>
              <button onClick={() => setSelectedQuestion(null)} className="text-xs text-indigo-400 font-bold mb-3 hover:underline">← Back to Questions</button>
              <h2 className="text-xl font-bold">{selectedQuestion.title}</h2>
              <p className="text-xs text-gray-400 mt-1">Asked by {selectedQuestion.author?.name} ({selectedQuestion.author?.university})</p>
              <p className={`text-sm mt-4 p-4 rounded-xl border ${bgInnerCard}`}>{selectedQuestion.content}</p>

              <div className="mt-6">
                <h3 className="text-md font-bold mb-3">Answers ({answers.length})</h3>
                {answers.length === 0 ? (
                  <p className="text-xs text-gray-400">No answers yet. Be the first to answer!</p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {answers.map((ans, idx) => (
                      <div key={idx} className={`p-4 border rounded-xl text-sm ${bgInnerCard}`}>
                        <p>{ans.content}</p>
                        <p className="text-[10px] text-gray-400 mt-2">Answered by: {ans.author?.name} ({ans.author?.university})</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Answer Form */}
                <form onSubmit={handlePostAnswer} className="flex gap-2 mt-4">
                  <input type="text" placeholder="Write an answer..." value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className={`flex-1 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-semibold transition">Answer</button>
                </form>
              </div>
            </div>
          ) : (
            /* Questions List Feed */
            <div>
              <h2 className="text-xl font-semibold mb-4">Community Q&A Forum</h2>
              {questions.length === 0 ? (
                <p className="text-gray-400 text-sm">No questions posted yet.</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q._id} onClick={() => handleSelectQuestion(q)} className={`p-5 rounded-2xl shadow-lg border cursor-pointer hover:border-indigo-500 transition ${bgCard}`}>
                      <h3 className="text-base font-bold">{q.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{q.content}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[11px] text-indigo-400">By {q.author?.name}</span>
                        <div className="flex gap-1">
                          {q.tags?.map((t, i) => (
                            <span key={i} className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}