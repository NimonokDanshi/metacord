import DiscordProvider from "@/components/DiscordProvider";
import WorldCanvasLoader from "@/components/scene/WorldCanvasLoader";

export default function Home() {
  return (
    <DiscordProvider>
      {/* Discord認証完了後に R3F (3D) キャンバスを表示 */}
      <WorldCanvasLoader />
    </DiscordProvider>
  );
}
