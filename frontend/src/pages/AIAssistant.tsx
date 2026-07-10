import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { RiskAnalysis } from '../types';
import { MessageSquare, Send, Shield, Lightbulb, AlertTriangle, BrainCircuit, Bot, User as UserIcon } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [risk, setRisk] = useState<RiskAnalysis | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [showRisk, setShowRisk] = useState(false);

  useEffect(() => {
    aiAPI.getSafetyTips().then((res) => setTips(res.data.tips)).catch(() => {});
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setChat((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const res = await aiAPI.askChatbot(question);
      setChat((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setChat((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not process your request. Please try again.' }]);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  const analyzeCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await aiAPI.analyzeRisk({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setRisk(res.data);
          setShowRisk(true);
        } catch (err) { console.error(err); }
      });
    }
  };

  const getRiskBadge = (level: string) => {
    const m: Record<string, string> = {
      safe: 'badge-green', moderate: 'badge-yellow', danger: 'badge-red', critical: 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300',
    };
    return m[level] || 'badge-gray';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const suggestions = [
    'Is this area safe?',
    'What should I do if I lose my passport?',
    'Find nearest police station',
    'How to stay safe at night?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Safety Assistant</h1>
          <p className="text-sm text-gray-500 mt-0.5">Powered by Gemini AI – ask anything about safety</p>
        </div>
        <button onClick={analyzeCurrentLocation} className="btn-outline text-sm">
          <Shield className="w-4 h-4" /> Analyze Location
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700/50">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">AI Chat</h2>
              <p className="text-xs text-gray-400">Ask me anything about safety</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {chat.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Bot className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">How can I help you stay safe?</p>
                <p className="text-xs mt-1 text-gray-300">Try one of these questions:</p>
                <div className="mt-4 space-y-2 w-full max-w-xs">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => { setQuestion(s); setTimeout(handleAsk, 100); }}
                      className="w-full text-left text-xs px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === 'user'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    {msg.role === 'user' ? <UserIcon className="w-3.5 h-3.5 text-blue-600" /> : <Bot className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`}>{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-700/50">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask a safety question..." className="input-field flex-1" />
            <button onClick={handleAsk} disabled={loading || !question.trim()} className="btn-primary px-4">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {showRisk && risk && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Location Risk Analysis
                </h2>
                <span className={`badge ${getRiskBadge(risk.risk_level)}`}>{risk.risk_level.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ring-4 ${
                  risk.safety_score >= 70 ? 'ring-green-500/30 text-green-600' :
                  risk.safety_score >= 40 ? 'ring-amber-500/30 text-amber-600' :
                  'ring-red-500/30 text-red-600'
                } bg-gray-50 dark:bg-gray-800`}>
                  {risk.safety_score}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Safety Score</p>
                  <p className={`text-lg font-bold ${getScoreColor(risk.safety_score)}`}>/100</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{risk.recommendation}</p>
              {risk.risk_factors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Factors</p>
                  {risk.risk_factors.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              )}
              {risk.ai_explanation && !risk.ai_explanation.startsWith('AI analysis unavailable') && (
                <p className="mt-3 text-xs text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-3">AI: {risk.ai_explanation}</p>
              )}
            </div>
          )}

          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Safety Tips
            </h2>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
