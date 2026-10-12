import React, { useState } from 'react';
import { AIDiagnosticReport } from '../ai/AIAssistant';
import { chatWithAINetworkEngineer, OpenRouterMessage } from '../ai/OpenRouterClient';
import { NetworkNode, NetworkLink, PacketTrace } from '../types/network';
import { Bot, CheckCircle, AlertTriangle, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface AIAssistantModalProps {
  report: AIDiagnosticReport;
  nodes: NetworkNode[];
  links: NetworkLink[];
  packetLogs: PacketTrace[];
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  report,
  nodes,
  links,
  packetLogs,
  onClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'diagnostics' | 'chat'>('diagnostics');
  const [chatMessages, setChatMessages] = useState<OpenRouterMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Format live topology state for OpenRouter AI context
  const getTopologySummary = (): string => {
    const nodeStr = nodes
      .map(
        (n) =>
          `- ${n.name} (${n.type.toUpperCase()}): IP=${n.interfaces[0]?.ip || 'None'}, Subnet=${
            n.interfaces[0]?.subnetMask || 'None'
          }, Status=${n.status}`
      )
      .join('\n');

    const linkStr = links
      .map((l) => {
        const n1 = nodes.find((n) => n.id === l.fromNodeId)?.name;
        const n2 = nodes.find((n) => n.id === l.toNodeId)?.name;
        return `- Link ${l.type.toUpperCase()}: ${n1} <-> ${n2} (${l.status})`;
      })
      .join('\n');

    const recentDrops = packetLogs
      .filter((p) => p.status === 'DROPPED' || p.status === 'BLOCKED')
      .slice(0, 3)
      .map((p) => `- Drop: ${p.sourceNodeId} -> ${p.targetNodeId} (${p.dropReason || 'Unknown'})`)
      .join('\n');

    return `NODES:\n${nodeStr || 'None'}\n\nLINKS:\n${linkStr || 'None'}\n\nRECENT PACKET DROPS:\n${
      recentDrops || 'None'
    }`;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const query = userInput.trim();
    setUserInput('');

    const newMessages: OpenRouterMessage[] = [...chatMessages, { role: 'user', content: query }];
    setChatMessages(newMessages);
    setIsLoading(true);

    try {
      const topologyState = getTopologySummary();
      const aiReply = await chatWithAINetworkEngineer(query, topologyState, chatMessages);

      setChatMessages([...newMessages, { role: 'assistant', content: aiReply }]);
    } catch (err) {
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, unable to connect to OpenRouter AI service. Please check network connection.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#fefefe] border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] h-[650px]">
        {/* Header */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                AI NETWORK ENGINEER
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Powered by OpenRouter
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Live topology diagnostics & OpenRouter LLM chat assistant
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('diagnostics')}
            className={`py-2.5 px-3 border-b-2 ${
              activeSubTab === 'diagnostics'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Auto Diagnostics
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1 ${
              activeSubTab === 'chat'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Live AI Assistant Chat
          </button>
        </div>

        {/* Content Body */}
        {activeSubTab === 'diagnostics' ? (
          <div className="p-6 space-y-4 text-xs text-slate-800 overflow-y-auto flex-1">
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                report.issueFound
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              {report.issueFound ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <span className="font-bold">{report.summary}</span>
            </div>

            {report.issueFound && (
              <>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 tracking-wider">IDENTIFIED ROOT CAUSES</h4>
                  <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                    {report.rootCauses.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] font-medium">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 tracking-wider">RECOMMENDED RESOLUTION STEPS</h4>
                  <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-cyan-900 font-medium">
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-cyan-700 font-bold">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Live AI Chat Interface */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-sans space-y-2">
                  <Bot className="w-8 h-8 text-cyan-600 mx-auto opacity-70" />
                  <p className="font-bold text-slate-700">Ask the OpenRouter AI Network Assistant anything!</p>
                  <p className="text-[11px] text-slate-500">
                    The AI has full context of your active nodes, cables, IP subnets, and routing tables.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    <button
                      onClick={() => setUserInput("Why can't my PC ping the server?")}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      "Why can't my PC ping the server?"
                    </button>
                    <button
                      onClick={() => setUserInput('How do I setup static route for Subnet 2?')}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      "How do I setup static route for Subnet 2?"
                    </button>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs font-sans whitespace-pre-wrap leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-cyan-600 text-white rounded-br-none font-medium'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-medium'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                    OpenRouter AI is analyzing network state...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI Engineer about your topology..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs flex-1 text-slate-900 font-medium focus:outline-none focus:border-cyan-600"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
