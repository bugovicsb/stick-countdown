import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(null);
  const [open, setOpen] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(0);
  const [draftSeconds, setDraftSeconds] = useState(0);
  const intervalId = useRef();
  const wakeLock = useRef(null);

  const formatTime = totalSeconds => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const stickGrid = count > 0
    ? {
        "--columns": Math.ceil(Math.sqrt(count * 2.2)),
        "--rows": Math.ceil(count / Math.ceil(Math.sqrt(count * 2.2))),
        "--stick-gap": count > 1200 ? "1px" : count > 300 ? "2px" : "5px"
      }
    : undefined;

  const clearCount = () => {
    clearInterval(intervalId.current);
    intervalId.current = null;

    if (wakeLock.current) {
      wakeLock.current.release().then(() => {
        wakeLock.current = null;
      });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const minutes = Math.min(120, Math.max(0, parseInt(draftMinutes, 10) || 0));
    const seconds = Math.min(59, Math.max(0, parseInt(draftSeconds, 10) || 0));
    const newCount = minutes * 60 + seconds;
    setCount(newCount);
    setCurrentCount(newCount);
    setOpen(false);
  };

  const lockScreen = async () => {
    if ("wakeLock" in navigator) {
      // request a wake lock
      try {
        wakeLock.current = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (open) {
      const value = currentCount ?? count;
      setDraftMinutes(Math.floor(value / 60));
      setDraftSeconds(value % 60);
    }
  }, [open, count, currentCount]);

  useEffect(() => {
    const handleKey = e => {
      if (!open && e.key === "Enter") {
        setOpen(true);
      }
    };
    document.addEventListener("keypress", handleKey);

    return () => {
      document.removeEventListener("keypress", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (intervalId.current === null && currentCount !== null && currentCount > 0) {
        const startTime = Math.round(Date.now() / 1000);
        const countOnStartTime = currentCount;
        intervalId.current = setInterval(() => {
          setCurrentCount(val => Math.max(0, startTime + countOnStartTime - Math.round(Date.now() / 1000)));
        }, 1000);

        lockScreen();
      }
    } else {
      clearCount();
    }
  }, [open, currentCount]);

  useEffect(() => {
    if (currentCount !== null && currentCount <= 0) {
      clearCount();

      if ("vibrate" in navigator) {
        navigator.vibrate(0);
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [currentCount]);

  useEffect(() => {
    () => {
      clearCount();
    };
  }, []);

  return (
    <div className="App">
      <main className="content-container" onDoubleClick={() => setOpen(true)}>
        <header className="app-header">
          <div className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></div>
          <span>Stick timer</span>
        </header>
        <button className="settings-trigger" onClick={() => setOpen(true)} aria-label="Set countdown">
          <span aria-hidden="true">⌘</span>
          <span>Set timer</span>
        </button>
        {currentCount !== null && currentCount > 0 ? (
          <div className="timer-view">
            <div className="count-summary">
              <div className="summary-row">
                <b>{currentCount}</b>
                <span>{currentCount === 1 ? "stick remaining" : "sticks remaining"}</span>
              </div>
              <div className="summary-row">
                <b>{formatTime(currentCount)}</b>
                <span>time remaining</span>
              </div>
            </div>
            <div className="stripes-container" style={stickGrid} aria-label={`${currentCount} sticks remaining`}>
            {count > 0 &&
              Array.from(Array(count)).map((item, idx) => (
                <div className={`stripe ${idx + 1 > currentCount ? "hidden" : ""}`} key={idx}></div>
              ))}
            </div>
          </div>
        ) : (
          !open && <div className="empty-state">
            <div className="empty-orbit"><span></span><span></span><span></span></div>
            <p className="eyebrow">Visual countdown</p>
            <h1>Make time tangible.</h1>
            <p className="start-label">Set your number of sticks, then watch the moment shrink away.</p>
            <button className="primary-action" onClick={() => setOpen(true)}>Start a countdown <span>→</span></button>
          </div>
        )}
        <footer>Each stick disappears every second.</footer>
      </main>
      <Modal isOpen={open} close={() => setOpen(false)}>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-heading">
              <p className="eyebrow">New countdown</p>
              <h2>Set your timer</h2>
            </div>
            <div className="duration-picker">
              <label className="duration-column">
                <span className="input-label">Minutes</span>
                <input
                  aria-label="Minutes"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="120"
                  value={draftMinutes}
                  onChange={e => setDraftMinutes(Math.min(120, Math.max(0, Number(e.target.value) || 0)))}
                  autoFocus
                />
                <div className="duration-wheel" aria-label="Choose minutes">
                  {Array.from({ length: 121 }, (_, value) => (
                    <button key={value} type="button" className={Number(draftMinutes) === value ? "selected" : ""} onClick={() => setDraftMinutes(value)}>
                      {String(value).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </label>
              <label className="duration-column">
                <span className="input-label">Seconds</span>
                <input
                  aria-label="Seconds"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  value={draftSeconds}
                  onChange={e => setDraftSeconds(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                />
                <div className="duration-wheel" aria-label="Choose seconds">
                  {Array.from({ length: 60 }, (_, value) => (
                    <button key={value} type="button" className={Number(draftSeconds) === value ? "selected" : ""} onClick={() => setDraftSeconds(value)}>
                      {String(value).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <div className="btn-container">
              <button type="button" className="cancel-btn" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Start <span>→</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
