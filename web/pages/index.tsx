import { Inter } from "next/font/google";

import GoogleMapReact from "google-map-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-toastify/dist/ReactToastify.css";

import { Bounce, toast } from "react-toastify";
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
import { routeModule } from "next/dist/build/templates/app-page";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

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

  const goofyQuestions = [
    {
      q: "If you had to eat spaghetti using only your elbows for the rest of your life, would you rather the noodles be:",
      a: [
        { text: "🍝&nbsp;&nbsp;Cooked", code: "A" },
        { text: "🍜&nbsp;&nbsp;Uncooked", code: "B" },
        { text: "🍝❄️&nbsp;&nbsp;Cooked, but frozen", code: "C" },
        {
          text: "🌶️🍜&nbsp;&nbsp;Uncooked, but soaked in hot sauce",
          code: "D",
        },
      ],
    },
    {
      q: "What's the worst food to ice cream-ify?",
      a: [
        { text: "🥩🍦&nbsp;&nbsp;Jerky", code: "A" },
        { text: "🍿🍦&nbsp;&nbsp;Popcorn", code: "B" },
        { text: "🥒🍦&nbsp;&nbsp;Celery", code: "C" },
        { text: "🥒🍦&nbsp;&nbsp;Pickles", code: "D" },
      ],
    },
    {
      q: "Your tongue can now speak its own language, but only to describe flavors it doesn't like. What's the first conversation you have with it?",
      a: [
        { text: "🥦🔥&nbsp;&nbsp;A heated debate about broccoli", code: "A" },
        { text: "🍬🖤&nbsp;&nbsp;A rant about black licorice", code: "B" },
        {
          text: "🌿🗣️&nbsp;&nbsp;A monologue on the evils of cilantro",
          code: "C",
        },
        { text: "🥒👿&nbsp;&nbsp;A tirade against bitter gourd", code: "D" },
      ],
    },
    {
      q: "If vegetables could feel pain, which one do you think would scream the loudest when being chopped?",
      a: [
        { text: "🧅😱&nbsp;&nbsp;Onion", code: "A" },
        { text: "🥬😱&nbsp;&nbsp;Cabbage", code: "B" },
        { text: "🥕😱&nbsp;&nbsp;Carrot", code: "C" },
        { text: "🌶️😱&nbsp;&nbsp;Bell pepper", code: "D" },
      ],
    },
    {
      q: "You're granted the ability to make any food invisible. Which meal would be the most hilarious to eat in public?",
      a: [
        { text: "🍝🕵️&nbsp;&nbsp;Spaghetti and meatballs", code: "A" },
        { text: "🍉🕵️&nbsp;&nbsp;A whole watermelon", code: "B" },
        { text: "🍗🕵️&nbsp;&nbsp;A giant turkey leg", code: "C" },
        { text: "🎂🕵️&nbsp;&nbsp;A 3-tier wedding cake", code: "D" },
      ],
    },
    {
      q: "Every time you eat cheese, you temporarily gain the ability to communicate with cows. How do you use this power?",
      a: [
        {
          text: "🐄🎤&nbsp;&nbsp;Start a cow-based stand-up comedy routine",
          code: "A",
        },
        { text: "🐄🛋️&nbsp;&nbsp;Become a cow therapist", code: "B" },
        { text: "🐄📜&nbsp;&nbsp;Learn the secret history of milk", code: "C" },
        { text: "🐄🪧&nbsp;&nbsp;Organize a cow union", code: "D" },
      ],
    },
    {
      q: "You can now photosynthesize like a plant, but only when covered in condiments. Which one do you choose and why?",
      a: [
        {
          text: "🍅🔋&nbsp;&nbsp;Ketchup - for that tomato-based energy boost",
          code: "A",
        },
        {
          text: "🌞🟡&nbsp;&nbsp;Mustard - to blend in with the sun",
          code: "B",
        },
        {
          text: "🍦⚡&nbsp;&nbsp;Mayo - for a creamy, smooth photosynthesis",
          code: "C",
        },
        {
          text: "🌶️🔥&nbsp;&nbsp;Hot sauce - for spicy solar power",
          code: "D",
        },
      ],
    },
    {
      q: "If foods had personalities, which two would be mortal enemies?",
      a: [
        { text: "🥜🍇&nbsp;&nbsp;Peanut butter and jelly", code: "A" },
        { text: "🧂🍬&nbsp;&nbsp;Salt and sugar", code: "B" },
        { text: "🥛🍋&nbsp;&nbsp;Milk and lemon", code: "C" },
        { text: "🍃🍊&nbsp;&nbsp;Mint and orange juice", code: "D" },
      ],
    },
    {
      q: "You're cursed to always smell like the last thing you ate. What food would you eat to ensure you're always invited to parties?",
      a: [
        { text: "🍪👃&nbsp;&nbsp;Freshly baked cookies", code: "A" },
        { text: "🍕👃&nbsp;&nbsp;Pizza", code: "B" },
        { text: "🍩👃&nbsp;&nbsp;Cinnamon rolls", code: "C" },
        { text: "🥓👃&nbsp;&nbsp;Bacon", code: "D" },
      ],
    },
    {
      q: "Your tears now taste like whatever you last drank. How do you monetize this strange superpower?",
      a: [
        {
          text: "🍸💧&nbsp;&nbsp;Become a high-end cocktail ingredient",
          code: "A",
        },
        {
          text: "🍬💧&nbsp;&nbsp;Start a 'Mystery Flavor' tear drop candy line",
          code: "B",
        },
        {
          text: "🍽️💧&nbsp;&nbsp;Offer personalized tear-tasting experiences",
          code: "C",
        },
        {
          text: "🍳💧&nbsp;&nbsp;Create the world's most dramatic cooking show",
          code: "D",
        },
      ],
    },
    {
      q: "Every time you eat a fruit, you swap bodies with the nearest fruit for an hour. How do you use this ability?",
      a: [
        {
          text: "🍌👀&nbsp;&nbsp;Become a banana to understand life on a kitchen counter",
          code: "A",
        },
        {
          text: "🍎👀&nbsp;&nbsp;Turn into an apple to spy on teachers' lounges",
          code: "B",
        },
        {
          text: "🍍🍕&nbsp;&nbsp;Experience life as a pineapple on a pizza",
          code: "C",
        },
        {
          text: "🍇👀&nbsp;&nbsp;Live as a grape to infiltrate a vineyard",
          code: "D",
        },
      ],
    },
    {
      q: "You can now grow any food from your hair. What's your new signature hairstyle?",
      a: [
        { text: "🍝👱‍♂️&nbsp;&nbsp;Spaghetti dreadlocks", code: "A" },
        { text: "🍭🌈&nbsp;&nbsp;Cotton candy afro", code: "B" },
        { text: "🥦✂️&nbsp;&nbsp;Broccoli buzz cut", code: "C" },
        { text: "🥓💇&nbsp;&nbsp;Bacon pompadour", code: "D" },
      ],
    },
    {
      q: "If kitchen utensils came to life, which one would be most likely to start a rebellion?",
      a: [
        { text: "🔪👿&nbsp;&nbsp;The knife", code: "A" },
        { text: "🍴🌀&nbsp;&nbsp;The whisk", code: "B" },
        { text: "🤜🥩&nbsp;&nbsp;The meat tenderizer", code: "C" },
        { text: "🪵🗯&nbsp;&nbsp;The potato masher", code: "D" },
      ],
    },
    {
      q: "You can telepathically communicate with one type of food. Which one would have the most interesting stories?",
      a: [
        { text: "🧀📜&nbsp;&nbsp;Ancient cheese", code: "A" },
        { text: "🌍🧂&nbsp;&nbsp;Well-traveled spices", code: "B" },
        { text: "🍅👵&nbsp;&nbsp;Heirloom tomatoes", code: "C" },
        { text: "🍞💭&nbsp;&nbsp;Sourdough starter", code: "D" },
      ],
    },
    {
      q: "Every time you burp, you release the scent of a random food. How does this change your social life?",
      a: [
        {
          text: "🍲🌟&nbsp;&nbsp;You become a hit at food festivals",
          code: "A",
        },
        {
          text: "🎥🚫&nbsp;&nbsp;You're banned from movie theaters",
          code: "B",
        },
        {
          text: "🌸👃&nbsp;&nbsp;You start a new career as a human air freshener",
          code: "C",
        },
        {
          text: "💐👃&nbsp;&nbsp;You accidentally create a new perfume trend",
          code: "D",
        },
      ],
    },
    {
      q: "You can now instantly cook any food by slapping it. How hard do you have to slap a chicken to roast it?",
      a: [
        {
          text: "🖐️🤗&nbsp;&nbsp;As hard as you'd high-five your best friend",
          code: "A",
        },
        {
          text: "🥊🥴&nbsp;&nbsp;Hard enough to knock out a professional boxer",
          code: "B",
        },
        {
          text: "☀️💥&nbsp;&nbsp;With the force of a thousand suns",
          code: "C",
        },
        {
          text: "🙌✨&nbsp;&nbsp;Just a gentle pat, but you have to believe in yourself",
          code: "D",
        },
      ],
    },
    {
      q: "What's the most confusing meal you'd create by reshaping any food without changing its taste?",
      a: [
        {
          text: "🍣🌯&nbsp;&nbsp;Sushi that looks like tiny burritos",
          code: "A",
        },
        { text: "🥩🍌&nbsp;&nbsp;A steak in the shape of a banana", code: "B" },
        {
          text: "🍲🍕&nbsp;&nbsp;Soup molded into the shape of a pizza",
          code: "C",
        },
        {
          text: "🍨🦃&nbsp;&nbsp;Ice cream that looks exactly like mashed potatoes and gravy",
          code: "D",
        },
      ],
    },
    {
      q: "What's the food, and what bizarre tradition do you invent to celebrate a new national holiday based on it?",
      a: [
        {
          text: "🥒🗣️&nbsp;&nbsp;Pickle Day - Everyone must speak in a pickle pun dialect",
          code: "A",
        },
        {
          text: "🍝🎨&nbsp;&nbsp;Spaghetti Day - National noodle hair competition",
          code: "B",
        },
        {
          text: "🍩🎯&nbsp;&nbsp;Donut Day - Ring-toss competitions using only donuts",
          code: "C",
        },
        {
          text: "🌮⏳&nbsp;&nbsp;Taco Tuesday (but on a Wednesday) - Competitive reverse taco eating",
          code: "D",
        },
      ],
    },
  ];

  const [choices, setChoices] = useState([]);

  useEffect(() => {
    let questionsCopy = goofyQuestions;

    let buildableArr = [];

    let item = questionsCopy[Math.floor(Math.random() * questionsCopy.length)];

    buildableArr.push(item);

    questionsCopy = questionsCopy.filter((ques) => ques.q !== item.q);

    item = questionsCopy[Math.floor(Math.random() * questionsCopy.length)];

    buildableArr.push(item);

    questionsCopy = questionsCopy.filter((ques) => ques.q !== item.q);

    item = questionsCopy[Math.floor(Math.random() * questionsCopy.length)];

    buildableArr.push(item);

    questionsCopy = questionsCopy.filter((ques) => ques.q !== item.q);

    setChoices(buildableArr);
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
    <>
      <main className="">
        <div className="max-w-2xl  w-full mx-auto md:py-12 p-4 ">
          <h1 className="font-bold text-2xl">
            Find The Marina's Best Restaurants 🌁👩‍🍳
          </h1>

          <p>Take this short quiz to find out what you should eat.</p>

          <div className="flex items-start space-x-2 mt-4 w-full">
            <div>1.</div>
            <div className="w-full">
              <label>
                I'm in the mood for something... (Select all that apply)
              </label>
              <div className="space-y-1 mt-2 w-full">
                {[
                  { text: "🌶️&nbsp;&nbsp;Spicy", code: "spicy" },
                  { text: "🍦&nbsp;&nbsp;Sweet", code: "sweet" },
                  { text: "🍲&nbsp;&nbsp;Savory", code: "savory" },
                  { text: "🥗&nbsp;&nbsp;Fresh", code: "fresh" },
                  { text: "🍕&nbsp;&nbsp;Comforting", code: "comforting" },
                  { text: "🧂&nbsp;&nbsp;Salty", code: "salty" },
                ].map((item) => (
                  <button
                    onClick={() => {
                      console.log(answers.one.selected);
                      if (answers.one.selected.indexOf(item.code) > -1) {
                        setAnswers({
                          ...answers,
                          one: {
                            selected: answers.one.selected.filter((code) => {
                              return code !== item.code;
                            }),
                          },
                        });

                        console.log(
                          answers.one.selected.filter((code) => {
                            code !== item.code;
                          })
                        );
                      } else {
                        setAnswers({
                          ...answers,
                          one: {
                            selected: [...answers.one.selected, item.code],
                          },
                        });
                        console.log({
                          ...answers,
                          one: {
                            selected: [...answers.one.selected, item.code],
                          },
                        });
                      }
                    }}
                    className={`  ${
                      answers.one.selected.indexOf(item.code) > -1
                        ? "bg-black text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    } w-full active:scale-[98%] transition duration-200 rounded-md  py-2 px-4 font-medium text-left text-lg`}
                  >
                    <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {choices.length > 0 && (
            <div className="flex items-start space-x-2 mt-4 w-full">
              <div>2.</div>
              <div className="w-full">
                <label>{choices[0].q}</label>
                <div className="space-y-1 mt-2 w-full">
                  {choices[0].a.map((item) => (
                    <button
                      onClick={() => {
                        if (answers.two.selected.indexOf(item.code) > -1) {
                          setAnswers({
                            ...answers,
                            two: {
                              selected: answers.two.selected.filter((code) => {
                                return code !== item.code;
                              }),
                            },
                          });
                        } else {
                          setAnswers({
                            ...answers,
                            two: {
                              selected: [item.code],
                            },
                          });
                        }
                      }}
                      className={`  ${
                        answers.two.selected.indexOf(item.code) > -1
                          ? "bg-black text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      } w-full active:scale-[98%] transition duration-200 rounded-md  py-2 px-4 font-medium text-left text-lg`}
                    >
                      <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2 mt-4 w-full">
            <div>3.</div>
            <div className="w-full">
              <label>Pick an ingredient</label>
              <div className="space-y-1 mt-2">
                {[
                  { text: "🍗&nbsp;&nbsp;Chicken", code: "chicken" },
                  { text: "🥩&nbsp;&nbsp;Beef", code: "beef" },
                  { text: "🐟&nbsp;&nbsp;Fish", code: "fish" },
                  { text: "🍣&nbsp;&nbsp;Tofu", code: "tofu" },
                  { text: "🍝&nbsp;&nbsp;Pasta", code: "pasta" },
                  { text: "🥦&nbsp;&nbsp;Vegetables", code: "vegetables" },
                  { text: "🍰&nbsp;&nbsp;Cake", code: "cake" },
                  { text: "🍞&nbsp;&nbsp;Bread", code: "bread" },
                ].map((item) => (
                  <button
                    onClick={() => {
                      if (answers.three.selected.indexOf(item.code) > -1) {
                        setAnswers({
                          ...answers,
                          three: {
                            selected: answers.three.selected.filter((code) => {
                              return code !== item.code;
                            }),
                          },
                        });
                      } else {
                        setAnswers({
                          ...answers,
                          three: {
                            selected: [item.code],
                          },
                        });
                      }
                    }}
                    className={`  ${
                      answers.three.selected.indexOf(item.code) > -1
                        ? "bg-black text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    } w-full active:scale-[98%] transition duration-200 rounded-md  py-2 px-4 font-medium text-left text-lg`}
                  >
                    <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {choices.length > 0 && (
            <div className="flex items-start space-x-2 mt-4 w-full">
              <div>4.</div>
              <div className="w-full">
                <label>{choices[1].q}</label>
                <div className="space-y-1 mt-2 w-full">
                  {choices[1].a.map((item) => (
                    <button
                      onClick={() => {
                        if (answers.four.selected.indexOf(item.code) > -1) {
                          setAnswers({
                            ...answers,
                            four: {
                              selected: answers.four.selected.filter((code) => {
                                return code !== item.code;
                              }),
                            },
                          });
                        } else {
                          setAnswers({
                            ...answers,
                            four: {
                              selected: [item.code],
                            },
                          });
                        }
                      }}
                      className={`  ${
                        answers.four.selected.indexOf(item.code) > -1
                          ? "bg-black text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      } w-full active:scale-[98%] transition duration-200 rounded-md  py-2 px-4 font-medium text-left text-lg`}
                    >
                      <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2 mt-4 w-full">
            <div>5.</div>
            <div className="w-full">
              <label>Dietary restrictions? (Select all that apply)</label>
              <div className="space-y-1 mt-2">
                {[
                  { text: "🌿&nbsp;&nbsp;Vegetarian", code: "vegetarian" },
                  { text: "🌱&nbsp;&nbsp;Vegan", code: "vegan" },
                  {
                    text: "🌾&nbsp;&nbsp;Gluten Free",
                    code: "gluten-free",
                  },
                ].map((item) => (
                  <button
                    onClick={() => {
                      console.log(answers.five.selected);
                      if (answers.five.selected.indexOf(item.code) > -1) {
                        setAnswers({
                          ...answers,
                          five: {
                            selected: answers.five.selected.filter((code) => {
                              return code !== item.code;
                            }),
                          },
                        });
                      } else {
                        setAnswers({
                          ...answers,
                          five: {
                            selected: [...answers.five.selected, item.code],
                          },
                        });
                      }
                    }}
                    className={`  ${
                      answers.five.selected.indexOf(item.code) > -1
                        ? "bg-black text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    } w-full active:scale-[98%] transition duration-200 rounded-md  py-2 px-4 font-medium text-left text-lg`}
                  >
                    <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {choices.length > 0 && (
            <div className="flex items-start space-x-2 mt-4 w-full mb-4">
              <div>6.</div>
              <div className="w-full">
                <label>{choices[2].q}</label>
                <div className="space-y-1 mt-2 w-full">
                  {choices[2].a.map((item) => (
                    <button
                      onClick={() => {
                        if (answers.six.selected.indexOf(item.code) > -1) {
                          setAnswers({
                            ...answers,
                            six: {
                              selected: answers.six.selected.filter((code) => {
                                return code !== item.code;
                              }),
                            },
                          });
                        } else {
                          setAnswers({
                            ...answers,
                            six: {
                              selected: [item.code],
                            },
                          });
                        }
                      }}
                      className={`  ${
                        answers.six.selected.indexOf(item.code) > -1
                          ? "bg-black text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      } w-full active:scale-[98%] transition duration-200 rounded-md  py-2 px-4 font-medium text-left text-lg`}
                    >
                      <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            className={`w-full text-center mt-4 transition border-2 border-black  text-lg font-medium py-2 text-white bg-black rounded-md ${
              Object.keys(answers)
                .map((question, i) => {
                  if (
                    answers[question].selected.length === 0 &&
                    question !== "five"
                  ) {
                    return question;
                  }
                })
                .filter((item) => item !== undefined).length > 0
                ? "cursor-not-allowed bg-gray-300 border-0 "
                : "hover:bg-white hover:text-black"
            }`}
            onClick={() => {
              const unResolved = Object.keys(answers)
                .map((question, i) => {
                  if (
                    answers[question].selected.length === 0 &&
                    question !== "five"
                  ) {
                    return question;
                  }
                })
                .filter((item) => item !== undefined);
              if (unResolved.length > 0) {
                // toast("Woah there, please finish all questions.");
                toast.error("Woah there, please finish all questions.", {
                  position: "bottom-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                  transition: Bounce,
                });
              }
              const resultString = `/results?flavors=${answers.one.selected.join(
                ","
              )}&ingredients=${
                answers.three.selected[0]
              }&restrictions=${answers.five.selected.join(",")}`;

              router.push(resultString);
            }}
            disabled={
              Object.keys(answers)
                .map((question, i) => {
                  if (
                    answers[question].selected.length === 0 &&
                    question !== "five"
                  ) {
                    return question;
                  }
                })
                .filter((item) => item !== undefined).length > 0
            }
          >
            Submit Now
          </button>
        </div>
      </main>
    </>
  );
}
