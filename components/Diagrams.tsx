
import React from 'react';

interface DiagramTitleProps {
  children: React.ReactNode;
}

const DiagramTitle: React.FC<DiagramTitleProps> = ({ children }) => (
  <text x="400" y="30" textAnchor="middle" className="text-lg font-bold fill-slate-800 uppercase tracking-widest">{children}</text>
);

export const UMLClassDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>System Architecture UML</DiagramTitle>
    <g transform="translate(50, 60)">
      <rect width="180" height="120" rx="4" className="fill-indigo-50 stroke-indigo-500 stroke-2" />
      <text x="90" y="25" textAnchor="middle" className="font-bold fill-indigo-900 text-sm italic">«Abstract» User</text>
      <line x1="0" y1="35" x2="180" y2="35" className="stroke-indigo-200" />
      <text x="10" y="55" className="text-[10px] fill-indigo-700">+ id: UUID</text>
      <text x="10" y="70" className="text-[10px] fill-indigo-700">+ email: String</text>
      <text x="10" y="85" className="text-[10px] fill-indigo-700">+ role: Enum(Role)</text>
      <line x1="0" y1="95" x2="180" y2="95" className="stroke-indigo-200" />
      <text x="10" y="110" className="text-[10px] fill-indigo-700">+ login(): Boolean</text>
    </g>
    <g transform="translate(310, 60)">
      <rect width="180" height="140" rx="4" className="fill-emerald-50 stroke-emerald-500 stroke-2" />
      <text x="90" y="25" textAnchor="middle" className="font-bold fill-emerald-900 text-sm">AssignmentTask</text>
      <line x1="0" y1="35" x2="180" y2="35" className="stroke-emerald-200" />
      <text x="10" y="55" className="text-[10px] fill-emerald-700">+ title: String</text>
      <text x="10" y="70" className="text-[10px] fill-emerald-700">+ instructions: String</text>
      <text x="10" y="85" className="text-[10px] fill-emerald-700">+ questions: Question[]</text>
      <line x1="0" y1="95" x2="180" y2="95" className="stroke-emerald-200" />
      <text x="10" y="110" className="text-[10px] fill-emerald-700">+ validatePDF(): void</text>
    </g>
    <g transform="translate(570, 60)">
      <rect width="180" height="150" rx="4" className="fill-orange-50 stroke-orange-500 stroke-2" />
      <text x="90" y="25" textAnchor="middle" className="font-bold fill-orange-900 text-sm">Submission</text>
      <line x1="0" y1="35" x2="180" y2="35" className="stroke-orange-200" />
      <text x="10" y="55" className="text-[10px] fill-orange-700">+ pdfData: Base64</text>
      <text x="10" y="70" className="text-[10px] fill-orange-700">+ score: Float</text>
      <text x="10" y="85" className="text-[10px] fill-orange-700">+ feedback: Text</text>
    </g>
    <g transform="translate(310, 280)">
      <rect width="180" height="100" rx="4" className="fill-purple-50 stroke-purple-500 stroke-2" />
      <text x="90" y="25" textAnchor="middle" className="font-bold fill-purple-900 text-sm">«Service» GeminiAPI</text>
      <line x1="0" y1="35" x2="180" y2="35" className="stroke-purple-200" />
      <text x="10" y="55" className="text-[10px] fill-purple-700">+ generateContent()</text>
      <text x="10" y="70" className="text-[10px] fill-purple-700">+ parseResponse()</text>
    </g>
    <path d="M230 120 L 310 120" fill="none" className="stroke-slate-400 stroke-1" />
    <path d="M490 120 L 570 120" fill="none" className="stroke-slate-400 stroke-1" />
    <path d="M400 200 L 400 280" fill="none" className="stroke-slate-400 stroke-1 border-dashed" strokeDasharray="4 2" />
  </svg>
);

