import React, { useRef } from 'react';
import { Certificate } from '../db/DatabaseService';
import { Award, ShieldCheck, Printer, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const certRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-[#fefefe] border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 my-8">
        {/* Certificate Actions Header Bar */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">OFFICIAL COMPUTER NETWORKS CERTIFICATION</h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4 text-cyan-700" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas Container */}
        <div className="p-8">
          <div
            ref={certRef}
            className="bg-gradient-to-b from-slate-50 via-white to-cyan-50/30 border-8 border-double border-amber-500/40 rounded-2xl p-10 relative text-center shadow-inner space-y-6"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-4 left-4 text-amber-500/40 text-xl font-serif">✦</div>
            <div className="absolute top-4 right-4 text-amber-500/40 text-xl font-serif">✦</div>
            <div className="absolute bottom-4 left-4 text-amber-500/40 text-xl font-serif">✦</div>
            <div className="absolute bottom-4 right-4 text-amber-500/40 text-xl font-serif">✦</div>

            {/* Top Logo & Issuer Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> Verified Educational Credential
              </div>
              <h1 className="text-3xl font-black tracking-wider text-slate-900 font-serif">
                CERTIFICATE OF ACHIEVEMENT
              </h1>
              <p className="text-xs font-semibold text-slate-600 tracking-widest uppercase">
                DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING • SIMULATION LABS
              </p>
            </div>

            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>

            {/* Recipient Statement */}
            <div className="space-y-2 py-2">
              <p className="text-xs font-serif italic text-slate-600">This is to certify that</p>
              <h2 className="text-3xl font-extrabold text-cyan-900 font-sans tracking-wide underline underline-offset-8 decoration-amber-400">
                {certificate.userName}
              </h2>
              <p className="text-xs font-medium text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
                has successfully completed all required computer networking simulation laboratories, packet routing protocol labs, CIDR subnetting designs, and dynamic Dijkstra dynamic routing missions in
              </p>
              <h3 className="text-lg font-bold text-slate-900 pt-1 font-mono">{certificate.courseTitle}</h3>
            </div>

            {/* Badges / Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-2">
              <div className="bg-white/80 border border-slate-200 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Missions Completed</span>
                <span className="text-base font-extrabold text-slate-900">{certificate.completedMissionsCount} / 18</span>
              </div>
              <div className="bg-white/80 border border-slate-200 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Practical GPA</span>
                <span className="text-base font-extrabold text-emerald-700">{certificate.gpaScore.toFixed(1)} / 4.0</span>
              </div>
              <div className="bg-white/80 border border-slate-200 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Status</span>
                <span className="text-xs font-bold text-cyan-800 flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASSED
                </span>
              </div>
            </div>

            {/* Footer Seal & Signatures */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Certificate Verification ID</span>
                <span className="font-bold font-mono text-slate-800">{certificate.certificateCode}</span>
                <span className="text-[10px] text-slate-500 block pt-0.5">Issued: {certificate.issuedAt}</span>
              </div>

              {/* Gold Seal Graphic */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-1 shadow-lg flex items-center justify-center text-amber-950 font-bold font-serif text-[10px] text-center border-2 border-amber-600">
                OFFICIAL SEAL
              </div>

              <div className="text-right">
                <div className="font-serif italic font-bold text-slate-800 text-sm">Network Tycoon Board</div>
                <div className="w-32 border-b border-slate-400 my-1 ml-auto"></div>
                <span className="text-[10px] text-slate-500 font-mono block">Lead Software Architect</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
