import { useEffect, useState } from "react";
import TextTransition, { presets } from "react-text-transition";

export default function Home() {
  const [currentWord, setCurrentWord] = useState(0);
  const [fade, setFade] = useState(false);
  const words = ["Find", "Share", "Rate"];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <main className="flex flex-col items-center h-screen bg-[url('/sky.jpg')] bg-cover bg-center">
      <div className="flex flex-col items-center justify-center py-[17vh]">
        <div className="relative mb-[8vh]">
          <span className="absolute -bottom-[1vh] -left-[7vw] text-[5vw] rotate-[-20deg]">
            🧑‍🍳
          </span>
          <span className="absolute -top-[7vh] left-[3vw] text-[5vw] rotate-[-10deg]">
            🍕
          </span>
          <span className="absolute top-[0vh] -right-[6vw] text-[5vw] rotate-[25deg]">
            🌁
          </span>
          <span className="absolute -bottom-[4vh] left-[23vw] text-[5vw] rotate-[20deg]">
            ☕
          </span>
          <h1 className="text-[10vw] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white from-35% to-[#33a9f7] to-80% drop-shadow-2xl">
            Ristoro
          </h1>
        </div>

        <div className="flex items-center drop-shadow-md">
          <h2 className="text-[3.5vw] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#C9C9C9] to-80% ">
            <TextTransition springConfig={presets.stiff} inline>
              <span className="bg-clip-text bg-gradient-to-b from-white to-[#C9C9C9] to-80% ">
                {words[currentWord]}
              </span>
            </TextTransition>
            {" good restaurants"}
          </h2>
        </div>

        <a href="/gen">
          <div className="px-6 py-2 text-xl rounded-md hover:scale-110 transition mt-4 font-bold bg-white text-black">
            Get Started
          </div>
        </a>
      </div>
    </main>
  );
}
