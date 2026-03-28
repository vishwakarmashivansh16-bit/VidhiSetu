import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}

export const Toast = ({ message, isVisible, onHide }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [isVisible, onHide]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 text-sm font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
