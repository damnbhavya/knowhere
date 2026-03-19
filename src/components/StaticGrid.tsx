import { useState, useEffect, useRef } from 'react';

interface GridDot {
  id: number;
  startX: number;
  startY: number;
  direction: 'horizontal' | 'vertical';
  duration: number;
  delay: number;
  distance: number;
}

const GRID_SIZE = 80;
const DOT_COUNT = 18;

export default function StaticGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<GridDot[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || isMobile) {
      setDots([]);
      return;
    }

    const cols = Math.floor(dimensions.width / GRID_SIZE);
    const rows = Math.floor(dimensions.height / GRID_SIZE);
    const offsetX = (dimensions.width % GRID_SIZE) / 2;
    const offsetY = (dimensions.height % GRID_SIZE) / 2;

    const newDots: GridDot[] = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      const isHorizontal = Math.random() > 0.5;
      const col = Math.floor(Math.random() * (cols + 1));
      const row = Math.floor(Math.random() * (rows + 1));

      newDots.push({
        id: i,
        startX: offsetX + col * GRID_SIZE,
        startY: offsetY + row * GRID_SIZE,
        direction: isHorizontal ? 'horizontal' : 'vertical',
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        distance: GRID_SIZE * (1 + Math.floor(Math.random() * 3)),
      });
    }
    setDots(newDots);
  }, [dimensions, isMobile]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30" />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: 'center center',
          opacity: 0.06,
        }}
      />

      {dots.map(dot => (
        <div
          key={dot.id}
          className="absolute rounded-full"
          style={{
            width: 5,
            height: 5,
            left: dot.startX - 2.5,
            top: dot.startY - 2.5,
            opacity: 0.35,
            background: 'var(--brand-red)',
            animation: `gridDot${dot.direction === 'horizontal' ? 'X' : 'Y'} ${dot.duration}s ease-in-out ${dot.delay}s infinite alternate`,
            ['--dot-distance' as string]: `${dot.distance}px`,
          }}
        />
      ))}

      <style>{`
        @keyframes gridDotX {
          0% { transform: translateX(0); opacity: 0.15; }
          50% { opacity: 0.45; }
          100% { transform: translateX(var(--dot-distance)); opacity: 0.15; }
        }
        @keyframes gridDotY {
          0% { transform: translateY(0); opacity: 0.15; }
          50% { opacity: 0.45; }
          100% { transform: translateY(var(--dot-distance)); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
