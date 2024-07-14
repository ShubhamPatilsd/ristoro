import Image from "next/image";
import { Inter } from "next/font/google";

import GoogleMapReact from "google-map-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import "mapbox-gl/dist/mapbox-gl.css";
import { point, buffer, bbox } from "@turf/turf";

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
                color="green"
                // popup={popup}
                ref={markerRef}
              ></Marker>
              <Popup
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
              </Popup>

              <div className="shadow w-[50vw] absolute bottom-12 left-12 bg-white p-8">
                <p className="font-medium">
                  <span className="text-gray-600 font-medium">{`${findTimeOfDay()}, ${
                    user?.firstName
                  }`}</span>
                  ,<br /> {content.letter}
                </p>

                <button
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
                        setQuery("");
                      });
                  }}
                >
                  Visited!
                </button>
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

                  console.log(response.info);

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

                  setContent({
                    ...restaurant,
                    // address: restaurantLocInfo[0].display_name,
                    address: addressString,
                    location: {
                      latitude: restaurantLocInfo[0].lat,
                      longitude: restaurantLocInfo[0].lon,
                    },
                    letter: JSON.parse(response.info).letter,
                  });

                  console.log(JSON.parse(response.info).letter);

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
                  const bufferStat = buffer(p, 0.5, { units: "kilometers" });
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
                className="  text-invert focus:outline-none placeholder:invert placeholder:opacity-55  bg-transparent rounded-full rounded-r-none  px-6 py-2 border-2 border-sky-600 border-r-0   md:w-[35vw] md:text-2xl"
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
