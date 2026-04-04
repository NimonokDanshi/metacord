import DiscordProvider from "@/components/DiscordProvider";
import GameCanvasLoader from "@/components/GameCanvasLoader";

export default function Home() {
  return (
    <DiscordProvider>
      {/* Discord認証完了後にPixiJSキャンバスを表示 */}
      <GameCanvasLoader />
    </DiscordProvider>
  );
}
