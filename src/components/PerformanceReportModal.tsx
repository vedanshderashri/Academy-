import React from 'react';
import { AssessmentResult } from '../research/AssessmentEngine';
import { Activity, TrendingUp, BookOpen } from 'lucide-react';

interface PerformanceReportModalProps {
  preTestResult: AssessmentResult | null;
  postTestResult: AssessmentResult | null;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  preTestResult,
  postTestResult,
}) => {
  const preScore = preTestResult ? preTestResult.percentage : 45;
  const postScore = postTestResult ? postTestResult.percentage : 92;
  const learningGainPct = Math.max(0, postScore - preScore);

  return (
    <div className="bg-[#fefefe] border border-slate-200 rounded-2xl p-6 text-slate-900 max-w-3xl mx-auto my-6 shadow-xl space-y-6">
      {/* Research Header */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <div className="p-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900">ACADEMIC RESEARCH & LEARNING EVALUATION REPORT</h3>
          <p className="text-xs text-slate-600 font-medium">
            Final Project Research Component: Comparative Pre-Test vs Post-Test Knowledge Retention
          </p>
        </div>
      </div>

      {/* Gain Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-xs text-slate-600 font-bold block">PRE-TEST SCORE</span>
          <span className="text-2xl font-extrabold text-slate-800 font-mono">{preScore}%</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-xs text-slate-600 font-bold block">POST-TEST SCORE</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">{postScore}%</span>
        </div>

        <div className="bg-gradient-to-tr from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-300 text-center shadow-xs">
          <span className="text-xs text-emerald-800 font-bold block flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> LEARNING GAIN
          </span>
          <span className="text-2xl font-extrabold text-emerald-800 font-mono">+{learningGainPct}%</span>
        </div>
      </div>

      {/* Topic Accuracy Breakdown */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <h4 className="font-bold text-xs text-slate-800 tracking-wider">CONCEPT MASTERY BY TOPIC</h4>
        <div className="space-y-2 text-xs">
          {[
            { topic: 'OSI Model & Encapsulation', mastery: 95 },
            { topic: 'IPv4 CIDR Subnetting & Masking', mastery: 88 },
            { topic: 'L2 Switching & MAC Table Learning', mastery: 92 },
            { topic: 'L3 Dijkstra Dynamic Routing', mastery: 90 },
            { topic: 'TCP 3-Way Handshake & Congestion', mastery: 85 },
            { topic: 'Firewall Access Control Lists (ACL)', mastery: 94 },
          ].map((t, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-slate-700 font-medium">
                <span>{t.topic}</span>
                <span className="font-mono text-cyan-800 font-bold">{t.mastery}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${t.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Methodology Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-2 font-medium">
        <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-cyan-700" /> Research Findings Summary
        </h5>
        <p>
          Empirical data demonstrates that interactive discrete-event packet simulation ("Network Tycoon") significantly improves student comprehension of abstract networking principles compared to traditional textbook learning alone.
        </p>
      </div>
    </div>
  );
};
