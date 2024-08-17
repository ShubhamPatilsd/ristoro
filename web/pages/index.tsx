import { Inter } from "next/font/google";

import GoogleMapReact from "google-map-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaDirections } from "react-icons/fa";

import { point, buffer, bbox, containsNumber } from "@turf/turf";
import { jsonToPlainText } from "json-to-plain-text";

import { IoSearchOutline } from "react-icons/io5";

import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
} from "react-map-gl";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import LoadingScreen from "../components/LoadingScreen";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [query, setQuery] = useState("");

  const { user } = useUser();

  const [letter, setLetter] = useState("");

  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 11,
  };

  const state = useGeolocation();

  const map = useRef(null);

  const geoControlRef = useRef<mapboxgl.GeolocateControl>();

  const geolocateControlRef = useCallback((ref) => {
    if (ref) {
      (async () => {
        while (!map.current)
          await (() => new Promise((resolve) => setTimeout(resolve, 200)))();
        ref.trigger();
      })();
    }
  }, []);

  useEffect(() => {
    // Activate as soon as the control is loaded
    console.log(geoControlRef.current);
    geoControlRef.current?.trigger();
  }, [geoControlRef.current]);

  const markerRef = useRef<mapboxgl.Marker>();

  const findTimeOfDay = () => {
    const date = new Date();

    const hours = date.getHours();

    if (hours < 12 && hours >= 6) {
      return "Good morning";
    } else if (hours >= 12 && hours <= 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  const [content, setContent] = useState<any>();

  const [animatedLetterContent, setAnimatedLetterContent] = useState("");

  useEffect(() => {
    if (content && content.letter) {
      const wrappedContent = wrapSentencesInHTML(content.letter);
      setAnimatedLetterContent(wrappedContent);
    }
  }, [content]);

  const wrapSentencesInHTML = (htmlString) => {
    const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/;
    let sentenceIndex = 0;

    const wrappedHTML = htmlString.replace(
      /<([^>]+)>([^<]+)<\/\1>/g,
      (match, tag, text) => {
        const sentences = text.split(sentenceRegex);
        const wrappedSentences = sentences.map((sentence) => {
          const trimmedSentence = sentence.trim();
          if (trimmedSentence) {
            return `<span class="fade-in-sentence" style="animation-delay: ${
              sentenceIndex++ * 0.5
            }s">${trimmedSentence}</span>`;
          }
          return sentence;
        });
        return `<${tag}>${wrappedSentences.join(" ")}</${tag}>`;
      }
    );

    return wrappedHTML;
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };
  const [currentStage, setCurrentStage] = useState(0);

  const loadingTips = [
    "Avoid the fog on your way to Fisherman's Wharf.",
    "Remember, cable cars have the right of way.",
    "Don't leave your heart in San Francisco, you might need it later.",
    "Watch out for seagulls at Pier 39, they're after your sourdough.",
    "The crookedest street isn't always the fastest route.",
  ];
  const [loadingTip, setLoadingTip] = useState(loadingTips[0]);

  const images = [
    "https://images.pexels.com/photos/12096173/pexels-photo-12096173.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/258447/pexels-photo-258447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/22817176/pexels-photo-22817176/free-photo-of-manually-operated-san-francisco-cable-car-over-fishermans-wharf.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/14084016/pexels-photo-14084016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  ];

  const [backgroundImage, setBackgroundImage] = useState(
    "https://images.pexels.com/photos/12096173/pexels-photo-12096173.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  );

  useEffect(() => {
    if (isLoading) {
      const tipInterval = setInterval(() => {
        setLoadingTip(
          loadingTips[Math.floor(Math.random() * loadingTips.length)]
        );
      }, 3000);

      return () => {
        clearInterval(tipInterval);
      };
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <LoadingScreen
        currentStage={currentStage}
        loadingTip={loadingTip}
        backgroundImage={backgroundImage}
      />
    );
  }

  const updateStage = () => {
    setCurrentStage((prev) => {
      const currStage = (prev + 1) % 6;
      setBackgroundImage(images[currStage % 6]);
      return currStage;
    });
  };

  return (
    <main className="h-screen">
      <div className="bg-sky-50 border border-gray-300 shadow-xl flex flex-col md:flex-row justify-between items-center md:px-8 p-2 px-4 md:py-0">
        <div className="md:block hidden md:visible justify-between w-full md:w-auto items-center">
          <img src="/smalllogo.svg" className="h-14" />
        </div>

        <div className="">
          <div className="p-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                setIsLoading(true);

                let foundThing = false;

                let DNERestaurants = [];

                while (true) {
                  let result = await fetch(
                    `/api/scrape?query=best ${query} in sf`
                  );
                  const jsonResult = await result.json();
                  console.log(jsonResult);
                  const links = jsonResult.links;

                  const docs = await axios(
                    `https://cors-anywhere.herokuapp.com/https://ael6waesqg.execute-api.us-east-1.amazonaws.com/v1/batch`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      data: {
                        urls: links,
                      },
                    }
                  );

                  let response = await fetch("/api/get_response", {
                    method: "POST",
                    body: JSON.stringify({
                      query: query,
                      location: {
                        lat: state.latitude,
                        lon: state.longitude,
                      },
                      restaurantsNotFound: DNERestaurants,
                      result: docs.data.results,
                    }),
                  });

                  updateStage();

                  response = await response.json();

                  //@ts-ignore
                  const restaurant = response.restaurants[0];

                  const tempRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?addressdetails=1&q=${restaurant.name} san francisco&format=json`
                  );

                  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

                  const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
                    restaurant.name
                  )} san francisco&key=${apiKey}`;

                  let firstRes = await fetch(`/api/get_location_info`, {
                    method: "POST",
                    body: JSON.stringify({
                      name: restaurant.name,
                    }),
                  });
                  const jsonRes = await firstRes.json();

                  let restaurantLocInfo: any = {};

                  for (const place of jsonRes) {
                    if (place.business_status === "OPERATIONAL") {
                      restaurantLocInfo = place;
                      break;
                    } else {
                      continue;
                    }
                  }

                  if (Object.keys(restaurantLocInfo).length === 0) {
                    DNERestaurants.push(`${restaurant.name}`);
                    continue;
                  }

                  updateStage();

                  const addressString = restaurantLocInfo.formatted_address;

                  let restaurantDetails = await fetch(
                    "/api/get_place_details",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        lat: restaurantLocInfo.geometry.location.lat,
                        lon: restaurantLocInfo.geometry.location.lng,
                        name: restaurant.name,
                      }),
                    }
                  );

                  updateStage();

                  restaurantDetails = await restaurantDetails.json();

                  const date = new Date();

                  const daysOfWeek = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ];
                  const currentDayOfWeek = daysOfWeek[date.getDay()];

                  const currentTime = date.toLocaleTimeString();

                  let hoursData = await fetch("/api/get_hours", {
                    method: "POST",
                    body: JSON.stringify({
                      name: restaurant.name,
                      lat: restaurantLocInfo.geometry.location.lat,
                      lon: restaurantLocInfo.geometry.location.lng,
                    }),
                  });

                  updateStage();

                  hoursData = await hoursData.json();

                  let letterGivenPre = await fetch("/api/generate_letter", {
                    method: "POST",
                    body: JSON.stringify({
                      prompt: `
                      Name: don't include username in the response
                      Restaurant Name: ${restaurant.name}
                      Hours: ${
                        //@ts-ignore
                        hoursData.weekday_text.join(" ")
                      }. Today is ${currentDayOfWeek} and it is ${currentTime}. Use this to suggest if the place is open or not.

                      Open_now: ${
                        //@ts-ignore
                        hoursData.open_now
                      }
                      Some pro tips for the restaurant: ${
                        //@ts-ignore
                        restaurantDetails.tips.map((tip) => tip.text)
                      }

                      Description: ${restaurant.description}

                      Make your response long to be a letter.

                      Restaurant: ${jsonToPlainText(restaurant, {
                        seperator: ":",
                        doubleQuotesForKeys: false,
                      })}

                      Don't include the address

                      Use two <br/> tags for new paragraphs.
                      `,
                    }),
                  });
                  let letterGiven = await letterGivenPre.text();
                  updateStage();

                  // letterGiven = await letterGiven.json();

                  {
                    /*
                    Photos URL: [${restaurantDetails.photos.map((photo) => {
                        return `${photo.prefix}original${photo.suffix}`;
                      })}]

                       Some tastes people note this place for: ${
                        restaurantDetails.tastes
                      }
                    */
                  }

                  setContent({
                    ...restaurant,
                    placeId: restaurantLocInfo.place_id,
                    // address: restaurantLocInfo[0].display_name,
                    address: addressString,
                    location: {
                      latitude: restaurantLocInfo.geometry.location.lat,
                      longitude: restaurantLocInfo.geometry.location.lng,
                    },
                    //@ts-ignore
                    letter: letterGiven,
                    information: {
                      ...restaurantDetails,
                      hours: {
                        //@ts-ignore
                        open_now: hoursData.open_now,
                        //@ts-ignore
                        display: hoursData.weekday_text.join(" "),
                        //@ts-ignore
                        regular: hoursData.periods,
                      },
                    },
                  });

                  const contentClone = {
                    ...restaurant,
                    location: {
                      latitude: restaurantLocInfo.geometry.location.lat,
                      longitude: restaurantLocInfo.geometry.location.lng,
                    },
                  };

                  const p = point([
                    parseFloat(contentClone.location.longitude),

                    parseFloat(contentClone.location.latitude),
                  ]);
                  const bufferStat = buffer(p, 2, { units: "kilometers" });
                  // const [minLng, minLat, maxLng, maxLat] = bbox(bufferStat);

                  const minLng =
                    restaurantLocInfo.geometry.viewport.southwest.lng;
                  const minLat =
                    restaurantLocInfo.geometry.viewport.southwest.lat;
                  const maxLng =
                    restaurantLocInfo.geometry.viewport.northeast.lng;
                  const maxLat =
                    restaurantLocInfo.geometry.viewport.northeast.lat;
                  console.log([minLng, minLat], [maxLng, maxLat], map.current);
                  map.current?.fitBounds(
                    [
                      [minLng, minLat],
                      [maxLng, maxLat],
                    ],
                    { padding: 40, duration: 1000 }
                  );

                  setIsLoading(false);
                  setCurrentStage(0);
                  setBackgroundImage(images[0]);
                  break;
                }
              }}
              className="flex items-center group bg-white bg-cover rounded-full bg-blend-overlay border border-sky-500"
            >
              <input
                type="text"
                name="query"
                placeholder="I want to eat some..."
                className=" font-semibold  focus:outline-none  placeholder:opacity-80  bg-transparent rounded-full rounded-r-none  px-6 py-2 border-0 border-sky-600 border-r-0 text-xl  md:w-[35vw] md:text-2xl"
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
              <button
                type="submit"
                className="focus:outline-none py-3 text-2xl focus:ring text-sky-500 font-bold focus:ring-sky-300 bg-transparent rounded-full rounded-l-none border-0 px-6 border-sky-600 ring-sky-200"
              >
                <IoSearchOutline className="mx-auto" />
              </button>
            </form>
          </div>
          {/* <div dangerouslySetInnerHTML={{ __html: content }} /> */}
          <div />
        </div>
        <div className="hidden md:block md:visible z-99">
          {user ? (
            <UserButton />
          ) : (
            <SignInButton
              //@ts-ignore
              className={
                "rounded-md bg-sky-500 border-2 border-sky-400 shadow px-3 py-1 font-bold text-white text-lg hover:scale-110 transition"
              }
            />
          )}
        </div>
      </div>
      <div
        style={{ height: "100%", width: "100%" }}
        className="flex flex-col md:flex-row"
      >
        {content && (
          <div className="md:w-[50vw] overflow-y-scroll bg-gradient-to-r from-stone-50 to-stone-100 bottom-0 md:left-12 bg-white p-8 h-[50vh] md:h-full">
            <p className="font-medium text-xl">
              {/* <span className="text-gray-600 font-medium">
                {`${findTimeOfDay()}${user ? ` ${user?.firstName}` : ""}`},
              </span> */}
            </p>

            <div className="flex h-72 mt-2">
              <div className="w-full overflow-x-scroll max-w-[80vw] space-x-3 flex">
                {content.information.photos.map((photo) => {
                  return (
                    <div
                      className="h-full min-w-[60vw]  md:min-w-[20vw] rounded-md bg-cover"
                      style={{
                        backgroundImage: `url('${photo.prefix}original${photo.suffix}')`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <div className="border-b pb-3">
                <h3 className="text-3xl font-bold">{content.name}</h3>
                <h3 className="text-base mt-1 uppercase text-gray-500">
                  {content.address.split(",")[0]}
                </h3>

                <div className="mt-2 ">
                  <a
                    target="_blank"
                    className="px-3 py-1 bg-sky-100 border-2 hover:bg-sky-200 transition border-sky-300 rounded-full inline-flex items-center space-x-2"
                    href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${content.name}&destination_place_id=${content.placeId}`}
                  >
                    <FaDirections className="text-sky-500" size={15} />

                    <span className="font-medium text-sky-700">
                      Take Me Here
                    </span>
                  </a>
                </div>
              </div>

              <div
                className="text-lg mt-3 letterParent"
                dangerouslySetInnerHTML={{ __html: content.letter }}
              />
            </div>
          </div>
        )}

        <Map
          ref={map}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          style={{ width: "100vw", height: "100%" }}
          initialViewState={{
            longitude: -122.412784,
            latitude: 37.765217,
            zoom: 12,
          }}
          maxBounds={[
            [-122.690114, 37.632134],
            [-122.19297, 37.876975],
          ]}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          <GeolocateControl
            ref={geolocateControlRef}
            trackUserLocation
            positionOptions={{ enableHighAccuracy: true }}
          />

          {content && (
            <>
              <Marker
                onClick={() => {
                  const p = point([
                    parseFloat(content.location.longitude),
                    parseFloat(content.location.latitude),
                  ]);
                  const bufferStat = buffer(p, 0.5, { units: "kilometers" });
                  const [minLng, minLat, maxLng, maxLat] = bbox(bufferStat);

                  map.current?.fitBounds(
                    [
                      [minLng, minLat],
                      [maxLng, maxLat],
                    ],
                    { padding: 40, duration: 1000 }
                  );
                }}
                longitude={content.location.longitude}
                latitude={content.location.latitude}
                color="#fff"
                // popup={popup}
                ref={markerRef}
              >
                <div className="marker" />
              </Marker>
            </>
          )}
        </Map>
      </div>
    </main>
  );
}
