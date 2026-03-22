import { motion, useReducedMotion } from 'motion/react';

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -8, filter: 'blur(2px)' },
};

const calmTransition = { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const };

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      variants={shouldReduce ? reducedVariants : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={calmTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
