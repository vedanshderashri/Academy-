import React, { useState, useEffect } from 'react';
import { RESEARCH_QUESTIONS, TOC_RESEARCH_QUESTIONS, DSA_RESEARCH_QUESTIONS, AssessmentResult, QuizQuestion } from '../research/AssessmentEngine';
import { generateAIQuizQuestions } from '../ai/OpenRouterClient';
import { SubjectType } from './TopNavbar';
import { Zap, CheckCircle2, XCircle, Award, Sparkles, Loader2, RefreshCw, Brain } from 'lucide-react';

interface QuizModalProps {
  currentSubject?: SubjectType;
  onCompleteAssessment?: (result: AssessmentResult) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ currentSubject = 'ALL', onCompleteAssessment }) => {
  const isTOC = currentSubject === 'TOC';
  const isDSA = currentSubject === 'DSA';
  const initialQuestions = isTOC ? TOC_RESEARCH_QUESTIONS : isDSA ? DSA_RESEARCH_QUESTIONS : RESEARCH_QUESTIONS;

  const [testType, setTestType] = useState<'PRE_TEST' | 'POST_TEST'>('PRE_TEST');
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>(
    isTOC ? 'Automata Theory & DFA/NFA' : isDSA ? 'Sorting & Complexity' : 'Subnetting & CIDR'
  );
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Update questions whenever subject changes
  useEffect(() => {
    const qList = isTOC ? TOC_RESEARCH_QUESTIONS : isDSA ? DSA_RESEARCH_QUESTIONS : RESEARCH_QUESTIONS;
    setQuestions(qList);
    setSelectedTopic(isTOC ? 'Automata Theory & DFA/NFA' : isDSA ? 'Sorting & Complexity' : 'Subnetting & CIDR');
    setUserAnswers({});
    setSubmitted(false);
    setResult(null);
  }, [isTOC, isDSA]);

  const handleOptionSelect = (qId: number, optIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const top = q.topic || 'General';
      if (!topicBreakdown[top]) {
        topicBreakdown[top] = { correct: 0, total: 0 };
      }
      topicBreakdown[top].total += 1;

      if (userAnswers[q.id] === q.correctAnswer) {
        score += 1;
        topicBreakdown[top].correct += 1;
      }
    });

    const res: AssessmentResult = {
      timestamp: Date.now(),
      type: testType,
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      answers: userAnswers,
      topicBreakdown,
    };

    setResult(res);
    setSubmitted(true);
    if (onCompleteAssessment) onCompleteAssessment(res);
  };

  const handleGenerateAIQuiz = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    try {
      const data = await generateAIQuizQuestions(selectedTopic, 4);
      if (data && data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setUserAnswers({});
        setSubmitted(false);
        setResult(null);
      } else {
        throw new Error('Invalid quiz response structure from AI.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Failed to generate AI quiz via OpenRouter. Falling back to offline question bank.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="bg-[#fefefe] border border-slate-200 rounded-2xl p-6 text-slate-900 w-full max-w-5xl mx-auto space-y-6 select-none shadow-xs">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl">
            {isTOC ? <Brain className="w-5 h-5 text-cyan-700" /> : <Zap className="w-5 h-5 text-cyan-700" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 uppercase">
              {isTOC ? 'Theory of Computation Assessment & Quiz Lab' : 'Computer Networking Assessment & Quiz Lab'}
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              {isTOC
                ? 'Evaluate formal languages, automata, grammars & decidability concepts'
                : 'Evaluate theoretical networking concepts & retention with Gemini 2.0 AI'}
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setTestType('PRE_TEST');
              setSubmitted(false);
              setUserAnswers({});
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              testType === 'PRE_TEST' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pre-Test Baseline
          </button>
          <button
            onClick={() => {
              setTestType('POST_TEST');
              setSubmitted(false);
              setUserAnswers({});
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              testType === 'POST_TEST' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Post-Test Evaluation
          </button>
        </div>
      </div>

      {/* AI Quiz Generator Bar */}
      <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-700 animate-pulse" />
          <span className="font-bold text-xs text-slate-900">Generate AI Quiz via OpenRouter:</span>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-1.5 font-semibold focus:outline-none focus:border-cyan-600 w-full"
          >
            {isTOC ? (
              <>
                <option value="Automata Theory & DFA/NFA">Automata Theory & DFA/NFA</option>
                <option value="Formal Languages & Regular Grammars">Formal Languages & Grammars</option>
                <option value="Pumping Lemma & Regular Languages">Pumping Lemma & Regular Languages</option>
                <option value="Context-Free Grammars & Pushdown Automata">CFG & Pushdown Automata (PDA)</option>
                <option value="Turing Machines & Decidability">Turing Machines & Decidability</option>
                <option value="Chomsky Hierarchy Classification">Chomsky Hierarchy Classification</option>
              </>
            ) : (
              <>
                <option value="Subnetting & CIDR">Subnetting & CIDR</option>
                <option value="TCP/IP Handshake & Congestion Control">TCP/IP & Congestion Control</option>
                <option value="OSPF & BGP Routing Protocols">OSPF & BGP Dynamic Routing</option>
                <option value="VLANs, Switches & MAC Learning">VLANs & Ethernet Switching</option>
                <option value="Cyber Security & Firewalls">Cyber Security & Firewalls</option>
                <option value="DNS, DHCP & Application Layer">DNS, DHCP & HTTP Protocols</option>
              </>
            )}
          </select>

          <button
            onClick={handleGenerateAIQuiz}
            disabled={isLoadingAI}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 flex-shrink-0 transition-all shadow-xs"
          >
            {isLoadingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{isLoadingAI ? 'Generating...' : 'Generate Questions'}</span>
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
          {aiError}
        </div>
      )}

      {/* Result Card Banner */}
      {submitted && result && (
        <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 p-4 rounded-xl border border-cyan-300 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-cyan-800 font-bold uppercase tracking-wider">{result.type} SCORE</span>
            <div className="text-2xl font-extrabold text-slate-900">
              {result.score} / {result.total} ({result.percentage}%)
            </div>
          </div>
          <Award className="w-10 h-10 text-amber-600" />
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-800">
                QUESTION {idx + 1} • <span className="text-slate-600">{q.topic || selectedTopic}</span>
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">{q.question}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {q.options.map((opt, oIdx) => {
                const isSelected = userAnswers[q.id] === oIdx;
                const isCorrect = q.correctAnswer === oIdx;

                let optStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 font-medium';
                if (isSelected) {
                  optStyle = 'bg-cyan-100 border-cyan-600 text-cyan-900 font-bold';
                }
                if (submitted) {
                  if (isCorrect) optStyle = 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold';
                  else if (isSelected) optStyle = 'bg-rose-100 border-rose-600 text-rose-900 font-bold';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(q.id, oIdx)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
                    {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs">
                <span className="font-bold text-slate-900">Explanation: </span>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmitQuiz}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm shadow-md shadow-cyan-600/20 transition-all"
        >
          Submit Quiz Answers
        </button>
      )}
    </div>
  );
};


