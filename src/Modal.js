import { useEffect, useRef } from "react";

function Modal({ isOpen, close, children }) {
  const ref = useRef();

  const handleClickOutside = e => {
    if (e.target === ref.current) {
      close();
    }
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={ref} onCancel={close} onClick={handleClickOutside}>
      {children}
    </dialog>
  );
}

export default Modal;
