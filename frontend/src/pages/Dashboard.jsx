import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchTasks = async () => {
    setTasksLoading(true);
    setTaskError("");
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setTaskError("Failed to load tasks. Please refresh.");
      console.error("fetchTasks error:", err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const addTask = async () => {
    if (!title.trim()) return;
    setAddLoading(true);
    try {
      await api.post("/tasks", { title: title.trim() });
      setTitle("");
      fetchTasks();
    } catch (err) {
      setTaskError("Failed to add task. Please try again.");
      console.error("addTask error:", err);
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  const removeTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      setTaskError("Failed to delete task.");
      console.error("removeTask error:", err);
    }
  };

  // Open inline edit
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditValue(task.title);
    setTaskError("");
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Save edit via PUT /tasks/{id}
  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    setEditLoading(true);
    try {
      await api.put(`/tasks/${id}`, { title: editValue.trim() });
      setEditingId(null);
      setEditValue("");
      fetchTasks();
    } catch (err) {
      setTaskError("Failed to update task.");
      console.error("saveEdit error:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") saveEdit(id);
    if (e.key === "Escape") cancelEdit();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)" }}>

      {/* Background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="absolute bottom-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />

      <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <div className="flex items-center gap-4">
            {user?.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt="profile"
                className="w-12 h-12 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
                style={{ background: "linear-gradient(135deg, #7c3aed44, #0ea5e944)" }}>
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">My Tasks</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200 bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Stats bar */}
        <div className="glass rounded-2xl px-5 py-4 mb-6 flex items-center justify-between animate-fade-up"
          style={{ animationDelay: "0.08s", opacity: 0, animationFillMode: "forwards" }}>
          <span className="text-slate-400 text-sm">
            {tasksLoading ? "Loading..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} total`}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-slate-400 text-xs">Active workspace</span>
          </div>
        </div>

        {/* Add Task Input */}
        <div className="glass rounded-2xl p-2 mb-6 flex gap-2 animate-fade-up"
          style={{ animationDelay: "0.14s", opacity: 0, animationFillMode: "forwards" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleAddKeyDown}
            placeholder="Add a new task — press Enter"
            disabled={addLoading}
            className="flex-1 bg-transparent px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          <button
            onClick={addTask}
            disabled={addLoading || !title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #7c3aed, #0ea5e9)" }}
          >
            {addLoading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Add
          </button>
        </div>

        {/* Error Banner */}
        {taskError && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {taskError}
          </div>
        )}

        {/* Task List */}
        {tasksLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-slate-500 text-sm">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 mb-2">
              <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white font-display font-semibold">No tasks yet</p>
            <p className="text-slate-500 text-sm">Add your first task above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className="glass rounded-2xl p-4 flex items-center gap-3 group hover:border-white/20 transition-all duration-200 animate-slide-in"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                {/* Task number */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-500 bg-white/5 flex-shrink-0">
                  {i + 1}
                </div>

                {/* Title or edit input */}
                {editingId === task.id ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                    autoFocus
                    className="flex-1 bg-white/5 border border-violet-500/40 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-violet-400 transition-colors"
                  />
                ) : (
                  <span className="flex-1 text-white text-sm truncate">{task.title}</span>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {editingId === task.id ? (
                    <>
                      {/* Save */}
                      <button
                        onClick={() => saveEdit(task.id)}
                        disabled={editLoading || !editValue.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                      >
                        {editLoading ? (
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Save
                      </button>
                      {/* Cancel */}
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Edit */}
                      <button
                        onClick={() => startEdit(task)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 border border-transparent hover:border-violet-500/30 transition-all opacity-0 group-hover:opacity-100"
                        title="Edit task"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete task"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
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