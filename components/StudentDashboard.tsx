
import React, { useState, useEffect, useRef } from 'react';
import { User, Submission, AssignmentTask } from '../types';
import { gradeSubmission } from '../geminiService';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<AssignmentTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<AssignmentTask | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const allTasks: AssignmentTask[] = JSON.parse(localStorage.getItem('tasks') || '[]');
      setTasks(allTasks);

      const allSubs: Submission[] = JSON.parse(localStorage.getItem('assignments') || '[]');
      setMySubmissions(allSubs.filter(s => s.studentId === user.id));
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    }
  };

  const startTask = (task: AssignmentTask) => {
    setSelectedTask(task);
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Validation Error: Please upload a standard PDF file.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !file) return;

    setIsSubmitting(true);
    try {
      const pdfBase64 = await convertToBase64(file);
      const result = await gradeSubmission(selectedTask.title, selectedTask.questions, pdfBase64);
      
      const newSubmission: Submission = {
        id: Date.now().toString(),
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        studentId: user.id,
        studentName: user.name,
        answers: [],
        feedback: result.feedback,
        score: result.score,
        submittedAt: new Date().toISOString(),
        status: 'GRADED'
      };

      const allSubs = JSON.parse(localStorage.getItem('assignments') || '[]');
      localStorage.setItem('assignments', JSON.stringify([...allSubs, newSubmission]));
      
      setSelectedTask(null);
      setFile(null);
      loadData();
      alert('Success: Your assignment was graded by SmartGrade AI!');
    } catch (error: any) {
      console.error("Submission Failure:", error);
      alert(`Submission Error: ${error.message || 'The AI service is temporarily unavailable. Please try again later.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-indigo-100">
              <div className="p-6 bg-indigo-600 text-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{selectedTask.title}</h3>
                  <button onClick={() => setSelectedTask(null)} className="text-indigo-200 hover:text-white">Cancel</button>
                </div>
                <p className="text-xs text-indigo-100">{selectedTask.instructions}</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Questions to Answer</h4>
                  <ul className="space-y-2">
                    {selectedTask.questions.map((q, idx) => (
                      <li key={q.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg flex justify-between">
                        <span>{idx + 1}. {q.text}</span>
                        <span className="font-bold text-indigo-600 ml-2">{q.marks}M</span>
                      </li>
                    ))}
                  </ul>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-6 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      file ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                    <svg className={`w-12 h-12 mb-3 ${file ? 'text-emerald-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-700 text-center truncate w-full px-2">
                      {file ? file.name : 'Upload PDF Document'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !file}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                    (isSubmitting || !file) ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'AI Analyzing...' : 'Submit Assignment'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Assignments</h2>
              {tasks.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                  No active tasks.
                </div>
              ) : (
                tasks.map(task => {
                  const alreadyDone = mySubmissions.some(s => s.taskId === task.id);
                  return (
                    <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                        <p className="text-xs text-gray-500">{task.questions.length} Questions</p>
                      </div>
                      {alreadyDone ? (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">Submitted</span>
                      ) : (
                        <button onClick={() => startTask(task)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">Start Task</button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Records</h2>
          <div className="space-y-6">
            {mySubmissions.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed text-gray-400 italic">
                Feedback will appear here after submission.
              </div>
            ) : (
              [...mySubmissions].reverse().map(sub => (
                <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{sub.taskTitle}</h4>
                      <div className="text-sm font-bold text-indigo-600">Grade: {sub.score}%</div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{sub.feedback}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
