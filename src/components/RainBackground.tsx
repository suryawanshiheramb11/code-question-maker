"use client";

import { useEffect, useRef } from 'react';

export function RainBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        type Particle = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
        };

        let particles: Particle[] = [];
        const particleCount = 100;

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height, // Start randomly distributed
                vx: (Math.random() - 0.5) * 1, // Slight drift
                vy: Math.random() * 2 + 2, // Falling speed
                size: Math.random() * 2 + 1,
                color: `rgba(100, 149, 237, ${Math.random() * 0.3 + 0.1})` // Cornflower blueish, faint
            });
        }

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // Gravity

                // Bounce off bottom
                if (p.y + p.size > height) {
                    p.y = height - p.size;
                    p.vy *= -0.6; // Damping (energy loss)

                    // Add random horizontal jump on bounce
                    p.vx = (Math.random() - 0.5) * 4;

                    // If almost stopped, respawn at top to keep rain going
                    if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 0.5) {
                        p.y = -10;
                        p.x = Math.random() * width;
                        p.vy = Math.random() * 2 + 2;
                        p.vx = (Math.random() - 0.5) * 1;
                    }
                }

                // Wrap horizontal
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Respawn or adjust particles? Just let them fall.
        };

        window.addEventListener('resize', handleResize);
        const animId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
