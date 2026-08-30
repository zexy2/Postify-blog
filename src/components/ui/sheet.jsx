import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FiX } from 'react-icons/fi';
import styles from './sheet.module.css';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`${styles.sheetOverlay} ${className || ''}`}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef(({ side = 'right', children, className, closeLabel = 'Close', ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`${styles.sheetContent} ${styles[side]} ${className || ''}`}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className={styles.sheetCloseButton} aria-label={closeLabel}>
        <FiX size={20} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }) => (
  <div className={`${styles.sheetHeader} ${className || ''}`} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`${styles.sheetTitle} ${className || ''}`}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={`${styles.sheetDescription} ${className || ''}`}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

const SheetFooter = ({ className, ...props }) => (
  <div className={`${styles.sheetFooter} ${className || ''}`} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
