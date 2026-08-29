'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleSphereProps {
  className?: string;
  particleCount?: number;
  speed?: number;
  radiusFactor?: number;
  centerYRatio?: number;
}

export default function ParticleSphere({
  className = '',
  particleCount = 2200,
  speed = 1,
  radiusFactor = 0.45,
  centerYRatio = 0.5,
}: ParticleSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateSize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    updateSize();

    // 3D Particles distribution
    interface Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      baseAlpha: number;
      twinkleSpeed: number;
      phase: number;
    }

    const particles: Particle[] = [];
    const baseRadius = Math.min(width, height) * radiusFactor;

    for (let i = 0; i < particleCount; i++) {
      // Uniform spherical surface & volume distribution like Squarespace starfield
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      // Concentration toward outer shell with a softly populated core
      const rFactor = Math.pow(Math.random(), 0.25) * 0.96 + 0.04;
      const r = baseRadius * rFactor;

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z = r * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        size: Math.random() < 0.15 ? Math.random() * 1.8 + 1.2 : Math.random() * 1.0 + 0.6,
        baseAlpha: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Continuous rotation state
    let rotY = 0;
    let rotX = 0.2; // slight aesthetic tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      targetMouseX = (x / width) * 0.6;
      targetMouseY = (y / height) * 0.4;
    };

    window.addEventListener('mousemove', onMouseMove);

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    const FOV = 480;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // CONTINUOUS UNINTERRUPTED INFINITE ROTATION
      rotY += 0.22 * speed * delta;
      rotX += 0.06 * speed * delta;

      // Smooth mouse follow offset
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const currentRadius = Math.min(width, height) * radiusFactor;
      const radiusScale = currentRadius / (baseRadius || 1);

      const finalRotY = rotY + mouseX;
      const finalRotX = rotX + mouseY;

      const cosY = Math.cos(finalRotY);
      const sinY = Math.sin(finalRotY);
      const cosX = Math.cos(finalRotX);
      const sinX = Math.sin(finalRotX);

      const centerX = (width * dpr) / 2;
      const centerY = height * dpr * centerYRatio;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pre-calculate projection and depth
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply radius dynamic scale on resize
        const px = p.x * radiusScale;
        const py = p.y * radiusScale;
        const pz = p.z * radiusScale;

        // Rotate Y
        const x1 = px * cosY - pz * sinY;
        const z1 = pz * cosY + px * sinY;

        // Rotate X
        const y2 = py * cosX - z1 * sinX;
        const z2 = z1 * cosX + py * sinX;

        // Perspective division
        const distance = FOV + z2 + currentRadius * 0.3;
        if (distance <= 10) continue;

        const scale = (FOV / distance) * dpr;
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;

        // Depth shading: Front particles are crystal white, back particles fade
        const depthNorm = Math.max(0, Math.min(1, (z2 + currentRadius) / (2 * currentRadius)));
        const twinkle = Math.sin(time * p.twinkleSpeed + p.phase) * 0.2;
        const alpha = Math.max(0.1, Math.min(1.0, (p.baseAlpha + twinkle) * (0.25 + 0.75 * depthNorm)));

        const pointSize = Math.max(0.6 * dpr, p.size * scale * (0.6 + 0.4 * depthNorm));

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pointSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
    };
  }, [particleCount, speed, radiusFactor, centerYRatio]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
