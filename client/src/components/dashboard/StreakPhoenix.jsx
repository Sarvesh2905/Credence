import { useEffect, useState } from 'react';
import './StreakPhoenix.css';

const StreakPhoenix = ({ streak = 0 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (streak >= 7) {
      const newParticles = Array.from({ length: Math.min(streak, 30) }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 60,
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 2,
        size: 2 + Math.random() * 4,
      }));
      setParticles(newParticles);
    }
  }, [streak]);

  const getPhoenixLevel = () => {
    if (streak >= 90) return { emoji: '🦅', name: 'Transformed', glow: '#00ff88', intensity: 4 };
    if (streak >= 30) return { emoji: '⚡', name: 'Unstoppable', glow: '#7b2ffc', intensity: 3 };
    if (streak >= 7) return { emoji: '🔥', name: 'Momentum', glow: '#ff6b2e', intensity: 2 };
    if (streak >= 1) return { emoji: '✨', name: 'Starting', glow: '#00d4ff', intensity: 1 };
    return { emoji: '💤', name: 'Dormant', glow: '#3d4566', intensity: 0 };
  };

  const level = getPhoenixLevel();

  return (
    <div className={`phoenix-container level-${level.intensity}`}>
      {/* Glow effect */}
      <div className="phoenix-glow" style={{ '--glow-color': level.glow }} />

      {/* Rising particles for streak >= 7 */}
      {particles.map(p => (
        <div
          key={p.id}
          className="phoenix-particle"
          style={{
            '--px': `${p.x}%`,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
            '--size': `${p.size}px`,
            '--color': level.glow,
          }}
        />
      ))}

      {/* Main phoenix emoji */}
      <div className="phoenix-emoji">
        {level.emoji}
      </div>

      {/* Streak ring */}
      <svg className="phoenix-ring" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="#1e293b"
          strokeWidth="3"
        />
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke={level.glow}
          strokeWidth="3"
          strokeDasharray={`${Math.min((streak / 90) * 276.5, 276.5)} 276.5`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="ring-fill"
        />
      </svg>

      {/* Level name */}
      <span className="phoenix-level-name" style={{ color: level.glow }}>
        {level.name}
      </span>
    </div>
  );
};

export default StreakPhoenix;
