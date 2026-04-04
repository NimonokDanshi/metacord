import dynamic from "next/dynamic";

const DiscordProvider = dynamic(() => import("@/components/DiscordProvider"), {
  ssr: false,
});

export default function Home() {
  return (
    <DiscordProvider>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="bg-slate-800 p-8 rounded-2xl border border-blue-500/30 text-center shadow-2xl shadow-blue-500/10">
          <h1 className="text-4xl font-extrabold text-blue-400 mb-4 drop-shadow-md">
            🎉 接続成功！
          </h1>
          <p className="text-lg text-slate-300 mb-2">
            Metacord の Discord アクティビティ連携が正常に動作しています。
          </p>
          <p className="text-sm text-slate-500">
            (Client ID 及び Handshake が正常に行われました)
          </p>
        </div>
      </main>
    </DiscordProvider>
  );
}
