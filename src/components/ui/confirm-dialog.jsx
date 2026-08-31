import { useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './confirm-dialog.module.css';

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  busy = false,
  tone = 'default',
  onConfirm,
}) => {
  const cancelRef = useRef(null);
  const returnFocusRef = useRef(null);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && busy) return;
    onOpenChange?.(nextOpen);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
          className={styles.content}
          onOpenAutoFocus={(event) => {
            if (document.activeElement instanceof HTMLElement) {
              returnFocusRef.current = document.activeElement;
            }
            event.preventDefault();
            cancelRef.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => {
            const target = returnFocusRef.current;
            if (!(target instanceof HTMLElement) || !target.isConnected) return;
            event.preventDefault();
            window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <div className={styles.copy}>
            <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className={styles.description}>{description}</DialogPrimitive.Description>
          </div>
          <div className={styles.actions}>
            <DialogPrimitive.Close asChild>
              <button ref={cancelRef} type="button" className={styles.cancel} disabled={busy}>
                {cancelLabel}
              </button>
            </DialogPrimitive.Close>
            <button
              type="button"
              className={`${styles.confirm} ${tone === 'danger' ? styles.danger : ''}`}
              disabled={busy}
              aria-busy={busy || undefined}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ConfirmDialog;
