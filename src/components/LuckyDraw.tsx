import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trash2, Shuffle, Trophy, RotateCcw, Users, Sparkles, Download } from 'lucide-react';

interface LuckyDrawProps {
  initialNames?: string[];
}

export default function LuckyDraw({ initialNames = [] }: LuckyDrawProps) {
  const [inputNames, setInputNames] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState<string>('???');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [drawCount, setDrawCount] = useState<number>(1);
  
  // Audio refs (optional, placeholders for now)
  // const tickSound = useRef(new Audio('/tick.mp3'));
  
  useEffect(() => {
    if (initialNames.length > 0) {
      setParticipants(initialNames);
      setInputNames(initialNames.join('\n'));
    }
  }, [initialNames]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputNames(e.target.value);
    const names = e.target.value
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setParticipants(names);
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF69B4', '#00FFFF']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FF69B4', '#00FFFF']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const startDraw = () => {
    const eligible = participants.filter(p => !winners.includes(p));
    
    if (eligible.length === 0) {
      alert("No eligible participants left!");
      return;
    }

    if (drawCount > eligible.length) {
      alert(`Only ${eligible.length} eligible participants available. Can't draw ${drawCount} winners.`);
      return;
    }

    setIsDrawing(true);
    setShowConfetti(false);
    
    let counter = 0;
    const totalDuration = 3000; // 3 seconds total spin
    const intervalTime = 50; // Update every 50ms
    const steps = totalDuration / intervalTime;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligible.length);
      setCurrentName(eligible[randomIndex]);
      counter++;
      
      if (counter >= steps) {
        clearInterval(interval);
        finalizeDraw(eligible);
      }
    }, intervalTime);
  };

  const finalizeDraw = (eligible: string[]) => {
    // Pick random winners from the eligible list
    const selectedWinners: string[] = [];
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < drawCount && i < shuffled.length; i++) {
      selectedWinners.push(shuffled[i]);
    }
    
    setCurrentName(selectedWinners.length === 1 ? selectedWinners[0] : selectedWinners.join(' • '));
    setWinners(prev => [...selectedWinners, ...prev]);
    setIsDrawing(false);
    setShowConfetti(true);
    fireConfetti();
  };

  const resetDraw = () => {
    if (confirm("Are you sure you want to clear all winners?")) {
      setWinners([]);
      setCurrentName('???');
      setShowConfetti(false);
    }
  };

  const downloadWinners = () => {
    if (winners.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," + winners.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "winners.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex flex-col gap-8">
      
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
          LUCKY DRAW
        </h1>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
          Pick a winner • Celebrate Success
        </p>
      </header>

      <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2 text-slate-200">
                <Users className="w-5 h-5 text-indigo-400" />
                Participants
              </h2>
              <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-slate-300">
                {participants.length}
              </span>
            </div>
            <textarea
              value={inputNames}
              onChange={handleInputChange}
              placeholder="Enter names (one per line)..."
              className="flex-1 w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl p-4 text-sm font-mono focus:border-indigo-500 focus:ring-0 transition-colors resize-none text-slate-300 placeholder:text-slate-600"
              spellCheck={false}
            />
            <div className="mt-4 flex flex-col gap-2">
              <label className="text-xs font-mono text-slate-400">Draw per spin</label>
              <input
                type="number"
                min="1"
                max={participants.length}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-lg p-2 text-sm text-slate-300 focus:border-indigo-500 focus:ring-0 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Paste your list here
            </p>
          </div>
        </div>

        {/* Center Column: The Stage */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Main Display Card */}
          <div className="relative aspect-video bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden group">
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 opacity-50" />
            
            {/* Animated Name */}
            <div className="relative z-10 text-center w-full px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentName}
                  initial={{ y: 20, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                  className={`font-black tracking-tight break-words ${
                    isDrawing 
                      ? 'text-6xl md:text-7xl text-slate-300 blur-sm' 
                      : showConfetti 
                        ? 'text-6xl md:text-8xl text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]' 
                        : 'text-6xl md:text-7xl text-slate-500'
                  }`}
                >
                  {currentName}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Decorative Borders */}
            <div className="absolute inset-0 border-[1px] border-white/5 rounded-[20px] m-1 pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startDraw}
              disabled={isDrawing || participants.length === 0}
              className="col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold py-6 rounded-2xl shadow-lg shadow-indigo-900/20 transform transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isDrawing ? (
                <>
                  <Shuffle className="w-6 h-6 animate-spin" />
                  Drawing...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  SPIN THE WHEEL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Winners */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2 text-yellow-400">
                <Trophy className="w-5 h-5" />
                Winners Hall
              </h2>
              <div className="flex gap-1">
                {winners.length > 0 && (
                  <button 
                    onClick={downloadWinners}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Download CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={resetDraw}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                  title="Reset Winners"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {winners.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm italic">
                  <Trophy className="w-12 h-12 mb-2 opacity-20" />
                  No winners yet
                </div>
              ) : (
                <AnimatePresence>
                  {winners.map((winner, index) => (
                    <motion.div
                      key={`${winner}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-gradient-to-r from-slate-700 to-slate-800 p-3 rounded-xl border border-slate-600 flex items-center gap-3 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-sm border border-yellow-500/30">
                        {winners.length - index}
                      </div>
                      <span className="font-medium text-slate-200 truncate">
                        {winner}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
