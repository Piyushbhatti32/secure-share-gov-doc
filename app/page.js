'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function HomePage() {
  const router = useRouter();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Electric particle system
    class ElectricParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        this.size = Math.random() * 2 + 0.5;
        this.color = `hsl(${200 + Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.99;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Lightning bolt class
    class LightningBolt {
      constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.segments = [];
        this.life = 1;
        this.decay = 0.015;
        this.generateSegments();
      }

      generateSegments() {
        this.segments = [{ x: this.startX, y: this.startY }];
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.floor(distance / 25);

        for (let i = 0; i < segments; i++) {
          const progress = i / segments;
          const x = this.startX + dx * progress + (Math.random() - 0.5) * 40;
          const y = this.startY + dy * progress + (Math.random() - 0.5) * 40;
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
        ctx.lineWidth = 2;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 12;
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

    // Plasma line class
    class PlasmaLine {
      constructor() {
        this.points = [];
        this.life = 1;
        this.decay = 0.003;
        this.generatePoints();
      }

      generatePoints() {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const endX = Math.random() * canvas.width;
        const endY = Math.random() * canvas.height;

        this.points = [{ x: startX, y: startY }];
        const segments = 15;
        for (let i = 1; i < segments; i++) {
          const progress = i / segments;
          const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 25;
          const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 25;
          this.points.push({ x, y });
        }
        this.points.push({ x: endX, y: endY });
      }

      update() {
        this.life -= this.decay;
        if (this.life <= 0) {
          this.life = 1;
          this.generatePoints();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;
        ctx.strokeStyle = `hsl(${220 + Math.random() * 40}, 100%, 60%)`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 6;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // Animation objects
    const particles = [];
    const lightningBolts = [];
    const plasmaLines = [];

    // Initialize plasma lines
    for (let i = 0; i < 8; i++) {
      plasmaLines.push(new PlasmaLine());
    }

    // Mouse tracking for lightning
    let mouseX = 0;
    let mouseY = 0;
    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw plasma lines
      plasmaLines.forEach(line => {
        line.update();
        line.draw();
      });

      // Generate lightning bolts occasionally
      if (Math.random() < 0.015) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const endX = mouseX + (Math.random() - 0.5) * 80;
        const endY = mouseY + (Math.random() - 0.5) * 80;
        lightningBolts.push(new LightningBolt(startX, startY, endX, endY));
      }

      // Update and draw lightning bolts
      lightningBolts.forEach((bolt, index) => {
        bolt.update();
        bolt.draw();
        if (bolt.life <= 0) {
          lightningBolts.splice(index, 1);
        }
      });

      // Generate particles from lightning
      lightningBolts.forEach(bolt => {
        if (Math.random() < 0.2) {
          const segment = bolt.segments[Math.floor(Math.random() * bolt.segments.length)];
          particles.push(new ElectricParticle(segment.x, segment.y));
        }
      });

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
          particles.splice(index, 1);
        }
      });

      // Add electric glow effect
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(0, 100, 255, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Electric Energy Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at center, #001122 0%, #000000 100%)' }}
      />

      {/* Electric Energy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/15 via-purple-900/8 to-cyan-900/15 z-10" />

      {/* Header/Navigation */}
      <nav className="relative z-20 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-cyan-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-cyan-900/80 text-white py-2 px-4 text-center text-sm electric-text">
          Government of India | Digital Document Management Portal
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="emblem relative w-[50px] h-[50px]">
                <Image 
                  src="/icon.svg" 
                  alt="SecureDocShare Logo" 
                  width={50} 
                  height={50}
                  priority
                  className="object-contain filter drop-shadow-lg"
                />
                {/* Electric glow around logo */}
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-md animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white electric-text">SecureDocShare</h1>
                <p className="text-blue-200 text-sm">Digital Document Management</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/sign-in" className="text-blue-200 hover:text-white transition-colors duration-300 hover:underline">Sign In</Link>
              <Link href="/sign-up" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl electric-glow">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 electric-text">
                Secure Digital Document Management Made Simple
              </h1>
              <p className="text-lg text-blue-200 mb-8">
                Store, manage, and share your important documents securely. 
                Experience the convenience of digital document management with 
                enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl electric-glow text-center">
                  Get Started
                </Link>
                <Link href="/sign-in" className="bg-transparent border border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-blue-200 px-8 py-4 rounded-lg font-semibold transition-all duration-300 text-center electric-border">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative h-[400px]">
              {/* Electric glow around illustration */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 py-16 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12 electric-text">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm electric-border hover:bg-black/60 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4 electric-glow">
                <i className="fa-solid fa-shield-halved text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 electric-text">
                Secure Storage
              </h3>
              <p className="text-blue-200">
                Enterprise-grade encryption and secure cloud storage for your sensitive documents.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm electric-border hover:bg-black/60 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4 electric-glow">
                <i className="fa-solid fa-share-nodes text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 electric-text">
                Easy Sharing
              </h3>
              <p className="text-blue-200">
                Share documents securely with family members and authorized personnel.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm electric-border hover:bg-black/60 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4 electric-glow">
                <i className="fa-solid fa-mobile-screen-button text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 electric-text">
                Mobile Access
              </h3>
              <p className="text-blue-200">
                Access your documents from anywhere with our mobile-friendly interface.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
