'use client';

import { useEffect, useRef, useState } from 'react';

export default function BackgroundAnimation() {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Optimized Electric particle system
    class ElectricParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2; // Reduced velocity
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.decay = Math.random() * 0.01 + 0.005; // Faster decay
        this.size = Math.random() * 2 + 0.5; // Smaller particles
        this.color = `hsl(${200 + Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.99;
      }

      draw() {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5; // Reduced shadow blur
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Optimized Lightning bolt class
    class LightningBolt {
      constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.segments = [];
        this.life = 1;
        this.decay = 0.05; // Faster decay
        this.generateSegments();
      }

      generateSegments() {
        this.segments = [{ x: this.startX, y: this.startY }];
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.floor(distance / 30); // Fewer segments

        for (let i = 0; i < segments; i++) {
          const progress = i / segments;
          const x = this.startX + dx * progress + (Math.random() - 0.5) * 30; // Reduced randomness
          const y = this.startY + dy * progress + (Math.random() - 0.5) * 30;
          this.segments.push({ x, y });
        }
        this.segments.push({ x: this.endX, y: this.endY });
      }

      update() {
        this.life -= this.decay;
      }

      draw() {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.strokeStyle = `hsl(${200 + Math.random() * 60}, 100%, 70%)`;
        ctx.lineWidth = 2; // Thinner lines
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8; // Reduced shadow blur
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);
        for (let i = 1; i < this.segments.length; i++) {
          ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // Animation state with reduced complexity
    let particles = [];
    let lightningBolts = [];
    let lastLightning = 0;
    let frameCount = 0;

    // Optimized animation loop
    const animate = () => {
      frameCount++;
      
      // Only clear canvas every few frames for better performance
      if (frameCount % 3 === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update and draw particles (reduced frequency)
      particles = particles.filter(particle => {
        particle.update();
        if (frameCount % 2 === 0) { // Only draw every other frame
          particle.draw();
        }
        return particle.life > 0;
      });

      // Update and draw lightning bolts
      lightningBolts = lightningBolts.filter(bolt => {
        bolt.update();
        bolt.draw();
        return bolt.life > 0;
      });

      // Add new particles less frequently
      if (Math.random() < 0.15 && particles.length < 20) { // Reduced particle count
        particles.push(new ElectricParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }

      // Add lightning bolts less frequently
      if (Date.now() - lastLightning > 5000 && Math.random() < 0.05) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const endX = Math.random() * canvas.width;
        const endY = Math.random() * canvas.height;
        lightningBolts.push(new LightningBolt(startX, startY, endX, endY));
        lastLightning = Date.now();
      }

      // Limit total objects for performance
      if (particles.length > 25) particles = particles.slice(-20);
      if (lightningBolts.length > 3) lightningBolts = lightningBolts.slice(-2);

      animationId = requestAnimationFrame(animate);
    };

    // Delay animation start for better initial page load
    const startAnimation = () => {
      setTimeout(() => {
        setIsVisible(true);
        animate();
      }, 1000); // Start animation after 1 second
    };

    startAnimation();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)' }}
    />
  );
}
