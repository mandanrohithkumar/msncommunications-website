"use client";

import React, { useEffect, useRef } from "react";
import { usePortal } from "@/lib/portal-store";

export const StarlightBackground: React.FC = () => {
  const { theme } = usePortal();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const numStars = 160;
    const stars: {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      twinkleSpeed: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.4,
          alpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.2 + 0.05,
          twinkleSpeed: Math.random() * 0.015 + 0.005
        });
      }
    };

    resize();
    initStars();

    const handleResize = () => {
      resize();
      initStars();
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      const isLight = theme === "light";
      ctx.fillStyle = isLight ? "#f8fafc" : "#050508";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(71, 85, 105, ${star.alpha * 0.45})`
          : `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Mouse Glow animation
  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animateGlow = () => {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.transform = `translate(${glowX - 325}px, ${glowY - 325}px)`;
      frameId = requestAnimationFrame(animateGlow);
    };

    animateGlow();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      {/* Interactive mouse radial glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 w-[650px] h-[650px] rounded-full blur-[110px] opacity-35 transition-colors duration-500 z-0"
        style={{
          background:
            theme === "light"
              ? "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)"
        }}
      />
      {/* Canvas starry sky */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed top-0 left-0 w-full h-full z-0"
      />
    </>
  );
};
