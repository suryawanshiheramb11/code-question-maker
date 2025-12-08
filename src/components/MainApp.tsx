'use client';

import { useState } from 'react';
import { UploadModal } from '@/components/UploadModal';
import { ReviewBoard } from '@/components/ReviewBoard';
import { QuestionList } from '@/components/QuestionList';
import { useRouter } from 'next/navigation';

interface MainAppProps {
    guestMode?: boolean;
}

export function MainApp({ guestMode = false }: MainAppProps) {
    const [view, setView] = useState<'dashboard' | 'review'>('dashboard');
    const [showUpload, setShowUpload] = useState(false);
    const [parsedItems, setParsedItems] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();

    const handleParseComplete = (items: any[]) => {
        setParsedItems(items);
        setShowUpload(false);
        setView('review');
    };

    const handleSaveComplete = () => {
        setView('dashboard');
        setParsedItems([]);
        setRefreshKey(prev => prev + 1);
    };

    const handleCancelReview = () => {
        if (confirm("Discard parsed items?")) {
            setView('dashboard');
            setParsedItems([]);
        }
    };

    if (view === 'review') {
        return <ReviewBoard items={parsedItems} onSave={handleSaveComplete} onCancel={handleCancelReview} />;
    }

    return (
        <div className="relative z-10">
            <QuestionList
                onOpenUpload={() => setShowUpload(true)}
                onSelectQuestion={(q) => router.push(`/questions/${q.id}`)}
                refreshKey={refreshKey}
            />

            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onParseComplete={handleParseComplete}
                />
            )}
        </div>
    );
}
