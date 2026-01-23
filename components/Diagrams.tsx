
import React from 'react';

// Define props interface to ensure children are correctly typed for the functional component
interface DiagramTitleProps {
  children: React.ReactNode;
}

// Fix: Explicitly type the component with React.FC to ensure children prop is correctly recognized in JSX contexts like SVG
const DiagramTitle: React.FC<DiagramTitleProps> = ({ children }) => (
  <text x="400" y="30" textAnchor="middle" className="text-lg font-bold fill-slate-800 uppercase tracking-widest">{children}</text>
);

export const UMLClassDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>System Architecture UML</DiagramTitle>
    
    {/* Abstract Base User */}
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

    {/* Assignment Task */}
    <g transform="translate(310, 60)">
      <rect width="180" height="140" rx="4" className="fill-emerald-50 stroke-emerald-500 stroke-2" />
      <text x="90" y="25" textAnchor="middle" className="font-bold fill-emerald-900 text-sm">AssignmentTask</text>
      <line x1="0" y1="35" x2="180" y2="35" className="stroke-emerald-200" />
      <text x="10" y="55" className="text-[10px] fill-emerald-700">+ title: String</text>
      <text x="10" y="70" className="text-[10px] fill-emerald-700">+ instructions: String</text>
      <text x="10" y="85" className="text-[10px] fill-emerald-700">+ questions: Question[]</text>
      <line x1="0" y1="95" x2="180" y2="95" className="stroke-emerald-200" />
      <text x="10" y="110" className="text-[10px] fill-emerald-700">+ validatePDF(): void</text>
      <text x="10" y="125" className="text-[10px] fill-emerald-700">+ getRubric(): Rubric</text>
    </g>

    {/* Submission */}
    <g transform="translate(570, 60)">
      <rect width="180" height="150" rx="4" className="fill-orange-50 stroke-orange-500 stroke-2" />
      <text x="90" y="25" textAnchor="middle" className="font-bold fill-orange-900 text-sm">Submission</text>
      <line x1="0" y1="35" x2="180" y2="35" className="stroke-orange-200" />
      <text x="10" y="55" className="text-[10px] fill-orange-700">+ pdfData: Base64</text>
      <text x="10" y="70" className="text-[10px] fill-orange-700">+ score: Float</text>
      <text x="10" y="85" className="text-[10px] fill-orange-700">+ feedback: Text</text>
      <line x1="0" y1="105" x2="180" y2="105" className="stroke-orange-200" />
      <text x="10" y="120" className="text-[10px] fill-orange-700">+ requestGrade(): Grade</text>
      <text x="10" y="135" className="text-[10px] fill-orange-700">+ persistResult(): void</text>
    </g>

    {/* AI Service Broker */}
    <g transform="translate(310, 280)">
      <rect width="180" height="100" rx="4" className="fill-purple-50 stroke-purple-500 stroke-2" />
      <text x="90" y="25" textAnchor="middle" className="font-bold fill-purple-900 text-sm">«Service» GeminiAPI</text>
      <line x1="0" y1="35" x2="180" y2="35" className="stroke-purple-200" />
      <text x="10" y="55" className="text-[10px] fill-purple-700">+ generateContentStream()</text>
      <text x="10" y="70" className="text-[10px] fill-purple-700">+ parseStructuredOutput()</text>
    </g>

    {/* Associations */}
    <path d="M230 120 L 310 120" fill="none" className="stroke-slate-400 stroke-1" markerEnd="url(#diamond)" />
    <text x="250" y="115" className="text-[8px] fill-slate-500">1...* owns</text>

    <path d="M490 120 L 570 120" fill="none" className="stroke-slate-400 stroke-1" />
    <text x="510" y="115" className="text-[8px] fill-slate-500">1 has many *</text>

    <path d="M400 200 L 400 280" fill="none" className="stroke-slate-400 stroke-1 border-dashed" strokeDasharray="4 2" />
    <text x="410" y="240" className="text-[8px] fill-slate-500">«utilize»</text>

    <defs>
      <marker id="diamond" markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
        <path d="M0,6 L6,0 L12,6 L6,12 z" fill="white" stroke="#94a3b8" />
      </marker>
    </defs>
  </svg>
);

