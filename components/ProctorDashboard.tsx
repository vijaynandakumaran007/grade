
import React, { useState, useEffect } from 'react';
import { User, Submission, AssignmentTask, Question, InviteToken, TaskStatus } from '../types';
import { UMLClassDiagram, ERDiagram, DataflowDiagram, StateTransitionDiagram } from './Diagrams';
import { supabase } from '../supabaseClient';

interface ProctorDashboardProps {
  user: User;
}

const ProctorDashboard: React.FC<ProctorDashboardProps> = ({ user }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<AssignmentTask[]>([]);
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'tasks' | 'approvals' | 'create' | 'security' | 'architecture'>('submissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [storageUsage, setStorageUsage] = useState({ used: 0, percent: 0 });

  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newQuestions, setNewQuestions] = useState<Question[]>([]);
  const [newStatus, setNewStatus] = useState<TaskStatus>('DRAFT');

  useEffect(() => {
    loadData();
    // calculateStorage(); // No longer needed for DB
  }, []);

  // Removed calculateStorage as we are using Supabase

  const loadData = async () => {
    try {
      // Fetch Users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        setAllUsers(usersData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isApproved: u.is_approved,
          registrationDate: u.registration_date
        })));
      }

      // Fetch Tasks (Assignments)
      const { data: tasksData } = await supabase.from('assignments').select('*');
      if (tasksData) {
        setTasks(tasksData.map((t: any) => ({
          id: t.id,
          proctorId: t.proctor_id,
          title: t.title,
          instructions: t.instructions,
          questions: t.questions,
          createdAt: t.created_at,
          status: t.status
        })));
      }

      // Fetch Submissions
      const { data: subsData } = await supabase
        .from('submissions')
        .select('*, assignments(title)');

      if (subsData) {
        setSubmissions(subsData.map((s: any) => ({
          id: s.id,
          taskId: s.task_id,
          taskTitle: s.assignments?.title || 'Unknown',
          studentId: s.student_id,
          studentName: s.student_name,
          answers: s.answers,
          feedback: s.feedback,
          score: s.score,
          submittedAt: s.submitted_at,
          status: s.status,
          cloudinaryUrl: s.cloudinary_url,
          fileName: s.file_name
        })));
      }

      // Invites: We aren't using DB invites yet, so clear them or keep empty.
      setInvites([]);

    } catch (error) {
      console.error("Error loading proctor data:", error);
    }
  };

  const generateInvite = () => {
    alert("Invite generation is temporarily disabled in database mode.");
    // Implementation would require a new 'invites' table
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestions.length === 0) return alert("Add at least one question");

    try {
      const newTask = {
        proctor_id: user.id,
        title: newTitle,
        instructions: newInstructions,
        questions: newQuestions,
        status: newStatus,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('assignments').insert([newTask]);
      if (error) throw error;

      setNewTitle(''); setNewInstructions(''); setNewQuestions([]); setNewStatus('DRAFT');
      setActiveTab('tasks');
      loadData();
    } catch (err: any) {
      console.error('Error creating task:', err);
      alert('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task? All submissions will remain but students won't see this task anymore.")) return;
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. It might have related submissions.');
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error approving user:', err);
    }
  };

  const filteredSubmissions = submissions.filter(s =>
    (s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) &&
    s.status !== 'DRAFT'
  );

  const pendingUsers = allUsers.filter(u => !u.isApproved && u.id !== user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proctor Control</h1>
          <p className="text-gray-500">Manage security and educational standards.</p>
        </div>
        <div className="flex p-1 bg-gray-200 rounded-xl overflow-x-auto custom-scrollbar">
          {['submissions', 'tasks', 'create', 'approvals', 'security', 'architecture'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-indigo-500'}`}>
              {tab === 'approvals' && pendingUsers.length > 0 ? `${tab} (${pendingUsers.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <input type="text" placeholder="Search graded submissions..." className="w-full max-w-md px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {filteredSubmissions.length === 0 ? <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">No active submissions found.</div> :
            [...filteredSubmissions].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).map(sub => (
              <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-100 flex gap-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center font-black text-indigo-600 flex-shrink-0">
                  <span className="text-2xl">{sub.score}</span>
                  <span className="text-[10px] uppercase">Score</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{sub.taskTitle}</h3>
                      <p className="text-indigo-600 text-sm font-bold">{sub.studentName} <span className="text-gray-400 font-normal ml-2">{new Date(sub.submittedAt).toLocaleString()}</span></p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Graded</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 italic line-clamp-2">"{sub.feedback}"</p>
                  {sub.cloudinaryUrl && (
                    <a href={sub.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      View Submission PDF
                    </a>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">No tasks created yet.</div> :
            tasks.map(task => (
              <div key={task.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${task.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                    task.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {task.status}
                  </span>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:text-red-600 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-1 truncate">{task.title}</h3>
                <p className="text-xs text-gray-400 mb-4">{task.questions.length} Questions • Created {new Date(task.createdAt).toLocaleDateString()}</p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {task.status !== 'ACTIVE' && (
                    <button onClick={() => handleUpdateTaskStatus(task.id, 'ACTIVE')} className="flex-1 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all">Publish</button>
                  )}
                  {task.status !== 'DRAFT' && task.status !== 'ARCHIVED' && (
                    <button onClick={() => handleUpdateTaskStatus(task.id, 'DRAFT')} className="flex-1 bg-yellow-50 text-yellow-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-yellow-600 hover:text-white transition-all">Move to Draft</button>
                  )}
                  {task.status !== 'ARCHIVED' && (
                    <button onClick={() => handleUpdateTaskStatus(task.id, 'ARCHIVED')} className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-600 hover:text-white transition-all">Archive</button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Database Status</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-sm text-gray-700 font-bold">Connected to Supabase</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Data is securely stored in the cloud.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Proctor Invite Tokens</h3>
              <button onClick={generateInvite} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all">Generate Token</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invites.filter(inv => !inv.isUsed).map(inv => (
                <div key={inv.code} className="p-4 rounded-xl border-2 bg-indigo-50 border-indigo-200">
                  <span className="text-xl font-mono font-black text-indigo-900 tracking-widest">{inv.code}</span>
                  <p className="text-[10px] text-gray-500">Created: {new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">New Assignment</h2>
          <form onSubmit={handleCreateTask} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Title</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Modern Physics Quiz 1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Instructions</label>
                <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} rows={3} className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Students must provide diagrams for full marks..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Initial Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value as TaskStatus)} className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                  <option value="DRAFT">Draft (Hidden from students)</option>
                  <option value="ACTIVE">Active (Available for submission)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-700 uppercase">Questions Breakdown</h4>
                <button type="button" onClick={() => setNewQuestions([...newQuestions, { id: Date.now().toString() + Math.random(), text: '', marks: 10 }])} className="text-indigo-600 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all">+ Add Question</button>
              </div>
              {newQuestions.length === 0 && <p className="text-center py-4 text-gray-400 text-sm">No questions added yet.</p>}
              <div className="space-y-3">
                {newQuestions.map((q, idx) => (
                  <div key={q.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="font-bold text-indigo-400 text-sm">#{idx + 1}</span>
                    <input required value={q.text} onChange={e => { const u = [...newQuestions]; u[idx].text = e.target.value; setNewQuestions(u); }} className="flex-grow bg-transparent border-b border-gray-200 outline-none focus:border-indigo-500 transition-colors py-1" placeholder="Enter question text..." />
                    <div className="flex items-center gap-2">
                      <input type="number" value={q.marks} onChange={e => { const u = [...newQuestions]; u[idx].marks = parseInt(e.target.value); setNewQuestions(u); }} className="w-16 bg-white p-1 rounded border text-center font-bold text-indigo-600" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Marks</span>
                    </div>
                    <button type="button" onClick={() => setNewQuestions(newQuestions.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Deploy Task</button>
          </form>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {pendingUsers.length === 0 ? <div className="p-20 text-center text-gray-400 italic">No pending requests.</div> :
            pendingUsers.map(u => (
              <div key={u.id} className="p-8 flex items-center justify-between border-b last:border-0 hover:bg-slate-50">
                <div>
                  <h4 className="font-bold text-lg">{u.name} <span className="text-gray-400 font-normal">({u.email})</span></h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${u.role === 'PROCTOR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                </div>
                <button onClick={() => handleApprove(u.id)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all">Grant Access</button>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"><UMLClassDiagram /></div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"><ERDiagram /></div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"><DataflowDiagram /></div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"><StateTransitionDiagram /></div>
        </div>
      )}
    </div>
  );
};

export default ProctorDashboard;
