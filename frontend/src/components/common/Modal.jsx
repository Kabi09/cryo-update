import React, { useEffect } from 'react';
import styles from './Modal.module.scss';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md' // 'md', 'lg', 'xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size === 'lg' ? styles.modalLg : size === 'xl' ? styles.modalXl : '';

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.modalWindow} ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
