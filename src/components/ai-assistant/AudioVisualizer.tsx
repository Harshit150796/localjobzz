import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

export const AudioVisualizer = ({ isActive, isSpeaking }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 24;
    const barWidth = canvas.width / barCount - 4;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 4);
        const height = isSpeaking
          ? Math.random() * 60 + 10
          : Math.sin(Date.now() / 500 + i * 0.5) * 15 + 15;

        const gradient = ctx.createLinearGradient(x, centerY - height, x, centerY + height);
        gradient.addColorStop(0, 'hsl(262, 83%, 58%)');
        gradient.addColorStop(0.5, 'hsl(280, 87%, 65%)');
        gradient.addColorStop(1, 'hsl(291, 64%, 42%)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - height, barWidth, height * 2);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <canvas
        ref={canvasRef}
        width={160}
        height={80}
        className="opacity-70"
      />
    </div>
  );
};
