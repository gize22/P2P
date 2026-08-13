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
  
  // የተመረጠው ጥያቄ (ለድሮ መልስ መስጫ እና ለማየት)
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Post Question Form */}
        <div className="bg-white p-6 rounded-lg shadow h-fit border">
          <h2 className="text-lg font-bold mb-4 text-indigo-600">Ask a Question</h2>
          <form onSubmit={handlePostQuestion}>
            <input type="text" placeholder="Question Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full mb-3 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <textarea placeholder="Describe your problem..." value={content} onChange={(e) => setContent(e.target.value)} required rows="4" className="w-full mb-3 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <input type="text" placeholder="Tags (comma separated, e.g. React, Node)" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full mb-3 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700 font-medium">Post Question</button>
          </form>
        </div>

        {/* Right: Questions Feed & Answers */}
        <div className="md:col-span-2 space-y-4">
          {selectedQuestion ? (
            /* Question Detail & Answers View */
            <div className="bg-white p-6 rounded-lg shadow border">
              <button onClick={() => setSelectedQuestion(null)} className="text-xs text-indigo-600 font-bold mb-3 hover:underline">← Back to Questions</button>
              <h2 className="text-xl font-bold text-gray-800">{selectedQuestion.title}</h2>
              <p className="text-xs text-gray-400 mt-1">Asked by {selectedQuestion.author?.name} ({selectedQuestion.author?.university})</p>
              <p className="text-sm text-gray-700 mt-4 bg-gray-50 p-3 rounded border">{selectedQuestion.content}</p>

              <div className="mt-6">
                <h3 className="text-md font-bold text-gray-700 mb-3">Answers ({answers.length})</h3>
                {answers.length === 0 ? (
                  <p className="text-xs text-gray-500">No answers yet. Be the first to answer!</p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {answers.map((ans, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border rounded text-sm">
                        <p className="text-gray-800">{ans.content}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Answered by: {ans.author?.name} ({ans.author?.university})</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Answer Form */}
                <form onSubmit={handlePostAnswer} className="flex gap-2 mt-4">
                  <input type="text" placeholder="Write an answer..." value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 font-medium">Answer</button>
                </form>
              </div>
            </div>
          ) : (
            /* Questions List Feed */
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-4">Community Q&A Forum</h2>
              {questions.length === 0 ? (
                <p className="text-gray-500">No questions posted yet.</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q._id} onClick={() => handleSelectQuestion(q)} className="p-4 bg-white rounded-lg shadow border cursor-pointer hover:border-indigo-400 transition">
                      <h3 className="text-md font-bold text-gray-800">{q.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{q.content}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-gray-400">By {q.author?.name}</span>
                        <div className="flex gap-1">
                          {q.tags?.map((t, i) => (
                            <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{t}</span>
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