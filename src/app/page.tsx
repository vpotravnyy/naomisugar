import { api } from "~/trpc/server";
import Libre from "./_components/Libre";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <Libre />
    </main>
  );
}

