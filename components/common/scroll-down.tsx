"use client";

import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

interface ScrollDownProps {
  targetId?: string;
  className?: string;
  smooth?: boolean;
}

const ScrollDown: React.FC<ScrollDownProps> = ({
  targetId,
  smooth = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToBottom = useCallback(() => {
    const target = targetId
      ? document.getElementById(targetId)
      : document.documentElement;

    if (target) {
      const scrollOptions: ScrollToOptions = {
        top: target.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      };

      target.scrollTo(scrollOptions);
    }
  }, [targetId, smooth]);

  const checkScrollPosition = useCallback(() => {
    const target = targetId
      ? document.getElementById(targetId)
      : document.documentElement;

    if (target) {
      const scrollPosition = target.scrollTop + target.clientHeight;
      const threshold = 20; // pixels from bottom to consider "at bottom"

      // Show button only when not at the bottom
      setIsVisible(scrollPosition < target.scrollHeight - threshold);
    }
  }, [targetId]);

  useEffect(() => {
    // Check initial position
    checkScrollPosition();

    // Add scroll event listener
    const target = targetId ? document.getElementById(targetId) : window;

    target?.addEventListener("scroll", checkScrollPosition);
    return () => {
      target?.removeEventListener("scroll", checkScrollPosition);
    };
  }, [targetId, checkScrollPosition]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
      >
        {isVisible && (
          <Button
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            variant="outline"
            className={`fixed right-4 bottom-4 z-50 h-8 w-8 shadow-md ${className}`}
          >
            <span className="sr-only">Scroll to bottom</span>
            <ChevronDownIcon size={28} />
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ScrollDown;
