'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignIn } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function SignInPage() {
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
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 3 + 1;
        this.color = `hsl(${200 + Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.98;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
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
        this.decay = 0.02;
        this.generateSegments();
      }

      generateSegments() {
        this.segments = [{ x: this.startX, y: this.startY }];
        let currentX = this.startX;
        let currentY = this.startY;
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.floor(distance / 20);

        for (let i = 0; i < segments; i++) {
          const progress = i / segments;
          const x = this.startX + dx * progress + (Math.random() - 0.5) * 50;
          const y = this.startY + dy * progress + (Math.random() - 0.5) * 50;
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
        ctx.lineWidth = 3;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 15;
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
        this.decay = 0.005;
        this.generatePoints();
      }

      generatePoints() {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const endX = Math.random() * canvas.width;
        const endY = Math.random() * canvas.height;

        this.points = [{ x: startX, y: startY }];
        const segments = 20;
        for (let i = 1; i < segments; i++) {
          const progress = i / segments;
          const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 30;
          const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 30;
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
        ctx.globalAlpha = this.life * 0.7;
        ctx.strokeStyle = `hsl(${220 + Math.random() * 40}, 100%, 60%)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8;
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
    for (let i = 0; i < 5; i++) {
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw plasma lines
      plasmaLines.forEach(line => {
        line.update();
        line.draw();
      });

      // Generate lightning bolts occasionally
      if (Math.random() < 0.02) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const endX = mouseX + (Math.random() - 0.5) * 100;
        const endY = mouseY + (Math.random() - 0.5) * 100;
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
        if (Math.random() < 0.3) {
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
      ctx.fillStyle = 'rgba(0, 100, 255, 0.1)';
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-cyan-900/20 z-10" />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-[720px]">
          {/* Electric Energy Card */}
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden">
            {/* Electric Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600/80 via-cyan-600/80 to-purple-600/80 p-6 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image 
                    src="/icon.svg" 
                    alt="SecureDocShare Logo" 
                    width={48} 
                    height={48}
                    priority
                    className="object-contain filter drop-shadow-lg"
                  />
                  {/* Electric glow around logo */}
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-md animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                    SecureDocShare
                  </h1>
                  <p className="text-blue-100 text-sm">Digital Document Management</p>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white drop-shadow-lg">
                Sign in to Your Account
              </h2>
            </div>

            {/* Sign In Form */}
            <div className="relative p-8">
              {/* Electric particles around form */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                <div className="absolute top-8 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative z-10">
                <SignIn 
                  redirectUrl="/dashboard"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl',
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none w-full max-w-none',
                      main: 'w-full',
                      content: 'w-full',
                      scrollBox: 'w-full',
                      cardBox: 'w-full',
                      header: 'w-full',
                      form: 'w-full',
                      formField: 'w-full',
                      formFieldRow: 'w-full',
                      formButtonRow: 'w-full',
                      footer: 'w-full',
                      footerAction: 'w-full',
                      socialButtons: 'w-full',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-blue-200',
                      socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 border border-blue-500/30 text-white w-full',
                      formFieldInput: 'bg-black/50 border border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400',
                      formFieldLabel: 'text-blue-200',
                      footerActionLink: 'text-blue-400 hover:text-blue-300',
                      dividerLine: 'bg-blue-500/30',
                      dividerText: 'text-blue-300'
                    }
                  }}
                />
                <div className="mt-6 text-center">
                  <span className="text-blue-200">Don't have an account?</span>{' '}
                  <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 underline">
                    Create your account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-blue-300 hover:text-blue-200 transition-colors duration-300 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


