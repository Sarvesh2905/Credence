import { useEffect, useState } from 'react';
import { HiOutlineFire, HiOutlineLightningBolt, HiOutlineStar } from 'react-icons/hi';
import './StreakPhoenix.css';

const StreakPhoenix = ({ streak = 0 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (streak >= 7) {
      const newParticles = Array.from({ length: Math.min(streak, 20) }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 50,
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 2,
        size: 2 + Math.random() * 3,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [streak]);

  const getLevel = () => {
    if (streak >= 90) return { icon: <HiOutlineLightningBolt />, name: 'Transformed', color: '#4A6D8C', intensity: 4 };
    if (streak >= 30) return { icon: <HiOutlineFire />,          name: 'Unstoppable', color: '#DDB635', intensity: 3 };
    if (streak >= 7)  return { icon: <HiOutlineFire />,          name: 'Momentum',    color: '#4A6D8C', intensity: 2 };
    if (streak >= 1)  return { icon: <HiOutlineStar />,          name: 'Starting',    color: '#88889A', intensity: 1 };
    return               { icon: <HiOutlineFire />,              name: 'Dormant',     color: '#AAAAB8', intensity: 0 };
  };

  const level = getLevel();
  const progress = Math.min((streak / 90) * 276.5, 276.5);

  return (
    <div className={`phoenix-container level-${level.intensity}`}>
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
            '--color': level.color,
          }}
        />
      ))}

      {/* SVG ring + icon */}
      <div className="phoenix-inner">
        <svg className="phoenix-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#E4E4EA" strokeWidth="3" />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={level.color}
            strokeWidth="3"
            strokeDasharray={`${progress} 251.2`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="ring-fill"
          />
        </svg>
        <span className="phoenix-icon" style={{ color: level.color }}>
          {level.icon}
        </span>
      </div>

      <span className="phoenix-level-name" style={{ color: level.color }}>
        {level.name}
      </span>
    </div>
  );
};

export default StreakPhoenix;
