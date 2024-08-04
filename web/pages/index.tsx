import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Utensils, Phone, Star } from "lucide-react";

import { emojiBlast } from "emoji-blast";
export default function Home() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClick = (event) => {
      emojiBlast({
        position: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    };

    // Add event listener
    document.addEventListener("click", handleClick);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="bg-[url('/sky.jpg')] bg-cover h-screen w-screen flex justify-center items-center flex-col space-y-2">
      <Head>
        <title>Ristoro</title>
        <meta name="description" content="Text EAT to 510-579-7965" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-3xl text-black  mb-2 font-bold text-center">
        hungry?
      </h1>
      <h1 className="text-2xl text-black  font-bold text-center">
        text "EAT" to{" "}
        <a href="sms://+15105797965;?&body=EAT" className="underline">
          510-579-7965
        </a>{" "}
      </h1>
      <h1 className="text-xl text-black  font-bold text-center">
        for a <span className="italic">really</span> good food rec
      </h1>
    </div>
  );
}
