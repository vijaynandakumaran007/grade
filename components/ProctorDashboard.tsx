
import React, { useState, useEffect } from 'react';
import { User, Submission, AssignmentTask, Question, InviteToken } from '../types';
import { UMLClassDiagram, ERDiagram, DataflowDiagram, StateTransitionDiagram } from './Diagrams';

interface ProctorDashboardProps {
  user: User;
}

const ProctorDashboard: React.FC<ProctorDashboardProps> = ({ user }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<AssignmentTask[]>([]);
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'approvals' | 'create' | 'records' | 'security' | 'architecture'>('submissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [storageUsage, setStorageUsage] = useState({ used: 0, percent: 0 });

  // Task Creation State
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newQuestions, setNewQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadData();
    calculateStorage();
  }, []);

  const calculateStorage = () => {
    let _lsTotal = 0, _xLen, _x;
    for (_x in localStorage) {
      if (!localStorage.hasOwnProperty(_x)) continue;
      _xLen = ((localStorage[_x].length + _x.length) * 2);
      _lsTotal += _xLen;
    }
    const usedKB = (_lsTotal / 1024).toFixed(2);
    const limitKB = 5120; // 5MB standard limit
    const percent = Math.min((parseFloat(usedKB) / limitKB) * 100, 100);
    setStorageUsage({ used: parseFloat(usedKB), percent });
  };

  const loadData = () => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    setAllUsers(users);
    
    const allSubmissions: Submission[] = JSON.parse(localStorage.getItem('assignments') || '[]');
    setSubmissions(allSubmissions);

    const allTasks: AssignmentTask[] = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(allTasks);

    const allInvites: InviteToken[] = JSON.parse(localStorage.getItem('proctor_invites') || '[]');
    setInvites(allInvites);
  };

  const clearData = (key: string, label: string) => {
    if (confirm(`DANGER: This will permanently delete ALL ${label}. Proceed?`)) {
      localStorage.removeItem(key);
      loadData();
      calculateStorage();
      alert(`${label} cleared successfully.`);
    }
  };

  const generateInvite = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newToken: InviteToken = {
      code,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      isUsed: false
    };
    const updatedInvites = [newToken, ...invites];
    localStorage.setItem('proctor_invites', JSON.stringify(updatedInvites));
    setInvites(updatedInvites);
    calculateStorage();
  };

  const revokeInvite = (code: string) => {
    if (!confirm(`Are you sure you want to revoke the invite code: ${code}?`)) return;
    const updatedInvites = invites.filter(inv => inv.code !== code);
    localStorage.setItem('proctor_invites', JSON.stringify(updatedInvites));
    setInvites(updatedInvites);
    calculateStorage();
  };

  const exportGradebook = () => {
    if (submissions.length === 0) return alert("No submissions to export.");
    const headers = ["Date", "Student Name", "Assignment", "Score"];
    const rows = submissions.map(s => [new Date(s.submittedAt).toLocaleDateString(), s.studentName, s.taskTitle, s.score]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `grades_${new Date().getTime()}.csv`);
    link.click();
  };

  const addQuestion = () => {
    const q: Question = { id: Date.now().toString() + Math.random(), text: '', marks: 10 };
    setNewQuestions([...newQuestions, q]);
  };

  const removeQuestion = (id: string) => {
    setNewQuestions(newQuestions.filter(q => q.id !== id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestions.length === 0) return alert("Add at least one question");
    const newTask: AssignmentTask = {
      id: Date.now().toString(),
      proctorId: user.id,
      title: newTitle,
      instructions: newInstructions,
      questions: newQuestions,
      createdAt: new Date().toISOString()
    };
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    localStorage.setItem('tasks', JSON.stringify([...allTasks, newTask]));
    setNewTitle(''); setNewInstructions(''); setNewQuestions([]);
    setActiveTab('submissions'); loadData(); calculateStorage();
  };

  const handleApprove = (userId: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isApproved: true } : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadData();
    calculateStorage();
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingUsers = allUsers.filter(u => !u.isApproved && u.id !== user.id);
  const approvedStudents = allUsers.filter(u => u.role === 'STUDENT' && u.isApproved);
  const activeInvites = invites.filter(inv => !inv.isUsed);
  const usedInvites = invites.filter(inv => inv.isUsed);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proctor Control</h1>
          <p className="text-gray-500">Manage students, verify proctors, and control security.</p>
        </div>
        <div className="flex p-1 bg-gray-200 rounded-xl overflow-x-auto custom-scrollbar">
          {['submissions', 'records', 'create', 'approvals', 'security', 'architecture'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)} 
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-indigo-500'}`}
            >
              {tab === 'approvals' && pendingUsers.length > 0 ? `${tab} (${pendingUsers.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <input type="text" placeholder="Search submissions..." className="flex-grow max-w-md px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <button onClick={exportGradebook} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Export Gradebook</button>
          </div>
          {filteredSubmissions.length === 0 ? <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">No submissions to display.</div> : 
            [...filteredSubmissions].reverse().map(sub => (
              <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-100 flex gap-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center font-black text-indigo-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-2xl">{sub.score}</span>
                  <span className="text-[10px] uppercase tracking-tighter">Percent</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{sub.taskTitle}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-indigo-600 text-sm font-bold">{sub.studentName}</p>
                    <span className="text-[10px] text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-2">"{sub.feedback}"</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8 animate-fadeIn">
          {/* DATABASE HEALTH MONITOR */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              </div>
              <h3 className="text-xl font-bold">Database Health Monitor (localStorage)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-600">Current Prototype Storage Used</span>
                  <span className={`text-sm font-bold ${storageUsage.percent > 80 ? 'text-red-600' : 'text-indigo-600'}`}>{storageUsage.used} KB / 5,120 KB</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200">
                  <div className={`h-full transition-all duration-1000 rounded-full ${storageUsage.percent > 80 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${storageUsage.percent}%` }}></div>
                </div>
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                   <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p className="text-xs text-amber-800 leading-relaxed">
                     <span className="font-bold">Important:</span> This prototype uses browser storage. PDF files take significant space. If storage reaches 100%, the app will stop accepting submissions. Use the Maintenance controls below to purge old data.
                   </p>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1">Scale Plan</h4>
                <p className="text-sm text-indigo-700 mb-4 font-medium">To implement a "real" database, move this data to PostgreSQL or MongoDB.</p>
                <button onClick={() => setActiveTab('architecture')} className="text-indigo-600 font-bold text-sm underline hover:text-indigo-800 text-left">View ER Schema -></button>
              </div>
            </div>

            <div className="mt-10 border-t pt-8">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Database Maintenance (Danger Zone)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => clearData('assignments', 'Submissions')} className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all">Purge Submissions</button>
                <button onClick={() => clearData('tasks', 'Assignment Tasks')} className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all">Purge Tasks</button>
                <button onClick={() => {
                  if(confirm("WIPE EVERYTHING? This resets the entire app.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }} className="px-4 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all">Reset Factory Settings</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Proctor Invite Management</h3>
                <p className="text-sm text-gray-500">Security bypass tokens for new staff members.</p>
              </div>
              <button onClick={generateInvite} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                Generate New Token
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeInvites.map(inv => (
                <div key={inv.code} className="p-4 rounded-xl border-2 bg-indigo-50 border-indigo-200 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl font-mono font-black text-indigo-900 tracking-widest">{inv.code}</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-green-100 text-green-700 animate-pulse">Active</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Created: {new Date(inv.createdAt).toLocaleString()}</p>
                  <button onClick={() => revokeInvite(inv.code)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 p-1.5 rounded-lg text-red-600 hover:bg-red-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))}
              {activeInvites.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed rounded-2xl bg-gray-50">No active invite codes.</div>}
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS (SIMPLIFIED FOR BREVITY) */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn max-w-4xl mx-auto">
           <h2 className="text-2xl font-bold mb-6 text-gray-900">New Assignment Designer</h2>
           <form onSubmit={handleCreateTask} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Assignment Identity</label>
              <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="e.g. Advanced System Architecture 101" />
              <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} rows={3} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="General instructions for students..." />
            </div>
            
            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-900">Grading Rubric (Questions)</label>
                <button type="button" onClick={addQuestion} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-indigo-700 transition-all">+ Add Question</button>
              </div>
              
              {newQuestions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-2xl">At least one question is required for the AI to grade against.</div>
              ) : (
                newQuestions.map((q, idx) => (
                  <div key={q.id} className="p-5 bg-indigo-50 rounded-2xl space-y-3 relative group border border-indigo-100 animate-slideUp">
                    <div className="flex gap-4">
                      <div className="flex-grow">
                        <label className="text-[10px] font-bold text-indigo-400 uppercase">Question {idx + 1}</label>
                        <input required value={q.text} onChange={e => {
                          const u = [...newQuestions]; u[idx].text = e.target.value; setNewQuestions(u);
                        }} className="w-full p-3 border-b-2 border-indigo-200 bg-transparent outline-none focus:border-indigo-600 transition-colors font-medium" placeholder="Describe the UML class structure..." />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-indigo-400 uppercase">Weight</label>
                        <input type="number" value={q.marks} onChange={e => {
                          const u = [...newQuestions]; u[idx].marks = parseInt(e.target.value); setNewQuestions(u);
                        }} className="w-full p-3 border-b-2 border-indigo-200 bg-transparent outline-none focus:border-indigo-600 transition-colors text-center font-bold" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeQuestion(q.id)} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity border">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-[0px] transition-all uppercase tracking-widest">Deploy Assignment</button>
           </form>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Student Identity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">GPA Equivalent</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Tasks Done</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">System Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {approvedStudents.length === 0 ? <tr><td colSpan={4} className="p-20 text-center text-gray-400 italic">No approved students in the system.</td></tr> : 
                approvedStudents.map(student => {
                  const sSubs = submissions.filter(s => s.studentId === student.id);
                  const avg = sSubs.length > 0 ? Math.round(sSubs.reduce((a,b) => a+b.score, 0) / sSubs.length) : 0;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{student.name}<br/><span className="text-[10px] font-normal text-gray-400">{student.email}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-indigo-600">{avg}%</span>
                          <div className="w-24 bg-gray-100 h-1.5 rounded-full"><div className="bg-indigo-400 h-full rounded-full" style={{ width: `${avg}%` }}></div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500">{sSubs.length}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified</span></td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          {pendingUsers.length === 0 ? <div className="p-20 text-center text-gray-400 italic bg-slate-50 border-2 border-dashed border-gray-200 m-8 rounded-2xl">Access control queue is currently empty.</div> : 
            pendingUsers.map(u => (
              <div key={u.id} className="p-8 flex items-center justify-between border-b last:border-0 hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{u.name} <span className="text-gray-400 font-normal">({u.email})</span></h4>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${u.role === 'PROCTOR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined: {new Date(u.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleApprove(u.id)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all">Grant Access</button>
                  <button className="bg-white text-gray-400 px-6 py-2 rounded-xl font-bold border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-all">Reject</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          {[
            { title: 'Class Diagram', desc: 'Object relationships & methods.', component: <UMLClassDiagram /> },
            { title: 'Entity Relationship', desc: 'Database schema (SQL/NoSQL).', component: <ERDiagram /> },
            { title: 'Dataflow (DFD)', desc: 'How information moves through nodes.', component: <DataflowDiagram /> },
            { title: 'State Lifecycle', desc: 'The transitions of an assignment.', component: <StateTransitionDiagram /> }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-50">{item.component}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProctorDashboard;