export const ERDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>Entity Relationship Diagram</DiagramTitle>
    <g transform="translate(50, 150)">
      <rect width="140" height="100" rx="2" className="fill-slate-50 stroke-slate-800 stroke-1" />
      <path d="M0 25 H 140" className="stroke-slate-800" />
      <text x="70" y="18" textAnchor="middle" className="text-xs font-bold">USERS</text>
      <text x="5" y="45" className="text-[10px]">PK: id (UUID)</text>
      <text x="5" y="60" className="text-[10px]">email (unique)</text>
      <text x="5" y="75" className="text-[10px]">role (string)</text>
      <text x="5" y="90" className="text-[10px]">isApproved (bool)</text>
    </g>
    <g transform="translate(330, 150)">
      <rect width="140" height="100" rx="2" className="fill-slate-50 stroke-slate-800 stroke-1" />
      <path d="M0 25 H 140" className="stroke-slate-800" />
      <text x="70" y="18" textAnchor="middle" className="text-xs font-bold">TASKS</text>
      <text x="5" y="45" className="text-[10px]">PK: id (UUID)</text>
      <text x="5" y="60" className="text-[10px]">FK: creator_id</text>
      <text x="5" y="75" className="text-[10px]">title (varchar)</text>
    </g>
    <g transform="translate(610, 150)">
      <rect width="140" height="100" rx="2" className="fill-slate-50 stroke-slate-800 stroke-1" />
      <path d="M0 25 H 140" className="stroke-slate-800" />
      <text x="70" y="18" textAnchor="middle" className="text-xs font-bold">SUBMISSIONS</text>
      <text x="5" y="45" className="text-[10px]">PK: id (UUID)</text>
      <text x="5" y="60" className="text-[10px]">FK: student_id</text>
      <text x="5" y="75" className="text-[10px]">FK: task_id</text>
    </g>
    <g className="stroke-slate-400 stroke-2">
      <line x1="190" y1="200" x2="330" y2="200" />
      <line x1="470" y1="200" x2="610" y2="200" />
    </g>
  </svg>
);

export const DataflowDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>Level 1 Dataflow Diagram (DFD)</DiagramTitle>
    <g transform="translate(50, 100)">
      <rect width="100" height="60" className="fill-slate-100 stroke-slate-800" />
      <text x="50" y="35" textAnchor="middle" className="text-xs font-bold">STUDENT</text>
    </g>
    <g transform="translate(250, 100)">
      <circle r="45" cx="45" cy="45" className="fill-white stroke-indigo-500 stroke-2" />
      <text x="45" y="40" textAnchor="middle" className="text-[10px] font-bold">1.0 Submit</text>
      <text x="45" y="55" textAnchor="middle" className="text-[10px] font-bold">PDF</text>
    </g>
    <g transform="translate(450, 250)">
      <circle r="45" cx="45" cy="45" className="fill-white stroke-purple-500 stroke-2" />
      <text x="45" y="40" textAnchor="middle" className="text-[10px] font-bold">2.0 Evaluate</text>
      <text x="45" y="55" textAnchor="middle" className="text-[10px] font-bold">w/ Gemini</text>
    </g>
    <path d="M150 130 L 250 130" className="stroke-indigo-300 stroke-2" fill="none" markerEnd="url(#arrow)" />
    <path d="M340 145 L 450 260" className="stroke-indigo-300 stroke-2" fill="none" markerEnd="url(#arrow)" />
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="#818cf8" />
      </marker>
    </defs>
  </svg>
);

export const StateTransitionDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>Assignment Lifecycle</DiagramTitle>
    <g transform="translate(100, 180)">
      <circle r="40" className="fill-slate-50 stroke-slate-300" />
      <text textAnchor="middle" className="text-[10px] font-bold">DRAFT</text>
    </g>
    <g transform="translate(300, 180)">
      <circle r="40" className="fill-indigo-50 stroke-indigo-400" />
      <text textAnchor="middle" className="text-[10px] font-bold">ACTIVE</text>
    </g>
    <g transform="translate(500, 180)">
      <circle r="40" className="fill-yellow-50 stroke-yellow-400" />
      <text textAnchor="middle" className="text-[10px] font-bold">PENDING</text>
    </g>
    <g transform="translate(700, 180)">
      <circle r="40" className="fill-emerald-100 stroke-emerald-600 stroke-2" />
      <text textAnchor="middle" className="text-[10px] font-bold">GRADED</text>
    </g>
    <path d="M140 180 L 260 180" className="stroke-slate-400" fill="none" markerEnd="url(#s-arrow)" />
    <path d="M340 180 L 460 180" className="stroke-slate-400" fill="none" markerEnd="url(#s-arrow)" />
    <path d="M540 180 L 660 180" className="stroke-slate-400" fill="none" markerEnd="url(#s-arrow)" />
    <defs>
      <marker id="s-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <path d="M0,0 L0,6 L7,3 z" fill="#94a3b8" />
      </marker>
    </defs>
  </svg>
);
