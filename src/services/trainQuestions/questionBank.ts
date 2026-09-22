/**
 * TEMPORARY frontend-only Train question bank (M4).
 *
 * Ported from Lovable `src/lib/questionBank.ts` for UX/content parity.
 * Maths: parameterised generators. English: curated seeds (may cycle when count > pool).
 *
 * NOT the production question bank. Do not treat as backend curriculum.
 * Loaded only through `loadTrainQuestions` - replace that seam later without redesigning Quiz UI.
 */

import type {
  OptionLetter,
  TrainBankDifficulty as Difficulty,
  TrainQuestionRow as QuestionRow,
  TrainSubjectType as SubjectType,
} from './types';

export type { OptionLetter, QuestionRow };

const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

/** Build a row from a question, the correct answer and 3 distractors. */
const build = (params: {
  subjectType: SubjectType;
  subject: string;
  difficulty: Difficulty;
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
}): QuestionRow => {
  const { subjectType, subject, difficulty, text, correct, distractors, explanation } =
    params;
  const unique = Array.from(new Set(distractors.map(String))).filter(
    (d) => d !== String(correct)
  );
  const options = shuffle([String(correct), ...unique.slice(0, 3)]);
  const letters: OptionLetter[] = ["A", "B", "C", "D", "E"];
  const correctIndex = options.indexOf(String(correct));
  const row: QuestionRow = {
    Question_ID: nextId(subjectType === "Maths" ? "M" : "E"),
    Subject_Type: subjectType,
    Subject: subject,
    Difficulty: difficulty,
    Question_Text: text,
    Option_A: options[0] ?? null,
    Option_B: options[1] ?? null,
    Option_C: options[2] ?? null,
    Option_D: options[3] ?? null,
    Option_E: options[4] ?? null,
    Correct_Option: letters[correctIndex] ?? "A",
    Explanation: explanation,
  };
  return row;
};

const near = (n: number, spread = 4): string[] => {
  const out = new Set<string>();
  const s = Math.max(1, Math.floor(spread));
  let guard = 0;
  while (out.size < 5 && guard < 64) {
    guard++;
    const delta = rnd(-s, s);
    if (delta !== 0) out.add(String(n + delta));
  }
  // If spread is too small to yield 5 distinct neighbours (e.g. spread=2 → only 4),
  // pad deterministically so distractor generation cannot hang.
  let step = 1;
  while (out.size < 5) {
    out.add(String(n + step));
    if (out.size >= 5) break;
    out.add(String(n - step));
    step++;
  }
  return [...out].slice(0, 5);
};

type Gen = (d: Difficulty) => {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
};

const scale = (d: Difficulty, easy: number, medium: number, hard: number) =>
  d === "Hard" ? hard : d === "Medium" ? medium : easy;

