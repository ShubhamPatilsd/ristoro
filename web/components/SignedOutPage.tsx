import { useSignIn } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

export const SignedOutPage = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const newScale = 1 + scrollTop / 500; // Adjust the divisor to control the scaling speed
      setScale(newScale);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { isLoaded, signIn, setActive } = useSignIn();

  return (
    <div className="flex-col justify-center h-screen w-screen">
      <h1
        className={`text-8xl mx-auto md:text-[20rem] font-bold garamond  italic bg-fixed text-center	 bg-[url(/city.jpg)] bg-[position:100%_20%] bg-cover  bg-clip-text text-transparent  `}
        style={{
          transform: `scale(${1})`,
          // fontSize: `${20 * scale}rem`,
          // marginTop: `${20 / scale}%`,

          // backgroundSize: `${100 * (1 / scale)}% ${100 * (1 / scale)}%`,
        }}
      >
        Ristoro
      </h1>
      <p className="mx-auto text-center garamond text-3xl text-gray-400 italic font-light">
        Explore SF through food
      </p>
      <button
        onClick={() => {
          signIn();
        }}
      >
        <p className="mx-auto text-center garamond text-3xl text-gray-400 italic font-light">
          Take me there
        </p>
      </button>
    </div>
  );
};
