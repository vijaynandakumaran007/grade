
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

  // Task Creation State
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newQuestions, setNewQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadData();
  }, []);

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
  };

  const exportGradebook = () => {
    if (submissions.length === 0) {
      alert("No submissions to export.");
      return;
    }
    const headers = ["Date", "Student Name", "Assignment", "Score"];
    const rows = submissions.map(s => [
      new Date(s.submittedAt).toLocaleDateString(),
      s.studentName,
      s.taskTitle,
      s.score
    ]);
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
    setActiveTab('submissions'); loadData();
  };

  const handleApprove = (userId: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isApproved: true } : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadData();
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingUsers = allUsers.filter(u => !u.isApproved && u.id !== user.id);
  const approvedStudents = allUsers.filter(u => u.role === 'STUDENT' && u.isApproved);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proctor Control</h1>
          <p className="text-gray-500">Manage students, verify proctors, and control security.</p>
        </div>
        <div className="flex p-1 bg-gray-200 rounded-xl overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'submissions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>Submissions</button>
          <button onClick={() => setActiveTab('records')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'records' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>Gradebook</button>
          <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'create' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>New Task</button>
          <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all relative ${activeTab === 'approvals' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>Approvals {pendingUsers.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingUsers.length}</span>}</button>
          <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'security' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>Security</button>
          <button onClick={() => setActiveTab('architecture')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'architecture' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>Architecture</button>
        </div>
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <input type="text" placeholder="Search..." className="flex-grow max-w-md px-4 py-2 border rounded-xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <button onClick={exportGradebook} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700">Export CSV</button>
          </div>
          {filteredSubmissions.length === 0 ? <div className="text-center py-20 text-gray-400">No submissions found.</div> : 
            [...filteredSubmissions].reverse().map(sub => (
              <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-100 flex gap-6 shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-xl flex flex-col items-center justify-center font-bold text-indigo-600 flex-shrink-0">
                  <span className="text-xl">{sub.score}</span>
                  <span className="text-[10px] uppercase">Pts</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{sub.taskTitle}</h3>
                  <p className="text-indigo-600 text-sm font-semibold">{sub.studentName}</p>
                  <p className="mt-2 text-sm text-gray-600 italic">"{sub.feedback}"</p>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvedStudents.map(student => {
                const sSubs = submissions.filter(s => s.studentId === student.id);
                const avg = sSubs.length > 0 ? Math.round(sSubs.reduce((a,b) => a+b.score, 0) / sSubs.length) : 0;
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 font-bold">{student.name}</td>
                    <td className="px-6 py-4">{avg}%</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-bold">Active</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
           <form onSubmit={handleCreateTask} className="space-y-6">
            <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Assignment Title" />
            <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg" placeholder="Instructions..." />
            <div className="space-y-4">
              <div className="flex justify-between items-center"><label className="font-bold">Questions</label><button type="button" onClick={addQuestion} className="text-xs bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 font-bold">+ Add</button></div>
              {newQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                  <input required value={q.text} onChange={e => {
                    const u = [...newQuestions]; u[idx].text = e.target.value; setNewQuestions(u);
                  }} className="w-full p-2 border rounded text-sm" placeholder="Question Text" />
                  <input type="number" value={q.marks} onChange={e => {
                    const u = [...newQuestions]; u[idx].marks = parseInt(e.target.value); setNewQuestions(u);
                  }} className="w-20 p-1 border rounded text-xs" />
                </div>
              ))}
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Publish</button>
           </form>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {pendingUsers.length === 0 ? <div className="p-12 text-center text-gray-400 italic">No pending requests.</div> : 
            pendingUsers.map(u => (
              <div key={u.id} className="p-6 flex items-center justify-between border-b last:border-0">
                <div>
                  <h4 className="font-bold">{u.name} ({u.email})</h4>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{u.role} Request</p>
                </div>
                <button onClick={() => handleApprove(u.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Approve {u.role}</button>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Proctor Invite Management</h3>
                <p className="text-sm text-gray-500">Generate unique, one-time codes for new Proctors. Students cannot join without a valid code.</p>
              </div>
              <button onClick={generateInvite} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                Generate New Token
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invites.map(inv => (
                <div key={inv.code} className={`p-4 rounded-xl border-2 ${inv.isUsed ? 'bg-gray-50 border-gray-200' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl font-mono font-black text-indigo-900 tracking-widest">{inv.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${inv.isUsed ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700 animate-pulse'}`}>
                      {inv.isUsed ? 'Used' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">Created: {new Date(inv.createdAt).toLocaleString()}</p>
                  {inv.isUsed && <p className="text-[10px] text-indigo-600 font-bold mt-1">Used By: {inv.usedBy}</p>}
                </div>
              ))}
              {invites.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed rounded-2xl">No invite codes generated yet.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">UML Class Diagram</h3>
            <UMLClassDiagram />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ER Diagram</h3>
            <ERDiagram />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dataflow Diagram (DFD)</h3>
            <DataflowDiagram />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">State Transition Diagram</h3>
            <StateTransitionDiagram />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctorDashboard;
