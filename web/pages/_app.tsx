import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SignedOutPage } from "@/components/SignedOutPage";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      {/* <SignedOut>
        <div className="flex items-center  justify-center h-screen w-screen">
          <div>
            <h1
              className={`text-8xl mx-auto md:text-[20rem] font-bold garamond  italic bg-fixed text-center	 bg-[url(/citybanner.jpg)] bg-center-top bg-cover  bg-clip-text text-transparent  `}
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
            <div className="flex justify-center w-full mt-12">
              <SignInButton>
                <div className="relative cursor-pointer    bg-[url(/sky.jpg)] bg-cover rounded-full bg-sky-400 hover:scale-110 transition">
                  <div className="w-full h-full bg-black  rounded-full opacity-35 absolute top-0"></div>
                  <p className="garamond text-center font-light italic text-3xl z-99 relative text-white px-6 py-2">
                    Start exploring
                  </p>
                </div>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut> */}
      {/* <SignedIn> */}
      <Component {...pageProps} />
      {/* </SignedIn> */}
      <Analytics />
    </ClerkProvider>
  );
}
