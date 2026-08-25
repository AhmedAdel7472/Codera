import React from 'react';

export const CoderIllustration: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="140" rx="16" fill="#F3F0FF" />
    {/* Boy head & body */}
    <circle cx="120" cy="50" r="22" fill="#8B5CF6" />
    <path d="M100 85 C100 70, 140 70, 140 85 L145 110 L95 110 Z" fill="#6D28D9" />
    {/* Hair */}
    <path d="M102 42 C105 32, 120 30, 128 35 C136 30, 142 40, 138 48 C135 44, 125 44, 120 46 C115 44, 105 45, 102 42 Z" fill="#3B0764" />
    {/* Glasses */}
    <circle cx="112" cy="50" r="5" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="128" cy="50" r="5" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="117" y1="50" x2="123" y2="50" stroke="#FFFFFF" strokeWidth="2" />
    {/* Laptop */}
    <rect x="80" y="80" width="80" height="48" rx="6" fill="#1E1B4B" stroke="#A78BFA" strokeWidth="2" />
    <rect x="70" y="125" width="100" height="6" rx="3" fill="#6D28D9" />
    <text x="92" y="100" fill="#C4B5FD" fontSize="10" fontFamily="monospace" fontWeight="bold">&lt;/&gt; Code</text>
    <rect x="92" y="106" width="40" height="3" rx="1.5" fill="#34D399" />
    <rect x="92" y="112" width="28" height="3" rx="1.5" fill="#F472B6" />
  </svg>
);

export const CodeGuideIllustration: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="140" rx="16" fill="#CCFBF1" />
    {/* Mentor */}
    <circle cx="85" cy="45" r="20" fill="#0D9488" />
    <path d="M65 80 C65 68, 105 68, 105 80 L108 105 L62 105 Z" fill="#0F766E" />
    {/* Learner */}
    <circle cx="150" cy="55" r="16" fill="#14B8A6" />
    <path d="M134 85 C134 74, 166 74, 166 85 L168 105 L132 105 Z" fill="#0D9488" />
    {/* Shared Tablet */}
    <rect x="95" y="70" width="60" height="42" rx="6" fill="#0F172A" stroke="#2DD4BF" strokeWidth="2" />
    <circle cx="125" cy="86" r="8" fill="#2DD4BF" opacity="0.3" />
    <path d="M120 86 L124 90 L130 82" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="105" y="98" width="40" height="4" rx="2" fill="#F43F5E" />
  </svg>
);

export const ProgrammerIllustration: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="140" rx="16" fill="#F5F3FF" />
    {/* Main screen window */}
    <rect x="35" y="20" width="170" height="100" rx="10" fill="#0F172A" stroke="#8B5CF6" strokeWidth="2" />
    <circle cx="48" cy="32" r="3" fill="#EF4444" />
    <circle cx="58" cy="32" r="3" fill="#F59E0B" />
    <circle cx="68" cy="32" r="3" fill="#10B981" />
    {/* Floating tech badges */}
    <rect x="55" y="48" width="50" height="22" rx="6" fill="#8B5CF6" />
    <text x="63" y="63" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">&lt;dev&gt;</text>

    <rect x="115" y="48" width="65" height="22" rx="6" fill="#10B981" />
    <text x="122" y="63" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">React.js</text>

    <rect x="75" y="80" width="85" height="24" rx="6" fill="#3B82F6" />
    <text x="83" y="96" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Inclusion++</text>
  </svg>
);

export const TeacherIllustration: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="140" rx="16" fill="#F0FDF4" />
    {/* Teacher silhouette */}
    <circle cx="70" cy="50" r="22" fill="#0D9488" />
    <path d="M50 88 C50 72, 90 72, 90 88 L92 115 L48 115 Z" fill="#115E59" />
    {/* Tablet held */}
    <rect x="100" y="40" width="75" height="70" rx="8" fill="#1E293B" stroke="#34D399" strokeWidth="2" />
    <rect x="110" y="52" width="55" height="6" rx="3" fill="#34D399" />
    <rect x="110" y="64" width="40" height="6" rx="3" fill="#A78BFA" />
    {/* Heart Badge */}
    <circle cx="195" cy="45" r="16" fill="#F43F5E" />
    <path d="M195 52 C190 47, 185 40, 191 36 C195 33, 195 37, 195 37 C195 37, 195 33, 199 36 C205 40, 200 47, 195 52 Z" fill="#FFFFFF" />
    {/* Accessibility Wheelchair Badge */}
    <circle cx="195" cy="85" r="16" fill="#0EA5E9" />
    <circle cx="195" cy="78" r="3" fill="#FFFFFF" />
    <path d="M192 84 H198 V91 H192 Z" fill="#FFFFFF" />
    <circle cx="195" cy="90" r="4" stroke="#FFFFFF" strokeWidth="2" fill="none" />
  </svg>
);

export const SchoolIllustration: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="140" rx="16" fill="#ECFDF5" />
    {/* Cloud base */}
    <ellipse cx="120" cy="115" rx="75" ry="16" fill="#D1FAE5" />
    <ellipse cx="90" cy="110" rx="30" ry="12" fill="#FFFFFF" />
    <ellipse cx="150" cy="110" rx="30" ry="12" fill="#FFFFFF" />
    {/* School Main Building */}
    <rect x="80" y="50" width="80" height="55" rx="4" fill="#0D9488" />
    {/* Roof */}
    <polygon points="75,50 120,20 165,50" fill="#0F766E" />
    {/* Clock Tower */}
    <rect x="110" y="30" width="20" height="20" fill="#14B8A6" />
    <circle cx="120" cy="40" r="5" fill="#FFFFFF" />
    {/* Windows & Doors */}
    <rect x="92" y="60" width="12" height="14" rx="2" fill="#FEF08A" />
    <rect x="136" y="60" width="12" height="14" rx="2" fill="#FEF08A" />
    <rect x="112" y="80" width="16" height="25" rx="3" fill="#064E3B" />
  </svg>
);

export const SpecializedCenterIllustration: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="140" rx="16" fill="#F3E8FF" />
    {/* 3D Interconnected Puzzle Sphere */}
    <circle cx="120" cy="70" r="45" fill="#FAF5FF" stroke="#C084FC" strokeWidth="2" />
    {/* Puzzle Pieces */}
    <path d="M100 50 C110 40, 130 40, 140 50 L140 70 L120 70 Z" fill="#8B5CF6" />
    <path d="M140 50 C150 60, 150 80, 140 90 L120 70 L140 70 Z" fill="#06B6D4" />
    <path d="M140 90 C130 100, 110 100, 100 90 L120 70 L140 70 Z" fill="#10B981" />
    <path d="M100 90 C90 80, 90 60, 100 50 L100 70 L120 70 Z" fill="#F43F5E" />
    <circle cx="120" cy="70" r="10" fill="#FFFFFF" />
    <text x="114" y="74" fill="#6B21A8" fontSize="10" fontWeight="bold">+</text>
  </svg>
);