const MATHS_GENERATORS: Record<string, Gen> = {
  "Number Skills": (d) => {
    const max = scale(d, 50, 500, 5000);
    const a = rnd(10, max);
    const b = rnd(10, max);
    const sum = a + b;
    return {
      text: `What is ${a} + ${b}?`,
      correct: String(sum),
      distractors: near(sum, Math.max(3, Math.round(max / 20))),
      explanation: `Add the numbers column by column: ${a} + ${b} = ${sum}.`,
    };
  },
  Fractions: (d) => {
    const den = scale(d, 4, 8, 12);
    const a = rnd(1, den - 1);
    const b = rnd(1, den - 1);
    const num = a + b;
    return {
      text: `What is ${a}/${den} + ${b}/${den}? (give the answer as a fraction over ${den})`,
      correct: `${num}/${den}`,
      distractors: [
        `${a * b}/${den}`,
        `${num}/${den * 2}`,
        `${Math.max(1, Math.abs(a - b))}/${den}`,
        `${num + 1}/${den}`,
      ],
      explanation: `The denominators match, so add the numerators only: ${a} + ${b} = ${num}, giving ${num}/${den}.`,
    };
  },
  Decimals: (d) => {
    const places = scale(d, 1, 2, 2);
    const a = Number((rnd(10, 900) / Math.pow(10, places)).toFixed(places));
    const b = Number((rnd(10, 900) / Math.pow(10, places)).toFixed(places));
    const sum = Number((a + b).toFixed(places));
    return {
      text: `Work out ${a} + ${b}.`,
      correct: String(sum),
      distractors: [
        String(Number((a + b + 0.1).toFixed(places))),
        String(Number((a - b).toFixed(places))),
        String(Number((a + b - 1).toFixed(places))),
        String(Number((a * 10 + b).toFixed(places))),
      ],
      explanation: `Line up the decimal points and add: ${a} + ${b} = ${sum}.`,
    };
  },
  Percentages: (d) => {
    const pct = scale(d, 10, 25, 35);
    const base = rnd(2, scale(d, 10, 20, 40)) * 20;
    const ans = (base * pct) / 100;
    return {
      text: `What is ${pct}% of ${base}?`,
      correct: String(ans),
      distractors: near(ans, Math.max(2, Math.round(ans / 4))),
      explanation: `${pct}% of ${base} = ${base} × ${pct}/100 = ${ans}.`,
    };
  },
  "Ratio & Proportion": (d) => {
    const r1 = rnd(1, 4);
    const r2 = rnd(2, scale(d, 5, 7, 9));
    const parts = r1 + r2;
    const total = parts * rnd(2, scale(d, 4, 8, 12));
    const share = (total / parts) * r1;
    return {
      text: `£${total} is shared in the ratio ${r1} : ${r2}. How much is the smaller-ratio share (the ${r1} part)?`,
      correct: `£${share}`,
      distractors: [
        `£${total - share}`,
        `£${total / parts}`,
        `£${share + total / parts}`,
        `£${Math.round(total / 2)}`,
      ],
      explanation: `There are ${parts} equal parts, so one part = ${total} ÷ ${parts} = ${
        total / parts
      }. The ${r1} part = ${total / parts} × ${r1} = ${share}.`,
    };
  },
  Algebra: (d) => {
    const m = rnd(2, scale(d, 5, 9, 12));
    const x = rnd(2, scale(d, 8, 12, 20));
    const c = rnd(1, scale(d, 10, 30, 60));
    const total = m * x + c;
    return {
      text: `Solve for x:  ${m}x + ${c} = ${total}`,
      correct: String(x),
      distractors: near(x, 4),
      explanation: `Subtract ${c} from both sides: ${m}x = ${total - c}. Divide by ${m}: x = ${x}.`,
    };
  },
  Geometry: (d) => {
    const w = rnd(3, scale(d, 9, 15, 25));
    const h = rnd(3, scale(d, 9, 15, 25));
    const area = w * h;
    return {
      text: `A rectangle measures ${w} cm by ${h} cm. What is its area?`,
      correct: `${area} cm²`,
      distractors: [
        `${2 * (w + h)} cm²`,
        `${area + w} cm²`,
        `${w + h} cm²`,
        `${area - h} cm²`,
      ],
      explanation: `Area of a rectangle = length × width = ${w} × ${h} = ${area} cm².`,
    };
  },
  Angles: (d) => {
    const a = rnd(20, scale(d, 70, 110, 140));
    const total = d === "Easy" ? 180 : d === "Medium" ? 180 : 360;
    const b = rnd(20, total - a - 20);
    const missing = total - a - b;
    const shape =
      total === 180 ? "on a straight line" : "around a point";
    return {
      text: `Two angles ${shape} measure ${a}° and ${b}°. What is the missing angle?`,
      correct: `${missing}°`,
      distractors: [`${missing + 10}°`, `${missing - 10}°`, `${a + b}°`, `${180 - missing}°`],
      explanation: `Angles ${shape} add to ${total}°, so the missing angle = ${total} − ${a} − ${b} = ${missing}°.`,
    };
  },
  Measurement: (d) => {
    const m = rnd(2, scale(d, 9, 40, 120));
    const cm = m * 100;
    return {
      text: `Convert ${m} metres into centimetres.`,
      correct: `${cm} cm`,
      distractors: [`${m * 10} cm`, `${m * 1000} cm`, `${cm / 2} cm`, `${cm + 100} cm`],
      explanation: `There are 100 cm in 1 m, so ${m} × 100 = ${cm} cm.`,
    };
  },
  "Word Problems": (d) => {
    const price = rnd(2, scale(d, 6, 12, 25));
    const qty = rnd(3, scale(d, 8, 12, 20));
    const paid = price * qty + rnd(1, 20);
    const change = paid - price * qty;
    return {
      text: `A pack of stickers costs £${price}. Maya buys ${qty} packs and pays with £${paid}. How much change does she get?`,
      correct: `£${change}`,
      distractors: [
        `£${change + price}`,
        `£${price * qty}`,
        `£${Math.abs(change - qty)}`,
        `£${paid - price}`,
      ],
      explanation: `Cost = ${price} × ${qty} = ${price * qty}. Change = ${paid} − ${
        price * qty
      } = ${change}.`,
    };
  },
};

