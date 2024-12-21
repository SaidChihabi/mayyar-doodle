'use client';
import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const [playerPosition, setPlayerPosition] = useState({ x: 200, y: 300 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [platforms, setPlatforms] = useState<{x: number, y: number}[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize platforms
  useEffect(() => {
    const initialPlatforms = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * (400 - 60),
      y: i * 100
    }));
    setPlatforms(initialPlatforms);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setVelocity(prev => ({ ...prev, x: -5 }));
      }
      if (e.key === 'ArrowRight') {
        setVelocity(prev => ({ ...prev, x: 5 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setVelocity(prev => ({ ...prev, x: 0 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOver) return;

      setPlayerPosition(prev => {
        const newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        
        // Screen boundaries
        if (newX < 0) return { ...prev, x: 400 };
        if (newX > 400) return { ...prev, x: 0 };

        // Gravity
        let newVelocityY = velocity.y + 0.2;

        // Platform collision and scoring
        let platformHit = false;
        platforms.forEach(platform => {
          if (newY + 50 >= platform.y && 
              newY + 50 <= platform.y + 10 && 
              newX >= platform.x - 30 && 
              newX <= platform.x + 60 && 
              velocity.y > 0) {
            newY = platform.y - 50;
            newVelocityY = -10;
            platformHit = true;
          }
        });

        // Increment score when hitting a new platform
        if (platformHit) {
          setScore(prev => prev + 1);
        }

        // Generate new platforms when player reaches upper half of screen
        if (newY < 300) {
          const offset = 300 - newY;
          setPlayerPosition(prev => ({ ...prev, y: prev.y + offset }));
          setPlatforms(prevPlatforms => {
            // Move existing platforms down
            const movedPlatforms = prevPlatforms.map(p => ({
              ...p,
              y: p.y + offset
            }));
            
            // Remove platforms that are too low
            const filteredPlatforms = movedPlatforms.filter(p => p.y < 600);
            
            // Add new platforms at the top
            while (filteredPlatforms.length < 5) {
              filteredPlatforms.unshift({
                x: Math.random() * (400 - 60),
                y: filteredPlatforms[0]?.y - 100 || 0
              });
            }
            
            return filteredPlatforms;
          });
        }

        setVelocity(prev => ({ ...prev, y: newVelocityY }));
        
        // Game over condition
        if (newY > 600) {
          setGameOver(true);
        }

        return { x: newX, y: newY };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [velocity, platforms, gameOver]);

  const restartGame = useCallback(() => {
    setPlayerPosition({ x: 200, y: 300 });
    setVelocity({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setPlatforms(Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * (400 - 60),
      y: i * 100
    })));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="relative w-[400px] h-[600px] bg-gradient-to-b from-indigo-800/40 to-purple-900/40 backdrop-blur-sm overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        {/* Score */}
        <div className="absolute top-4 right-4 text-xl font-bold text-white/90 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          {score}
        </div>

        {/* Player */}
        <div 
          className="absolute w-[30px] h-[50px] bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-lg"
          style={{ 
            left: `${playerPosition.x}px`, 
            top: `${playerPosition.y}px`,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}
        />

        {/* Platforms */}
        {platforms.map((platform, index) => (
          <div
            key={index}
            className="absolute w-[60px] h-[10px] rounded-full bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm"
            style={{
              left: `${platform.x}px`,
              top: `${platform.y}px`,
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
            }}
          />
        ))}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center">
            <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20 text-center">
              <h2 className="text-white text-4xl font-bold mb-4">Game Over!</h2>
              <p className="text-white/90 text-2xl mb-6">Score: {score}</p>
              <button 
                onClick={restartGame}
                className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-full font-semibold hover:from-emerald-500 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

