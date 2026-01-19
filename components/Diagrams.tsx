
import React from 'react';

export const UMLClassDiagram = () => (
  <svg viewBox="0 0 800 400" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    {/* User Class */}
    <rect x="50" y="50" width="150" height="100" rx="8" className="fill-indigo-50 stroke-indigo-400 stroke-2" />
    <text x="125" y="75" textAnchor="middle" className="font-bold fill-indigo-900 text-sm">User</text>
    <line x1="50" y1="85" x2="200" y2="85" className="stroke-indigo-200" />
    <text x="60" y="105" className="text-[10px] fill-indigo-700">- id: String</text>
    <text x="60" y="120" className="text-[10px] fill-indigo-700">- role: Role</text>
    <text x="60" y="135" className="text-[10px] fill-indigo-700">- isApproved: Bool</text>

    {/* AssignmentTask Class */}
    <rect x="325" y="50" width="180" height="100" rx="8" className="fill-emerald-50 stroke-emerald-400 stroke-2" />
    <text x="415" y="75" textAnchor="middle" className="font-bold fill-emerald-900 text-sm">AssignmentTask</text>
    <line x1="325" y1="85" x2="505" y2="85" className="stroke-emerald-200" />
    <text x="335" y="105" className="text-[10px] fill-emerald-700">- questions: Question[]</text>
    <text x="335" y="120" className="text-[10px] fill-emerald-700">- proctorId: String</text>

    {/* Submission Class */}
    <rect x="325" y="250" width="180" height="120" rx="8" className="fill-orange-50 stroke-orange-400 stroke-2" />
    <text x="415" y="275" textAnchor="middle" className="font-bold fill-orange-900 text-sm">Submission</text>
    <line x1="325" y1="285" x2="505" y2="285" className="stroke-orange-200" />
    <text x="335" y="305" className="text-[10px] fill-orange-700">- taskId: String</text>
    <text x="335" y="320" className="text-[10px] fill-orange-700">- studentId: String</text>
    <text x="335" y="335" className="text-[10px] fill-orange-700">- answers: Answer[]</text>
    <text x="335" y="350" className="text-[10px] fill-orange-700">- score: Number</text>

    {/* Relationships */}
    <path d="M200 100 Q 262 100 325 100" fill="none" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="240" y="90" className="text-[8px] fill-gray-400">Creates (1:N)</text>
    
    <path d="M415 150 L 415 250" fill="none" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="420" y="200" className="text-[8px] fill-gray-400">Instances (1:N)</text>

    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#d1d5db" />
      </marker>
    </defs>
  </svg>
);

export const ERDiagram = () => (
  <svg viewBox="0 0 800 400" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    {/* Entities as Diamonds/Rects */}
    <rect x="50" y="50" width="120" height="50" className="fill-indigo-100 stroke-indigo-500" />
    <text x="110" y="80" textAnchor="middle" className="text-sm font-bold">STUDENTS</text>
    
    <polygon points="250,50 300,75 250,100 200,75" className="fill-gray-100 stroke-gray-400" />
    <text x="250" y="80" textAnchor="middle" className="text-[8px]">SUBMITS</text>

    <rect x="380" y="50" width="120" height="50" className="fill-emerald-100 stroke-emerald-500" />
    <text x="440" y="80" textAnchor="middle" className="text-sm font-bold">SUBMISSIONS</text>

    <polygon points="580,50 630,75 580,100 530,75" className="fill-gray-100 stroke-gray-400" />
    <text x="580" y="80" textAnchor="middle" className="text-[8px]">OF_TASK</text>

    <rect x="380" y="200" width="120" height="50" className="fill-orange-100 stroke-orange-500" />
    <text x="440" y="230" textAnchor="middle" className="text-sm font-bold">TASKS</text>

    {/* Lines */}
    <line x1="170" y1="75" x2="200" y2="75" className="stroke-gray-300" />
    <line x1="300" y1="75" x2="380" y2="75" className="stroke-gray-300" />
    <line x1="500" y1="75" x2="530" y2="75" className="stroke-gray-300" />
    <line x1="440" y1="100" x2="440" y2="200" className="stroke-gray-300" />
    
    <circle cx="110" cy="50" r="3" className="fill-gray-400" />
    <text x="110" y="40" textAnchor="middle" className="text-[8px]">PK: id</text>
    <circle cx="440" cy="50" r="3" className="fill-gray-400" />
    <text x="440" y="40" textAnchor="middle" className="text-[8px]">FK: taskId</text>
  </svg>
);

export const DataflowDiagram = () => (
  <svg viewBox="0 0 800 200" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <rect x="50" y="70" width="100" height="60" rx="10" className="fill-blue-50 stroke-blue-400" />
    <text x="100" y="105" textAnchor="middle" className="text-xs font-bold">Student UI</text>

    <path d="M150 100 L 250 100" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="200" y="90" textAnchor="middle" className="text-[8px]">Answers</text>

    <circle cx="310" cy="100" r="40" className="fill-yellow-50 stroke-yellow-400" />
    <text x="310" y="105" textAnchor="middle" className="text-xs font-bold">AI Processing</text>

    <path d="M370 100 L 470 100" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="420" y="90" textAnchor="middle" className="text-[8px]">Grades/Feedback</text>

    <rect x="490" y="70" width="100" height="60" rx="10" className="fill-red-50 stroke-red-400" />
    <text x="540" y="105" textAnchor="middle" className="text-xs font-bold">Proctor DB</text>

    <path d="M590 100 L 690 100" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="640" y="90" textAnchor="middle" className="text-[8px]">Reports</text>

    <rect x="700" y="70" width="80" height="60" rx="4" className="fill-gray-50 stroke-gray-400" />
    <text x="740" y="105" textAnchor="middle" className="text-xs font-bold">Dashboard</text>
  </svg>
);

export const StateTransitionDiagram = () => (
  <svg viewBox="0 0 800 200" className="w-full h-auto bg-white rounded-xl shadow-inner p-4">
    <circle cx="80" cy="100" r="30" className="fill-gray-100 stroke-gray-400" />
    <text x="80" y="105" textAnchor="middle" className="text-[10px]">Created</text>

    <path d="M110 100 L 210 100" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="160" y="90" textAnchor="middle" className="text-[8px]">Submit</text>

    <circle cx="240" cy="100" r="30" className="fill-blue-100 stroke-blue-400" />
    <text x="240" y="105" textAnchor="middle" className="text-[10px]">Pending AI</text>

    <path d="M270 100 L 370 100" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="320" y="90" textAnchor="middle" className="text-[8px]">Analysis</text>

    <circle cx="400" cy="100" r="30" className="fill-green-100 stroke-green-400" />
    <text x="400" y="105" textAnchor="middle" className="text-[10px]">Graded</text>

    <path d="M430 100 L 530 100" className="stroke-gray-300 stroke-2" markerEnd="url(#arrow)" />
    <text x="480" y="90" textAnchor="middle" className="text-[8px]">Release</text>

    <circle cx="560" cy="100" r="35" className="fill-indigo-100 stroke-indigo-400 stroke-2" />
    <text x="560" y="105" textAnchor="middle" className="text-[10px] font-bold">Final Report</text>
  </svg>
);
