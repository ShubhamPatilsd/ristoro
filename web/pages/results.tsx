import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { useRouter } from "next/router";

export default function Home() {
  const [choices, setChoices] = useState([]);

  const router = useRouter();

  const searchParams = useSearchParams();

  const [suggestions, setSuggestions] = useState<any>([]);
  const [suggestion, setSuggestion] = useState<any>();

  useEffect(() => {
    const flavors = searchParams.get("flavors").split(",");
    const ingredients = [searchParams.get("ingredients")];
    const restrictions = searchParams.get("restrictions").split(",");

    console.log(flavors, ingredients, restrictions);

    fetch("/api/marina_rec", {
      method: "POST",
      body: JSON.stringify({
        flavors,
        ingredients,
        restrictions,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.suggestions);

        setSuggestions(data.suggestions);
        setSuggestion(data.suggestions[0]);
      });
  }, []);

  const [answers, setAnswers] = useState({
    one: {
      selected: [],
    },
    two: {
      selected: [],
    },
    three: {
      selected: [],
    },
    four: {
      selected: [],
    },
    five: {
      selected: [],
    },
    six: {
      selected: [],
    },
  });

  return (
    <main className="py-2 flex flex-col justify-center md:py-12">
      <h1 className="text-center text-3xl font-black ">
        Yo, I got a place & dish for you
      </h1>
      <div className="max-w-2xl  w-full mx-auto  p-4 ">
        {suggestion && (
          <div>
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${suggestion.restaurant.placeId}`}
              className="w-full h-[50vh] mb-3"
              loading="lazy"
            ></iframe>

            <h1 className="text-xl">
              {suggestion.name} from {suggestion.restaurant.name}
            </h1>
            <h1 className="text-lg">${suggestion.price}</h1>
            <h1 className="">{suggestion.description}</h1>
            <div className="mt-2 flex space-x-2 w-full justify-center text-white">
              <button
                onClick={() => {
                  let ind = suggestions.indexOf(suggestion) + 1;

                  if (ind > suggestions.length - 1) {
                    ind = 0;
                  }

                  console.log(ind);
                  setSuggestion(suggestions[ind]);
                }}
                className="flex space-x-2 w-1/2 hover:bg-red-600 transition  p-2 items-center justify-center rounded-md bg-red-500"
              >
                <FaXmark />
                <p>Nah</p>
              </button>
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${suggestion.restaurant.placeId}`}
                target="_blank"
                className="flex space-x-2 p-2  w-1/2 items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600"
              >
                <FaCheck />
                <p> Yep</p>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
