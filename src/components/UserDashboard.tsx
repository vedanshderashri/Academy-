import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { MISSION_LIST } from '../simulation/missions/missionList';
import { CertificateModal } from './CertificateModal';
import { Certificate } from '../db/DatabaseService';
import { isSupabaseConfigured } from '../db/SupabaseClient';
import { SubjectType } from './TopNavbar';
import {
  MoreVertical,
  SlidersHorizontal,
  Award,
  Lock,
  LogOut,
  Database,
  ArrowUpRight,
  TrendingUp,
  Layers,
  GraduationCap,
  Check,
  Activity,
  Brain,
  Zap,
  Globe,
} from 'lucide-react';

interface UserDashboardProps {
  currentSubject?: SubjectType;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ currentSubject = 'NETWORKS' }) => {
  const isTOC = currentSubject === 'TOC';
  const isDSA = currentSubject === 'DSA';
  const isNet = currentSubject === 'NETWORKS' || currentSubject === 'ALL';

  const { user, progress, certificates, logout, generateCertificate } = useAuth();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '1W' | '1M' | '1Y' | 'ALL'>('1W');
  const cloudActive = isSupabaseConfigured();

  if (!user || !progress) {
    return (
      <div className="p-12 text-center text-slate-600 font-sans">
        <p className="text-sm font-bold">Please log in to view your student LMS dashboard.</p>
      </div>
    );
  }

  // Define Subject-Specific Curriculum Modules & Total Labs
  const tocModules = [
    { id: 'toc-m1', title: 'DFA Automata Builder & Step Animator', level: 'Module 1', diff: 'Beginner', skills: 'States, Alphabet Σ, Transitions, Counterexamples' },
    { id: 'toc-m2', title: 'Formal Languages & Grammar Lab', level: 'Module 2', diff: 'Intermediate', skills: 'Regular Expression Engine, String Generation' },
    { id: 'toc-m3', title: 'NFA → DFA Subset Construction', level: 'Module 3', diff: 'Advanced', skills: 'ε-closures, Power Set Automata, Equivalence' },
    { id: 'toc-m4', title: 'Chomsky Hierarchy & Decidability', level: 'Module 4', diff: 'Expert', skills: 'PDA Stack, Turing Machine Tape & Halting Problem' },
  ];

  const dsaModules = [
    { id: 'dsa-m1', title: 'Arrays & Dynamic Contiguous Memory', level: 'Module 1', diff: 'Beginner', skills: 'O(1) Access, Two Pointers, Sliding Window, Kadane' },
    { id: 'dsa-m2', title: 'Linked Lists & Pointer Manipulation', level: 'Module 2', diff: 'Intermediate', skills: 'Singly, Doubly, Reverse, Floyd Cycle Detection' },
    { id: 'dsa-m3', title: 'Stacks, Queues & Expression Parsing', level: 'Module 3', diff: 'Intermediate', skills: 'LIFO Stack, FIFO Queue, Infix to Postfix Eval' },
    { id: 'dsa-m4', title: 'Searching & Sorting Algorithms', level: 'Module 4', diff: 'Advanced', skills: 'Binary Search, Quick Sort Partition, Merge Sort' },
    { id: 'dsa-m5', title: 'Trees, BST, AVL & Heapify', level: 'Module 5', diff: 'Advanced', skills: 'Inorder Traversal, AVL Rotations, Min/Max Heap' },
    { id: 'dsa-m6', title: 'Graphs & Shortest Path Algorithms', level: 'Module 6', diff: 'Expert', skills: 'BFS, DFS, Dijkstra, Prim/Kruskal MST' },
    { id: 'dsa-m7', title: 'Dynamic Programming & Backtracking', level: 'Module 7', diff: 'Expert', skills: '0/1 Knapsack, LCS Table, N-Queens Backtracking' },
  ];

  const netModules = MISSION_LIST.map((m, idx) => {
    const meta = [
      { level: 'Module 1', diff: 'Beginner', skills: 'IPv4, Subnetting, MAC Table' },
      { level: 'Module 2', diff: 'Intermediate', skills: '802.1Q, VLAN Trunking' },
      { level: 'Module 3', diff: 'Advanced', skills: 'Static & Dynamic BGP Routing' },
      { level: 'Module 4', diff: 'Expert', skills: 'Stateful Firewall, Security ACLs' },
    ][idx] || { level: `Module ${idx + 1}`, diff: 'Intermediate', skills: 'Routing & Packet Tracing' };

    return {
      id: m.id,
      title: m.title,
      level: meta.level,
      diff: meta.diff,
      skills: meta.skills,
    };
  });

  const activeModules = isTOC ? tocModules : isDSA ? dsaModules : netModules;
  const totalMissions = activeModules.length;

  // Calculate Subject Progress & Metrics
  const completedCount = Math.min(progress.completedMissionIds?.length || 0, totalMissions);
  const progressPct = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  const quizCount = progress.quizScores?.length || 0;
  const avgQuizScore = quizCount > 0
    ? Math.round(progress.quizScores.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizCount)
    : 0;

  const hasStudentData = completedCount > 0 || quizCount > 0;

  const overallGradePct = hasStudentData
    ? Math.round((progressPct * 0.5) + (quizCount > 0 ? avgQuizScore * 0.5 : progressPct * 0.5))
    : 0;

  const getGradeLetter = (score: number) => {
    if (!hasStudentData) return 'Pending';
    if (score >= 90) return 'Grade A+';
    if (score >= 80) return 'Grade A';
    if (score >= 70) return 'Grade B';
    if (score >= 60) return 'Grade C';
    return 'Grade D';
  };

  // Sparkline Chart Data Generator
  const generateSparklinePath = () => {
    if (!hasStudentData) {
      return {
        lineD: 'M 0 70 L 300 70',
        areaD: 'M 0 70 L 300 70 L 300 80 L 0 80 Z',
        pinX: 250,
        pinY: 70,
      };
    }

    const steps = Math.max(completedCount + quizCount, 3);
    const pts = [{ x: 0, y: 70 }];

    for (let i = 1; i <= steps; i++) {
      const ratio = i / steps;
      const currentScore = Math.min(overallGradePct, Math.round(overallGradePct * (ratio * 0.75 + 0.25)));
      const px = Math.round(ratio * 300);
      const py = Math.round(70 - (currentScore / 100) * 55);
      pts.push({ x: px, y: py });
    }

    const lastPt = pts[pts.length - 1];

    let pathStr = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      pathStr += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const areaStr = `${pathStr} L 300 80 L 0 80 Z`;

    return {
      lineD: pathStr,
      areaD: areaStr,
      pinX: Math.min(lastPt.x, 260),
      pinY: lastPt.y,
    };
  };

  const spark = generateSparklinePath();
  const allLabsCompleted = completedCount >= totalMissions && totalMissions > 0;

  const handleClaimCertificate = async () => {
    if (!allLabsCompleted) {
      alert(`Certificate Locked! You must complete all ${totalMissions} ${currentSubject} simulation labs to earn your verified diploma. Current progress: ${completedCount}/${totalMissions} labs completed.`);
      return;
    }

    setIsGeneratingCert(true);
    try {
      const title = isTOC
        ? 'Certified Theory of Computation & Automata Architect'
        : isDSA
        ? 'Certified Data Structures & Algorithms (DSA) Architect'
        : 'Certified Computer Network Architect & Systems Specialist';
      const cert = await generateCertificate(title);
      if (cert) setSelectedCert(cert);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCert(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-slate-900 font-sans select-none pb-8">
      {/* STUDENT LMS DASHBOARD HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black tracking-tight text-slate-900 font-sans">
              {isTOC
                ? 'Theory of Computation (TOC) Academic Overview'
                : isDSA
                ? 'Data Structures & Algorithms (DSA) Academic Overview'
                : 'Computer Networks Academic Overview'}
            </h2>
            {isTOC && (
              <span className="bg-cyan-100 text-cyan-900 border border-cyan-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Brain className="w-3 h-3 text-cyan-600" />
                <span>TOC Specialization</span>
              </span>
            )}
            {isDSA && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                <span>DSA Specialization</span>
              </span>
            )}
            {isNet && (
              <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-600" />
                <span>Networks Specialization</span>
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Welcome back, <span className="text-slate-900 font-extrabold">{user.username}</span> • STUDENT LEARNER
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            <span>{cloudActive ? 'Supabase LMS Sync' : 'IndexedDB Local'}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-full transition border border-slate-200"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP ROW: SUBJECT-SPECIFIC METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* ACADEMIC GRADE & PERFORMANCE CARD */}
        <div className={`lg:col-span-5 text-slate-900 rounded-[28px] p-6 relative flex flex-col justify-between overflow-hidden shadow-xs border ${
          isTOC ? 'bg-cyan-50 border-cyan-200/80' : isDSA ? 'bg-amber-50 border-amber-200/80' : 'bg-blue-50 border-blue-200/80'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black tracking-tight text-slate-900 font-sans">
                {hasStudentData ? `${overallGradePct}.0% (${getGradeLetter(overallGradePct)})` : '0.0% Grade (Pending)'}
              </span>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1">
              {hasStudentData
                ? `${isTOC ? 'TOC' : isDSA ? 'DSA' : 'Computer Networks'} Subject Academic Score`
                : 'Start your first lab or quiz to begin plotting grade data'}
            </p>
          </div>

          {/* DYNAMIC SPARKLINE CHART GRAPH */}
          <div className="my-6 relative h-28 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isTOC ? '#06b6d4' : isDSA ? '#f59e0b' : '#3b82f6'} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={isTOC ? '#06b6d4' : isDSA ? '#f59e0b' : '#3b82f6'} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={spark.lineD}
                fill="none"
                stroke={isTOC ? '#06b6d4' : isDSA ? '#f59e0b' : '#3b82f6'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={spark.areaD}
                fill="url(#chartGradient)"
              />
              <line x1={spark.pinX} y1={spark.pinY} x2={spark.pinX} y2="80" stroke={isTOC ? '#06b6d4' : isDSA ? '#f59e0b' : '#3b82f6'} strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx={spark.pinX} cy={spark.pinY} r="4" fill={isTOC ? '#06b6d4' : isDSA ? '#f59e0b' : '#3b82f6'} stroke="#ffffff" strokeWidth="2" />
            </svg>

            <div
              className="absolute bg-[#18181b] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1 animate-bounce"
              style={{ left: `${Math.min(spark.pinX - 40, 200)}px`, top: `${Math.max(spark.pinY - 35, 5)}px` }}
            >
              <span>{hasStudentData ? `${overallGradePct}% Score` : '0% Grade'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-extrabold text-slate-500">
            {(['1H', '24H', '1W', '1M', '1Y', 'ALL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2 py-0.5 rounded-md transition ${
                  timeRange === t ? 'bg-slate-900 text-white font-black' : 'hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ACADEMIC CREDENTIALS CARDS */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">
              {isTOC ? 'TOC Subject Metrics' : isDSA ? 'DSA Subject Metrics' : 'Networks Subject Metrics'}
            </h3>
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {/* CARD 1: LABS COMPLETED */}
            <div className="bg-[#f3e8ff] text-slate-900 rounded-[24px] p-5 flex flex-col justify-between border border-purple-200/60 shadow-xs hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{completedCount} / {totalMissions} Labs</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {isTOC ? 'Automata & Turing Labs' : isDSA ? 'DSA Execution Engines' : 'Networks Topology Labs'}
                  </p>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  <Layers className="w-4 h-4 text-purple-200" />
                </div>
                <span className="text-[10px] font-black text-purple-700 bg-purple-200/80 px-2 py-0.5 rounded-full">
                  {progressPct}% Progress
                </span>
              </div>
            </div>

            {/* CARD 2: QUIZZES */}
            <div className="bg-[#dcfce7] text-slate-900 rounded-[24px] p-5 flex flex-col justify-between border border-emerald-200/60 shadow-xs hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {quizCount > 0 ? `${avgQuizScore}% Avg` : '0 Quizzes'}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {isTOC ? 'TOC Quizzes' : isDSA ? 'DSA Quizzes' : 'Networks Quizzes'}
                  </p>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  <GraduationCap className="w-4 h-4 text-emerald-200" />
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  {quizCount > 0 ? `${quizCount} Taken` : '0 Taken'}
                </span>
              </div>
            </div>

            {/* CARD 3: DIPLOMA STATUS */}
            <div className="bg-[#fef9c3] text-slate-900 rounded-[24px] p-5 flex flex-col justify-between border border-yellow-200/60 shadow-xs hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {certificates.length > 0 ? `${certificates.length} Diplomas` : '0 Diplomas'}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {isTOC ? 'TOC Diploma' : isDSA ? 'DSA Diploma' : 'Networks Diploma'}
                  </p>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  <Award className="w-4 h-4 text-amber-200" />
                </div>
                <span className="text-[10px] font-black text-amber-700 bg-yellow-200/80 px-2 py-0.5 rounded-full">
                  {allLabsCompleted ? 'Unlocked' : 'Pending Labs'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: SUBJECT CURRICULUM MATRIX & CERTIFICATE PROMO CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: COURSE CURRICULUM MATRIX */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-black text-slate-900">
              {isTOC
                ? 'Theory of Computation (TOC) Curriculum'
                : isDSA
                ? 'Data Structures & Algorithms (DSA) Curriculum'
                : 'Computer Networks Curriculum'}
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {totalMissions} Modules
            </span>
          </div>

          {/* TABLE MATRIX */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-2">
                  <th className="py-2.5 font-bold">Lab Module</th>
                  <th className="py-2.5 font-bold">Level</th>
                  <th className="py-2.5 font-bold">Pass Criteria</th>
                  <th className="py-2.5 font-bold">Skills Covered</th>
                  <th className="py-2.5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
                {activeModules.map((m, idx) => {
                  const isDone = completedCount > idx;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#18181b] text-white flex items-center justify-center font-black text-sm shadow-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{m.title}</div>
                          <span className="text-[10px] text-slate-400 font-semibold">{m.level}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-900 font-extrabold">{m.diff}</td>
                      <td className="py-3.5 text-emerald-600 font-extrabold">80%+ Pass</td>
                      <td className="py-3.5 text-slate-500 font-bold max-w-xs truncate">{m.skills}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${
                          isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {isDone ? <Check className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                          {isDone ? 'Completed' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: CERTIFICATE PROMO CARD */}
        <div className="lg:col-span-5 bg-[#18181b] text-white rounded-[28px] p-7 flex flex-col justify-between relative overflow-hidden shadow-xl border border-slate-800 min-h-[260px]">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="1">
              <polygon points="10,10 90,10 90,90 10,90" />
              <polygon points="20,20 80,20 80,80 20,80" />
              <polygon points="30,30 70,30 70,70 30,70" />
            </svg>
          </div>

          <div className="space-y-3 relative z-10">
            <h3 className="text-2xl font-black tracking-tight leading-tight">
              Earn your <span className="px-2 py-0.5 border border-white/40 rounded-xl bg-white/10">verified</span>{' '}
              {isTOC ? 'TOC' : isDSA ? 'DSA' : 'networking'} diploma!
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
              {isTOC
                ? 'Complete all Theory of Computation simulation labs, master automata & decidability, and claim your official diploma.'
                : isDSA
                ? 'Complete all 12 Data Structures & Algorithms labs, master sorting, search & graph engines, and claim your official diploma.'
                : 'Complete all hands-on networking simulation labs, master topology & packet tracing, and claim your official diploma.'}
            </p>
          </div>

          <div className="pt-6 relative z-10">
            {allLabsCompleted ? (
              <button
                onClick={handleClaimCertificate}
                disabled={isGeneratingCert}
                className="bg-[#bfdbfe] hover:bg-sky-200 text-slate-900 font-black text-xs px-6 py-3 rounded-full transition shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>{isGeneratingCert ? 'Generating Diploma...' : 'Claim Verified Diploma 🎓'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleClaimCertificate}
                className="bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs px-5 py-3 rounded-full transition flex items-center justify-center gap-2 hover:bg-slate-700 hover:text-white"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Locked: Complete All Labs ({completedCount}/{totalMissions})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ISSUED CERTIFICATES MODAL RENDER */}
      {selectedCert && <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />}
    </div>
  );
};
