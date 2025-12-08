import { auth, signOut } from "@/auth";
import { MainApp } from "@/components/MainApp";
import { RainBackground } from "@/components/RainBackground";

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] relative overflow-hidden">
            {/* Reuse rain background? Or keep it clean? Let's add it for consistency but maybe darker? 
            Actually MainApp was white-bg based (QuestionList). We might need to adjust MainApp styling or wrapper.
            The original QuestionList assumes white background. 
            Let's keep Dashboard white for now to match the app style, or wrap MainApp in white.
        */}
            <div className="absolute inset-0 bg-white z-0"></div>

            <div className="relative z-10">
                <header className="flex justify-between items-center border-b border-gray-200 bg-white p-4 px-8 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">Code Question Maker</h1>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Pro</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {session?.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    className="w-8 h-8 rounded-full border border-gray-300"
                                />
                            )}
                            <span className="font-medium text-gray-700 text-sm hidden md:block">{session?.user?.name}</span>
                        </div>
                        <form action={async () => {
                            "use server";
                            await signOut();
                        }}>
                            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                Sign Out
                            </button>
                        </form>
                    </div>
                </header>

                <main className="p-8">
                    <MainApp />
                </main>
            </div>
        </div>
    );
}
