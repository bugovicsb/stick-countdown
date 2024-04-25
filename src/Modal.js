import { useEffect, useRef } from "react";

function Modal({ isOpen, close, children }) {
  const ref = useRef();

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={ref} onCancel={close}>
      {children}
    </dialog>
  );
}

export default Modal;