interface EnglishSeed {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const ENGLISH_SEEDS: Record<string, Record<Difficulty, EnglishSeed[]>> = {
  "Synonyms & Antonyms": {
    Easy: [
      {
        text: "Which word means the SAME as 'happy'?",
        correct: "cheerful",
        distractors: ["angry", "tired", "quiet"],
        explanation: "'Cheerful' is a synonym of 'happy'; the others describe different moods.",
      },
      {
        text: "Which word is the OPPOSITE of 'ancient'?",
        correct: "modern",
        distractors: ["old", "historic", "faded"],
        explanation: "'Ancient' means very old, so its antonym is 'modern'.",
      },
    ],
    Medium: [
      {
        text: "Choose the closest synonym for 'reluctant'.",
        correct: "unwilling",
        distractors: ["eager", "careless", "generous"],
        explanation: "'Reluctant' means hesitant or unwilling to act.",
      },
      {
        text: "Which word is the OPPOSITE of 'scarce'?",
        correct: "plentiful",
        distractors: ["rare", "limited", "hidden"],
        explanation: "'Scarce' means in short supply, so 'plentiful' is its antonym.",
      },
    ],
    Hard: [
      {
        text: "Choose the closest synonym for 'obstinate'.",
        correct: "stubborn",
        distractors: ["obvious", "flexible", "anxious"],
        explanation: "'Obstinate' describes someone who refuses to change their mind — stubborn.",
      },
      {
        text: "Which word is the OPPOSITE of 'candid'?",
        correct: "secretive",
        distractors: ["honest", "frank", "open"],
        explanation: "'Candid' means open and honest; 'secretive' is the opposite.",
      },
    ],
  },
  "Word Analogies": {
    Easy: [
      {
        text: "Puppy is to dog as kitten is to ____.",
        correct: "cat",
        distractors: ["mouse", "kennel", "milk"],
        explanation: "A puppy is a young dog, so a kitten is a young cat.",
      },
      {
        text: "Hot is to cold as day is to ____.",
        correct: "night",
        distractors: ["sun", "morning", "week"],
        explanation: "The relationship is opposites: hot/cold, day/night.",
      },
    ],
    Medium: [
      {
        text: "Author is to book as composer is to ____.",
        correct: "symphony",
        distractors: ["orchestra", "piano", "audience"],
        explanation: "An author creates a book; a composer creates a symphony (creator â†’ creation).",
      },
      {
        text: "Thirsty is to drink as tired is to ____.",
        correct: "sleep",
        distractors: ["run", "yawn", "bed"],
        explanation: "The link is need â†’ remedy: thirst is solved by drinking, tiredness by sleeping.",
      },
    ],
    Hard: [
      {
        text: "Cartographer is to map as archaeologist is to ____.",
        correct: "artefact",
        distractors: ["globe", "compass", "museum"],
        explanation: "A cartographer works with maps; an archaeologist works with artefacts.",
      },
      {
        text: "Meticulous is to careless as frugal is to ____.",
        correct: "extravagant",
        distractors: ["thrifty", "wealthy", "modest"],
        explanation: "The pairs are antonyms: meticulous/careless, frugal/extravagant.",
      },
    ],
  },
  "Odd One Out": {
    Easy: [
      {
        text: "Which is the odd one out?",
        correct: "carrot",
        distractors: ["apple", "banana", "pear"],
        explanation: "Apple, banana and pear are fruits; a carrot is a vegetable.",
      },
      {
        text: "Which is the odd one out?",
        correct: "sofa",
        distractors: ["robin", "sparrow", "eagle"],
        explanation: "The others are all birds.",
      },
    ],
    Medium: [
      {
        text: "Which is the odd one out?",
        correct: "violin",
        distractors: ["trumpet", "flute", "clarinet"],
        explanation: "Trumpet, flute and clarinet are wind instruments; a violin is a string instrument.",
      },
      {
        text: "Which is the odd one out?",
        correct: "Paris",
        distractors: ["France", "Spain", "Italy"],
        explanation: "France, Spain and Italy are countries; Paris is a city.",
      },
    ],
    Hard: [
      {
        text: "Which is the odd one out?",
        correct: "quickly",
        distractors: ["swift", "rapid", "brisk"],
        explanation: "'Swift', 'rapid' and 'brisk' are adjectives; 'quickly' is an adverb.",
      },
      {
        text: "Which is the odd one out?",
        correct: "mercury",
        distractors: ["copper", "iron", "zinc"],
        explanation: "All are metals, but mercury is the only one that is liquid at room temperature.",
      },
    ],
  },
  "Shuffled Sentences": {
    Easy: [
      {
        text: "Rearrange to make a sentence. Which word is left over?  'dog / the / barked / loudly / banana'",
        correct: "banana",
        distractors: ["barked", "loudly", "dog"],
        explanation: "'The dog barked loudly' uses every word except 'banana'.",
      },
      {
        text: "Which is the correct order?  'school / to / walked / she'",
        correct: "She walked to school.",
        distractors: ["Walked she to school.", "To school she walked to.", "School walked she to."],
        explanation: "Subject (She) + verb (walked) + place phrase (to school).",
      },
    ],
    Medium: [
      {
        text: "Rearrange to make a sentence. Which word is left over?  'rain / because / match / cancelled / the / was / happy'",
        correct: "happy",
        distractors: ["rain", "cancelled", "because"],
        explanation: "'The match was cancelled because of rain' — 'happy' is unused.",
      },
      {
        text: "Which is the correct order?  'quietly / library / in / read / the / we'",
        correct: "We read quietly in the library.",
        distractors: [
          "We in the library read quietly.",
          "Quietly the library we read in.",
          "In we read the library quietly.",
        ],
        explanation: "Subject + verb + adverb + prepositional phrase is the natural order.",
      },
    ],
    Hard: [
      {
        text: "Rearrange to make a sentence. Which word is left over?  'although / tired / finished / she / was / she / race / the / never'",
        correct: "never",
        distractors: ["although", "finished", "tired"],
        explanation: "'Although she was tired, she finished the race' — 'never' is not needed.",
      },
      {
        text: "Which is the correct order?  'having / homework / his / finished / television / watched / he'",
        correct: "Having finished his homework, he watched television.",
        distractors: [
          "He having watched television finished his homework.",
          "Finished having his homework he television watched.",
          "His homework having he finished watched television.",
        ],
        explanation: "The participle clause comes first, then the main clause.",
      },
    ],
  },
  "Cloze Passages": {
    Easy: [
      {
        text: "Choose the best word: 'The sun was so bright that Ella had to ____ her eyes.'",
        correct: "shield",
        distractors: ["shout", "shape", "share"],
        explanation: "'Shield' means to protect — the only word that fits the meaning.",
      },
      {
        text: "Choose the best word: 'We had to be quiet ____ the baby was sleeping.'",
        correct: "because",
        distractors: ["although", "unless", "whether"],
        explanation: "'Because' gives the reason, which is what the sentence needs.",
      },
    ],
    Medium: [
      {
        text: "Choose the best word: 'The explorer's ____ determination kept the team moving through the storm.'",
        correct: "unwavering",
        distractors: ["uncertain", "unwilling", "unaware"],
        explanation: "'Unwavering' means steady and firm, matching 'kept the team moving'.",
      },
      {
        text: "Choose the best word: 'Rain fell steadily; ____, the festival continued.'",
        correct: "nevertheless",
        distractors: ["therefore", "similarly", "meanwhile"],
        explanation: "The clauses contrast, so a contrasting connective is needed.",
      },
    ],
    Hard: [
      {
        text: "Choose the best word: 'Her argument was so ____ that even her critics conceded the point.'",
        correct: "cogent",
        distractors: ["fragile", "verbose", "obscure"],
        explanation: "'Cogent' means clear and convincing — the only word that explains why critics agreed.",
      },
      {
        text: "Choose the best word: 'The manuscript was ____ preserved, despite being four centuries old.'",
        correct: "remarkably",
        distractors: ["barely", "reluctantly", "rarely"],
        explanation: "'Despite' signals surprise, so 'remarkably' fits the contrast.",
      },
    ],
  },
  "Comprehension: Literal": {
    Easy: [
      {
        text: "'Tom packed a torch, a map and two apples before setting off at six.' What did Tom pack?",
        correct: "A torch, a map and two apples",
        distractors: ["A torch and a compass", "A map and a bottle of water", "Two apples only"],
        explanation: "The text lists exactly three items: a torch, a map and two apples.",
      },
      {
        text: "'The library closes at four on Saturdays.' When does the library close on Saturdays?",
        correct: "Four o'clock",
        distractors: ["Six o'clock", "Midday", "It does not close"],
        explanation: "The text states the closing time directly.",
      },
    ],
    Medium: [
      {
        text: "'Despite the drizzle, forty-two runners lined up at the start; three withdrew before the gun.' How many runners started the race?",
        correct: "39",
        distractors: ["42", "45", "3"],
        explanation: "42 lined up and 3 withdrew, so 42 − 3 = 39 started.",
      },
      {
        text: "'Marta's grandmother arrived from Lisbon on Tuesday and stayed a fortnight.' How long did she stay?",
        correct: "Two weeks",
        distractors: ["Two days", "One month", "Four weeks"],
        explanation: "A fortnight means two weeks.",
      },
    ],
    Hard: [
      {
        text: "'The lighthouse, built in 1834 and automated in 1979, has never once failed.' In which year was it automated?",
        correct: "1979",
        distractors: ["1834", "1934", "1897"],
        explanation: "The text gives 1834 as the build date and 1979 as the automation date.",
      },
      {
        text: "'Only the eastern wing, closed since the flood, remains unrestored.' Which part of the building is unrestored?",
        correct: "The eastern wing",
        distractors: ["The western wing", "The whole building", "The roof"],
        explanation: "The sentence names the eastern wing specifically.",
      },
    ],
  },
  "Comprehension: Inferential": {
    Easy: [
      {
        text: "'Sam pulled his coat tighter and stamped his feet.' What can we infer?",
        correct: "It was cold",
        distractors: ["He was hungry", "He was late", "He was angry"],
        explanation: "Tightening a coat and stamping feet are clues that suggest cold weather.",
      },
      {
        text: "'Ava's hands shook as she stepped onto the stage.' How does Ava most likely feel?",
        correct: "Nervous",
        distractors: ["Bored", "Sleepy", "Amused"],
        explanation: "Shaking hands before performing suggests nerves.",
      },
    ],
    Medium: [
      {
        text: "'The kitchen light was still on and yesterday's post lay unopened on the mat.' What can we infer?",
        correct: "Nobody had been home since the day before",
        distractors: [
          "The family had just returned",
          "The postman had not delivered",
          "The kitchen had been cleaned",
        ],
        explanation: "Unopened post and a light left on suggest the house has been empty.",
      },
      {
        text: "'Every time the topic arose, Daniel suddenly remembered an urgent errand.' What does this suggest?",
        correct: "He was avoiding the topic",
        distractors: ["He was very busy", "He had a poor memory", "He enjoyed the subject"],
        explanation: "The repeated pattern implies deliberate avoidance rather than coincidence.",
      },
    ],
    Hard: [
      {
        text: "'The captain praised the crew warmly, then asked the first mate to remain behind.' What is implied?",
        correct: "The first mate was to be spoken to privately",
        distractors: [
          "The crew had been dismissed",
          "The first mate was being promoted publicly",
          "The captain disliked the crew",
        ],
        explanation: "Asking one person to stay after public praise implies a private conversation.",
      },
      {
        text: "'Her thanks were perfectly polite, and perfectly brief.' What does the narrator suggest about her thanks?",
        correct: "They were sincere in form but cool in feeling",
        distractors: [
          "They were rude and loud",
          "They were long and emotional",
          "They were accidental",
        ],
        explanation: "The repeated 'perfectly' with 'brief' hints at politeness without warmth.",
      },
    ],
  },
  "Spelling Rules & Traps": {
    Easy: [
      {
        text: "Which spelling is correct?",
        correct: "friend",
        distractors: ["freind", "frend", "frienned"],
        explanation: "'Friend' follows the 'i before e' pattern here: f-r-i-e-n-d.",
      },
      {
        text: "Which spelling is correct?",
        correct: "because",
        distractors: ["becuase", "becouse", "becasue"],
        explanation: "'Because' is spelled b-e-c-a-u-s-e.",
      },
    ],
    Medium: [
      {
        text: "Which spelling is correct?",
        correct: "necessary",
        distractors: ["neccessary", "necesary", "nesessary"],
        explanation: "'Necessary' has one c and two s's.",
      },
      {
        text: "Which spelling is correct?",
        correct: "separate",
        distractors: ["seperate", "sepparate", "separete"],
        explanation: "'Separate' contains 'a rat': sep-a-rate.",
      },
    ],
    Hard: [
      {
        text: "Which spelling is correct?",
        correct: "conscientious",
        distractors: ["consciencious", "conscentious", "conscienscious"],
        explanation: "'Conscientious' = conscien + tious.",
      },
      {
        text: "Which spelling is correct?",
        correct: "embarrassment",
        distractors: ["embarassment", "embarrasment", "embarasment"],
        explanation: "'Embarrassment' has double r and double s.",
      },
    ],
  },
  "Homophones & Confused Words": {
    Easy: [
      {
        text: "Choose the correct word: 'They left ____ bags in the hall.'",
        correct: "their",
        distractors: ["there", "they're", "theirs'"],
        explanation: "'Their' shows possession; 'there' is a place and 'they're' means 'they are'.",
      },
      {
        text: "Choose the correct word: 'The cake is ____ sweet for me.'",
        correct: "too",
        distractors: ["to", "two", "tow"],
        explanation: "'Too' means excessively.",
      },
    ],
    Medium: [
      {
        text: "Choose the correct word: 'The medicine had no ____ on the pain.'",
        correct: "effect",
        distractors: ["affect", "effekt", "afect"],
        explanation: "'Effect' is the noun (a result); 'affect' is usually the verb.",
      },
      {
        text: "Choose the correct word: 'Please ____ quiet during the exam.'",
        correct: "stay",
        distractors: ["stationery", "stationary", "staid"],
        explanation: "Only 'stay' fits; 'stationary' means not moving and 'stationery' means writing materials.",
      },
    ],
    Hard: [
      {
        text: "Choose the correct word: 'The chef will ____ the sauce before serving.'",
        correct: "complement",
        distractors: ["compliment", "complament", "complimant"],
        explanation: "'Complement' means to complete or go well with; 'compliment' is praise.",
      },
      {
        text: "Choose the correct word: 'Her ____ advice saved the project.'",
        correct: "principled",
        distractors: ["principal", "principle", "principaled"],
        explanation: "'Principled' is the adjective; 'principal' means chief and 'principle' is a rule.",
      },
    ],
  },
  "Grammar & Punctuation": {
    Easy: [
      {
        text: "Which sentence is punctuated correctly?",
        correct: "Where are my shoes?",
        distractors: ["Where are my shoes.", "where are my shoes?", "Where are my shoes!?"],
        explanation: "A question needs a capital letter and a question mark.",
      },
      {
        text: "Choose the correct verb: 'The dogs ____ in the garden.'",
        correct: "are playing",
        distractors: ["is playing", "was playing", "plays"],
        explanation: "'Dogs' is plural, so it takes the plural verb 'are playing'.",
      },
    ],
    Medium: [
      {
        text: "Which sentence uses the apostrophe correctly?",
        correct: "The girls' coats were soaked.",
        distractors: [
          "The girl's coats were soaked (many girls).",
          "The girls's coats were soaked.",
          "The girls coat's were soaked.",
        ],
        explanation: "For a plural noun ending in s, the apostrophe goes after the s.",
      },
      {
        text: "Which sentence is punctuated correctly?",
        correct: "After the storm, we swept the yard.",
        distractors: [
          "After the storm we, swept the yard.",
          "After, the storm we swept the yard.",
          "After the storm we swept, the yard.",
        ],
        explanation: "A comma follows the introductory phrase 'After the storm'.",
      },
    ],
    Hard: [
      {
        text: "Which sentence uses the semicolon correctly?",
        correct: "The rain stopped; the match resumed.",
        distractors: [
          "The rain stopped; and the match resumed.",
          "The rain stopped; because the match resumed.",
          "The rain; stopped the match resumed.",
        ],
        explanation: "A semicolon joins two complete, closely related clauses without a conjunction.",
      },
      {
        text: "Which sentence is grammatically correct?",
        correct: "Neither the teacher nor the pupils were ready.",
        distractors: [
          "Neither the teacher nor the pupils was ready.",
          "Neither the teacher or the pupils were ready.",
          "Neither the teacher nor the pupils is ready.",
        ],
        explanation: "With 'neither…nor', the verb agrees with the nearer subject ('pupils' — plural).",
      },
    ],
  },
};

const mathsQuestions = (
  subject: string,
  difficulty: Difficulty,
  count: number
): QuestionRow[] => {
  const gen = MATHS_GENERATORS[subject] ?? MATHS_GENERATORS["Number Skills"];
  const rows: QuestionRow[] = [];
  const seen = new Set<string>();
  let guard = 0;
  // Prefer unique stems first (Lovable mathsQuestions).
  while (rows.length < count && guard < count * 20) {
    guard++;
    const item = gen(difficulty);
    if (seen.has(item.text)) continue;
    seen.add(item.text);
    rows.push(
      build({
        subjectType: "Maths",
        subject,
        difficulty,
        ...item,
      })
    );
  }
  // Finite generators (e.g. Fractions Easy: den=4 → only 9 unique texts) exhaust
  // uniqueness before `count`. Fill the remainder by continuing to generate,
  // allowing repeats — same fill-to-count idea as English seed cycling.
  while (rows.length < count) {
    const item = gen(difficulty);
    rows.push(
      build({
        subjectType: "Maths",
        subject,
        difficulty,
        ...item,
      })
    );
  }
  return rows;
};

const englishQuestions = (
  subject: string,
  difficulty: Difficulty,
  count: number
): QuestionRow[] => {
  const seeds = ENGLISH_SEEDS[subject]?.[difficulty] ?? [];
  const rows: QuestionRow[] = [];
  const pool = shuffle(seeds);
  let i = 0;
  while (rows.length < count && pool.length > 0) {
    const seed = pool[i % pool.length];
    i++;
    rows.push(
      build({
        subjectType: "English",
        subject,
        difficulty,
        ...seed,
      })
    );
  }
  return rows;
};

/** Produce `count` questions for one topic + difficulty. */
export const generateQuestions = (params: {
  subjectType: SubjectType;
  subject: string;
  difficulty: Difficulty;
  count: number;
}): QuestionRow[] => {
  const { subjectType, subject, difficulty, count } = params;
  return subjectType === "English"
    ? englishQuestions(subject, difficulty, count)
    : mathsQuestions(subject, difficulty, count);
};

export const shuffleRows = shuffle;
