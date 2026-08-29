'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleSphereProps {
  className?: string;
  particleCount?: number;
}

export default function ParticleSphere({
  className = '',
  particleCount = 1600,
}: ParticleSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Calculate sphere radius based on canvas dimensions
    let radius = Math.min(width, height) * 0.42;

    // Generate particles in a 3D spherical volume with celestial distribution
    interface Point3D {
      x: number;
      y: number;
      z: number;
      baseSize: number;
      alpha: number;
    }

    const points: Point3D[] = [];
    for (let i = 0; i < particleCount; i++) {
      // Uniform random distribution on a sphere using spherical coordinates
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Layered radius for dense core and defined spherical edge
      const radialFactor = Math.pow(Math.random(), 0.3) * 0.95 + 0.05;
      const r = radius * radialFactor;

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z = r * Math.cos(phi);

      points.push({
        x,
        y,
        z,
        baseSize: Math.random() * 1.4 + 0.6,
        alpha: Math.random() * 0.65 + 0.35,
      });
    }

    // Rotation angles and mouse interaction
    let angleX = 0;
    let angleY = 0;
    let targetAngleX = 0;
    let targetAngleY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;
      targetAngleY = (mouseX / width) * 0.5;
      targetAngleX = -(mouseY / height) * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      radius = Math.min(width, height) * 0.42;
    };

    window.addEventListener('resize', handleResize);

    const FOV = 500;

    const render = () => {
      // Continuous gentle ambient rotation with smooth mouse tilt
      angleY += 0.0018 + (targetAngleY - angleY) * 0.05;
      angleX += 0.0006 + (targetAngleX - angleX) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Sort points by Z depth so front particles render over back particles
      const projectedPoints: { x: number; y: number; size: number; alpha: number; z: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 3D rotation around Y axis
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // 3D rotation around X axis
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        // Perspective projection
        const scale = FOV / (FOV + z2 + radius * 0.2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;

        // Depth-based opacity: particles in front are brighter and sharper
        const depthNorm = (z2 + radius) / (2 * radius); // 0 (back) to 1 (front)
        const alpha = Math.max(0.08, Math.min(0.95, p.alpha * (0.3 + 0.7 * depthNorm)));
        const size = Math.max(0.4, p.baseSize * scale * (0.6 + 0.4 * depthNorm));

        projectedPoints.push({
          x: projX,
          y: projY,
          size,
          alpha,
          z: z2,
        });
      }

      // Draw all particles
      for (let i = 0; i < projectedPoints.length; i++) {
        const pt = projectedPoints[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
