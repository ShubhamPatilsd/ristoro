import { Inter } from "next/font/google";

import GoogleMapReact from "google-map-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import "mapbox-gl/dist/mapbox-gl.css";

import { point, buffer, bbox, containsNumber } from "@turf/turf";
import { jsonToPlainText } from "json-to-plain-text";

import { IoSearchOutline } from "react-icons/io5";

import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
} from "react-map-gl";
import { UserButton, useUser } from "@clerk/nextjs";

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
  return (
    <main>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map
          ref={map}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          style={{ width: "100vw", height: "100vh" }}
          initialViewState={{
            // longitude: -122.442982,
            // latitude: 37.768649,

            longitude: -122.412784,
            latitude: 37.765217,
            zoom: 12,
          }}
          maxBounds={[
            [-122.690114, 37.632134],
            [-122.19297, 37.876975],
          ]}
          mapStyle="mapbox://styles/mapbox/streets-v9"
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
              {/* <Popup
                longitude={content.location.longitude}
                closeOnClick={false}
                closeOnMove={false}
                onClose={() => {}}
                latitude={content.location.latitude}
                anchor="top"
              >
                <div className="p-4 bg-white rounded-sm">
                  <h1>{content.name}</h1>
                  <p>{content.address}</p>
                  <p>{content.description}</p>
                </div>
              </Popup> */}

              <div className="shadow-2xl md:w-[50vw] overflow-y-scroll fixed bg-gradient-to-r from-stone-50 to-stone-100 bottom-0 md:left-12 bg-white p-8 h-[50vh] md:h-[70vh]">
                <p className="font-medium text-xl">
                  <span className="text-gray-600 font-medium">
                    {`${findTimeOfDay()}${` ${user?.firstName}` || ""}`},
                  </span>
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

                <div
                  className="text-lg mt-3 letterParent"
                  dangerouslySetInnerHTML={{ __html: content.letter }}
                />

                {/* <button
                  onClick={() => {
                    fetch("/api/mark_visited", {
                      method: "POST",
                      body: JSON.stringify({
                        restaurantName: content.name,
                      }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        setContent("");
                        setLetter("");
                      });
                  }}
                >
                  Visited!
                </button> */}
              </div>
            </>
          )}
        </Map>

        <div className="absolute top-5 left-5">
          <UserButton />
        </div>
        <div className="absolute top-10 left-0 flex items-center justify-center w-screen">
          <div className="p-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                let foundThing = false;

                let DNERestaurants = [];

                while (true) {
                  let response = await fetch("/api/get_response", {
                    method: "POST",
                    body: JSON.stringify({
                      query: query,
                      location: {
                        lat: state.latitude,
                        lon: state.longitude,
                      },
                      restaurantsNotFound: DNERestaurants,
                    }),
                  });

                  response = await response.json();

                  const restaurant = JSON.parse(response.info).restaurants[0];

                  const tempRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?addressdetails=1&q=${restaurant.name} san francisco&format=json`
                  );

                  const restaurantLocInfo = await tempRes.json();

                  if (
                    restaurantLocInfo.length === 0 ||
                    restaurantLocInfo[0].name !== restaurant.name
                  ) {
                    DNERestaurants.push(`${restaurant.name}`);
                    continue;
                  }

                  const address = restaurantLocInfo[0].address;
                  const addressString = `${address.house_number} ${address.road}`;

                  let restaurantDetails = await fetch(
                    "/api/get_place_details",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        lat: restaurantLocInfo[0].lat,
                        lon: restaurantLocInfo[0].lon,
                        name: restaurant.name,
                      }),
                    }
                  );

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
                      lat: restaurantLocInfo[0].lat,
                      lon: restaurantLocInfo[0].lon,
                    }),
                  });

                  hoursData = await hoursData.json();

                  let letterGiven = await fetch("/api/generate_letter", {
                    method: "POST",
                    body: JSON.stringify({
                      prompt: `
                      Name: don't include username in the response
                      Restaurant Name: ${restaurant.name}
                      Hours: ${hoursData.weekday_text.join(
                        " "
                      )}. Today is ${currentDayOfWeek} and it is ${currentTime}. Use this to suggest if the place is open or not.

                      Open_now: ${hoursData.open_now}
                      Some pro tips for the restaurant: ${restaurantDetails.tips.map(
                        (tip) => tip.text
                      )}

                      Description: ${restaurant.description}

                      Make your response long to be a letter.

                      Restaurant: ${jsonToPlainText(restaurant, {
                        seperator: ":",
                        doubleQuotesForKeys: false,
                      })}

                      Use two <br/> tags for new paragraphs.
                      `,
                    }),
                  });
                  letterGiven = await letterGiven.json();

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
                    // address: restaurantLocInfo[0].display_name,
                    address: addressString,
                    location: {
                      latitude: restaurantLocInfo[0].lat,
                      longitude: restaurantLocInfo[0].lon,
                    },
                    letter: letterGiven.info,
                    information: {
                      ...restaurantDetails,
                      hours: {
                        open_now: hoursData.open_now,
                        display: hoursData.weekday_text.join(" "),
                        regular: hoursData.periods,
                      },
                    },
                  });

                  const contentClone = {
                    ...restaurant,
                    location: {
                      latitude: restaurantLocInfo[0].lat,
                      longitude: restaurantLocInfo[0].lon,
                    },
                  };

                  const p = point([
                    parseFloat(contentClone.location.longitude),

                    parseFloat(contentClone.location.latitude),
                  ]);
                  const bufferStat = buffer(p, 2, { units: "kilometers" });
                  const [minLng, minLat, maxLng, maxLat] = bbox(bufferStat);

                  map.current?.fitBounds(
                    [
                      [minLng, minLat],
                      [maxLng, maxLat],
                    ],
                    { padding: 40, duration: 1000 }
                  );

                  break;
                }
              }}
              className="flex items-center group bg-[url(/sky.jpg)] bg-cover rounded-full bg-blend-overlay"
            >
              <input
                type="text"
                name="query"
                placeholder="Let's try something new today"
                className=" font-semibold text-invert focus:outline-none placeholder:invert placeholder:opacity-55  bg-transparent rounded-full rounded-r-none  px-6 py-2 border-2 border-sky-600 border-r-0   md:w-[35vw] md:text-2xl"
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
              <button
                type="submit"
                className="focus:outline-none py-3 text-2xl focus:ring text-sky-500 font-bold focus:ring-sky-300 bg-transparent rounded-full rounded-l-none border-2 border-l-1 border-l-[1px] px-6 border-sky-600 ring-sky-200"
              >
                <IoSearchOutline className="mx-auto" />
              </button>
            </form>
          </div>
          {/* <div dangerouslySetInnerHTML={{ __html: content }} /> */}
          <div />
        </div>
      </div>
    </main>
  );
}
