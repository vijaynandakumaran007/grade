
import React, { useState, useEffect, useRef } from 'react';
import { User, Submission, AssignmentTask } from '../types';
import { gradeSubmission } from '../geminiService';
import { supabase } from '../supabaseClient';

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
    // Subscribe to changes? For now just load once.
  }, []);

  const loadData = async () => {
    try {
      // Fetch active tasks
      const { data: activeTasks, error: tasksError } = await supabase
        .from('assignments')
        .select('*')
        .eq('status', 'ACTIVE');

      if (tasksError) console.error('Error loading tasks:', tasksError);
      else {
        // Map snake_case to camelCase
        setTasks(activeTasks.map((t: any) => ({
          id: t.id,
          proctorId: t.proctor_id,
          title: t.title,
          instructions: t.instructions,
          questions: t.questions,
          createdAt: t.created_at,
          status: t.status
        })));
      }

      // Fetch my submissions
      const { data: subs, error: subsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', user.id);

      if (subsError) console.error('Error loading submissions:', subsError);
      else {
        setMySubmissions(subs.map((s: any) => ({
          id: s.id,
          taskId: s.task_id,
          taskTitle: '', // We need to join or fetch title. For now let's leave it or fetch it.
          // Actually, in the dashboard view, we might need it. 
          // Supabase join: .select('*, assignments(title)')
          // Let's do a simple join if possible or just map it from tasks if loaded.
          // But tasks only has ACTIVE ones. User might have submissions for archived tasks.
          // Let's fetch the task title via join.
          studentId: s.student_id,
          studentName: s.student_name,
          answers: s.answers,
          feedback: s.feedback,
          score: s.score,
          submittedAt: s.submitted_at,
          status: s.status,
          draftFileData: s.draft_file_data,
          draftFileName: s.draft_file_name
        })));

        // Refetch submissions with task titles
        const { data: subsWithTitle, error: joinError } = await supabase
          .from('submissions')
          .select('*, assignments(title)')
          .eq('student_id', user.id);

        if (!joinError && subsWithTitle) {
          setMySubmissions(subsWithTitle.map((s: any) => ({
            id: s.id,
            taskId: s.task_id,
            taskTitle: s.assignments?.title || 'Unknown Task',
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
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    }
  };

  const startTask = (task: AssignmentTask) => {
    // Check if there is an existing draft for this task
    const draft = mySubmissions.find(s => s.taskId === task.id && s.status === 'DRAFT');
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

  const uploadToCloudinary = async (file: File): Promise<{ url: string, public_id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return { url: data.secure_url, public_id: data.public_id };
  };

  const convertToBase64ForAI = (file: File): Promise<string> => {
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

  const saveDraft = async () => {
    if (!selectedTask || !file) return;
    setIsSubmitting(true);

    try {
      const cloudData = await uploadToCloudinary(file);

      const existing = mySubmissions.find(s => s.taskId === selectedTask.id && s.status === 'DRAFT');

      const submissionData = {
        task_id: selectedTask.id,
        student_id: user.id,
        student_name: user.name,
        status: 'DRAFT',
        cloudinary_url: cloudData.url,
        cloudinary_public_id: cloudData.public_id,
        file_name: file.name,
        submitted_at: new Date().toISOString()
      };

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('submissions')
          .update(submissionData)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('submissions')
          .insert([submissionData]);
        error = insertError;
      }

      if (error) throw error;

      loadData();
      alert('Draft saved to cloud successfully.');
      setSelectedTask(null);
    } catch (err: any) {
      console.error('Save Draft Error:', err);
      alert(`Storage Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !file) return;

    setIsSubmitting(true);
    try {
      const cloudData = await uploadToCloudinary(file);
      const pdfBase64 = await convertToBase64ForAI(file);

      // AI Grading
      const result = await gradeSubmission(selectedTask.title, selectedTask.questions, pdfBase64);

      const existing = mySubmissions.find(s => s.taskId === selectedTask.id && s.status === 'DRAFT');

      const submissionData = {
        task_id: selectedTask.id,
        student_id: user.id,
        student_name: user.name,
        status: 'GRADED',
        cloudinary_url: cloudData.url,
        cloudinary_public_id: cloudData.public_id,
        file_name: file.name,
        submitted_at: new Date().toISOString(),
        score: result.score,
        feedback: result.feedback,
        answers: []
      };

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('submissions')
          .update(submissionData)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('submissions')
          .insert([submissionData]);
        error = insertError;
      }

      if (error) throw error;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'GRADED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-indigo-100 sticky top-8">
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
                    className={`mt-6 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={isSubmitting || !file}
                    className="flex-1 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !file}
                    className={`flex-[2] py-3 rounded-xl font-bold text-white shadow-lg transition-all ${(isSubmitting || !file) ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                  >
                    {isSubmitting ? 'AI Analyzing...' : 'Submit Final'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Assignments</h2>
              {tasks.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                  No active tasks.
                </div>
              ) : (
                tasks.map(task => {
                  const submission = mySubmissions.find(s => s.taskId === task.id);

                  return (
                    <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500">{task.questions.length} Questions</p>
                      </div>
                      <div className="flex-shrink-0">
                        {submission?.status === 'GRADED' ? (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Graded</span>
                        ) : submission?.status === 'DRAFT' ? (
                          <button onClick={() => startTask(task)} className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-600 hover:text-white transition-all border border-yellow-100">Resume Draft</button>
                        ) : (
                          <button onClick={() => startTask(task)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">Start Task</button>
                        )}
                      </div>
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
                Feedback and drafts will appear here.
              </div>
            ) : (
              [...mySubmissions].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).map(sub => (
                <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{sub.taskTitle}</h4>
                        <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                        {sub.status === 'GRADED' && (
                          <div className="text-xl font-black text-indigo-600">{sub.score}%</div>
                        )}
                      </div>
                    </div>
                    <div className={`p-5 rounded-xl border ${sub.status === 'DRAFT' ? 'bg-yellow-50 border-yellow-100 italic text-yellow-800' : 'bg-slate-50 border-slate-100 text-gray-700'}`}>
                      <p className="leading-relaxed text-sm whitespace-pre-wrap">{sub.feedback}</p>
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
