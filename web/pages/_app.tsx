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
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Ristoro</title>
        <meta
          name="description"
          content="finding you really good food recs in sf 🌉🧑‍🍳"
        />
        <meta
          name="keywords"
          content="ristoro,food,pizza sf,food sf,eater sf,food recommendations sf,sf,san francisco food,sf food,best sf food,best coffee sf,best pizza sf,best restaurants sf,best restaurants san francisco,best coffee san francisco,best pizza san francisco,restaurant recommendation,restaurant finder,food recommendation app,restaurant recommendation app reddit,best food,restaurants,reddit,best places to eat sf,best places to eat san francisco,best places to eat"
        />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <meta property="og:site_name" content="Ristoro" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content="Ristoro" />
        <meta
          property="og:description"
          content="finding you really good food recs in sf 🌉🧑‍🍳"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://getristoro.com" />
        <meta
          property="og:image"
          content="https://cloud-6hdrv51ni-hack-club-bot.vercel.app/0banner.png"
        />
        <meta property="og:image:alt" content="Ristoro Banner" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@getristoro" />
        <meta name="twitter:creator" content="@getristoro" />
        <meta name="twitter:title" content="Ristoro" />
        <meta
          name="twitter:description"
          content="finding you really good food recs in sf 🌉🧑‍🍳"
        />
        <meta
          name="twitter:image"
          content="https://cloud-6hdrv51ni-hack-club-bot.vercel.app/0banner.png"
        />
      </Head>
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
    </>
  );
}
