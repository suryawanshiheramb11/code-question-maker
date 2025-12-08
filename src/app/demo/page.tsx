'use client';

import { MainApp } from '@/components/MainApp';
import { RainBackground } from '@/components/RainBackground';

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-white relative overflow-hidden">
            <RainBackground />
            <div className="relative z-10 p-4">
                <div className="max-w-7xl mx-auto mb-4 p-4 bg-orange-100 border border-orange-200 rounded-lg text-orange-800 flex justify-between items-center">
                    <span><strong>Demo Mode:</strong> You are exploring as a guest.</span>
                    <a href="/login" className="underline font-semibold">Sign In to Save</a>
                </div>
                <MainApp guestMode={true} />
            </div>
        </main>
    );
}
