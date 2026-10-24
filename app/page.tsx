import { About } from "@/components/About";
import { Hero } from "@/components/Hero";
import { Releases } from "@/components/Releases";
import { Footer } from "@/components/Footer";
import { Signup } from "@/components/Signup";
import { PlayerProvider } from "@/components/PlayerProvider";
import { PlayerBar } from "@/components/PlayerBar";
import { getTracks } from "@/lib/tracks";

// Re-read the catalogue every five minutes; new approved tracks show up without a deploy.
export const revalidate = 300;

export default async function Page() {
  const tracks = await getTracks();

  return (
    <PlayerProvider>
      <main>
        <Hero tracks={tracks} />
        <About />
        <Releases tracks={tracks} />
        <Signup />
      </main>
      <Footer />
      <PlayerBar />
    </PlayerProvider>
  );
}
