'use client';

import { RainBackground } from '@/components/RainBackground';
import { Outfit } from 'next/font/google';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <main className={`min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden ${outfit.className}`}>
      <RainBackground />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <span className="font-bold text-lg">JS</span>
          </div>
          <span className="font-bold text-xl tracking-tight">CodeMaster</span>
        </div>
        <Link href="/login" className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all text-sm font-medium backdrop-blur-sm">
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center mt-20 px-4">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          ✨ AI-Powered Code Verification
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent">
          Master Frontend <br /> Interviews
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Practice real machine coding rounds with an intelligent environment that tests your logic, not just your syntax.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/demo" className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Try Demo Access
          </Link>
          <Link href="/login" className="px-8 py-4 bg-transparent border border-zinc-700 hover:bg-zinc-800 rounded-full font-bold text-lg transition-colors">
            Get Pro
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 max-w-6xl mx-auto mt-32 px-4 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-zinc-400">Choose the plan that fits your preparation needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md hover:border-zinc-700 transition-colors">
            <h3 className="text-xl font-bold mb-2">Starter</h3>
            <div className="text-4xl font-bold mb-2">₹0<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
            <p className="text-sm text-zinc-500 mb-6">Perfect for trying out the platform.</p>
            <ul className="space-y-3 mb-8 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 3 Demo Questions</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Basic Code Editor</li>
              <li className="flex items-center gap-2"><span className="text-zinc-600">✕</span> AI Verification</li>
            </ul>
            <Link href="/demo" className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors">
              Try Demo
            </Link>
          </div>

          {/* Pro */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-blue-500/30 backdrop-blur-md shadow-2xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-2">₹499<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
            <p className="text-sm text-zinc-500 mb-6">Everything you need to crack the interview.</p>
            <ul className="space-y-3 mb-8 text-sm text-white">
              <li className="flex items-center gap-2"><span className="text-blue-400">✓</span> Unlimited Questions</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">✓</span> AI Logic Verification</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">✓</span> Instructor Solutions</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">✓</span> Priority Support</li>
            </ul>
            <Link href="/login" className="block w-full py-3 text-center bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors text-white">
              Get Started
            </Link>
          </div>

          {/* Team */}
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md hover:border-zinc-700 transition-colors">
            <h3 className="text-xl font-bold mb-2">Lifetime</h3>
            <div className="text-4xl font-bold mb-2">₹2999<span className="text-lg text-zinc-500 font-normal">/one-time</span></div>
            <p className="text-sm text-zinc-500 mb-6">For the dedicated learner.</p>
            <ul className="space-y-3 mb-8 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All Pro Features</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Lifetime Access</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Early Access to New Features</li>
            </ul>
            <Link href="/login" className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors">
              Buy Lifetime
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
