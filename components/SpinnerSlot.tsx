'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Winner {
  memberId: string;
  memberName: string;
  amount: number;
}

interface SpinnerSlotProps {
  index: number;
  isSpinning: boolean;
  targetMemberId: string; // The final member ID to land on
  winner: Winner | null;
  onSpinComplete?: () => void;
}

export default function SpinnerSlot({ index, isSpinning, targetMemberId, winner, onSpinComplete }: SpinnerSlotProps) {
  const [currentChars, setCurrentChars] = useState<string[]>([]);
  const [frozenPositions, setFrozenPositions] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const startTimeRef = useRef<number>(0);
  
  // Parse member ID format: AGR7108Y (3 letters, 4 digits, 1 letter)
  const parseMemberId = (memberId: string) => {
    if (!memberId) return null;
    // Extract parts: first 3 letters, 4 digits, last letter(s)
    const match = memberId.match(/^([A-Z]{3})(\d{4})([A-Z]+)$/);
    if (match) {
      return {
        letters: match[1].split(''), // ['A', 'G', 'R']
        digits: match[2].split(''),  // ['7', '1', '0', '8']
        lastChar: match[3].split('')  // ['Y'] or more
      };
    }
    // Fallback: split by character
    return {
      letters: memberId.substring(0, 3).split(''),
      digits: memberId.substring(3, 7).split(''),
      lastChar: memberId.substring(7).split('')
    };
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, []);

  useEffect(() => {
    // Clear any existing timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];

    // Reset completion state when starting a new spin
    if (isSpinning && targetMemberId) {
      setIsComplete(false);
      startTimeRef.current = Date.now();
    }

    if (isSpinning && targetMemberId) {
      const parsed = parseMemberId(targetMemberId);
      if (!parsed) return;
      
      const allChars = [...parsed.letters, ...parsed.digits, ...parsed.lastChar];
      const totalPositions = allChars.length;
      
      // Initialize with random chars
      const initialChars = allChars.map((_, idx) => {
        const isDigit = idx >= 3 && idx < 7;
        const charSet = isDigit ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charArray = charSet.split('');
        return charArray[Math.floor(Math.random() * charArray.length)];
      });
      setCurrentChars(initialChars);
      setFrozenPositions(new Array(totalPositions).fill(false));
      setIsComplete(false);
      
      const TOTAL_DURATION = 6000; // 6 seconds total
      const FREEZE_START = 4500; // Start freezing characters at 4.5 seconds
      const FREEZE_DURATION = 1500; // Freeze over 1.5 seconds
      
      // Spin all positions simultaneously
      const spinAllPositions = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / TOTAL_DURATION, 1);
        
        if (progress >= 1) {
          // All done - set final characters
          setCurrentChars(allChars);
          setFrozenPositions(new Array(totalPositions).fill(true));
          setIsComplete(true);
          if (onSpinComplete) {
            const timeout = setTimeout(() => {
              onSpinComplete();
            }, 500);
            timeoutRefs.current.push(timeout);
          }
          return;
        }
        
        // Calculate which positions should be frozen
        const freezeProgress = progress >= FREEZE_START / TOTAL_DURATION
          ? Math.min((elapsed - FREEZE_START) / FREEZE_DURATION, 1)
          : 0;
        
        const positionsToFreeze = Math.floor(freezeProgress * totalPositions);
        
        // Update characters for non-frozen positions
        setCurrentChars(prev => {
          const newChars = [...prev];
          for (let i = 0; i < totalPositions; i++) {
            if (i < positionsToFreeze) {
              // This position is frozen, use target character
              newChars[i] = allChars[i];
            } else {
              // This position is still spinning
              const isDigit = i >= 3 && i < 7;
              const charSet = isDigit ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              const charArray = charSet.split('');
              // Fast spinning - change character frequently
              const spinSpeed = 50 + (i * 10); // Different speed for each position
              const charIndex = Math.floor((elapsed / spinSpeed) % charArray.length);
              newChars[i] = charArray[charIndex];
            }
          }
          return newChars;
        });
        
        // Update frozen positions
        setFrozenPositions(prev => {
          const newFrozen = [...prev];
          for (let i = 0; i < totalPositions; i++) {
            newFrozen[i] = i < positionsToFreeze;
          }
          return newFrozen;
        });
        
        // Continue animation
        const timeout = setTimeout(spinAllPositions, 50); // Update every 50ms
        timeoutRefs.current.push(timeout);
      };
      
      // Start spinning all positions
      const timeout = setTimeout(spinAllPositions, 50);
      timeoutRefs.current.push(timeout);
    } else if (!isSpinning) {
      // Reset when not spinning
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
      setCurrentChars([]);
      setFrozenPositions([]);
      setIsComplete(false);
    }
  }, [isSpinning, targetMemberId, onSpinComplete]);

  const displayChars = winner ? winner.memberId.split('') : currentChars;
  const allFrozen = frozenPositions.every(f => f) && currentChars.length > 0;

  return (
    <div className="relative">
      <div className="bg-slate-800 rounded-xl p-6 border-2 border-slate-700 h-80 flex flex-col overflow-hidden relative shadow-2xl">
        {/* Top and bottom gradients for slot machine effect */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-20"></div>
        
        {/* Center highlight line */}
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-20 border-t-2 border-b-2 border-amber-400/60 pointer-events-none z-30 shadow-lg"></div>
        
        {(isSpinning || (currentChars.length > 0 && !allFrozen)) ? (
          <div className="flex-1 flex items-center justify-center relative z-40 overflow-x-auto">
            <div className="flex items-center justify-center gap-2 px-2 min-w-max">
              {displayChars.map((char, idx) => {
                const isFrozen = frozenPositions[idx] || (winner && idx < displayChars.length);
                const isEmpty = !char || char === '';
                
                return (
                  <motion.div
                    key={`${index}-${idx}`}
                    className={`w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center rounded-lg border-2 flex-shrink-0 ${
                      isFrozen 
                        ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-700/50 border-amber-500/50 text-amber-400'
                    }`}
                    animate={isFrozen || isEmpty ? {} : {
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 0.15,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <span className={`font-bold font-mono text-2xl sm:text-3xl ${
                      isFrozen ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {char || '?'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : winner ? (
          <motion.div
            key={`winner-${index}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="flex-1 flex flex-col items-center justify-center text-center z-40 relative"
          >
            <div className="text-4xl font-bold text-emerald-400 mb-3 animate-pulse font-mono">
              {winner.memberId}
            </div>
            <div className="text-xl text-slate-200 font-medium">
              {winner.memberName}
            </div>
            <div className="mt-2 text-sm text-slate-400">🏆 Winner!</div>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Casino-style blank state with subtle pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="h-full w-full" style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 15px,
                  rgba(255, 215, 0, 0.15) 15px,
                  rgba(255, 215, 0, 0.15) 30px
                )`
              }}></div>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/20 to-transparent"></div>
            <div className="relative z-10 text-center">
              <div className="text-7xl font-bold text-slate-600/20 tracking-widest mb-2" style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
              }}>?</div>
              <div className="text-xs text-slate-500/40 mt-2 uppercase tracking-[0.2em] font-semibold">Ready to Spin</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