export const ERDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>Entity Relationship (Crow's Foot)</DiagramTitle>
    
    {/* Table: USERS */}
    <g transform="translate(50, 150)">
      <rect width="140" height="100" rx="2" className="fill-slate-50 stroke-slate-800 stroke-1" />
      <path d="M0 25 H 140" className="stroke-slate-800" />
      <text x="70" y="18" textAnchor="middle" className="text-xs font-bold">USERS</text>
      <text x="5" y="45" className="text-[10px]">PK: id (UUID)</text>
      <text x="5" y="60" className="text-[10px]">email (unique)</text>
      <text x="5" y="75" className="text-[10px]">role (string)</text>
      <text x="5" y="90" className="text-[10px]">isApproved (bool)</text>
    </g>

    {/* Table: TASKS */}
    <g transform="translate(330, 150)">
      <rect width="140" height="100" rx="2" className="fill-slate-50 stroke-slate-800 stroke-1" />
      <path d="M0 25 H 140" className="stroke-slate-800" />
      <text x="70" y="18" textAnchor="middle" className="text-xs font-bold">TASKS</text>
      <text x="5" y="45" className="text-[10px]">PK: id (UUID)</text>
      <text x="5" y="60" className="text-[10px]">FK: creator_id</text>
      <text x="5" y="75" className="text-[10px]">title (varchar)</text>
      <text x="5" y="90" className="text-[10px]">config (JSONB)</text>
    </g>

    {/* Table: SUBMISSIONS */}
    <g transform="translate(610, 150)">
      <rect width="140" height="100" rx="2" className="fill-slate-50 stroke-slate-800 stroke-1" />
      <path d="M0 25 H 140" className="stroke-slate-800" />
      <text x="70" y="18" textAnchor="middle" className="text-xs font-bold">SUBMISSIONS</text>
      <text x="5" y="45" className="text-[10px]">PK: id (UUID)</text>
      <text x="5" y="60" className="text-[10px]">FK: student_id</text>
      <text x="5" y="75" className="text-[10px]">FK: task_id</text>
      <text x="5" y="90" className="text-[10px]">grade (decimal)</text>
    </g>

    {/* Relationship Lines with Crow's Foot */}
    <g className="stroke-slate-400 stroke-2">
      {/* User to Tasks (1 to many) */}
      <line x1="190" y1="200" x2="330" y2="200" />
      <circle cx="210" cy="200" r="4" fill="white" stroke="#64748b" /> {/* One side */}
      <path d="M315 190 L 330 200 L 315 210 M 325 190 L 325 210" fill="none" /> {/* Many side */}

      {/* Task to Submissions (1 to many) */}
      <line x1="470" y1="200" x2="610" y2="200" />
      <circle cx="490" cy="200" r="4" fill="white" stroke="#64748b" /> {/* One side */}
      <path d="M595 190 L 610 200 L 595 210 M 605 190 L 605 210" fill="none" /> {/* Many side */}
    </g>

    <text x="260" y="190" textAnchor="middle" className="text-[8px] fill-slate-400 font-bold uppercase">Creates</text>
    <text x="540" y="190" textAnchor="middle" className="text-[8px] fill-slate-400 font-bold uppercase">Receives</text>
  </svg>
);

