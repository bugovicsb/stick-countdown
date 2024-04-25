import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(count);
  const [open, setOpen] = useState(false);
  const inputRef = useRef();
  const intervalId = useRef();

  const clearCount = () => {
    clearInterval(intervalId.current);
    intervalId.current = null;
  };

  const handleSubmit = e => {
    e.preventDefault();
    let newCount = parseInt(inputRef.current.value);
    newCount = Number.isNaN(newCount) || newCount < 0 ? 0 : newCount;
    setCount(newCount);
    setCurrentCount(newCount);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      inputRef.current.value = count;
    }
  }, [open, count]);

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
    if (!open && intervalId.current === null && count > 0) {
      intervalId.current = setInterval(() => {
        setCurrentCount(val => Math.max(0, val - 1));
      }, 1000);
    }

    return () => {
      clearCount();
    };
  }, [open, count]);

  useEffect(() => {
    if (currentCount <= 0) {
      clearCount();
    }
  }, [currentCount]);

  return (
    <div className="App">
      <div className="content-container" onClick={() => setOpen(true)}>
        {currentCount > 0 ? (
          <div className="stripes-container">
            {count > 0 &&
              Array.from(Array(count)).map((item, idx) => (
                <div className={`stripe ${idx + 1 > currentCount ? "hidden" : ""}`} key={idx}></div>
              ))}
          </div>
        ) : (
          !open && <span className="start-label">Click to start</span>
        )}
      </div>
      <Modal isOpen={open} close={() => setOpen(false)}>
        <div className="modal-content">
          <form formMethod="dialog">
            <div className="left-label">
              <span>{currentCount} left</span>
            </div>
            <div>
              <input maxLength={4} min={0} defaultValue={currentCount} ref={inputRef} />
            </div>
            <div className="btn-container">
              <button type="button" className="cancel-btn" formMethod="dialog" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" formMethod="dialog" onClick={handleSubmit}>
                Set
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
