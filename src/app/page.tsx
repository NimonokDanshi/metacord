import DiscordProvider from "@/components/DiscordProvider";
import UserProfile from "@/components/UserProfile";

export default function Home() {
  return (
    <DiscordProvider>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="bg-slate-800 p-8 rounded-2xl border border-blue-500/30 text-center shadow-2xl shadow-blue-500/10 min-w-80">
          <h1 className="text-3xl font-extrabold text-blue-400 mb-6 drop-shadow-md">
            🎉 Metacord
          </h1>
          <UserProfile />
        </div>
      </main>
    </DiscordProvider>
  );
}
