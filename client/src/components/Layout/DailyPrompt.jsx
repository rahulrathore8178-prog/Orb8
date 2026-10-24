import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { apiUrl, getAuthHeaders } from '../../utilites/DashboardHelper';
import { setContent } from '../../redux/slices/postSlice';

const DISMISS_KEY = 'orbit:prompt-dismissed';

export default function DailyPrompt({ onAnswer }) {
  const dispatch = useDispatch();
  const [habit, setHabit] = useState(null);
  const [dismissedId, setDismissedId] = useState(() => localStorage.getItem(DISMISS_KEY));

  useEffect(() => {
    let active = true;
    axios
      .get(`${apiUrl}/api/auth/user/habit`, { withCredentials: true, headers: getAuthHeaders() })
      .then((response) => {
        if (active) setHabit(response.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!habit?.prompt) return null;

  const showPrompt = dismissedId !== habit.prompt.id;
  const streak = habit.streakCount > 0 ? `${habit.streakCount}-day streak` : null;
  if (!showPrompt && !streak) return null;

  const answer = () => {
    dispatch(setContent(habit.prompt.text));
    onAnswer();
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, habit.prompt.id);
    setDismissedId(habit.prompt.id);
  };

  return (
    <div className="flex min-h-11 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-black/50 px-4">
      {showPrompt ? (
        <>
          <p className="min-w-0 flex-1 text-sm text-neutral-200">
            <span className="text-neutral-400">Today: </span>
            {habit.prompt.text}
          </p>
          <button
            type="button"
            onClick={answer}
            className="min-h-11 shrink-0 px-2 text-sm font-medium text-white underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-white/50"
          >
            Answer
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss today's prompt"
            className="grid h-11 w-11 shrink-0 place-items-center text-neutral-400 hover:text-white focus-visible:outline-2 focus-visible:outline-white/50"
          >
            <span aria-hidden="true">×</span>
          </button>
        </>
      ) : (
        <p className="text-xs text-neutral-400">{streak}</p>
      )}
      {showPrompt && streak && <span className="shrink-0 text-xs text-neutral-400">{streak}</span>}
    </div>
  );
}
