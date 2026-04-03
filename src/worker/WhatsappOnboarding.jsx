import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { getCurrentWorker, updateWorker, setCurrentWorker } from '../store';

const BOT_QUESTIONS = [
  { key: 'platform', question: (w) => `Hi ${w.name}! 👋 I'm StillPaid's assistant. To activate your insurance, I need to verify a few details.\n\nWhich delivery platform do you work for?` },
  { key: 'zone', question: () => `Great! Which city/zone are you based in?` },
  { key: 'hours', question: () => `How many hours do you typically work each day?` },
];

function Message({ msg, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}>
      {msg.from === 'bot' && (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-text-main text-sm font-bold mr-2 flex-shrink-0 mt-1">
          SP
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          msg.from === 'user'
            ? 'bg-green-600 text-text-main rounded-tr-sm'
            : 'bg-bg-element text-text-main rounded-tl-sm'
        }`}
      >
        {msg.text.split('\n').map((line, i) => (
          <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>
        ))}
      </div>
    </div>
  );
}

export default function WhatsappOnboarding({ onComplete }) {
  const navigate = useNavigate();
  const worker = getCurrentWorker();
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const initRef = useRef(false);
  useEffect(() => {
    if (!worker) { navigate('/'); return; }
    if (initRef.current) return;
    initRef.current = true;
    // First bot message
    setTimeout(() => {
      addBotMessage(BOT_QUESTIONS[0].question(worker));
    }, 500);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addBotMessage = (text) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { from: 'bot', text, id: Date.now() }]);
    }, 1200);
  };

  const addUserMessage = (text) => {
    setMessages(m => [...m, { from: 'user', text, id: Date.now() }]);
  };

  const handleSend = () => {
    if (!input.trim() || typing || done) return;
    const val = input.trim();
    setInput('');
    addUserMessage(val);

    const currentQ = BOT_QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.key]: val };
    setAnswers(newAnswers);

    if (step < BOT_QUESTIONS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setTimeout(() => {
        addBotMessage(BOT_QUESTIONS[nextStep].question(worker));
      }, 800);
    } else {
      // All answered — activate profile
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages(m => [
            ...m,
            {
              from: 'bot',
              text: `✅ Perfect! Your profile has been verified.\n\nPlatform: ${newAnswers.platform}\nZone: ${newAnswers.zone}\nHours: ${newAnswers.hours} hrs/day\n\nYour risk score is: 🏷️ ${worker.riskScore}\n\nWelcome to StillPaid! Let's activate your insurance plan. 🛡️`,
              id: Date.now(),
            },
          ]);
          setDone(true);

          // Activate the worker
          const updatedWorker = { ...worker, status: 'Active' };
          updateWorker(updatedWorker);
          onComplete && onComplete();
        }, 1500);
      }, 800);
    }
  };

  const quickReplies = step === 0
    ? [worker?.platform]
    : step === 1
    ? [worker?.zone]
    : [`${worker?.avgHours} hours`];

  return (
    <div className="min-h-screen flex flex-col bg-bg-surface">
      {/* WhatsApp header */}
      <div className="bg-green-800 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-text-main font-bold">
          SP
        </div>
        <div>
          <p className="text-text-main font-semibold">StillPaid Assistant</p>
          <p className="text-green-300 text-xs">Official WhatsApp Bot</p>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        <div className="text-center">
          <span className="bg-bg-element/60 text-text-sub text-xs px-3 py-1 rounded-full">Today</span>
        </div>

        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}

        {typing && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-text-main text-sm font-bold">
              SP
            </div>
            <div className="bg-bg-element px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-bg-element-hover rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-bg-element-hover rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-bg-element-hover rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Success CTA */}
      {done && (
        <div className="p-4 bg-bg-surface border-t border-border-line">
          <button
            onClick={() => navigate('/plans')}
            className="w-full py-4 bg-indigo-600 text-text-main font-bold rounded-xl flex items-center justify-center gap-2 animate-slide-in-up"
          >
            <CheckCircle size={20} />
            Choose Your Plan
          </button>
        </div>
      )}

      {/* Input area */}
      {!done && (
        <div className="p-4 bg-bg-surface border-t border-border-line">
          {/* Quick replies */}
          {quickReplies[0] && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {quickReplies.map((qr) => qr && (
                <button
                  key={qr}
                  onClick={() => { setInput(qr); }}
                  className="bg-green-800/40 border border-green-700 text-green-300 text-sm px-3 py-1.5 rounded-full hover:bg-green-800/60 transition"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-bg-elevated border border-border-focus rounded-full px-4 py-2.5 text-text-main text-sm placeholder-text-muted focus:outline-none focus:border-green-600"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-text-main">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