export const DataflowDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>Level 1 Dataflow Diagram (DFD)</DiagramTitle>
    
    {/* External Entities */}
    <g transform="translate(50, 100)">
      <rect width="100" height="60" className="fill-slate-100 stroke-slate-800" />
      <text x="50" y="35" textAnchor="middle" className="text-xs font-bold">STUDENT</text>
    </g>

    <g transform="translate(650, 100)">
      <rect width="100" height="60" className="fill-slate-100 stroke-slate-800" />
      <text x="50" y="35" textAnchor="middle" className="text-xs font-bold">PROCTOR</text>
    </g>

    {/* Processes */}
    <g transform="translate(250, 100)">
      <circle r="45" cx="45" cy="45" className="fill-white stroke-indigo-500 stroke-2" />
      <text x="45" y="40" textAnchor="middle" className="text-[10px] font-bold">1.0 Submission</text>
      <text x="45" y="55" textAnchor="middle" className="text-[10px] font-bold">Collection</text>
    </g>

    <g transform="translate(450, 250)">
      <circle r="45" cx="45" cy="45" className="fill-white stroke-purple-500 stroke-2" />
      <text x="45" y="40" textAnchor="middle" className="text-[10px] font-bold">2.0 AI Evaluation</text>
      <text x="45" y="55" textAnchor="middle" className="text-[10px] font-bold">& Feedback</text>
    </g>

    {/* Data Stores */}
    <g transform="translate(250, 320)">
      <line x1="0" y1="0" x2="120" y2="0" className="stroke-slate-800 stroke-2" />
      <line x1="0" y1="35" x2="120" y2="35" className="stroke-slate-800 stroke-2" />
      <text x="60" y="22" textAnchor="middle" className="text-[10px] font-bold">D1 Assignments DB</text>
    </g>

    {/* Flows */}
    <g className="stroke-indigo-300 stroke-2">
      <path d="M150 130 L 250 130" markerEnd="url(#dfd-arrow)" fill="none" />
      <text x="200" y="120" textAnchor="middle" className="text-[8px] fill-slate-600">PDF File</text>

      <path d="M340 145 L 450 260" markerEnd="url(#dfd-arrow)" fill="none" />
      <text x="400" y="200" textAnchor="middle" className="text-[8px] fill-slate-600">Unprocessed Data</text>

      <path d="M450 300 L 370 340" markerEnd="url(#dfd-arrow)" fill="none" />
      <text x="430" y="330" textAnchor="middle" className="text-[8px] fill-slate-600">Graded Result</text>

      <path d="M495 250 L 650 150" markerEnd="url(#dfd-arrow)" fill="none" />
      <text x="580" y="190" textAnchor="middle" className="text-[8px] fill-slate-600">Analytics</text>
    </g>

    <defs>
      <marker id="dfd-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="#818cf8" />
      </marker>
    </defs>
  </svg>
);

export const StateTransitionDiagram = () => (
  <svg viewBox="0 0 800 450" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <DiagramTitle>Assignment Lifecycle States</DiagramTitle>

    {/* State Nodes */}
    <g transform="translate(50, 180)">
      <circle r="40" className="fill-slate-50 stroke-slate-300" />
      <text textAnchor="middle" className="text-[10px] font-bold">DRAFT</text>
    </g>

    <g transform="translate(200, 180)">
      <circle r="40" className="fill-indigo-50 stroke-indigo-400" />
      <text textAnchor="middle" className="text-[10px] font-bold">PUBLISHED</text>
    </g>

    <g transform="translate(400, 180)">
      <circle r="40" className="fill-yellow-50 stroke-yellow-400" />
      <text textAnchor="middle" className="text-[10px] font-bold">SUBMITTED</text>
    </g>

    <g transform="translate(600, 180)">
      <circle r="40" className="fill-purple-50 stroke-purple-400" />
      <text textAnchor="middle" className="text-[10px] font-bold">ANALYZING</text>
    </g>

    <g transform="translate(720, 180)">
      <circle r="40" className="fill-emerald-100 stroke-emerald-600 stroke-2 shadow-lg" />
      <text textAnchor="middle" className="text-[10px] font-bold">GRADED</text>
    </g>

    {/* Transitions */}
    <g className="stroke-slate-400 stroke-1" fill="none">
      <path d="M90 180 L 160 180" markerEnd="url(#state-arrow)" />
      <text x="125" y="170" textAnchor="middle" className="text-[8px]">Proctor Finalize</text>

      <path d="M240 180 L 360 180" markerEnd="url(#state-arrow)" />
      <text x="300" y="170" textAnchor="middle" className="text-[8px]">Student Upload</text>

      <path d="M440 180 L 560 180" markerEnd="url(#state-arrow)" />
      <text x="500" y="170" textAnchor="middle" className="text-[8px]">API Handshake</text>

      <path d="M640 180 L 680 180" markerEnd="url(#state-arrow)" />
      <text x="660" y="170" textAnchor="middle" className="text-[8px]">JSON Return</text>
      
      {/* Return Path */}
      <path d="M400 220 Q 400 300 200 220" markerEnd="url(#state-arrow)" strokeDasharray="3 3" />
      <text x="300" y="280" textAnchor="middle" className="text-[8px]">Invalid PDF (Retry)</text>
    </g>

    <defs>
      <marker id="state-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <path d="M0,0 L0,6 L7,3 z" fill="#94a3b8" />
      </marker>
    </defs>
  </svg>
);
