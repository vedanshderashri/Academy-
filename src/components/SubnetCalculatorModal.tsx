import React, { useState } from 'react';
import { calculateSubnetDetails, SubnetInfo } from '../simulation/protocols/SubnetMath';
import { Calculator, X } from 'lucide-react';

interface SubnetCalculatorModalProps {
  onClose: () => void;
}

export const SubnetCalculatorModal: React.FC<SubnetCalculatorModalProps> = ({ onClose }) => {
  const [ipCidr, setIpCidr] = useState<string>('192.168.1.0/24');
  const [details, setDetails] = useState<SubnetInfo>(calculateSubnetDetails('192.168.1.0/24'));

  const handleCalculate = () => {
    try {
      setDetails(calculateSubnetDetails(ipCidr));
    } catch (e) {
      // Keep previous valid
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#fefefe] border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-cyan-700" />
            <h3 className="font-bold text-slate-900 text-sm">INTERACTIVE CIDR SUBNET CALCULATOR</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-mono text-slate-800">
          <div>
            <label className="block text-slate-700 font-sans font-bold mb-1">Enter IPv4 CIDR Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ipCidr}
                onChange={(e) => setIpCidr(e.target.value)}
                className="bg-white border border-slate-300 p-2 rounded text-cyan-900 font-bold flex-1 focus:outline-none focus:border-cyan-600"
              />
              <button
                onClick={handleCalculate}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-sans font-bold"
              >
                Calculate
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600 font-sans font-medium">Subnet Mask:</span>
              <span className="text-cyan-800 font-bold">{details.mask}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600 font-sans font-medium">Network Address:</span>
              <span className="text-emerald-700 font-bold">{details.network}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600 font-sans font-medium">Broadcast Address:</span>
              <span className="text-rose-700 font-bold">{details.broadcast}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600 font-sans font-medium">First Usable Host IP:</span>
              <span className="text-amber-800 font-bold">{details.firstUsable}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600 font-sans font-medium">Last Usable Host IP:</span>
              <span className="text-amber-800 font-bold">{details.lastUsable}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600 font-sans font-medium">Total Host IPs:</span>
              <span className="text-purple-800 font-bold">{details.totalHosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans font-medium">Usable Host IPs:</span>
              <span className="text-cyan-800 font-bold">{details.usableHosts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
