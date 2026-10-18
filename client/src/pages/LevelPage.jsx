import { useEffect, useRef, useState, useCallback, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCourseData, getChapterData } from '../components/LandingPage/LevelData.js';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
 
// ─── SYNTAX HIGHLIGHTER ───────────────────────────────────────────────────────
function highlight(code) {
  const lines = (code || '').split('\n');
 
  return lines.map((line, i) => {
    const cmtIdx = line.indexOf('//');
    const main = cmtIdx !== -1 ? line.slice(0, cmtIdx) : line;
    const cmt = cmtIdx !== -1 ? line.slice(cmtIdx) : null;
 
    const keywords = new Set([
      'const', 'let', 'var', 'function', 'return', 'if', 'else',
      'typeof', 'new', 'for', 'while', 'class', 'import', 'export',
      'default', 'async', 'await',
    ]);
 
    const tokens = main.split(
      /(\b(?:const|let|var|function|return|if|else|typeof|new|for|while|class|import|export|default|async|await)\b|"[^"]*"|'[^']*'|`[^`]*`|\b\d+\.?\d*\b|\bconsole\b)/
    );
 
    const parts = tokens.map((t, ti) => {
      if (keywords.has(t)) return <span key={ti} style={{ color: '#ff79c6' }}>{t}</span>;
      if (/^["'`]/.test(t)) return <span key={ti} style={{ color: '#f1fa8c' }}>{t}</span>;
      if (/^\d/.test(t)) return <span key={ti} style={{ color: '#bd93f9' }}>{t}</span>;
      if (t === 'console') return <span key={ti} style={{ color: '#50fa7b' }}>{t}</span>;
      return t;
    });
 
    if (cmt) parts.push(
      <span key="cmt" style={{ color: '#6272a4', fontStyle: 'italic' }}>{cmt}</span>
    );
 
    return <div key={i} className="leading-7">{parts}</div>;
  });
}
 
// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);
 
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
 
  return (
    <button
      onClick={copy}
      className="text-xs font-mono px-2.5 py-1 rounded border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
 
// ─── CODE BLOCK ───────────────────────────────────────────────────────────────
function CodeBlock({ code, note }) {
  if (!code) return null;
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-white/10 bg-[#08080f]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161625] border-b border-white/[0.07]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30">
          JavaScript
        </span>
        <CopyButton code={code} />
      </div>
 
      <pre
        className="overflow-x-auto p-5 font-mono text-[0.82rem] text-[#c9d1d9]"
        style={{ lineHeight: 1.8 }}
      >
        {highlight(code)}
      </pre>
 
      {note && (
        <div className="flex gap-2.5 items-start px-4 py-3 bg-white/[0.02] border-t border-white/[0.07] text-[0.78rem] text-white/40 leading-relaxed">
          <span className="shrink-0">💡</span>
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}
 
// ─── LESSON CONTENT ───────────────────────────────────────────────────────────
// Reads:  part.steps[]  →  { heading, body, code, codeNote }
function LessonContent({ part }) {
  return (
    <div className="space-y-8">
      {part.steps.map((step, i) => (
        <div key={i}>
          <h2
            className="text-lg font-bold text-white mb-3 leading-snug"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {step.heading}
          </h2>
          <p
            className="text-[0.93rem] leading-7 text-white/70"
            dangerouslySetInnerHTML={{ __html: step.body }}
          />
          <CodeBlock code={step.code} note={step.codeNote} />
        </div>
      ))}
    </div>
  );
}
 
// ─── CHALLENGE CONTENT ────────────────────────────────────────────────────────
// Reads:  part.challenges[]  →  { id, question, code, options[], correct, explanation }
function ChallengeContent({ part, answers, onAnswer, submitted }) {
  const resultRef = useRef(null);
 
  useEffect(() => {
    if (submitted && resultRef.current) {
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
        80
      );
    }
  }, [submitted]);
 
  // answers keyed by question index (0, 1, 2 …)
  const correctCount = part.challenges.filter((ch, qi) => answers[qi] === ch.correct).length;
  const total = part.challenges.length;
 
  return (
    <div className="space-y-5">
      {/* intro */}
      <div
        className="flex gap-3 items-start p-4 rounded-xl border"
        style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}
      >
        <span className="text-2xl shrink-0">⚡</span>
        <p className="text-[0.86rem] text-white/60 leading-relaxed">
          <strong className="text-amber-400">Chapter Challenge</strong> — Answer all {total} questions,
          then hit <strong className="text-amber-400">Submit</strong> to earn{' '}
          <strong className="text-amber-400">+{part.xp} XP</strong>.
        </p>
      </div>
 
      {/* questions */}
      {part.challenges.map((ch, ci) => {
        // Use question index (ci) as key — ch.id can repeat across chapters
        const selected = answers[ci];
        const hasSelected = selected !== undefined;
        const isCorrect = selected === ch.correct;
 
        return (
          <div key={ch.id} className="rounded-2xl border border-white/10 bg-[#161625] overflow-hidden">
 
            {/* question header */}
            <div className="flex items-center gap-3 px-5 pt-5">
              <div
                className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono text-[0.7rem] font-bold border"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)' }}
              >
                {ci + 1}
              </div>
              <p className="text-[0.93rem] font-medium text-white">{ch.question}</p>
            </div>
 
            {/* optional code snippet */}
            {ch.code && (
              <div className="mx-5 mt-3.5 rounded-lg overflow-hidden border border-white/[0.08] bg-[#08080f]">
                <pre
                  className="p-3.5 font-mono text-[0.78rem] text-[#c9d1d9] overflow-x-auto"
                  style={{ lineHeight: 1.8 }}
                >
                  {highlight(ch.code)}
                </pre>
              </div>
            )}
 
            {/* options */}
            <div className="grid grid-cols-2 gap-2 p-5">
              {ch.options.map((opt, oi) => {
                let bg = 'bg-[#12121f]';
                let border = 'border-white/10';
                let textCol = 'text-white/70';
                let letterBg = 'bg-[#1e1e32] border-white/10 text-white/40';
 
                if (hasSelected) {
                  if (submitted) {
                    if (oi === ch.correct) {
                      bg = 'bg-emerald-500/10'; border = 'border-emerald-500';
                      textCol = 'text-emerald-400'; letterBg = 'bg-emerald-500 border-emerald-500 text-white';
                    } else if (oi === selected && !isCorrect) {
                      bg = 'bg-red-500/10'; border = 'border-red-500';
                      textCol = 'text-red-400'; letterBg = 'bg-red-500 border-red-500 text-white';
                    } else {
                      textCol = 'text-white/30';
                    }
                  } else if (oi === selected) {
                    bg = 'bg-indigo-500/10'; border = 'border-indigo-400';
                    textCol = 'text-indigo-300'; letterBg = 'bg-indigo-500 border-indigo-500 text-white';
                  } else {
                    textCol = 'text-white/30';
                  }
                }
 
                return (
                  <button
                    key={oi}
                    disabled={hasSelected}
                    onClick={() => !hasSelected && onAnswer(ci, oi)}
                    className={`flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-lg border text-[0.82rem] font-mono transition-all duration-150
                      ${bg} ${border} ${textCol}
                      ${!hasSelected ? 'hover:bg-indigo-500/10 hover:border-indigo-400 hover:text-indigo-300 cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <span className={`w-5 h-5 shrink-0 rounded flex items-center justify-center text-[0.62rem] font-bold border ${letterBg}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
 
            {/* explanation after submit */}
            {submitted && hasSelected && (
              <div className={`mx-5 mb-5 px-4 py-3 rounded-lg text-[0.8rem] leading-relaxed border ${isCorrect
                ? 'bg-emerald-500/[0.07] border-emerald-500/25 text-white/70'
                : 'bg-red-500/[0.07] border-red-500/25 text-white/70'
                }`}>
                {isCorrect ? '✅' : '❌'} {ch.explanation}
              </div>
            )}
          </div>
        );
      })}
 
      {/* result card */}
      {submitted && (
        <div
          ref={resultRef}
          className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-[#161625]"
        >
          <div className="text-5xl mb-3">
            {correctCount === total ? '🏆' : correctCount >= total - 1 ? '🎯' : '📚'}
          </div>
          <h3
            className="text-2xl font-extrabold text-white mb-1.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {correctCount === total ? 'Perfect Score!' : correctCount >= total - 1 ? 'Well Done!' : 'Keep Practicing!'}
          </h3>
          <p className="text-sm text-white/40 mb-5">
            {correctCount} / {total} correct answers
          </p>
          <div
            className="flex items-center gap-2 px-6 py-3 rounded-xl border font-mono font-bold text-lg"
            style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}
          >
            ⚡ +{part.xp} XP Earned
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─────── CHALLENGE TIMER ──────────────────────────────────────────────────────
// Returns { timerDisplay, elapsedSeconds, resetTimer }
// and renders the timer + optional "last time" badge
 
function ChallengeTimer({ isChallenge, isCodeChallenge, isSubmitted, lastTimeTaken }) {
  const [startTime, setstartTime] = useState(null);
  const [elapsedTime, setelapsedTime] = useState(0);
 
  const isChallengeRunning = (isChallenge || isCodeChallenge) && !isSubmitted;
 
  // Start timer when challenge begins
  useEffect(() => {
    if (isChallengeRunning && !startTime) {
      setstartTime(new Date());
    }
  }, [isChallengeRunning, startTime]);
 
  // Reset timer when challenge is submitted or no longer running
  useEffect(() => {
    if (!isChallengeRunning) {
      setstartTime(null);
      setelapsedTime(0);
    }
  }, [isChallengeRunning]);
 
  // Run the timer interval
  useEffect(() => {
    let interval;
    if (startTime && isChallengeRunning) {
      interval = setInterval(() => {
        const currentTime = new Date();
        const timeDiff = Math.floor((currentTime - startTime) / 1000);
        setelapsedTime(timeDiff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isChallengeRunning]);
 
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  if (isChallenge){
  return (
    <div className="flex flex-col gap-1">
      <div className='timer'>
        {formatTime(elapsedTime)}
      </div>
      {/* Show last recorded time below the timer when challenge was previously solved */}
      {lastTimeTaken !== null && lastTimeTaken !== undefined && (
        <div
          className="font-mono text-white/50 text-center leading-tight"
          title="Your best recorded time for this challenge"
        >
          last: {formatTime(lastTimeTaken)}
        </div>
      )}
    </div>
  );
};
}
 
// ─── SIDEBAR PART ITEM ────────────────────────────────────────────────────────
function SidebarPartItem({ part, index, isActive, isDone, isAccessible, onClick }) {
  const icons = ['📖', '🔢', '⚡', '🏆', '📌', '🔑', '🛠️'];
  const icon = part.codeChallenge ? '</>' : part.isChallengepart ? '🏆' : (icons[index] ?? '📌');
 
  return (
    <div
      onClick={isAccessible ? onClick : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl border mb-1 transition-all duration-200 overflow-hidden
        ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}
        ${isActive ? 'bg-[#161625] border-white/10' : 'border-transparent hover:bg-[#161625]/60'}
      `}
    >
      {/* active indicator bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
          style={{ background: part.color, boxShadow: `0 0 8px ${part.glow}` }}
        />
      )}
 
      {/* icon */}
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm border transition-all"
        style={
          isDone
            ? { background: 'rgba(16,185,129,0.12)', borderColor: '#10B981' }
            : isActive
              ? { background: '#12121f', borderColor: part.color, boxShadow: `0 0 10px ${part.glow}` }
              : { background: '#12121f', borderColor: 'rgba(255,255,255,0.07)' }
        }
      >
        {isDone ? '✅' : icon}
      </div>
 
      {/* label */}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[0.62rem] uppercase tracking-wider text-white/30 mb-0.5">
          Part {index + 1}
        </div>
        <div className={`text-[0.83rem] truncate ${isActive ? 'font-semibold text-white' : 'font-medium text-white/70'}`}>
          {part.title}
        </div>
      </div>
 
      {/* xp badge or lock */}
      {!isAccessible ? (
        <span className="text-xs text-white/30">🔒</span>
      ) : (
        <span
          className="text-[0.68rem] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0"
          style={{
            color: part.color,
            background: part.glow.replace('0.35', '0.08').replace('0.4', '0.08'),
            borderColor: part.color + '44',
          }}
        >
          +{part.xp}
        </span>
      )}
    </div>
  );
}
 
// ─── CODE CHALLENGE CONTENT ───────────────────────────────────────────────────
// Reads:  part.codeChallenge → { prompt, starterCode, testCases[], hint }
function CodeChallengeContent({ part, submitted, onSubmitCode }) {
  const [userCode, setUserCode] = useState(part.codeChallenge?.starterCode || '');
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
 
  const challenge = part.codeChallenge;
  if (!challenge) return null;
 
  // Pick CodeMirror language extension based on the course
  const langExtension = challenge.language === 'python' ? python() : javascript();
 
  function runTests() {
    setIsRunning(true);
    setResults(null);
 
    setTimeout(() => {
      const testResults = (challenge.testCases || []).map((tc) => {
        try {
          // Create a sandboxed function from user code + test call
          const callExpr = tc.call || `${tc.input}`;
          const fn = new Function(userCode + '\nreturn ' + callExpr + ';');
          const actual = fn();
          const expected = tc.expectedOutput !== undefined ? tc.expectedOutput : tc.expected;
          const passed = JSON.stringify(actual) === JSON.stringify(expected);
          return { ...tc, actual, passed, expected };
        } catch (err) {
          return { ...tc, actual: err.message, passed: false, error: true, expected: tc.expectedOutput !== undefined ? tc.expectedOutput : tc.expected };
        }
      });
      setResults(testResults);
      setIsRunning(false);
 
      if (testResults.every((r) => r.passed) && !submitted) {
        onSubmitCode();
      }
    }, 300);
  }
 
  const allPassed = results && results.every((r) => r.passed);
 
  return (
    <div className="space-y-5">
      {/* intro */}
      <div
        className="flex gap-3 items-start p-4 rounded-xl border"
        style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}
      >
        <span className="text-2xl shrink-0">💻</span>
        <div>
          <p className="text-[0.86rem] text-white/60 leading-relaxed">
            <strong className="text-purple-400">Code Challenge</strong> — Write code to solve the problem.
            Pass all tests to earn <strong className="text-purple-400">+{part.xp} XP</strong>.
          </p>
        </div>
      </div>
 
      {/* prompt */}
      <div className="rounded-2xl border border-white/10 bg-[#161625] p-5">
        <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          {challenge.prompt}
        </h3>
        {challenge.description && (
          <p className="text-sm text-white/50 leading-relaxed mb-4">{challenge.description}</p>
        )}
 
        {/* hint toggle */}
        {challenge.hint && (
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-amber-400/70 hover:text-amber-400 font-mono mb-3 transition"
          >
            {showHint ? '🔽 Hide hint' : '💡 Show hint'}
          </button>
        )}
        {showHint && challenge.hint && (
          <div className="px-4 py-2.5 rounded-lg bg-amber-500/[0.07] border border-amber-500/20 text-sm text-amber-200/80 mb-4">
            {challenge.hint}
          </div>
        )}
 
        {/* CodeMirror editor */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <CodeMirror
            value={userCode}
            height="220px"
            theme={oneDark}
            extensions={[langExtension]}
            onChange={(val) => setUserCode(val)}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              bracketMatching: true,
              autocompletion: true,
              foldGutter: false,
            }}
          />
        </div>
 
        {/* run button */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={runTests}
            disabled={isRunning || allPassed}
            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: allPassed ? '#10B981' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: 'white',
              boxShadow: allPassed ? '0 0 20px rgba(16,185,129,0.3)' : '0 4px 20px rgba(139,92,246,0.3)',
            }}
          >
            {isRunning ? '⏳ Running...' : allPassed ? '✅ All Tests Passed!' : '▶ Run Tests'}
          </button>
          {results && !allPassed && (
            <span className="text-sm text-red-400 font-semibold">
              {results.filter(r => r.passed).length}/{results.length} passed
            </span>
          )}
        </div>
      </div>
 
      {/* test results */}
      {results && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-lg border p-3 text-sm font-mono ${r.passed
                  ? 'bg-emerald-500/[0.07] border-emerald-500/25'
                  : 'bg-red-500/[0.07] border-red-500/25'
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/70">{r.passed ? '✅' : '❌'} Test {i + 1}</span>
                <span className="text-white/40 text-xs">{r.description || r.label || r.call}</span>
              </div>
              <div className="text-white/50 text-xs">
                Expected: <span className="text-cyan-400">{JSON.stringify(r.expected)}</span>
                {!r.passed && (
                  <> | Got: <span className="text-red-400">{r.error ? r.actual : JSON.stringify(r.actual)}</span></>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
 
      {/* success card */}
      {allPassed && (
        <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-[#161625]">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-2xl font-extrabold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
            Challenge Complete!
          </h3>
          <p className="text-sm text-white/40 mb-5">All {results.length} tests passed</p>
          <div
            className="flex items-center gap-2 px-6 py-3 rounded-xl border font-mono font-bold text-lg"
            style={{ color: '#8B5CF6', background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)' }}
          >
            ⚡ +{part.xp} XP Earned
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── CHALLENGE TIME COMPLETION POPUP ─────────────────────────────────────────
// Shows immediately after first-time challenge completion with time taken
function ChallengeTimePopup({ timeTaken, onClose, partColor, partGlow }) {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
 
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative rounded-3xl p-8 text-center max-w-xs w-full mx-4 border"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e, #0d0d1a)',
          borderColor: partColor + '55',
          boxShadow: `0 0 60px ${partGlow}, 0 0 120px ${partGlow}`,
          animation: 'timePopupIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* stopwatch icon */}
        <div className="text-5xl mb-3" style={{ animation: 'popupBounce 0.5s ease-out 0.1s both' }}>⏱️</div>
 
        <h3
          className="text-xl font-black text-white mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Challenge Solved!
        </h3>
        <p className="text-white/40 text-sm mb-5">Here's how long it took you</p>
 
        {/* big time display */}
        <div
          className="rounded-2xl px-6 py-4 mb-6 border"
          style={{
            background: 'rgba(245,158,11,0.07)',
            borderColor: 'rgba(245,158,11,0.25)',
          }}
        >
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30 mb-1">Time Taken</div>
          <div
            className="font-mono text-4xl font-black tracking-tight"
            style={{ color: '#F59E0B', textShadow: '0 0 20px rgba(245,158,11,0.4)' }}
          >
            {formatTime(timeTaken)}
          </div>
        </div>
 
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${partColor}, ${partColor}bb)`,
            boxShadow: `0 4px 20px ${partGlow}`,
          }}
        >
          Awesome! 🎉
        </button>
 
        <style>{`
          @keyframes timePopupIn {
            0%   { opacity: 0; transform: scale(0.7) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes popupBounce {
            0%   { transform: scale(0.3) rotate(-20deg); }
            60%  { transform: scale(1.2) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
 
// ─── localStorage helpers for persisting challenge times ──────────────────────
// Key format:  "challengeTime:{courseId}:{levelNo}:{partIdx}"
function getChallengeTimeKey(courseId, levelNo, partIdx) {
  return `challengeTime:${courseId}:${levelNo}:${partIdx}`;
}
 
function getSavedChallengeTime(courseId, levelNo, partIdx) {
  try {
    const val = localStorage.getItem(getChallengeTimeKey(courseId, levelNo, partIdx));
    return val !== null ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}
 
function saveChallengeTime(courseId, levelNo, partIdx, seconds) {
  try {
    localStorage.setItem(getChallengeTimeKey(courseId, levelNo, partIdx), String(seconds));
  } catch { /* non-critical */ }
}
 
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LevelPage() {
  const { courseId, levelNo } = useParams();
  const navigate = useNavigate();
 
  // ── Data ──────────────────────────────────────────────────────────────────
  const courseData = getCourseData(courseId);
  const levelData = getChapterData(courseId, parseInt(levelNo));
  const currentNo = parseInt(levelNo);
  const nextNo = currentNo + 1;
  const prevNo = currentNo - 1;
  const nextLevel = getChapterData(courseId, nextNo);
 
  // ── AI State ──────────────────────────────────────────────────────────────
  const [dynamicLevelData, setDynamicLevelData] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
 
  // ── State ─────────────────────────────────────────────────────────────────
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [completedParts, setCompletedParts] = useState(new Set());
  const [earnedXP, setEarnedXP] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [xpBurst, setXpBurst] = useState(null);        // { amount, key, particles: [...] }
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState('');
 
  // ── Challenge timer recording state ───────────────────────────────────────
  // challengeStartTime: Date | null — when the current challenge timer started
  // challengeTimePopup: { seconds } | null — drives the "time taken" popup
  // savedChallengeTimes: { [partIdx]: seconds } — in-memory cache of localStorage times
  const [challengeStartTime, setChallengeStartTime] = useState(null);
  const [challengeTimePopup, setChallengeTimePopup] = useState(null);
  const [savedChallengeTimes, setSavedChallengeTimes] = useState({});
 
  const xpBurstKeyRef = useRef(0);
  const savedPartsRef = useRef(new Set());  // track which parts already synced
  const mainRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';
 
  // ── Sync progress to backend ──────────────────────────────────────────────
  const syncProgress = useCallback(async (partXp) => {
    const token = localStorage.getItem('token');
    if (!token || !courseId) return;
    try {
      const res = await axios.patch(
        `${apiUrl}/api/learning/courses/${courseId}/progress`,
        { lectureNumber: currentNo, completed: true, points: partXp },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh local user data with updated stats
      if (res.data?.userStats) {
        const stored = localStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          user.totalXp = res.data.userStats.totalXp;
          user.level = res.data.userStats.level;
          user.league = res.data.userStats.league;
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('auth:user-updated'));
        }
      }
      // Also fetch fresh user data so header XP is fully up to date
      try {
        const meRes = await axios.get(`${apiUrl}/api/auth/user/me`, {
          withCredentials: true, headers: { Authorization: `Bearer ${token}` }
        });
        if (meRes.data?.user) {
          localStorage.setItem('user', JSON.stringify(meRes.data.user));
          window.dispatchEvent(new Event('auth:user-updated'));
        }
      } catch { /* non-critical */ }
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg) {
        setSyncError(msg);
        setTimeout(() => setSyncError(''), 6000);
      }
    }
  }, [apiUrl, courseId, currentNo]);
 
  // ── Reset all state when the level changes ────────────────────────────────
  useEffect(() => {
    setCurrentPartIdx(0);
    setCompletedParts(new Set());
    setEarnedXP(0);
    setAnswers({});
    setSubmitted(false);
    setSidebarOpen(false);
    savedPartsRef.current = new Set();
    setChallengeStartTime(null);
    setChallengeTimePopup(null);
    setSavedChallengeTimes({});
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [levelNo, courseId]);
 
  // ── Load saved challenge times from localStorage on mount / level change ──
  useEffect(() => {
    if (!levelData?.parts) return;
    const loaded = {};
    levelData.parts.forEach((p, idx) => {
      if (p.isChallengepart || p.codeChallenge) {
        const saved = getSavedChallengeTime(courseId, levelNo, idx);
        if (saved !== null) loaded[idx] = saved;
      }
    });
    setSavedChallengeTimes(loaded);
  }, [courseId, levelNo, levelData]);
 
  // ── Not found guard ───────────────────────────────────────────────────────
  if (!levelData || !levelData.parts) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#07070f] text-white">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4">Level {levelNo} not found.</p>
          <button
            onClick={() => navigate(`/levels/${courseId}`)}
            className="px-5 py-2 rounded-xl text-white font-bold"
            style={{ background: courseData.accentColor }}
          >
            ← Back to Levels
          </button>
        </div>
      </div>
    );
  }
 
  // ── Derived ───────────────────────────────────────────────────────────────
  const parts = levelData.parts;
  const totalXP = parts.reduce((s, p) => s + p.xp, 0);
  const xpPct = totalXP > 0 ? Math.round((earnedXP / totalXP) * 100) : 0;
  const part = parts[currentPartIdx];
  const isChallenge = !!part.isChallengepart;
  const isCodeChallenge = !!part.codeChallenge;
  const isSubmitted = submitted || completedParts.has(currentPartIdx);
  const allAnswered = isChallenge
    ? part.challenges.every((_, qi) => answers[qi] !== undefined)
    : false;
 
  // Last recorded time for the current part (null if never solved before)
  const lastTimeTakenForCurrentPart = savedChallengeTimes[currentPartIdx] ?? null;
 
  // Bottom-right button label
  const nextLabel =
    isCodeChallenge && !isSubmitted ? 'Skip →'
      : isChallenge && !isSubmitted ? 'Submit ✓'
        : currentPartIdx === parts.length - 1 ? 'Next Chapter →'
          : 'Next Part →';
 
  const nextEnabled = isChallenge && !isSubmitted ? allAnswered : true;
 
  // ── Helpers ───────────────────────────────────────────────────────────────
  function isPartAccessible(idx) {
    return (
      idx === 0 ||
      completedParts.has(idx - 1) ||
      completedParts.has(idx) ||
      idx <= currentPartIdx
    );
  }
 
  function goToPart(idx) {
    if (idx < 0 || idx >= parts.length) return;
    if (!isPartAccessible(idx)) return;
 
    setCurrentPartIdx(idx);
    setAnswers({});
    setSubmitted((parts[idx].isChallengepart || parts[idx].codeChallenge) ? completedParts.has(idx) : false);
    setSidebarOpen(false);
    // Reset challenge start time when navigating to a different part
    setChallengeStartTime(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }
 
  function handleAnswer(questionIdx, chosenIdx) {
    setAnswers(prev => {
      if (prev[questionIdx] !== undefined) return prev; // locked once chosen
      return { ...prev, [questionIdx]: chosenIdx };
    });
  }
 
  function triggerXpBurst(amount) {
    const particles = [...Array(8)].map(() => ({
      fontSize: `${1.2 + Math.random() * 0.8}rem`,
      left: `${40 + Math.random() * 20}%`,
      translateY: -(80 + Math.random() * 60),
      rotate: -15 + Math.random() * 30,
    }));
    setXpBurst({ amount, key: ++xpBurstKeyRef.current, particles });
    setTimeout(() => setXpBurst(null), 1400);
  }
 
  // ── Record challenge completion time ──────────────────────────────────────
  // Returns the elapsed seconds since challengeStartTime, records it, shows popup
  function recordChallengeTime(partIdx) {
    // Only record on first-time completion (not already saved)
    const alreadySaved = savedChallengeTimes[partIdx] !== undefined;
    if (alreadySaved) return;
 
    const elapsedSeconds = challengeStartTime
      ? Math.floor((new Date() - challengeStartTime) / 1000)
      : 0;
 
    // Persist to localStorage
    saveChallengeTime(courseId, levelNo, partIdx, elapsedSeconds);
 
    // Update in-memory cache
    setSavedChallengeTimes(prev => ({ ...prev, [partIdx]: elapsedSeconds }));
 
    // Show the popup
    setChallengeTimePopup({ seconds: elapsedSeconds });
 
    // Clear the start time so the timer stops
    setChallengeStartTime(null);
  }
 
  function handleCodeChallengeComplete() {
    if (!completedParts.has(currentPartIdx)) {
      setSubmitted(true);
      setCompletedParts(prev => new Set([...prev, currentPartIdx]));
      setEarnedXP(prev => prev + part.xp);
      triggerXpBurst(part.xp);
      recordChallengeTime(currentPartIdx);
      if (!savedPartsRef.current.has(currentPartIdx)) {
        savedPartsRef.current.add(currentPartIdx);
        syncProgress(earnedXP + part.xp);
      }
      if (completedParts.size + 1 === parts.length) {
        setTimeout(() => setShowLevelUp(true), 900);
      }
    }
  }
 
  function handleNext() {
    if (isCodeChallenge && !isSubmitted) {
      // ── Skip code challenge (user can still go back)
      const nextIdx = currentPartIdx + 1;
      if (nextIdx < parts.length) {
        setCurrentPartIdx(nextIdx);
        setAnswers({});
        setSubmitted((parts[nextIdx].isChallengepart || parts[nextIdx].codeChallenge) ? completedParts.has(nextIdx) : false);
        setSidebarOpen(false);
        setChallengeStartTime(null);
        if (mainRef.current) mainRef.current.scrollTop = 0;
      }
      return;
    }
    if (isChallenge && !isSubmitted) {
      // ── Submit challenge — record time first, then mark done
      setSubmitted(true);
      if (!completedParts.has(currentPartIdx)) {
        setCompletedParts(prev => new Set([...prev, currentPartIdx]));
        setEarnedXP(prev => prev + part.xp);
        triggerXpBurst(part.xp);
        recordChallengeTime(currentPartIdx);
        if (!savedPartsRef.current.has(currentPartIdx)) {
          savedPartsRef.current.add(currentPartIdx);
          syncProgress(earnedXP + part.xp);
        }
        if (completedParts.size + 1 === parts.length) {
          setTimeout(() => setShowLevelUp(true), 900);
        }
      }
    } else if (currentPartIdx < parts.length - 1) {
      // ── Advance to next part
      if (!completedParts.has(currentPartIdx)) {
        setCompletedParts(prev => new Set([...prev, currentPartIdx]));
        setEarnedXP(prev => prev + part.xp);
        triggerXpBurst(part.xp);
        if (!savedPartsRef.current.has(currentPartIdx)) {
          savedPartsRef.current.add(currentPartIdx);
          syncProgress(earnedXP + part.xp);
        }
      }
      const nextIdx = currentPartIdx + 1;
      setCurrentPartIdx(nextIdx);
      setAnswers({});
      setSubmitted((parts[nextIdx].isChallengepart || parts[nextIdx].codeChallenge) ? completedParts.has(nextIdx) : false);
      setSidebarOpen(false);
      setChallengeStartTime(null);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    } else {
      // ── Last part — go to next chapter or levels list
      if (!completedParts.has(currentPartIdx)) {
        setCompletedParts(prev => new Set([...prev, currentPartIdx]));
        setEarnedXP(prev => prev + part.xp);
        triggerXpBurst(part.xp);
        if (!savedPartsRef.current.has(currentPartIdx)) {
          savedPartsRef.current.add(currentPartIdx);
          syncProgress(earnedXP + part.xp);
        }
        setTimeout(() => {
          setShowLevelUp(true);
        }, 900);
        return;
      }
      if (nextLevel) {
        navigate(`/level/${courseId}/${nextNo}`);
        window.scrollTo(0, 0);
      } else {
        navigate(`/levels/${courseId}`);
      }
    }
  }
 
  // ── Start challenge timer when landing on a challenge part ────────────────
  // Watches currentPartIdx + submitted: if we're on an unsolved challenge, start clock
  useEffect(() => {
    if (!levelData?.parts) return;
    const currentPart = levelData.parts[currentPartIdx];
    const isChallengeType = currentPart?.isChallengepart || currentPart?.codeChallenge;
    const alreadyDone = completedParts.has(currentPartIdx);
 
    if (isChallengeType && !alreadyDone && !submitted) {
      // Start the timer for this challenge (only if not already running)
      setChallengeStartTime(prev => prev === null ? new Date() : prev);
    } else {
      // Not a challenge or already done — stop the timer
      setChallengeStartTime(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPartIdx, submitted]);
 
  // ── Grid texture ──────────────────────────────────────────────────────────
  const gridBg = {
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col bg-[#07070f] text-[#e8e8f0]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" style={gridBg} />
 
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 border-b border-white/10"
        style={{ background: 'rgba(7,7,15,0.92)', backdropFilter: 'blur(16px)' }}
      >
        {/* logo */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.25rem', fontWeight: 800,
            backgroundImage: `linear-gradient(135deg, ${courseData.accentColor}, ${courseData.accentLight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Codify
        </button>
 
        {/* breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-white/30 font-mono">
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }}
            className="hover:text-white/60 transition"
          >
            Dashboard
          </button>
          <span className="text-white/20">›</span>
          <button
            onClick={() => navigate(`/levels/${courseId}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }}
            className="hover:text-white/60 transition"
          >
            {courseData.language}
          </button>
          <span className="text-white/20">›</span>
          <span style={{ color: courseData.accentLight }}>Level {levelNo}</span>
        </div>
 
        <div className="flex items-center gap-4">
          {/* hamburger (mobile) */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setSidebarOpen(v => !v)}
          >
            <span className="block w-5 h-0.5 bg-white/40 rounded" />
            <span className="block w-5 h-0.5 bg-white/40 rounded" />
            <span className="block w-5 h-0.5 bg-white/40 rounded" />
          </button>
 
          {/* xp pill */}
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 font-mono text-xs font-bold text-amber-400"
            style={{ background: '#1e1e32' }}
          >
            ⚡ {earnedXP} XP
          </div>
 
          {/* avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${courseData.accentColor}, ${courseData.accentLight})` }}
          >
            {(courseData.language ?? 'JS').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>
 
      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div className="fixed top-16 bottom-0 left-0 right-0 flex z-10">
 
        {/* mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
 
        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed md:relative top-16 md:top-0 bottom-0 left-0 z-50 md:z-auto
            w-72 flex flex-col shrink-0
            border-r border-white/[0.07] bg-[#0d0d1a]
            transition-transform duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* chapter title block */}
          <div className="px-5 py-4 border-b border-white/[0.07] shrink-0">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 font-mono text-[0.65rem] uppercase tracking-widest text-white/40 mb-2.5"
              style={{ background: '#1e1e32' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: part.color, boxShadow: `0 0 6px ${part.color}` }}
              />
              Level {levelNo}
            </div>
 
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 font-mono text-[0.65rem] uppercase tracking-widest text-white/50 mb-2.5"
              style={{ background: '#1e1e32' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: part.color, boxShadow: `0 0 6px ${part.color}` }}
              />
              Time:&nbsp;
              <ChallengeTimer
                isChallenge={isChallenge}
                isCodeChallenge={isCodeChallenge}
                isSubmitted={isSubmitted}
                lastTimeTaken={lastTimeTakenForCurrentPart}
              />
            </div>
            <h2
              className="text-[1rem] font-bold text-white leading-snug"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {levelData.name}
            </h2>
            <p className="text-[0.75rem] text-white/30 mt-1">
              {levelData.difficulty} · {levelData.duration}
            </p>
          </div>
 
          {/* xp bar */}
          <div className="px-5 py-3.5 border-b border-white/[0.07] shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30">
                ⚡ XP Progress
              </span>
              <span className="font-mono text-[0.75rem] font-bold text-amber-400">
                {earnedXP} / {totalXP} XP
              </span>
            </div>
            <div className="h-1.5 bg-[#1e1e32] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
                style={{
                  width: `${xpPct}%`,
                  background: 'linear-gradient(90deg, #F59E0B, #fcd34d)',
                  boxShadow: '0 0 8px rgba(245,158,11,0.4)',
                }}
              />
            </div>
          </div>
 
          {/* parts list */}
          <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'thin' }}>
            {parts.map((p, i) => (
              <SidebarPartItem
                key={p.id}
                part={p}
                index={i}
                isActive={i === currentPartIdx}
                isDone={completedParts.has(i)}
                isAccessible={isPartAccessible(i)}
                onClick={() => goToPart(i)}
              />
            ))}
          </div>
 
          {/* parts progress footer */}
          <div className="px-5 py-3.5 border-t border-white/[0.07] shrink-0">
            <div className="flex justify-between text-[0.72rem] text-white/30 mb-1.5">
              <span>Parts Done</span>
              <span>{completedParts.size} / {parts.length}</span>
            </div>
            <div className="h-1 bg-[#1e1e32] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(completedParts.size / parts.length) * 100}%`,
                  background: part.color,
                }}
              />
            </div>
          </div>
        </aside>
 
        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto relative"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e32 transparent' }}
        >
          <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 pb-28">
 
            {/* Sync error banner */}
            {syncError && (
              <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-900/40 border border-red-800/50 text-red-300 text-sm font-semibold flex items-center justify-between">
                <span>⚠ Progress sync failed: {syncError}</span>
                <button onClick={() => setSyncError('')} className="text-red-400 hover:text-red-200 ml-3 text-lg leading-none">&times;</button>
              </div>
            )}
 
            {/* part header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-widest text-white/30 mb-4">
                <span>{levelData.name}</span>
                <span className="text-white/20">›</span>
                <span style={{ color: part.color }}>Part {currentPartIdx + 1}</span>
              </div>
 
              <div className="flex items-start gap-4 flex-wrap">
                {/* colour bar */}
                <div
                  className="w-1 self-stretch min-h-[52px] rounded shrink-0"
                  style={{ background: part.color, boxShadow: `0 0 12px ${part.glow}` }}
                />
                <div className="flex-1">
                  <h1
                    className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-1"
                    style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}
                  >
                    {part.title}
                  </h1>
                  <p className="text-base text-white/40 font-light">{part.subtitle}</p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-mono text-[0.78rem] font-bold shrink-0 mt-1"
                  style={{
                    color: part.color,
                    background: part.glow.replace('0.35', '0.07').replace('0.4', '0.07'),
                    borderColor: part.color + '44',
                  }}
                >
                  ⚡ +{part.xp} XP
                </div>
              </div>
            </div>
 
            <div className="h-px bg-white/[0.07] mb-8" />
 
            {/* lesson, MCQ challenge, or code challenge */}
            {isCodeChallenge ? (
              <CodeChallengeContent
                part={part}
                submitted={isSubmitted}
                onSubmitCode={handleCodeChallengeComplete}
              />
            ) : !isChallenge ? (
              <LessonContent part={part} />
            ) : (
              <ChallengeContent
                part={part}
                answers={answers}
                onAnswer={handleAnswer}
                submitted={isSubmitted}
              />
            )}
          </div>
        </main>
      </div>
 
      {/* ── BOTTOM NAV ─────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-5 md:px-8 py-4"
        style={{ background: 'linear-gradient(to top, rgba(7,7,15,0.97) 60%, transparent)' }}
      >
        {/* ← Previous */}
        <button
          disabled={currentPartIdx === 0}
          onClick={() => goToPart(currentPartIdx - 1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm font-bold transition-all
            hover:bg-[#161625] hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          ← Previous
        </button>
 
        {/* progress dots */}
        <div className="hidden sm:flex items-center gap-1.5">
          {parts.map((p, i) => (
            <div
              key={i}
              className={`h-2 rounded-full border transition-all duration-300 ${i === currentPartIdx ? 'w-5' : 'w-2'}`}
              style={{
                background: i === currentPartIdx ? p.color : completedParts.has(i) ? 'rgba(16,185,129,0.5)' : '#1e1e32',
                borderColor: i === currentPartIdx ? p.color : completedParts.has(i) ? '#10B981' : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
 
        {/* Submit / Next Part / Next Chapter */}
        <button
          disabled={!nextEnabled}
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-transparent text-white text-sm font-bold transition-all
            disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
          style={{
            fontFamily: "'Syne', sans-serif",
            background: `linear-gradient(135deg, ${part.color}, ${part.color}bb)`,
            boxShadow: nextEnabled ? `0 4px 20px ${part.glow}` : 'none',
          }}
        >
          {nextLabel}
        </button>
      </div>
 
      {/* ── XP BURST ANIMATION ─────────────────────────────────────────────── */}
      {xpBurst && (
        <div key={xpBurst.key} className="fixed inset-0 pointer-events-none z-100 flex items-center justify-center">
          {xpBurst.particles.map((p, i) => (
            <span
              key={i}
              className="absolute text-amber-400 font-extrabold opacity-0"
              style={{
                fontSize: p.fontSize,
                animation: `xpFloat${i} 1.3s ease-out ${i * 0.06}s forwards`,
                left: p.left,
                top: '50%',
              }}
            >
              +{xpBurst.amount} XP
            </span>
          ))}
          <span
            className="text-amber-300 font-black text-5xl md:text-6xl opacity-0"
            style={{ animation: 'xpCenter 1.3s ease-out forwards', textShadow: '0 0 30px rgba(245,158,11,0.6)' }}
          >
            +{xpBurst.amount} XP
          </span>
 
          <style>{`
            ${xpBurst.particles.map((p, i) => `
              @keyframes xpFloat${i} {
                0%   { opacity: 0; transform: translateY(0) scale(0.5); }
                30%  { opacity: 1; }
                100% { opacity: 0; transform: translateY(${p.translateY}px) scale(1.2) rotate(${p.rotate}deg); }
              }
            `).join('')}
            @keyframes xpCenter {
              0%   { opacity: 0; transform: scale(0.3); }
              40%  { opacity: 1; transform: scale(1.15); }
              70%  { opacity: 1; transform: scale(0.95); }
              100% { opacity: 0; transform: scale(1) translateY(-30px); }
            }
          `}</style>
        </div>
      )}
 
      {/* ── CHALLENGE TIME POPUP (first-time completion) ────────────────────── */}
      {challengeTimePopup && (
        <ChallengeTimePopup
          timeTaken={challengeTimePopup.seconds}
          onClose={() => setChallengeTimePopup(null)}
          partColor={part.color}
          partGlow={part.glow}
        />
      )}
 
      {/* ── LEVEL-UP MODAL ─────────────────────────────────────────────────── */}
      {showLevelUp && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="relative rounded-3xl p-8 md:p-10 text-center max-w-sm w-full mx-4 border"
            style={{
              background: 'linear-gradient(145deg, #1a1a2e, #0d0d1a)',
              borderColor: part.color + '55',
              boxShadow: `0 0 60px ${part.glow}, 0 0 120px ${part.glow}`,
            }}
          >
            <div className="text-6xl mb-4" style={{ animation: 'levelStar 0.6s ease-out' }}>🎉</div>
            <h2
              className="text-2xl md:text-3xl font-black text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Level Complete!
            </h2>
            <p className="text-white/50 text-sm mb-5">
              You earned <span className="text-amber-400 font-bold">{earnedXP} XP</span> in this chapter!
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className="px-4 py-2 rounded-xl font-mono font-bold text-sm"
                style={{ background: part.glow, color: part.color, border: `1px solid ${part.color}44` }}
              >
                ⚡ {earnedXP} / {totalXP} XP
              </div>
            </div>
            <button
              onClick={() => {
                setShowLevelUp(false);
                if (nextLevel) {
                  navigate(`/level/${courseId}/${nextNo}`);
                  window.scrollTo(0, 0);
                } else {
                  navigate(`/levels/${courseId}`);
                }
              }}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${part.color}, ${part.color}bb)`,
                boxShadow: `0 4px 20px ${part.glow}`,
              }}
            >
              {nextLevel ? 'Continue to Next Chapter →' : 'Back to Levels'}
            </button>
 
            <style>{`
              @keyframes levelStar {
                0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
                60%  { transform: scale(1.2) rotate(10deg); opacity: 1; }
                100% { transform: scale(1) rotate(0deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}