import { useCallback, useEffect, useRef, useState } from "react";

interface ParticleProps {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  disableOnMobile?: boolean;
  color?: string;
  connectDistance?: number;
  interactionDistance?: number;
}

export function ParticleBackground({
  particleCount = 80,
  disableOnMobile = true,
  color = "138, 75, 255",
  connectDistance = 120,
  interactionDistance = 100,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<ParticleProps[]>([]);

  // Check if device is mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Initialize particles
  const initParticles = useCallback(
    (canvas: HTMLCanvasElement) => {
      particlesRef.current = [];
      const actualCount = isMobile
        ? Math.floor(particleCount / 2)
        : particleCount;

      for (let i = 0; i < actualCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 0.8 - 0.4,
          speedY: Math.random() * 0.8 - 0.4,
          color: `rgba(${color}, ${Math.random() * 0.3})`,
        });
      }
    },
    [particleCount, isMobile, color],
  );

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Update and draw particles
    particles.forEach((particle, index) => {
      // Draw particle
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Mouse interaction
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < interactionDistance) {
        const angle = Math.atan2(dy, dx);
        particle.x -= Math.cos(angle) * 0.3;
        particle.y -= Math.sin(angle) * 0.3;
      }

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX *= -1;
      }

      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY *= -1;
      }

      // Connect nearby particles (only check half to avoid duplicates)
      for (let j = index + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${color}, ${0.15 - distance / 600})`;
          ctx.lineWidth = 0.4;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [interactionDistance, connectDistance, color]);

  // Setup and cleanup effects
  useEffect(() => {
    if (disableOnMobile && isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup canvas size
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(canvas);
      }
    };

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Initial setup
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [disableOnMobile, isMobile, animate, initParticles]);

  // If disabled on mobile and is mobile, return null
  if (disableOnMobile && isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0, willChange: "transform" }}
    />
  );
}
