// Registry is a function — evaluated lazily, never at import time
function getRegistry() {
  return {
    'python': pythonCourse,
    'javascript': jsCourse,
    'cpp': cppCourse,
    'java': javaCourse,
    'html': htmlCourse,
    'css': cssCourse,
    'dsa': dsaCourse,
    'sql': sqlCourse,
  };
}

// Fallback totalChapters to match backend DEFAULT_COURSES.totalLectures
const BACKEND_TOTAL_CHAPTERS = {
  python: 25, javascript: 25, java: 25, claude: 15, aws: 16, cpp: 25,
  azure: 16, gcp: 16, ml: 20, dl: 22, nlp: 19, data: 17, sql: 15,
  spark: 21, docker: 15, k8s: 20, security: 15, dsa: 24, html: 22, css: 24
};

export function getCourseData(courseId) {
  const registry = getRegistry();
  const normalizedId = (courseId ?? '').toLowerCase().trim();
  const course = registry[normalizedId];
  if (!course) {
    console.warn(`[LevelData] Unknown courseId: "${courseId}" (normalized: "${normalizedId}")`);
    return {
      language: courseId ?? 'Unknown',
      accentColor: '#6366f1',
      accentLight: '#818cf8',
      totalChapters: BACKEND_TOTAL_CHAPTERS[normalizedId] || 0,
      chapters: [],
    };
  }
  return course;
}

export function getChapterData(courseId, no) {
  const course = getCourseData(courseId);
  return course.chapters.find((ch) => ch.no === no) ?? null;
}

export function getPartData(courseId, no, partId) {
  const chapter = getChapterData(courseId, no);
  if (!chapter || !chapter.parts) return null;
  // Handle both string and numeric IDs
  return chapter.parts.find((p) => p.id === partId || p.id === parseInt(partId)) ?? null;
}


export function getAllCourses() {
  return Object.entries(getRegistry()).map(([id, course]) => ({
    id,
    language: course.language,
    accentColor: course.accentColor,
    accentLight: course.accentLight,
    totalChapters: course.totalChapters,
  }));
}


export const jsCourse = {
  language: "JavaScript",
  accentColor: "#ef4444",
  accentLight: "#f87171",
  totalChapters: 25,
  chapters: [
    {
      no: 1,
      name: "Introduction to JavaScript",
      difficulty: "Beginner",
      totalXP: 100,
      parts: [
        {
          id: 1,
          title: "What is JavaScript?",
          subtitle: "Origin & the big picture",
          xp: 20,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "Born in 10 days. Used by billions.",
              body: "JavaScript was created by Brendan Eich in 1995 in just 10 days. Built to make web pages interactive, it's now the only language natively understood by every browser. Think of it as the brain of the web: HTML is the skeleton, CSS is the skin, JS is what makes it move. Today it also runs on servers (Node.js), mobile apps (React Native), and desktop apps like VS Code and Slack — via Electron.",
              code: `// This runs in your browser console
console.log("JavaScript is everywhere!");`,
              codeNote: "Try it: Press F12 → Console tab → paste this → hit Enter.",
            },
          ],
        },
        {
          id: 2,
          title: "Key Features",
          subtitle: "What makes JS unique",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Zero setup. Runs anywhere. Thinks for itself.",
              body: "JS runs directly in your browser — no compiler, no install. It's dynamically typed, meaning you don't declare variable types; JS figures it out. It's also event-driven (responds to clicks, key presses) and interpreted (runs line by line). It supports both Object-Oriented and Functional styles, so you write code the way you think.",
              code: `let x = 42;       // number
x = "hello";      // now a string — totally valid
console.log(x);   // "hello"`,
              codeNote: "The same variable can hold any type at any time. That's dynamic typing.",
            },
          ],
        },
        {
          id: 3,
          title: "What JS Is Used For",
          subtitle: "Real-world applications",
          xp: 20,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "One language. Every platform.",
              body: "JS powers everything interactive on the web — clicks, animations, live search, form validation. It can directly manipulate any element on the page in real time. Beyond the browser, Node.js lets it run on servers, React Native builds mobile apps, and Electron builds desktop apps. Every major platform. One language.",
              code: `// Manipulate the page directly
document.getElementById("title").innerText = "JS took over!";
 
// Show a quick popup
alert("Welcome to Codify!");`,
              codeNote: "JS can read and rewrite any element on the page instantly.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Prove you got it",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this code output to the console?",
              code: `let name = "Codify";
console.log("Welcome to " + name + "!");`,
              options: [
                "Welcome to Codify!",
                "let name Codify",
                "undefined",
                "Error: name is not defined",
              ],
              correct: 0,
              body: "The + operator joins strings. So \"Welcome to \" + \"Codify\" + \"!\" = \"Welcome to Codify!\"",
            },
            {
              id: "c2",
              question: "Which line pops up a dialog box in the browser?",
              code: null,
              options: [
                `console.log("Hello")`,
                `document.write("Hello")`,
                `alert("Hello")`,
                `print("Hello")`,
              ],
              correct: 2,
              body: "alert() triggers the browser's built-in popup dialog. console.log() writes to the dev console instead.",
            },
            {
              id: "c3",
              question: "JavaScript was originally created to run where?",
              code: null,
              options: [
                "On servers using Node.js",
                "Inside web browsers",
                "On mobile devices",
                "In desktop applications",
              ],
              correct: 1,
              body: "JS was created in 1995 specifically to run inside browsers and add interactivity to web pages. Server-side JS came much later with Node.js.",
            },
          ],
        },
        {
          id: 5,
          title: "Code Challenge",
          subtitle: "Write your first function",
          xp: 50,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.4)",
          codeChallenge: {
            prompt: "Write a function called greet that takes a name and returns a greeting string.",
            description: "The function should accept one parameter (name) and return the string \"Hello, <name>!\" — for example, greet(\"Alice\") should return \"Hello, Alice!\".",
            starterCode: `function greet(name) {\n  // write your code here\n}`,
            hint: "Use string concatenation or template literals: \"Hello, \" + name + \"!\" or `Hello, ${name}!`",
            testCases: [
              { call: 'greet("Alice")', expected: "Hello, Alice!", label: "greet(\"Alice\")" },
              { call: 'greet("World")', expected: "Hello, World!", label: "greet(\"World\")" },
              { call: 'greet("Codingo")', expected: "Hello, Codingo!", label: "greet(\"Codingo\")" },
            ],
          },
        },
      ],
    },

    {
      no: 2,
      name: "Variables & Data Types",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "var, let & const",
          subtitle: "Three ways to store data",
          xp: 25,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Variables are just labelled boxes for your data.",
            body: "Think of a variable as a named box that holds a value. JavaScript gives you three ways to create one. Use const when the value will never change — it's your safe default. Use let when you know you'll need to update the value later. Avoid var — it's from older JavaScript, behaves in confusing ways, and you'll almost never need it in modern code.",
            code: `const name = "Alice";   // const — value stays the same
let score = 0;          // let — we'll update this later
score = 10;             // ✓ works fine

// Trying to change a const throws an error
// name = "Bob";        // ✗ TypeError: Assignment to constant

// var is old — avoid it
var old = "legacy";     // unpredictable behaviour, skip this`,
            codeNote: "Simple rule: always use const first. If you later need to change it, switch to let. Never use var.",
          }],
        },
        {
          id: 2,
          title: "Data Types",
          subtitle: "What kind of value is it?",
          xp: 25,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Every value in JS has a type. Here are the main ones.",
            body: "JavaScript has different kinds of values. A String is text (wrapped in quotes). A Number is any numeric value — whole numbers, decimals, negatives. A Boolean is simply true or false. null means a value is intentionally empty. undefined means a variable exists but hasn't been given a value yet. You'll work with these five constantly — the others (BigInt, Symbol) are specialist tools you'll meet later.",
            code: `const username = "Alice";     // String  — text in quotes
const age      = 25;          // Number  — any numeric value
const isOnline = true;        // Boolean — true or false only
const cart     = null;        // null    — deliberately empty
let   address;                // undefined — declared, no value yet

// typeof tells you what type a value is
console.log(typeof username);  // "string"
console.log(typeof age);       // "number"
console.log(typeof isOnline);  // "boolean"
console.log(typeof cart);      // "object"  ← JS quirk, null isn't an object!
console.log(typeof address);   // "undefined"`,
            codeNote: "typeof null shows 'object' — this is a known JavaScript bug that has existed since 1995 and can't be changed without breaking old websites.",
          }],
        },
        {
          id: 3,
          title: "Dynamic Typing",
          subtitle: "JS adapts the type at runtime",
          xp: 25,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "In JS, variables don't have a fixed type — their value does.",
            body: "Unlike some languages where you say 'this variable is always a number', JavaScript lets a variable hold any type — and you can change it anytime. This is called dynamic typing. It makes JS quick to write, but it also means you need to be careful. The typeof keyword is your tool to check what type a variable currently holds before working with it.",
            code: `let data = 42;
console.log(typeof data);  // "number"

data = "forty-two";        // reassigned to a string — totally fine
console.log(typeof data);  // "string"

data = true;               // now a boolean
console.log(typeof data);  // "boolean"

// typeof is useful for safety checks
function double(n) {
  if (typeof n !== "number") return "Please pass a number!";
  return n * 2;
}

console.log(double(5));     // 10
console.log(double("hi"));  // "Please pass a number!"`,
            codeNote: "Use typeof whenever you receive data from outside your code — like user input or an API — to make sure it's the type you expect.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Test what you learned",
          xp: 45,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this print? Think about what const and let each do.",
              code: `const x = 5;
let y = x;
y = 10;
console.log(x);`,
              options: ["5", "10", "undefined", "TypeError"],
              correct: 0,
              body: "When you write y = x, JavaScript copies the value 5 into y. Changing y to 10 only affects y — x still holds 5. const and let are separate boxes.",
            },
            {
              id: "c2",
              question: "Which line causes an error?",
              code: `const a = 1;
let b = 2;
var c = 3;`,
              options: [
                "a = 5  (reassigning a const)",
                "b = 5  (reassigning a let)",
                "c = 5  (reassigning a var)",
                "None — all three work fine",
              ],
              correct: 0,
              body: "const means the value is locked. Trying to reassign it with a = 5 throws a TypeError. let and var can both be reassigned freely.",
            },
            {
              id: "c3",
              question: "What does typeof null return — and why is it surprising?",
              code: `console.log(typeof null);`,
              options: ['"null"', '"undefined"', '"object"', '"boolean"'],
              correct: 2,
              body: "It returns 'object' — which is wrong! null is not an object, it just means 'empty'. This is a famous old bug in JavaScript that was never fixed because changing it would break millions of existing websites.",
            },
          ],
        },
        {
          id: 5,
          title: "Code Challenge",
          subtitle: "Work with variables",
          xp: 50,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.4)",
          codeChallenge: {
            prompt: "Write a function called swapCase that takes a string and swaps casing.",
            description: "Given a string, return a new string where every uppercase letter becomes lowercase, and every lowercase letter becomes uppercase. For example: swapCase(\"Hello\") → \"hELLO\"",
            starterCode: `function swapCase(str) {\n  // write your code here\n}`,
            hint: "Loop through each character. Use char === char.toUpperCase() to detect uppercase. Build a result string.",
            testCases: [
              { call: 'swapCase("Hello")', expected: "hELLO", label: 'swapCase("Hello")' },
              { call: 'swapCase("JavaScript")', expected: "jAVAsCRIPT", label: 'swapCase("JavaScript")' },
              { call: 'swapCase("abc")', expected: "ABC", label: 'swapCase("abc")' },
            ],
          },
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 3 — Operators & Expressions (120 XP)
    // ─────────────────────────────────────────────
    {
      no: 3,
      name: "Operators & Expressions",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Arithmetic Operators",
          subtitle: "Math in JavaScript",
          xp: 25,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "JS does math — and a few tricks.",
            body: "The standard operators (+, -, *, /) work as expected. `%` gives the remainder (modulo) — useful for even/odd checks. `**` is exponentiation (power). `++` and `--` increment/decrement by 1. The `+` operator doubles as string concatenation — if either side is a string, JS converts the other side too.",
            code: `console.log(10 + 3);    // 13
console.log(10 - 3);    // 7
console.log(10 * 3);    // 30
console.log(10 / 3);    // 3.333...
console.log(10 % 3);    // 1  ← remainder
console.log(2 ** 10);   // 1024 ← exponentiation

// String + Number = String concatenation!
console.log("Price: " + 99);  // "Price: 99"
console.log("5" + 3);         // "53" ← watch out!
console.log("5" - 3);         // 2   ← subtraction converts to number`,
            codeNote: "+ is special: it concatenates strings. All other math operators coerce strings to numbers.",
          }],
        },
        {
          id: 2,
          title: "Comparison Operators",
          subtitle: "== vs === and when to use each",
          xp: 25,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Always use ===. Never use ==.",
            body: "Comparison operators return true or false. `===` (strict equality) checks both value AND type — it's the safe choice. `==` (loose equality) converts types before comparing, causing bugs. `!==` is strict not-equal. `<`, `>`, `<=`, `>=` compare numbers and strings alphabetically. Rule: use === everywhere, == never.",
            code: `// Loose == (type coercion — dangerous)
console.log(5 == "5");    // true  ← dangerous!
console.log(0 == false);  // true  ← dangerous!
console.log("" == false); // true  ← dangerous!

// Strict === (safe)
console.log(5 === "5");   // false ← correct
console.log(0 === false); // false ← correct

// Comparison
console.log(10 > 5);      // true
console.log(10 <= 10);    // true
console.log("b" > "a");   // true (alphabetical)`,
            codeNote: "Memorise: === compares value + type. == only compares value after coercing both sides.",
          }],
        },
        {
          id: 3,
          title: "Logical & Ternary Operators",
          subtitle: "&&, ||, ! and the one-liner if",
          xp: 25,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Combine conditions. Write less. Do more.",
            body: "`&&` (AND) returns true only if both sides are truthy. `||` (OR) returns true if either side is truthy. `!` flips a boolean. Crucially, && and || don't just return true/false — they return the actual value that decided the result. The ternary operator `condition ? ifTrue : ifFalse` is a compact if/else for simple decisions.",
            code: `// Logical operators
console.log(true && false);   // false
console.log(true || false);   // true
console.log(!true);           // false

// Short-circuit: returns the deciding value
console.log("Alice" && "Bob");  // "Bob"  (both truthy, returns last)
console.log(null && "Bob");     // null   (null is falsy, stops early)
console.log(null || "Guest");   // "Guest" (null is falsy, tries right side)

// Ternary
const age = 20;
const pass = age >= 18 ? "Allowed" : "Denied";
console.log(pass);  // "Allowed"`,
            codeNote: "Short-circuit evaluation: && stops at the first falsy, || stops at the first truthy. This powers default values.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Operators & expressions quiz",
          xp: 45,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the output?",
              code: `console.log("3" + 2 + 1);`,
              options: ['"321"', '"33"', '6', '"6"'],
              correct: 0,
              body: '"3" + 2 = "32" (string concat), then "32" + 1 = "321". Left to right — once a string appears, + concatenates.',
            },
            {
              id: "c2",
              question: "Which expression evaluates to true?",
              code: null,
              options: [
                '0 === false',
                '"" === false',
                'null == undefined',
                'null === undefined',
              ],
              correct: 2,
              body: "null == undefined is true with loose equality — one of the few 'safe' uses of ==. With === they are not equal.",
            },
            {
              id: "c3",
              question: "What does this ternary return?",
              code: `const x = 0;
const result = x || "default";
console.log(result);`,
              options: ['"default"', '0', 'true', 'undefined'],
              correct: 0,
              body: "0 is falsy, so || moves to the right side and returns 'default'. This is the OR short-circuit in action.",
            },
          ],
        },
        {
          id: 5,
          title: "Code Challenge",
          subtitle: "Math meets logic",
          xp: 50,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.4)",
          codeChallenge: {
            prompt: "Write a function called calculator that takes two numbers and an operator.",
            description: "Given a, b, and op (one of '+', '-', '*', '/'), return the result. For division by zero return \"Error\".",
            starterCode: `function calculator(a, b, op) {\n  // write your code here\n}`,
            hint: "Use if/else or a switch statement to check the operator. Don't forget to handle b === 0 for division!",
            testCases: [
              { call: 'calculator(3, 4, "+")', expected: 7, label: 'calculator(3, 4, "+")' },
              { call: 'calculator(10, 3, "-")', expected: 7, label: 'calculator(10, 3, "-")' },
              { call: 'calculator(6, 5, "*")', expected: 30, label: 'calculator(6, 5, "*")' },
              { call: 'calculator(10, 0, "/")', expected: "Error", label: 'calculator(10, 0, "/")' },
            ],
          },
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 4 — Control Flow (130 XP)
    // ─────────────────────────────────────────────
    {
      no: 4,
      name: "Control Flow — if, else, switch",
      difficulty: "Beginner",
      duration: "14 min",
      totalXP: 130,
      parts: [
        {
          id: 1,
          title: "if / else if / else",
          subtitle: "Making decisions in code",
          xp: 28,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Code takes different paths based on conditions.",
            body: "The `if` statement evaluates a condition and runs a block only if it's truthy. Chain `else if` to check more conditions. `else` is the final fallback. Conditions are checked top-to-bottom — the first truthy one wins, the rest are skipped. Any value can be a condition: 0, '', null, undefined, NaN, and false are falsy; everything else is truthy.",
            code: `const temp = 28;

if (temp > 35) {
  console.log("Extremely hot");
} else if (temp > 25) {
  console.log("Warm day");   // ← this runs
} else if (temp > 15) {
  console.log("Pleasant");
} else {
  console.log("Cold");
}

// Truthy/falsy in conditions
const username = "";
if (username) {
  console.log("Welcome, " + username);
} else {
  console.log("Please log in");  // ← empty string is falsy
}`,
            codeNote: "Only the first matching else if runs. Even if later conditions are also true, they're skipped.",
          }],
        },
        {
          id: 2,
          title: "switch Statement",
          subtitle: "Cleaner multi-value branching",
          xp: 28,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "switch is cleaner than a chain of if/else for fixed values.",
            body: "Use `switch` when comparing one variable against many specific values. Each `case` is a value to match. `break` exits the switch — without it, execution falls through to the next case (sometimes useful, usually a bug). `default` is the fallback if no case matches. `switch` uses strict equality (===) internally.",
            code: `const day = "Monday";

switch (day) {
  case "Monday":
    console.log("Start of the week");  // runs
    break;
  case "Friday":
    console.log("Almost weekend!");
    break;
  case "Saturday":
  case "Sunday":
    // Both cases share the same block (fall-through intentional)
    console.log("Weekend!");
    break;
  default:
    console.log("Midweek grind");
}`,
            codeNote: "Always add break unless you intentionally want fall-through. Missing break is a very common bug.",
          }],
        },
        {
          id: 3,
          title: "Nullish Coalescing ??",
          subtitle: "Smarter defaults than ||",
          xp: 28,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "?? gives a default only for null and undefined.",
            body: "The `||` operator returns the right side if the left is any falsy value — including 0, '', false. This causes bugs when 0 or empty string are valid values. `??` (nullish coalescing) only falls through on null or undefined, making it safer for optional values with legitimate falsy defaults.",
            code: `// || treats 0 and '' as falsy — often wrong
const count = 0;
console.log(count || 10);   // 10 ← wrong! 0 is a valid count

// ?? only falls through on null/undefined
console.log(count ?? 10);   // 0  ← correct

const name = null;
console.log(name ?? "Guest");     // "Guest"

const score = undefined;
console.log(score ?? 0);          // 0

const active = false;
console.log(active ?? true);      // false ← ?? doesn't treat false as nullish`,
            codeNote: "Rule: use ?? for 'this value might not exist yet'. Use || for 'this value might be falsy'.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Control flow in action",
          xp: 46,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What gets logged?",
              code: `const x = 0;
if (x) {
  console.log("truthy");
} else {
  console.log("falsy");
}`,
              options: ['"truthy"', '"falsy"', 'nothing', 'undefined'],
              correct: 1,
              body: "0 is falsy in JavaScript. The else branch runs and logs 'falsy'.",
            },
            {
              id: "c2",
              question: "What is the output of this switch?",
              code: `const val = 2;
switch (val) {
  case 1:
    console.log("one");
  case 2:
    console.log("two");
  case 3:
    console.log("three");
}`,
              options: [
                '"two"',
                '"two" then "three"',
                '"one" then "two" then "three"',
                'nothing',
              ],
              correct: 1,
              body: "val matches case 2. Since there's no break, execution falls through to case 3. Both 'two' and 'three' are logged.",
            },
            {
              id: "c3",
              question: "What does ?? return here?",
              code: `const a = 0;
const b = null;
console.log(a ?? "fallback-a");
console.log(b ?? "fallback-b");`,
              options: [
                '"fallback-a" and "fallback-b"',
                '0 and "fallback-b"',
                '0 and null',
                '"fallback-a" and null',
              ],
              correct: 1,
              body: "?? only replaces null and undefined. 0 is NOT nullish, so a stays 0. b is null, so it gets 'fallback-b'.",
            },
          ],
        },
        {
          id: 5,
          title: "Code Challenge",
          subtitle: "Build a grade checker",
          xp: 50,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.4)",
          codeChallenge: {
            prompt: "Write a function called getGrade that returns a letter grade for a score.",
            description: "Given a number score (0–100), return: 'A' for 90+, 'B' for 80–89, 'C' for 70–79, 'D' for 60–69, 'F' for below 60.",
            starterCode: `function getGrade(score) {\n  // write your code here\n}`,
            hint: "Use if/else if chains: if(score >= 90) return 'A'; else if(score >= 80) return 'B'; ...",
            testCases: [
              { call: 'getGrade(95)', expected: "A", label: 'getGrade(95)' },
              { call: 'getGrade(82)', expected: "B", label: 'getGrade(82)' },
              { call: 'getGrade(73)', expected: "C", label: 'getGrade(73)' },
              { call: 'getGrade(65)', expected: "D", label: 'getGrade(65)' },
              { call: 'getGrade(42)', expected: "F", label: 'getGrade(42)' },
            ],
          },
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 5 — Loops (130 XP)
    // ─────────────────────────────────────────────
    {
      no: 5,
      name: "Loops — for, while, for...of",
      difficulty: "Beginner",
      duration: "14 min",
      totalXP: 130,
      parts: [
        {
          id: 1,
          title: "The for Loop",
          subtitle: "Classic counted repetition",
          xp: 28,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Repeat code a known number of times.",
            body: "The `for` loop has three parts: initialiser (runs once), condition (checked before each iteration), and update (runs after each iteration). It's best when you know exactly how many times to loop. You can loop forward, backward, or in any step size. Access the current index with `i` inside the loop.",
            code: `// Count 1 to 5
for (let i = 1; i <= 5; i++) {
  console.log(i);
}
// 1, 2, 3, 4, 5

// Loop over an array by index
const colors = ["red", "green", "blue"];
for (let i = 0; i < colors.length; i++) {
  console.log(i, colors[i]);
}
// 0 "red", 1 "green", 2 "blue"

// Backwards
for (let i = 5; i >= 1; i--) {
  console.log(i);  // 5, 4, 3, 2, 1
}`,
            codeNote: "Arrays are zero-indexed: the first item is at index 0, last is at index length - 1.",
          }],
        },
        {
          id: 2,
          title: "while & do...while",
          subtitle: "Loop while a condition holds",
          xp: 28,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Use while when you don't know the count upfront.",
            body: "`while` checks the condition BEFORE each iteration — it may never run. `do...while` checks AFTER — it always runs at least once. Both need a condition that eventually becomes false, or you'll create an infinite loop. Use `while` for things like 'keep reading until end of file' or 'keep asking until valid input'.",
            code: `// while — may never run
let count = 0;
while (count < 3) {
  console.log("count:", count);
  count++;
}
// count: 0, count: 1, count: 2

// do...while — always runs at least once
let num = 10;
do {
  console.log("num:", num);
  num++;
} while (num < 5);
// num: 10 ← ran once even though condition was false`,
            codeNote: "Always make sure your while condition will eventually become false — or use break inside.",
          }],
        },
        {
          id: 3,
          title: "for...of and break/continue",
          subtitle: "Modern loops for iterables",
          xp: 28,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "for...of is the cleanest way to loop over arrays.",
            body: "`for...of` iterates over any iterable (arrays, strings, Sets) and gives you the value directly — no index management. `break` exits the loop early. `continue` skips the current iteration and moves to the next. Use `for...of` for arrays, `for...in` for object keys (though Object.keys() is often cleaner).",
            code: `const fruits = ["apple", "banana", "cherry"];

for (const fruit of fruits) {
  console.log(fruit.toUpperCase());
}
// APPLE, BANANA, CHERRY

// break and continue
for (let i = 0; i < 10; i++) {
  if (i === 3) continue;  // skip 3
  if (i === 7) break;     // stop at 7
  console.log(i);
}
// 0, 1, 2, 4, 5, 6

// for...of a string
for (const char of "Hello") {
  console.log(char);  // H, e, l, l, o
}`,
            codeNote: "for...of doesn't give you the index. If you need both value and index, use .entries(): for (const [i, val] of arr.entries())",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Loop logic test",
          xp: 46,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What numbers does this loop print?",
              code: `for (let i = 0; i < 5; i++) {
  if (i % 2 === 0) continue;
  console.log(i);
}`,
              options: ["0, 2, 4", "1, 3", "0, 1, 2, 3, 4", "1, 2, 3, 4"],
              correct: 1,
              body: "continue skips when i is even (i % 2 === 0). So only odd values 1 and 3 are logged (i goes 0-4).",
            },
            {
              id: "c2",
              question: "How many times does this loop run?",
              code: `let i = 5;
do {
  console.log(i);
  i++;
} while (i < 3);`,
              options: ["0 times", "1 time", "3 times", "5 times"],
              correct: 1,
              body: "do...while runs at least once. i starts at 5, logs 5, then checks 5 < 3 (false) and stops. Runs exactly once.",
            },
            {
              id: "c3",
              question: "What does this log?",
              code: `const nums = [1, 2, 3, 4, 5];
let total = 0;
for (const n of nums) {
  total += n;
}
console.log(total);`,
              options: ["5", "10", "15", "12345"],
              correct: 2,
              body: "total starts at 0. Each iteration adds n to it: 0+1+2+3+4+5 = 15.",
            },
          ],
        },
        {
          id: 5,
          title: "Code Challenge",
          subtitle: "Loop mastery",
          xp: 50,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.4)",
          codeChallenge: {
            prompt: "Write a function called fizzBuzz that returns an array from 1 to n.",
            description: "For multiples of 3 push \"Fizz\", for multiples of 5 push \"Buzz\", for multiples of both push \"FizzBuzz\", otherwise push the number itself.",
            starterCode: `function fizzBuzz(n) {\n  const result = [];\n  // write your loop here\n  return result;\n}`,
            hint: "Use a for loop from 1 to n. Check i%15===0 first (FizzBuzz), then i%3===0 (Fizz), then i%5===0 (Buzz), else push i.",
            testCases: [
              { call: 'fizzBuzz(5)', expected: [1, 2, "Fizz", 4, "Buzz"], label: 'fizzBuzz(5)' },
              { call: 'fizzBuzz(15).slice(-1)[0]', expected: "FizzBuzz", label: 'fizzBuzz(15) last element' },
              { call: 'fizzBuzz(3)', expected: [1, 2, "Fizz"], label: 'fizzBuzz(3)' },
            ],
          },
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 6 — Functions (150 XP)
    // ─────────────────────────────────────────────
    {
      no: 6,
      name: "Functions",
      difficulty: "Beginner",
      duration: "16 min",
      totalXP: 150,
      parts: [
        {
          id: 1,
          title: "Declaring Functions",
          subtitle: "Declarations vs expressions vs arrows",
          xp: 32,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Three ways to write a function. One best choice for each use case.",
            body: "Function declarations are hoisted — you can call them before they appear in code. Function expressions assign a function to a variable — not hoisted. Arrow functions are the shortest syntax and are best for callbacks and anonymous functions. Arrow functions with a single expression implicitly return that expression (no need for `return` or `{}`).",
            code: `// Declaration — hoisted, can be called before definition
function add(a, b) {
  return a + b;
}

// Expression — not hoisted
const subtract = function(a, b) {
  return a - b;
};

// Arrow — shortest, best for callbacks
const multiply = (a, b) => a * b;

// Arrow with single param (no parens needed)
const double = n => n * 2;

console.log(add(3, 4));        // 7
console.log(subtract(10, 3));  // 7
console.log(multiply(3, 4));   // 12
console.log(double(6));        // 12`,
            codeNote: "Arrow functions implicitly return when body is a single expression. Add {} and return for multi-line.",
          }],
        },
        {
          id: 2,
          title: "Parameters & Return Values",
          subtitle: "Inputs, outputs, and defaults",
          xp: 32,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Functions take inputs, do work, and give back output.",
            body: "Parameters are the placeholders defined in the function signature. Arguments are the actual values passed when calling it. Default parameters prevent undefined errors when arguments are omitted. Every function returns `undefined` unless you explicitly use `return`. `return` also exits the function immediately.",
            code: `// Default parameters
function greet(name = "Guest", greeting = "Hello") {
  return \`\${greeting}, \${name}!\`;
}

console.log(greet());               // "Hello, Guest!"
console.log(greet("Alice"));        // "Hello, Alice!"
console.log(greet("Bob", "Hi"));    // "Hi, Bob!"

// Rest parameters — collects extra args into an array
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));      // 6
console.log(sum(1, 2, 3, 4, 5)); // 15`,
            codeNote: "...args (rest parameter) must be the last parameter. It collects all remaining arguments into an array.",
          }],
        },
        {
          id: 3,
          title: "Functions as Values",
          subtitle: "Passing and returning functions",
          xp: 32,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Functions are first-class — store them, pass them, return them.",
            body: "In JavaScript, functions are values like strings or numbers. You can store a function in a variable, pass it as an argument (callback), or return it from another function. This is the foundation of event handling, array methods like .map() and .filter(), and asynchronous code.",
            code: `// Store in a variable
const sayHi = () => console.log("Hi!");
sayHi();  // "Hi!"

// Pass as a callback
function doTwice(fn) {
  fn();
  fn();
}
doTwice(sayHi);  // "Hi!" "Hi!"

// Return a function (factory pattern)
function makeMultiplier(factor) {
  return (n) => n * factor;
}

const triple = makeMultiplier(3);
console.log(triple(5));   // 15
console.log(triple(10));  // 30

// Real world: setTimeout callback
setTimeout(() => console.log("1 second later"), 1000);`,
            codeNote: "Callbacks are the backbone of async JS. Every time you write .then(), .map(), or addEventListener(), you're passing a function.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Functions — write real code",
          xp: 54,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this function return when called with no arguments?",
              code: `function greet(name = "World") {
  return "Hello, " + name + "!";
}
console.log(greet());`,
              options: ['"Hello, undefined!"', '"Hello, World!"', '"Hello, !"', 'undefined'],
              correct: 1,
              body: "Default parameter name = 'World' is used when no argument is passed. Returns 'Hello, World!'.",
            },
            {
              id: "c2",
              question: "What is the output?",
              code: `const fn = (x) => x * x;
console.log(fn(4));`,
              options: ["8", "16", "undefined", "NaN"],
              correct: 1,
              body: "Arrow function with implicit return: (x) => x * x returns x squared. 4 * 4 = 16.",
            },
            {
              id: "c3",
              question: "What does this log?",
              code: `function outer() {
  let x = 10;
  function inner() {
    return x * 2;
  }
  return inner();
}
console.log(outer());`,
              options: ["10", "20", "undefined", "ReferenceError"],
              correct: 1,
              body: "inner() can access x from outer's scope (closure). x * 2 = 20. outer() returns the result of inner().",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 7 — Strings (130 XP)
    // ─────────────────────────────────────────────
    {
      no: 7,
      name: "Strings — Methods & Template Literals",
      difficulty: "Beginner",
      duration: "14 min",
      totalXP: 130,
      parts: [
        {
          id: 1,
          title: "Template Literals",
          subtitle: "Modern string syntax with ${}",
          xp: 28,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Backticks replace messy string concatenation.",
            body: "Template literals use backticks (`) instead of quotes. Embed any JavaScript expression with `${}`. They support multi-line strings without escape characters. Anything inside `${}` is evaluated as JavaScript — math, function calls, ternary expressions, all work.",
            code: `const name = "Alice";
const score = 95;
const passed = score >= 60;

// Old way (messy)
console.log("Hello, " + name + ". Score: " + score + ". Passed: " + passed);

// Template literal (clean)
console.log(\`Hello, \${name}. Score: \${score}. Passed: \${passed}\`);

// Expression inside \${}
console.log(\`Grade: \${score >= 90 ? "A" : "B"}\`);   // "Grade: A"
console.log(\`Double: \${score * 2}\`);                  // "Double: 190"

// Multi-line
const card = \`
  Name:  \${name}
  Score: \${score}
  Result: \${passed ? "PASS" : "FAIL"}
\`;
console.log(card);`,
            codeNote: "Everything inside ${} is live JavaScript. You can call functions, do math, use ternaries — all inline.",
          }],
        },
        {
          id: 2,
          title: "Essential String Methods",
          subtitle: "transform, search, and extract",
          xp: 28,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "JS has a rich set of built-in string tools.",
            body: "Strings are immutable — methods return new strings, never modify the original. Key methods: `.length` (character count), `.toUpperCase()/.toLowerCase()`, `.trim()` (removes whitespace), `.includes()` (checks presence), `.startsWith()/.endsWith()`, `.slice(start, end)` (extract a portion), `.split()` (split into array). Chain them for clean transformations.",
            code: `const email = "  Alice@Example.COM  ";

console.log(email.trim());                    // "Alice@Example.COM"
console.log(email.trim().toLowerCase());      // "alice@example.com"
console.log(email.includes("@"));             // true
console.log(email.trim().split("@"));         // ["Alice", "Example.COM"]

const str = "JavaScript";
console.log(str.length);                      // 10
console.log(str.slice(0, 4));                 // "Java"
console.log(str.slice(-6));                   // "Script"
console.log(str.startsWith("Java"));          // true
console.log(str.toUpperCase());               // "JAVASCRIPT"`,
            codeNote: "Methods can be chained: str.trim().toLowerCase().split(' '). Each method returns a new string.",
          }],
        },
        {
          id: 3,
          title: "replace, indexOf & padStart",
          subtitle: "Search and format strings",
          xp: 28,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Find, replace, and format text precisely.",
            body: "`.indexOf()` returns the position of a substring (-1 if not found). `.replace()` swaps the first match. `.replaceAll()` swaps every match. `.padStart(length, char)` and `.padEnd()` pad strings to a fixed length — great for formatting numbers and IDs. `.repeat(n)` repeats a string n times.",
            code: `const text = "cat and dog and cat";

console.log(text.indexOf("dog"));        // 8
console.log(text.indexOf("fish"));       // -1 (not found)
console.log(text.replace("cat", "bat")); // "bat and dog and cat" (first only)
console.log(text.replaceAll("cat", "bat")); // "bat and dog and bat"

// Padding for formatting
const id = "42";
console.log(id.padStart(5, "0"));        // "00042"
console.log("9".padStart(3, "0"));       // "009"

// Repeat
console.log("⭐".repeat(5));             // "⭐⭐⭐⭐⭐"`,
            codeNote: "padStart is very useful for displaying timestamps (01:05:09) and IDs (USR-00042).",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "String manipulation test",
          xp: 46,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this return?",
              code: `const str = "JavaScript";
console.log(str.slice(4));`,
              options: ['"Java"', '"Script"', '"script"', '"avaScript"'],
              correct: 1,
              body: "slice(4) starts at index 4 and goes to the end. 'J'=0,'a'=1,'v'=2,'a'=3,'S'=4 → 'Script'.",
            },
            {
              id: "c2",
              question: "What is the output?",
              code: `const name = "Alice";
console.log(\`Hello, \${name.toUpperCase()}!\`);`,
              options: ['"Hello, name.toUpperCase()!"', '"Hello, ALICE!"', '"Hello, Alice!"', 'SyntaxError'],
              correct: 1,
              body: "Inside ${} the expression name.toUpperCase() evaluates to 'ALICE'. Template literal produces 'Hello, ALICE!'.",
            },
            {
              id: "c3",
              question: "What does this output?",
              code: `const words = "one two three";
const arr = words.split(" ");
console.log(arr.length);`,
              options: ["1", "3", "13", "undefined"],
              correct: 1,
              body: "split(' ') splits at each space. 'one two three' splits into ['one', 'two', 'three'] — length 3.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 8 — Arrays & Array Methods (160 XP)
    // ─────────────────────────────────────────────
    {
      no: 8,
      name: "Arrays & Array Methods",
      difficulty: "Intermediate",
      duration: "18 min",
      totalXP: 160,
      parts: [
        {
          id: 1,
          title: "Array Basics & Mutation",
          subtitle: "Creating, reading, and modifying arrays",
          xp: 35,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Arrays are ordered, zero-indexed, mutable lists.",
            body: "Arrays hold ordered collections of any type — mix strings, numbers, objects, even other arrays. Index from 0. `.push()` adds to end, `.pop()` removes from end, `.unshift()` adds to start, `.shift()` removes from start. `.length` gives the count. `.splice(index, deleteCount, ...items)` inserts or removes at any position.",
            code: `const fruits = ["apple", "banana", "cherry"];

console.log(fruits[0]);         // "apple"
console.log(fruits.length);     // 3

fruits.push("date");            // add to end
fruits.unshift("avocado");      // add to start
console.log(fruits);
// ["avocado", "apple", "banana", "cherry", "date"]

fruits.pop();                   // remove last ("date")
fruits.shift();                 // remove first ("avocado")
console.log(fruits);
// ["apple", "banana", "cherry"]

// splice: remove 1 item at index 1, insert "blueberry"
fruits.splice(1, 1, "blueberry");
console.log(fruits);
// ["apple", "blueberry", "cherry"]`,
            codeNote: "push/pop are O(1) — fast. unshift/shift are O(n) — slow on large arrays because all items shift.",
          }],
        },
        {
          id: 2,
          title: "map, filter & reduce",
          subtitle: "Transform data without loops",
          xp: 35,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "These three methods replace 90% of array loops.",
            body: "`.map(fn)` transforms every element and returns a new array of the same length. `.filter(fn)` returns a new array with only elements where `fn` returns true. `.reduce(fn, initial)` accumulates all elements into a single value. None of them modify the original array — they always return new ones.",
            code: `const prices = [10, 25, 8, 42, 15];

// map — apply 10% tax to each
const withTax = prices.map(p => +(p * 1.1).toFixed(2));
console.log(withTax);  // [11, 27.5, 8.8, 46.2, 16.5]

// filter — only items over $15
const expensive = prices.filter(p => p > 15);
console.log(expensive);  // [25, 42]

// reduce — sum all prices
const total = prices.reduce((acc, p) => acc + p, 0);
console.log(total);  // 100

// Chain them: sum of expensive items with tax
const result = prices
  .filter(p => p > 15)
  .map(p => p * 1.1)
  .reduce((acc, p) => acc + p, 0);
console.log(result.toFixed(2));  // "74.80"`,
            codeNote: "Chaining map().filter().reduce() is the functional pipeline pattern — readable and expressive.",
          }],
        },
        {
          id: 3,
          title: "find, some, every & spread",
          subtitle: "Search and copy arrays",
          xp: 35,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Search arrays without writing a loop.",
            body: "`.find(fn)` returns the first element where fn returns true (or undefined). `.findIndex()` returns its position. `.some(fn)` returns true if any element passes. `.every(fn)` returns true if all elements pass. The spread operator `[...arr]` creates a shallow copy — essential for immutable updates in React.",
            code: `const users = [
  { name: "Alice", age: 17 },
  { name: "Bob",   age: 22 },
  { name: "Carol", age: 19 },
];

console.log(users.find(u => u.age >= 18));   // { name: "Bob", age: 22 }
console.log(users.findIndex(u => u.age >= 18)); // 1
console.log(users.some(u => u.age < 18));    // true
console.log(users.every(u => u.age >= 18));  // false

// Spread to copy and merge arrays
const a = [1, 2, 3];
const b = [4, 5, 6];
const merged = [...a, ...b];  // [1, 2, 3, 4, 5, 6]

// Immutable add to array
const newUsers = [...users, { name: "Dave", age: 25 }];
console.log(newUsers.length);  // 4 (original unchanged)`,
            codeNote: "Always use spread [...arr] to copy arrays before modifying when working with React state.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Array methods — code output",
          xp: 55,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this output?",
              code: `const nums = [1, 2, 3, 4, 5];
const result = nums.filter(n => n % 2 === 0).map(n => n * 10);
console.log(result);`,
              options: ["[1, 3, 5]", "[20, 40]", "[10, 20, 30, 40, 50]", "[2, 4]"],
              correct: 1,
              body: "filter keeps even numbers: [2, 4]. map multiplies by 10: [20, 40].",
            },
            {
              id: "c2",
              question: "What is the final value of total?",
              code: `const nums = [1, 2, 3, 4];
const total = nums.reduce((acc, n) => acc + n, 10);
console.log(total);`,
              options: ["10", "20", "14", "0"],
              correct: 1,
              body: "reduce starts with initial value 10. Adds each: 10+1+2+3+4 = 20.",
            },
            {
              id: "c3",
              question: "What does this return?",
              code: `const arr = [3, 7, 1, 9, 2];
console.log(arr.find(n => n > 5));`,
              options: ["7", "9", "[7, 9]", "true"],
              correct: 0,
              body: "find returns the FIRST element where the condition is true. 3 > 5? No. 7 > 5? Yes — returns 7.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 9 — Objects & Destructuring (150 XP)
    // ─────────────────────────────────────────────
    {
      no: 9,
      name: "Objects & Destructuring",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 150,
      parts: [
        {
          id: 1,
          title: "Creating & Accessing Objects",
          subtitle: "Key-value pairs and dot notation",
          xp: 32,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Objects are named containers for related data.",
            body: "An object is a collection of key-value pairs called properties. Keys are strings (or Symbols). Access with dot notation (`obj.key`) for known keys, or bracket notation (`obj['key']`) for dynamic keys. Objects are mutable — you can add, change, or delete properties. Nested objects are accessed by chaining dots.",
            code: `const user = {
  name: "Alice",
  age: 28,
  role: "admin",
  address: {
    city: "Delhi",
    country: "India",
  },
};

console.log(user.name);             // "Alice"
console.log(user["role"]);          // "admin"
console.log(user.address.city);     // "Delhi"

// Dynamic key access
const key = "age";
console.log(user[key]);             // 28

// Add/modify properties
user.score = 100;                   // add new property
user.role = "superadmin";           // modify existing
delete user.score;                  // delete property`,
            codeNote: "Use dot notation when the key is known. Use bracket notation when the key is in a variable or has special characters.",
          }],
        },
        {
          id: 2,
          title: "Destructuring",
          subtitle: "Extract values cleanly",
          xp: 32,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Pull values out of objects without repetition.",
            body: "Destructuring assigns object properties to variables in one line. You can rename during destructuring (alias) and provide a default value if the property doesn't exist. Nested destructuring unpacks nested objects. It's extremely common in React — most component props are destructured.",
            code: `const product = { title: "Laptop", price: 999, stock: 0 };

// Basic destructuring
const { title, price } = product;
console.log(title, price);   // "Laptop" 999

// Alias (rename)
const { title: productName } = product;
console.log(productName);    // "Laptop"

// Default value (if key missing)
const { discount = 10 } = product;
console.log(discount);       // 10 (not in object, uses default)

// Nested destructuring
const { address: { city } = {} } = { address: { city: "Delhi" } };
console.log(city);           // "Delhi"

// In function parameters
function display({ name, age = 0 }) {
  console.log(\`\${name} is \${age}\`);
}
display({ name: "Bob", age: 25 });  // "Bob is 25"`,
            codeNote: "Destructuring in function params is extremely common in React. ({ title, onClick }) => {} is the standard pattern.",
          }],
        },
        {
          id: 3,
          title: "Spread, Object.entries & Shorthand",
          subtitle: "Modern object patterns",
          xp: 32,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Copy, merge, and iterate objects the modern way.",
            body: "The spread operator `{...obj}` creates a shallow copy of an object. Properties added after the spread override earlier ones — useful for immutable updates. `Object.keys()`, `.values()`, and `.entries()` let you iterate over objects. Shorthand property syntax lets you write `{ name, age }` instead of `{ name: name, age: age }`.",
            code: `const base = { theme: "dark", lang: "en", fontSize: 14 };

// Spread to copy
const copy = { ...base };

// Spread to override specific properties (immutable update)
const updated = { ...base, lang: "hi", fontSize: 16 };
console.log(updated);
// { theme: "dark", lang: "hi", fontSize: 16 }

// Shorthand properties
const name = "Alice";
const age = 28;
const person = { name, age };  // same as { name: name, age: age }

// Iterate with entries
Object.entries(updated).forEach(([key, value]) => {
  console.log(\`\${key}: \${value}\`);
});`,
            codeNote: "Spread always does a shallow copy. Nested objects are still shared by reference — be careful when modifying them.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Objects — intermediate code test",
          xp: 54,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is logged?",
              code: `const obj = { a: 1, b: 2, c: 3 };
const { a, ...rest } = obj;
console.log(rest);`,
              options: ["{ a: 1 }", "{ b: 2, c: 3 }", "{ a: 1, b: 2, c: 3 }", "undefined"],
              correct: 1,
              body: "...rest collects the remaining properties after a is destructured. rest = { b: 2, c: 3 }.",
            },
            {
              id: "c2",
              question: "What does this output?",
              code: `const original = { x: 1, y: 2 };
const copy = { ...original, y: 99 };
console.log(original.y, copy.y);`,
              options: ["99, 99", "2, 2", "2, 99", "undefined, 99"],
              correct: 2,
              body: "Spread copies original, then y: 99 overrides. original is unchanged (y: 2). copy has y: 99.",
            },
            {
              id: "c3",
              question: "What does this log?",
              code: `const user = { name: "Alice", role: "admin" };
const { name, role: userRole = "guest" } = user;
console.log(userRole);`,
              options: ['"admin"', '"guest"', '"role"', 'undefined'],
              correct: 0,
              body: "role is renamed to userRole during destructuring. The default 'guest' only applies if role is missing. It exists, so userRole = 'admin'.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 10 — The DOM (160 XP)
    // ─────────────────────────────────────────────
    {
      no: 10,
      name: "The DOM — Selecting & Manipulating Elements",
      difficulty: "Intermediate",
      duration: "18 min",
      totalXP: 160,
      parts: [
        {
          id: 1,
          title: "Selecting Elements",
          subtitle: "querySelector and friends",
          xp: 35,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "querySelector lets you find any element with a CSS selector.",
            body: "The DOM is a tree of all HTML elements. `document.querySelector(selector)` finds the first match. `querySelectorAll(selector)` returns all matches as a NodeList. You can use any CSS selector: '#id', '.class', 'tag', '[attribute]'. NodeList is not an array — convert with `Array.from()` to use array methods on it.",
            code: `// Select by ID
const heading = document.querySelector("#main-title");

// Select by class
const cards = document.querySelectorAll(".card");

// Select by tag
const inputs = document.querySelectorAll("input");

// CSS selectors work
const submitBtn = document.querySelector("form button[type='submit']");

// NodeList → Array for array methods
const cardArray = Array.from(cards);
cardArray.forEach(card => console.log(card.textContent));

// Read element properties
const input = document.querySelector("#username");
console.log(input.value);       // current input value
console.log(input.placeholder); // placeholder attribute`,
            codeNote: "querySelectorAll returns a static NodeList (snapshot). Use querySelectorAll + Array.from for functional methods.",
          }],
        },
        {
          id: 2,
          title: "Modifying Content & Styles",
          subtitle: "Change what users see",
          xp: 35,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "JS can change any text, HTML, or style on the page.",
            body: "`textContent` sets or reads plain text — safe and fast. `innerHTML` sets HTML content — use carefully, never with user input (XSS risk). `style` sets inline CSS. `classList` manages CSS classes cleanly without overwriting all styles. Prefer `classList` over `style` to keep CSS in stylesheets.",
            code: `const heading = document.querySelector("h1");

// Change text content (safe)
heading.textContent = "Updated by JavaScript!";

// Change HTML content (careful — XSS risk with user input)
const div = document.querySelector("#container");
div.innerHTML = "<strong>Bold text</strong>";

// Inline style (avoid for complex styles)
heading.style.color = "blue";
heading.style.fontSize = "32px";

// classList — preferred for CSS management
const btn = document.querySelector("#toggle");
btn.classList.add("active");       // adds a class
btn.classList.remove("disabled");  // removes a class
btn.classList.toggle("hidden");    // adds if missing, removes if present
console.log(btn.classList.contains("active"));  // true`,
            codeNote: "Never set innerHTML with user-supplied content — always use textContent for plain text to prevent XSS.",
          }],
        },
        {
          id: 3,
          title: "Creating & Inserting Elements",
          subtitle: "Build the DOM dynamically",
          xp: 35,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Create new DOM nodes and inject them anywhere.",
            body: "`document.createElement(tag)` creates a new element node in memory. Set its properties, then attach it to the DOM with `appendChild()`, `prepend()`, or `insertAdjacentElement()`. `remove()` deletes an element. This is how dynamic UIs work — rendering lists of items, adding notifications, building modals.",
            code: `const ul = document.querySelector("#list");

// Create and append multiple items
const frameworks = ["React", "Vue", "Angular"];

frameworks.forEach(name => {
  const li = document.createElement("li");
  li.textContent = name;
  li.classList.add("item");
  ul.appendChild(li);    // append to end
});

// Create a full element
const card = document.createElement("div");
card.className = "card";
card.innerHTML = \`
  <h2>New Card</h2>
  <p>Created dynamically</p>
\`;

// Insert before the first child
ul.prepend(card);

// Remove an element
const old = document.querySelector(".old-item");
old?.remove();`,
            codeNote: "createElement + appendChild is faster than setting innerHTML in a loop — the browser reflows only once.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "DOM manipulation — code output",
          xp: 55,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does classList.toggle do?",
              code: `const el = document.querySelector("#box");
// el currently has class "hidden"
el.classList.toggle("hidden");
el.classList.toggle("hidden");
// How many times does "hidden" exist?`,
              options: [
                "0 times — toggle removed then added then removed",
                "1 time — back to original state",
                "2 times — toggle adds each time",
                "Error — toggle doesn't work twice",
              ],
              correct: 1,
              body: "First toggle removes 'hidden' (it existed). Second toggle adds it back. Net result: 1 occurrence, back to original.",
            },
            {
              id: "c2",
              question: "Which is the safest way to display user-submitted text?",
              code: `const userInput = "<script>alert('xss')</script>";`,
              options: [
                "el.innerHTML = userInput",
                "el.textContent = userInput",
                "el.insertAdjacentHTML('beforeend', userInput)",
                "el.outerHTML = userInput",
              ],
              correct: 1,
              body: "textContent treats the value as plain text — it won't execute scripts. innerHTML parses HTML and would run the malicious script.",
            },
            {
              id: "c3",
              question: "What does querySelectorAll return?",
              code: `const items = document.querySelectorAll(".item");
console.log(typeof items);
console.log(Array.isArray(items));`,
              options: [
                '"object", true',
                '"array", false',
                '"object", false',
                '"NodeList", true',
              ],
              correct: 2,
              body: "querySelectorAll returns a NodeList, which is an object but NOT an Array. Array.isArray returns false. Use Array.from() to convert.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 11 — Events (150 XP)
    // ─────────────────────────────────────────────
    {
      no: 11,
      name: "Events & Event Listeners",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 150,
      parts: [
        {
          id: 1,
          title: "addEventListener",
          subtitle: "Respond to user actions",
          xp: 32,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "addEventListener is the clean way to handle events.",
            body: "Events are signals the browser fires when something happens. `addEventListener(eventType, handler)` attaches a handler function that runs when the event fires. The handler receives an event object (`e`) with details about what happened. Common events: 'click', 'input', 'keydown', 'submit', 'mouseover', 'DOMContentLoaded'.",
            code: `const btn = document.querySelector("#btn");

// Click event
btn.addEventListener("click", (e) => {
  console.log("Clicked!", e.target);  // e.target is the element clicked
});

// Input event — fires on every keystroke
const input = document.querySelector("#search");
input.addEventListener("input", (e) => {
  console.log("Value:", e.target.value);
});

// Keydown — check which key
document.addEventListener("keydown", (e) => {
  console.log("Key pressed:", e.key);
  if (e.key === "Escape") console.log("Escape pressed!");
});`,
            codeNote: "Use 'input' for real-time text tracking, 'change' only fires after focus leaves the field.",
          }],
        },
        {
          id: 2,
          title: "e.preventDefault & form handling",
          subtitle: "Control default browser behavior",
          xp: 32,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Prevent the browser from doing its default thing.",
            body: "`e.preventDefault()` stops the default browser action. For forms: stops page reload on submit. For links: stops navigation. For drag events: enables custom drop targets. Without it, form submissions reload the page and you lose all your JavaScript state. Always call it first in submit handlers.",
            code: `const form = document.querySelector("#login-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();  // stop page reload

  const email = form.querySelector("#email").value.trim();
  const password = form.querySelector("#password").value;

  // Validate
  if (!email || !password) {
    alert("All fields are required");
    return;
  }

  if (!email.includes("@")) {
    alert("Invalid email address");
    return;
  }

  console.log("Form submitted:", { email, password });
});

// Prevent link navigation
const link = document.querySelector("a");
link.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Link clicked but not followed");
});`,
            codeNote: "e.preventDefault() only stops the browser default. e.stopPropagation() stops the event from bubbling up to parent elements.",
          }],
        },
        {
          id: 3,
          title: "Event Delegation",
          subtitle: "One listener for many elements",
          xp: 32,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Attach to the parent, handle children via e.target.",
            body: "Event delegation exploits event bubbling — events on child elements bubble up to their parents. Instead of adding a listener to every list item, add one listener to the parent and check `e.target` to determine which child was clicked. This is more efficient, works for dynamically added elements, and simplifies cleanup.",
            code: `const list = document.querySelector("#todo-list");

// One listener handles ALL list items, even future ones
list.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("done");
    console.log("Toggled:", e.target.textContent);
  }

  // Handle delete buttons inside items
  if (e.target.classList.contains("delete-btn")) {
    e.target.closest("li").remove();
  }
});

// Dynamically add items — listener still works!
const newItem = document.createElement("li");
newItem.textContent = "New task";
newItem.innerHTML += ' <button class="delete-btn">✕</button>';
list.appendChild(newItem);`,
            codeNote: "e.target is the element actually clicked. e.currentTarget is the element with the listener (the parent).",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Events — code prediction",
          xp: 54,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What happens when the form is submitted without e.preventDefault()?",
              code: `form.addEventListener("submit", (e) => {
  console.log("submitted");
});`,
              options: [
                "Only the console.log runs",
                "Console logs then page reloads",
                "An error is thrown",
                "Nothing happens",
              ],
              correct: 1,
              body: "Without preventDefault(), the browser performs its default action: reload the page. The log runs first, then the page refreshes.",
            },
            {
              id: "c2",
              question: "What does e.target refer to in this handler?",
              code: `ul.addEventListener("click", (e) => {
  console.log(e.target);
});
// User clicks an <li> inside <ul>`,
              options: [
                "The <ul> element",
                "The <li> that was clicked",
                "The document body",
                "The event object",
              ],
              correct: 1,
              body: "e.target is the element that was actually clicked — the <li>. e.currentTarget would be the <ul> (the element with the listener).",
            },
            {
              id: "c3",
              question: "Why is event delegation better than adding a listener to each item?",
              code: `// Option A
items.forEach(item => item.addEventListener("click", handler));

// Option B
container.addEventListener("click", (e) => {
  if (e.target.matches(".item")) handler(e);
});`,
              options: [
                "Option A is faster because it's more direct",
                "Option B works for dynamic items and uses fewer listeners",
                "They are exactly the same",
                "Option A is the only correct way",
              ],
              correct: 1,
              body: "Option B (delegation) uses one listener instead of N listeners, and automatically works for elements added after setup.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 12 — Scope, Closures & Hoisting (160 XP)
    // ─────────────────────────────────────────────
    {
      no: 12,
      name: "Scope, Closures & Hoisting",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 160,
      parts: [
        {
          id: 1,
          title: "Scope & Hoisting",
          subtitle: "Where variables live and when they exist",
          xp: 35,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Scope controls visibility. Hoisting controls timing.",
            body: "Scope determines where a variable is accessible. `let` and `const` are block-scoped (live inside `{}`). `var` is function-scoped (leaks out of if/for blocks). Hoisting: function declarations and `var` declarations are moved to the top of their scope at compile time. `let`/`const` are hoisted but not initialised — accessing them before declaration throws a ReferenceError (Temporal Dead Zone).",
            code: `// Block scope with let/const
{
  let x = 10;
  const y = 20;
  console.log(x, y);  // 10, 20
}
// console.log(x); // ReferenceError — x not accessible here

// var leaks out of blocks
{
  var leaked = "I escape!";
}
console.log(leaked);  // "I escape!" ← var ignores block scope

// Hoisting: function declarations are fully hoisted
console.log(add(2, 3));  // 5 ← works before definition!
function add(a, b) { return a + b; }

// let is in TDZ until declaration
// console.log(val); // ReferenceError!
let val = 5;`,
            codeNote: "Temporal Dead Zone: let/const exist in memory but can't be read until the declaration line runs.",
          }],
        },
        {
          id: 2,
          title: "Closures",
          subtitle: "Functions that remember their past",
          xp: 35,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "A closure is a function that remembers outer variables.",
            body: "When a function is created inside another function, it maintains access to the outer function's variables even after the outer function has finished executing. This is a closure. They're used to create private state, factory functions, and are the mechanism behind every callback that 'remembers' something.",
            code: `function makeCounter(start = 0) {
  let count = start;  // private — not accessible outside

  return {
    increment: () => ++count,
    decrement: () => --count,
    reset: () => { count = start; },
    value: () => count,
  };
}

const counter = makeCounter(10);
counter.increment();
counter.increment();
counter.increment();
console.log(counter.value());    // 13
counter.decrement();
console.log(counter.value());    // 12

// count is private!
console.log(counter.count);      // undefined — can't access directly

// Each call creates its own closure
const counter2 = makeCounter(0);
console.log(counter2.value());   // 0 (independent of counter)`,
            codeNote: "Each makeCounter() call creates a new scope with its own count variable. Closures capture the scope, not a snapshot.",
          }],
        },
        {
          id: 3,
          title: "var in Loops & IIFE",
          subtitle: "Classic gotchas explained",
          xp: 35,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "var in loops is a famous JS bug. let fixes it.",
            body: "`var` is function-scoped — all loop iterations share the same variable. By the time the callbacks run, the loop has finished and `var i` is the final value. `let` creates a new binding per iteration — each callback gets its own copy. IIFE (Immediately Invoked Function Expression) was the old fix; `let` is the modern one.",
            code: `// var — all callbacks share the same i (bug!)
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 100);
}
// var: 3, var: 3, var: 3  ← all see i = 3 (loop ended)

// let — each iteration has its own i (correct!)
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 100);
}
// let: 0, let: 1, let: 2  ← each has its own j

// IIFE (old pre-let fix)
for (var k = 0; k < 3; k++) {
  (function(captured) {
    setTimeout(() => console.log("IIFE:", captured), 100);
  })(k);
}
// IIFE: 0, IIFE: 1, IIFE: 2`,
            codeNote: "This is the most famous JS interview question. The answer: var shares one variable, let creates one per iteration.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Scope & closures — advanced output",
          xp: 55,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this log?",
              code: `function outer() {
  let x = 1;
  function inner() {
    let x = 2;
    console.log(x);
  }
  inner();
  console.log(x);
}
outer();`,
              options: [
                "2, then 2",
                "2, then 1",
                "1, then 2",
                "ReferenceError",
              ],
              correct: 1,
              body: "inner() has its own x = 2. outer's x = 1 is untouched. inner logs 2, then outer logs 1.",
            },
            {
              id: "c2",
              question: "What is logged?",
              code: `function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}
const add5 = makeAdder(5);
console.log(add5(3));
console.log(add5(10));`,
              options: [
                "8, then 15",
                "5, then 5",
                "3, then 10",
                "NaN, then NaN",
              ],
              correct: 0,
              body: "makeAdder(5) closes over x=5. add5(3) returns 5+3=8. add5(10) returns 5+10=15. Classic closure/currying.",
            },
            {
              id: "c3",
              question: "Why does this print 3 three times?",
              code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
              options: [
                "setTimeout delays make i unpredictable",
                "var is function-scoped — all callbacks share one i that equals 3 after loop ends",
                "console.log caches the value",
                "Closures don't work inside loops",
              ],
              correct: 1,
              body: "var creates one shared i. The loop finishes (i becomes 3) before any setTimeout callback runs. All three callbacks then read i = 3.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 13 — Higher-Order Functions (150 XP)
    // ─────────────────────────────────────────────
    {
      no: 13,
      name: "Higher-Order Functions & Callbacks",
      difficulty: "Intermediate",
      duration: "14 min",
      totalXP: 150,
      parts: [
        {
          id: 1,
          title: "Functions as First-Class Values",
          subtitle: "Store, pass, and return functions",
          xp: 32,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Functions are just values — treat them like any other.",
            body: "In JavaScript, functions can be stored in variables, put in arrays, added as object properties, passed as arguments, and returned from other functions. A Higher-Order Function (HOF) either takes a function as input or returns one. This is the foundation of `map`, `filter`, `addEventListener`, and async code.",
            code: `// Store in variable
const greet = (name) => \`Hello, \${name}\`;

// Store in object
const actions = {
  double: (n) => n * 2,
  square: (n) => n ** 2,
};
console.log(actions.double(5));   // 10
console.log(actions.square(4));   // 16

// Pass as argument (callback)
function apply(value, fn) {
  return fn(value);
}
console.log(apply(6, n => n * 3));  // 18
console.log(apply("hi", s => s.toUpperCase()));  // "HI"

// Array of functions
const pipeline = [
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/s+/g, "-"),
];
const result = pipeline.reduce((v, fn) => fn(v), "  Hello World  ");
console.log(result);  // "hello-world"`,
            codeNote: "Storing functions in arrays (pipelines) is a powerful pattern for building data transformation chains.",
          }],
        },
        {
          id: 2,
          title: "Building HOFs",
          subtitle: "Return functions from functions",
          xp: 32,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "HOFs are function factories — take behaviour, return a specialised function.",
            body: "Returning functions lets you create families of related functions from a single definition. This is called partial application or currying. The returned function closes over the parameters of the outer function — that's what makes it specific. Debounce and throttle are real-world HOFs used in virtually every production app.",
            code: `// Multiplier factory
function multiplier(factor) {
  return (n) => n * factor;
}
const double = multiplier(2);
const triple = multiplier(3);
console.log(double(5));   // 10
console.log(triple(5));   // 15

// Repeat HOF
function repeat(n, fn) {
  for (let i = 0; i < n; i++) fn(i);
}
repeat(3, i => console.log(\`Step \${i + 1}\`));
// Step 1, Step 2, Step 3

// Debounce — real world HOF
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
const search = debounce(query => console.log("Searching:", query), 300);
// Only fires 300ms after last call`,
            codeNote: "Debounce is used on every search input. It prevents firing on every keystroke — only when typing pauses.",
          }],
        },
        {
          id: 3,
          title: "Function Composition",
          subtitle: "Build pipelines from small functions",
          xp: 32,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Combine tiny functions to build powerful transformations.",
            body: "Function composition means chaining functions so the output of one feeds into the input of the next. Each function does one thing well. `compose` applies right to left (mathematical convention). `pipe` applies left to right (more readable). This is the functional programming approach to building logic without if/else chains.",
            code: `// Small, focused functions
const trim    = s => s.trim();
const lower   = s => s.toLowerCase();
const noSpaces = s => s.replace(/s+/g, "-");

// pipe — left to right
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const slugify = pipe(trim, lower, noSpaces);

console.log(slugify("  Hello World  "));  // "hello-world"
console.log(slugify("  JS IS GREAT  "));  // "js-is-great"

// compose — right to left
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const process = compose(noSpaces, lower, trim);
console.log(process("  ANOTHER Example  "));  // "another-example"`,
            codeNote: "Prefer pipe over compose — left-to-right reads naturally. Think of it as an assembly line for data.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "HOF — predict and reason",
          xp: 54,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this output?",
              code: `function makeGreeter(greeting) {
  return (name) => \`\${greeting}, \${name}!\`;
}
const hi = makeGreeter("Hi");
const hello = makeGreeter("Hello");
console.log(hi("Alice"));
console.log(hello("Bob"));`,
              options: [
                '"Hi, Alice!" and "Hello, Bob!"',
                '"greeting, name!" and "greeting, name!"',
                '"Hi, Bob!" and "Hello, Alice!"',
                'undefined and undefined',
              ],
              correct: 0,
              body: "Each call to makeGreeter closes over a different greeting. hi closes 'Hi', hello closes 'Hello'. Correct partial application.",
            },
            {
              id: "c2",
              question: "What does this reduce to?",
              code: `const fns = [x => x + 1, x => x * 2, x => x - 3];
const result = fns.reduce((v, fn) => fn(v), 5);
console.log(result);`,
              options: ["9", "7", "6", "NaN"],
              correct: 0,
              body: "Start: 5. Apply x+1: 6. Apply x*2: 12. Apply x-3: 9. Each function takes the output of the previous.",
            },
            {
              id: "c3",
              question: "What is the purpose of clearTimeout in debounce?",
              code: `function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
              options: [
                "It cancels the function entirely",
                "It resets the wait period each time the function is called",
                "It speeds up the delay",
                "It prevents multiple timers from existing",
              ],
              correct: 1,
              body: "clearTimeout cancels the previous timer. A new timer starts. This resets the wait period on each call — the function only fires after the user stops calling it.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 14 — Promises & Async JS (180 XP)
    // ─────────────────────────────────────────────
    {
      no: 14,
      name: "Promises & Asynchronous JavaScript",
      difficulty: "Intermediate",
      duration: "20 min",
      totalXP: 180,
      parts: [
        {
          id: 1,
          title: "The Async Model",
          subtitle: "Why JS needs async at all",
          xp: 38,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "JS is single-threaded. Async lets it juggle tasks.",
            body: "JavaScript runs on a single thread — only one thing at a time. Blocking operations (network requests, timers) would freeze everything if done synchronously. Instead, JS starts the task and moves on. When the task finishes, a callback is queued to handle the result. This is the async model. setTimeout is the simplest example.",
            code: `console.log("1 - Start");

setTimeout(() => {
  console.log("3 - Timeout callback (async)");
}, 1000);

console.log("2 - End");

// Output:
// 1 - Start
// 2 - End
// (1 second later...)
// 3 - Timeout callback

// Callback-based async (old way)
function loadUser(id, callback) {
  setTimeout(() => {
    const user = { id, name: "Alice" };
    callback(null, user);  // (error, result) convention
  }, 500);
}

loadUser(1, (err, user) => {
  if (err) return console.error(err);
  console.log("Got user:", user.name);
});`,
            codeNote: "The async model keeps JS responsive. The browser doesn't freeze while waiting for a network request to complete.",
          }],
        },
        {
          id: 2,
          title: "Promises",
          subtitle: "A better way to handle async results",
          xp: 38,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Promises represent a future value — pending, fulfilled, or rejected.",
            body: "A Promise is an object that will eventually hold a value (or an error). It has three states: pending, fulfilled (resolved), or rejected. `.then()` handles success, `.catch()` handles errors, `.finally()` always runs (cleanup). Promises are chainable — `.then()` returns a new Promise.",
            code: `const fetchUser = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) resolve({ id, name: "Alice" });
    else reject(new Error("Invalid ID"));
  }, 500);
});

// .then / .catch chain
fetchUser(1)
  .then(user => {
    console.log("Got:", user.name);  // "Got: Alice"
    return user.name.toUpperCase();  // pass to next .then
  })
  .then(upper => console.log(upper)) // "ALICE"
  .catch(err => console.error("Error:", err.message))
  .finally(() => console.log("Done"));

// Promise.all — run multiple in parallel
Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)])
  .then(users => console.log(users.length));  // 3`,
            codeNote: "Chaining .then() is powerful but deep chains get messy. async/await (next part) is cleaner for complex flows.",
          }],
        },
        {
          id: 3,
          title: "async / await",
          subtitle: "Async code that reads synchronously",
          xp: 38,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "async/await makes Promise code readable.",
            body: "`async` functions always return a Promise. `await` pauses execution inside an async function until the awaited Promise resolves. `try/catch` handles errors from awaited calls — cleaner than `.catch()` chains. `await` can only be used inside `async` functions (or at the top level of modules).",
            code: `async function loadUserData(userId) {
  try {
    // Simulated fetch
    const user = await new Promise(resolve =>
      setTimeout(() => resolve({ id: userId, name: "Alice" }), 500)
    );

    console.log("User:", user.name);  // "Alice"

    // Sequential awaits
    const profile = await fetchProfile(user.id);
    console.log("Profile:", profile);

    return { user, profile };

  } catch (error) {
    console.error("Failed:", error.message);
    return null;
  } finally {
    console.log("Load complete");
  }
}

// Run parallel with Promise.all
async function loadDashboard() {
  const [user, posts] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
  ]);
  console.log(user, posts);  // both resolved
}`,
            codeNote: "For parallel async tasks, use Promise.all([]). Sequential await runs them one after another (slower).",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Async — execution order & error handling",
          xp: 66,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the output order?",
              code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
              options: [
                "A, B, C, D",
                "A, D, C, B",
                "A, D, B, C",
                "A, C, D, B",
              ],
              correct: 1,
              body: "Sync runs first: A, D. Then microtasks (Promise): C. Then macrotasks (setTimeout): B. Order: A, D, C, B.",
            },
            {
              id: "c2",
              question: "What happens to the error here?",
              code: `async function fail() {
  throw new Error("oops");
}
fail();`,
              options: [
                "The error crashes the program immediately",
                "The error is swallowed silently",
                "An unhandled Promise rejection occurs",
                "try/catch is required here",
              ],
              correct: 2,
              body: "async functions return Promises. Throwing inside one creates a rejected Promise. Without .catch() or try/catch, it's an unhandled rejection.",
            },
            {
              id: "c3",
              question: "What's the difference between these two approaches?",
              code: `// A
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// B
const a = await fetchA();
const b = await fetchB();`,
              options: [
                "They are identical",
                "A runs both in parallel; B runs them sequentially (slower)",
                "B runs both in parallel; A runs them sequentially",
                "A throws an error if either fails; B doesn't",
              ],
              correct: 1,
              body: "Promise.all fires both requests simultaneously. Sequential awaits wait for each to finish before starting the next — double the wait time.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 15 — Fetch API & JSON (160 XP)
    // ─────────────────────────────────────────────
    {
      no: 15,
      name: "Fetch API & Working with JSON",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 160,
      parts: [
        {
          id: 1,
          title: "GET Requests with fetch",
          subtitle: "Load data from the internet",
          xp: 35,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "fetch() is the modern way to make HTTP requests.",
            body: "`fetch(url)` returns a Promise that resolves to a Response object. The Response has a `.json()` method that parses the body as JSON (also async). Always check `response.ok` — a 404 or 500 response doesn't throw; it resolves with `ok: false`. Use `jsonplaceholder.typicode.com` as a free test API.",
            code: `async function getUser(id) {
  try {
    const response = await fetch(
      \`https://jsonplaceholder.typicode.com/users/\${id}\`
    );

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const user = await response.json();
    console.log(user.name);    // "Leanne Graham"
    console.log(user.email);   // "Sincere@april.biz"
    return user;

  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
}

getUser(1);`,
            codeNote: "Two awaits: one for the network response, one to parse the body. response.json() reads and parses the stream.",
          }],
        },
        {
          id: 2,
          title: "POST Requests",
          subtitle: "Send data to a server",
          xp: 35,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "POST sends data. Always stringify the body.",
            body: "For POST (and PUT/PATCH/DELETE), pass an options object to `fetch` with `method`, `headers`, and `body`. The body must be a JSON string — use `JSON.stringify()`. Set `Content-Type: application/json` so the server knows what format to expect. The server's response is parsed the same way as GET.",
            code: `async function createPost(title, body) {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer my-token",  // if auth needed
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1,
      }),
    }
  );

  if (!response.ok) throw new Error(\`Error \${response.status}\`);

  const newPost = await response.json();
  console.log("Created post ID:", newPost.id);  // 101
  return newPost;
}

createPost("Hello World", "My first post!");`,
            codeNote: "JSON.stringify() converts the JS object to a JSON string. Always required — fetch doesn't auto-serialize objects.",
          }],
        },
        {
          id: 3,
          title: "JSON.parse & JSON.stringify",
          subtitle: "Serialize and deserialize data",
          xp: 35,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "JSON is the universal data format of the web.",
            body: "`JSON.stringify(obj)` converts a JS object to a JSON string (for sending or storing). `JSON.parse(string)` converts a JSON string back to a JS object (for using). The second argument of stringify is a replacer; the third controls indentation for pretty-printing. Not everything serializes: functions and undefined are dropped.",
            code: `const user = {
  name: "Alice",
  age: 28,
  hobbies: ["coding", "hiking"],
};

// Object → JSON string
const json = JSON.stringify(user, null, 2);
console.log(json);
// {
//   "name": "Alice",
//   "age": 28,
//   "hobbies": ["coding", "hiking"]
// }

// JSON string → Object
const parsed = JSON.parse(json);
console.log(parsed.name);     // "Alice"
console.log(parsed.hobbies);  // ["coding", "hiking"]

// Common use: localStorage
localStorage.setItem("user", JSON.stringify(user));
const saved = JSON.parse(localStorage.getItem("user"));

// What gets dropped
const data = { fn: () => "hello", val: undefined, num: 42 };
console.log(JSON.stringify(data));  // '{"num":42}' — fn and val dropped`,
            codeNote: "Deep cloning with JSON: JSON.parse(JSON.stringify(obj)) — works for plain objects but loses functions, Dates, and undefined.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Fetch & JSON — write and predict",
          xp: 55,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What's missing from this POST request?",
              code: `await fetch("/api/data", {
  method: "POST",
  body: JSON.stringify({ name: "Alice" }),
});`,
              options: [
                "The URL is wrong",
                'The "Content-Type": "application/json" header is missing',
                "POST doesn't need a body",
                "JSON.stringify is incorrect here",
              ],
              correct: 1,
              body: "Without Content-Type header, the server may not know the body is JSON and could reject or misparse it.",
            },
            {
              id: "c2",
              question: "Why must you check response.ok?",
              code: `const res = await fetch("/api/user/999");
// res.ok is false (404 Not Found)
const data = await res.json();`,
              options: [
                "fetch() throws on 404",
                "fetch() resolves (doesn't throw) even on error status codes",
                "res.json() returns null on error",
                "404 responses have no body",
              ],
              correct: 1,
              body: "fetch only rejects on network failure (no internet). HTTP error codes (404, 500) still resolve — you must check response.ok manually.",
            },
            {
              id: "c3",
              question: "What does JSON.stringify output?",
              code: `const obj = {
  name: "Bob",
  greet: function() { return "hi"; },
  score: undefined,
};
console.log(JSON.stringify(obj));`,
              options: [
                '\'{"name":"Bob","greet":"function() { return \\"hi\\"; }","score":null}\'',
                '\'{"name":"Bob"}\'',
                '\'{"name":"Bob","score":null}\'',
                "SyntaxError",
              ],
              correct: 1,
              body: "JSON.stringify drops functions and undefined values entirely. Only serializable values (strings, numbers, booleans, null, arrays, plain objects) are included.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 16 — ES6+ Modern Features (180 XP)
    // ─────────────────────────────────────────────
    {
      no: 16,
      name: "ES6+ Modern JavaScript Features",
      difficulty: "Advanced",
      duration: "18 min",
      totalXP: 180,
      parts: [
        {
          id: 1,
          title: "Optional Chaining & Nullish Coalescing",
          subtitle: "Safe access to nested data",
          xp: 40,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "?. and ?? eliminate deeply nested null checks.",
            body: "Optional chaining (`?.`) lets you access nested properties safely. If any link in the chain is null or undefined, it returns undefined instead of throwing. Nullish coalescing (`??`) provides a fallback only for null/undefined (not 0 or ''). Together they handle most optional data patterns from APIs cleanly.",
            code: `const user = {
  name: "Alice",
  address: null,
  getEmail: null,
};

// Without optional chaining — throws
// user.address.city  // TypeError!

// With optional chaining — safe
console.log(user?.address?.city);           // undefined
console.log(user?.address?.city ?? "N/A"); // "N/A"
console.log(user?.name ?? "Guest");         // "Alice"

// Works on method calls too
console.log(user?.getEmail?.());            // undefined (not a function)

// Works on arrays
const items = null;
console.log(items?.[0]);                    // undefined

// Combining both
const config = null;
const timeout = config?.network?.timeout ?? 3000;
console.log(timeout);  // 3000`,
            codeNote: "?. short-circuits: if user?.address is null, the rest of the chain is not evaluated at all.",
          }],
        },
        {
          id: 2,
          title: "Logical Assignment & Computed Keys",
          subtitle: "Shorthand operators and dynamic objects",
          xp: 40,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Newer ES features make common patterns shorter.",
            body: "Logical assignment operators combine a condition with assignment. `??=` assigns only if the left is null/undefined. `||=` assigns only if the left is falsy. `&&=` assigns only if the left is truthy. Computed property names use `[expression]` as a key — useful when the key comes from a variable.",
            code: `// Logical assignment
let a = null;
let b = "Hello";
let c = 0;

a ??= "Default";  // null → assign
b ||= "Fallback"; // truthy → no change
c &&= c * 2;      // falsy → no change

console.log(a); // "Default"
console.log(b); // "Hello"
console.log(c); // 0

// Computed property names
const field = "email";
const value = "alice@example.com";

const update = { [field]: value };
console.log(update);  // { email: "alice@example.com" }

// Dynamic object building
function buildConfig(overrides) {
  return {
    timeout: 3000,
    retries: 3,
    ...overrides,
  };
}`,
            codeNote: "Computed keys are essential for building dynamic objects from runtime values — very common in form handling.",
          }],
        },
        {
          id: 3,
          title: "Symbols & Well-Known Symbols",
          subtitle: "Unique keys and protocol hooks",
          xp: 40,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Symbols are unique, non-string property keys.",
            body: "Every `Symbol()` is guaranteed unique — even if two have the same description. They're invisible to `for...in` loops and `Object.keys()`, making them ideal for metadata or internal properties. Well-known Symbols like `Symbol.iterator` are hooks into JS language behaviour — they let you customise how objects work with `for...of`, spread, and more.",
            code: `// Symbols are always unique
const s1 = Symbol("id");
const s2 = Symbol("id");
console.log(s1 === s2);  // false

// Symbol as object key
const ID = Symbol("id");
const user = {
  name: "Alice",
  [ID]: 42,  // symbol key — hidden from enumeration
};

console.log(user[ID]);           // 42
console.log(Object.keys(user));  // ["name"] — symbol not included
console.log(user.name);          // "Alice"

// Symbol.iterator — make any object iterable
const range = {
  from: 1, to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    return {
      next: () => current <= this.to
        ? { value: current++, done: false }
        : { done: true }
    };
  }
};
console.log([...range]);  // [1, 2, 3, 4, 5]`,
            codeNote: "Symbol.iterator is how for...of works. Any object with this method can be iterated — arrays, strings, Maps, and Sets all have it.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "ES6+ — Advanced code reasoning",
          xp: 60,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this output?",
              code: `const obj = { a: 1 };
const val = obj?.b?.c ?? "missing";
console.log(val);`,
              options: ['"missing"', 'undefined', 'null', 'TypeError'],
              correct: 0,
              body: "obj?.b is undefined (b doesn't exist). undefined?.c is undefined. undefined ?? 'missing' returns 'missing'.",
            },
            {
              id: "c2",
              question: "What is logged?",
              code: `let x = 0;
x ||= 42;
x ??= 100;
console.log(x);`,
              options: ["0", "42", "100", "undefined"],
              correct: 1,
              body: "x ||= 42: x is 0 (falsy), so assigns 42. x ??= 100: x is 42 (not null/undefined), so no change. Result: 42.",
            },
            {
              id: "c3",
              question: "What does this output?",
              code: `const key = "score";
const obj = {
  name: "Alice",
  [key]: 95,
  [\`max_\${key}\`]: 100,
};
console.log(obj.score, obj.max_score);`,
              options: [
                "undefined, undefined",
                "95, 100",
                '"score", "max_score"',
                "SyntaxError",
              ],
              correct: 1,
              body: "[key] computes to 'score'. [`max_${key}`] computes to 'max_score'. Object has both properties with values 95 and 100.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 17 — ES Modules (160 XP)
    // ─────────────────────────────────────────────
    {
      no: 17,
      name: "ES Modules — import & export",
      difficulty: "Advanced",
      duration: "14 min",
      totalXP: 160,
      parts: [
        {
          id: 1,
          title: "Named & Default Exports",
          subtitle: "Exposing values from a module",
          xp: 35,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "export makes values available. import brings them in.",
            body: "Named exports use `export const/function`. You can have many per file. Default exports use `export default` — one per file, imported without braces under any name. You can mix both. Modules are strict mode by default. Each module runs once and is cached — all imports share the same instance.",
            code: `// ── math.js ──
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export default function multiply(a, b) { return a * b; }

// ── main.js ──
import multiply, { PI, add, subtract } from "./math.js";
// Default import: no braces, any name
// Named imports: braces, exact name

console.log(PI);              // 3.14159
console.log(add(2, 3));       // 5
console.log(subtract(10, 4)); // 6
console.log(multiply(4, 5));  // 20

// Import all named exports as namespace
import * as math from "./math.js";
console.log(math.PI);         // 3.14159
console.log(math.add(1, 2));  // 3`,
            codeNote: "Prefer named exports — IDEs can auto-import them. Default exports make renaming trickier.",
          }],
        },
        {
          id: 2,
          title: "Barrel Files & Re-exports",
          subtitle: "Clean public API for a folder",
          xp: 35,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Barrel files create a single import point for a whole folder.",
            body: "A barrel file (usually `index.js`) re-exports everything from files in a folder. Consumers import from the folder instead of individual files. This hides internal structure, lets you refactor freely, and gives you a clean public API surface. It's a standard pattern in React component libraries.",
            code: `// ── utils/date.js ──
export function formatDate(d) {
  return new Date(d).toLocaleDateString();
}

// ── utils/string.js ──
export function slugify(s) {
  return s.trim().toLowerCase().replace(/s+/g, "-");
}

// ── utils/api.js ──
export async function fetchUser(id) {
  const r = await fetch(\`/api/users/\${id}\`);
  return r.json();
}

// ── utils/index.js  (barrel) ──
export { formatDate } from "./date.js";
export { slugify }    from "./string.js";
export { fetchUser }  from "./api.js";

// ── app.js ──
import { formatDate, slugify, fetchUser } from "./utils";
// One clean import instead of three`,
            codeNote: "Barrel files are everywhere in React codebases. Components folder always has an index.js re-exporting all components.",
          }],
        },
        {
          id: 3,
          title: "Dynamic Imports",
          subtitle: "Load modules on demand",
          xp: 35,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Dynamic import() loads code only when needed.",
            body: "`import()` is a function that returns a Promise resolving to the module. Unlike static imports, it runs at runtime — you can import based on conditions or events. This is code splitting: load heavy libraries only when the feature using them is needed. It's how React.lazy() works under the hood.",
            code: `// Static import — always loaded (at top of file)
import { formatDate } from "./utils.js";

// Dynamic import — loaded on demand
const btn = document.querySelector("#load-chart");

btn.addEventListener("click", async () => {
  // Only load this heavy library when button is clicked
  const { Chart } = await import("./chart.js");
  const chart = new Chart("#canvas", { type: "bar" });
});

// Conditional import
async function loadLocale(lang) {
  const module = await import(\`./locales/\${lang}.js\`);
  return module.default;  // default export
}

const enMessages = await loadLocale("en");
const hiMessages = await loadLocale("hi");

// React.lazy equivalent pattern
const HeavyComponent = React.lazy(() => import("./HeavyComponent"));`,
            codeNote: "Dynamic imports are crucial for performance. Don't load 200KB of chart library until the user actually opens a chart.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Modules — code and architecture",
          xp: 55,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is wrong with this import?",
              code: `// math.js has: export default function multiply() {}
import { multiply } from "./math.js";`,
              options: [
                "The file path is wrong",
                "Default exports must be imported without curly braces",
                "You can't import functions",
                "Nothing is wrong",
              ],
              correct: 1,
              body: "Default exports are imported without braces: import multiply from './math.js'. Using braces looks for a named export called 'multiply', which doesn't exist.",
            },
            {
              id: "c2",
              question: "What does dynamic import return?",
              code: `const module = await import("./utils.js");
console.log(typeof module);`,
              options: ['"function"', '"object"', '"module"', '"undefined"'],
              correct: 1,
              body: "Dynamic import returns a Promise that resolves to a Module object (typeof 'object'). All exports are properties of this object.",
            },
            {
              id: "c3",
              question: "How many times does a module's top-level code run?",
              code: `// counter.js
let count = 0;
count++;
console.log("Module loaded, count:", count);
export { count };

// a.js
import { count } from "./counter.js";
// b.js
import { count } from "./counter.js";`,
              options: [
                "Twice — once per import",
                "Once — modules are cached after first load",
                "Zero times in this scenario",
                "Every time the export is accessed",
              ],
              correct: 1,
              body: "ES Modules are cached. The top-level code runs once on first import. All subsequent imports get the same cached module instance.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 18 — Classes & OOP (180 XP)
    // ─────────────────────────────────────────────
    {
      no: 18,
      name: "Classes & Object-Oriented Programming",
      difficulty: "Advanced",
      duration: "18 min",
      totalXP: 180,
      parts: [
        {
          id: 1,
          title: "Class Syntax & Private Fields",
          subtitle: "Constructors, methods, and encapsulation",
          xp: 40,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "Classes bundle state and behaviour into reusable blueprints.",
            body: "`class` provides clean syntax for creating objects with shared structure. `constructor()` runs when `new` is called. Methods are defined directly in the class body. Private fields (`#field`) are truly inaccessible from outside — enforced by the runtime, not just convention. Getters (`get`) let you compute read-only properties.",
            code: `class BankAccount {
  #balance;       // truly private field

  constructor(owner, initial = 0) {
    this.owner = owner;
    this.#balance = initial;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.#balance += amount;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
  }

  get balance() { return this.#balance; }  // read-only getter

  toString() {
    return \`\${this.owner}: $\${this.#balance.toFixed(2)}\`;
  }
}

const acc = new BankAccount("Alice", 1000);
acc.deposit(500);
console.log(acc.balance);   // 1500
console.log(\`\${acc}\`);      // "Alice: $1500.00"
// acc.#balance;             // SyntaxError — truly private!`,
            codeNote: "Private fields (#) are enforced at the language level — not just naming convention like _balance. Added in ES2022.",
          }],
        },
        {
          id: 2,
          title: "Inheritance with extends",
          subtitle: "Build class hierarchies",
          xp: 40,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "extends creates a parent-child class relationship.",
            body: "`extends` makes a class inherit all properties and methods from its parent. `super()` must be called first in the child's constructor. It calls the parent constructor. `super.method()` calls a parent method from the child. `instanceof` checks if an object belongs to a class or any of its ancestors.",
            code: `class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }
  speak() {
    return \`\${this.name} says \${this.sound}!\`;
  }
  toString() { return this.name; }
}

class Dog extends Animal {
  constructor(name) {
    super(name, "Woof");  // must call parent constructor first
    this.tricks = [];
  }

  learn(trick) {
    this.tricks.push(trick);
  }

  showTricks() {
    return \`\${this.name} knows: \${this.tricks.join(", ")}\`;
  }
}

const dog = new Dog("Rex");
dog.learn("sit");
dog.learn("shake");
console.log(dog.speak());       // "Rex says Woof!"
console.log(dog.showTricks());  // "Rex knows: sit, shake"
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true`,
            codeNote: "Always call super() before accessing 'this' in a child constructor — failing to do so throws a ReferenceError.",
          }],
        },
        {
          id: 3,
          title: "Static Methods & Factory Pattern",
          subtitle: "Class-level utilities",
          xp: 40,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "static belongs to the class, not instances.",
            body: "Static methods and properties belong to the class itself, not to instances created with `new`. Call them on the class: `ClassName.method()`. They're ideal for utility functions related to the class, factory methods (alternative constructors), and shared configuration. Static fields act as class-level constants.",
            code: `class Color {
  static BLACK = new Color(0, 0, 0);    // static instance
  static WHITE = new Color(255, 255, 255);

  constructor(r, g, b) {
    this.r = r; this.g = g; this.b = b;
  }

  // Static factory — alternative constructor
  static fromHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return new Color(r, g, b);
  }

  static fromArray([r, g, b]) {
    return new Color(r, g, b);
  }

  toString() { return \`rgb(\${this.r}, \${this.g}, \${this.b})\`; }
}

console.log(\`\${Color.BLACK}\`);             // "rgb(0, 0, 0)"
console.log(\`\${Color.fromHex("#ff6600")}\`); // "rgb(255, 102, 0)"
console.log(\`\${Color.fromArray([120, 80, 200])}\`); // "rgb(120, 80, 200)"`,
            codeNote: "Static factory methods are cleaner than overloading constructors. They have descriptive names like fromHex, fromArray.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "OOP — write code to pass tests",
          xp: 60,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this output?",
              code: `class Vehicle {
  constructor(type) { this.type = type; }
  describe() { return \`I am a \${this.type}\`; }
}
class Car extends Vehicle {
  constructor() { super("car"); }
  describe() { return super.describe() + " (Car)"; }
}
const c = new Car();
console.log(c.describe());`,
              options: [
                '"I am a car"',
                '"I am a car (Car)"',
                '"I am a (Car)"',
                'TypeError',
              ],
              correct: 1,
              body: "Car.describe() calls super.describe() which returns 'I am a car', then appends ' (Car)'. Result: 'I am a car (Car)'.",
            },
            {
              id: "c2",
              question: "What does this throw?",
              code: `class Counter {
  #count = 0;
  increment() { this.#count++; }
  get value() { return this.#count; }
}
const c = new Counter();
c.increment();
c.#count = 99;`,
              options: [
                "Nothing — #count becomes 99",
                "SyntaxError — private fields can't be set externally",
                "TypeError — can't set property",
                "ReferenceError",
              ],
              correct: 1,
              body: "Private fields (#) throw a SyntaxError when accessed outside the class. They are enforced at the language level.",
            },
            {
              id: "c3",
              question: "What is the correct way to call a static method?",
              code: `class MathUtils {
  static add(a, b) { return a + b; }
}`,
              options: [
                "new MathUtils().add(1, 2)",
                "MathUtils.add(1, 2)",
                "MathUtils().add(1, 2)",
                "this.add(1, 2)",
              ],
              correct: 1,
              body: "Static methods are called on the class itself: MathUtils.add(). They are not available on instances (new MathUtils() would return a different error).",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 19 — Error Handling & Debugging (160 XP)
    // ─────────────────────────────────────────────
    {
      no: 19,
      name: "Error Handling & Debugging",
      difficulty: "Advanced",
      duration: "14 min",
      totalXP: 160,
      parts: [
        {
          id: 1,
          title: "try / catch / finally",
          subtitle: "Graceful error recovery",
          xp: 35,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "try/catch turns crashes into recoverable situations.",
            body: "`try` wraps code that might throw. `catch(e)` handles the error — `e.message` and `e.stack` give details. `finally` always runs regardless of outcome — essential for cleanup (hide spinners, close connections). You can also `throw` your own errors. `throw` accepts any value, but throwing `new Error()` is conventional.",
            code: `// Basic try/catch/finally
function divide(a, b) {
  try {
    if (b === 0) throw new Error("Division by zero!");
    return a / b;
  } catch (e) {
    console.error("Caught:", e.message);
    return null;
  } finally {
    console.log("divide() attempted");  // always runs
  }
}

console.log(divide(10, 2));  // 5, then "divide() attempted"
console.log(divide(10, 0));  // "Caught: Division by zero!", null

// Async error handling
async function loadData(url) {
  let spinner;
  try {
    spinner = showSpinner();
    const res = await fetch(url);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (e) {
    showError(e.message);
    return null;
  } finally {
    hideSpinner(spinner);  // always hidden, even on error
  }
}`,
            codeNote: "finally is critical for resource cleanup — it runs whether try succeeded, catch caught, or even if there's a return inside try.",
          }],
        },
        {
          id: 2,
          title: "Custom Error Classes",
          subtitle: "Typed errors for better handling",
          xp: 35,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Create specific error types to handle them differently.",
            body: "Extending `Error` creates a custom error class with its own name and extra properties. `instanceof` lets you catch specific error types while re-throwing others. This pattern is essential in larger apps where different error types need different recovery strategies.",
            code: `class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NetworkError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "NetworkError";
    this.status = status;
  }
}

function validateUser(user) {
  if (!user.name) throw new ValidationError("name", "Name is required");
  if (user.age < 0) throw new ValidationError("age", "Age must be positive");
  return true;
}

try {
  validateUser({ name: "", age: 25 });
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(\`Field '\${e.field}': \${e.message}\`);
  } else if (e instanceof NetworkError) {
    console.log(\`HTTP \${e.status}: \${e.message}\`);
  } else {
    throw e;  // re-throw unknown errors
  }
}`,
            codeNote: "Always re-throw errors you don't handle. Silently swallowing unexpected errors creates very hard-to-find bugs.",
          }],
        },
        {
          id: 3,
          title: "Debugging Tools",
          subtitle: "console methods and the debugger",
          xp: 35,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "Master your debugging toolkit.",
            body: "`console.log` is just the start. `console.table` renders arrays of objects as a table. `console.group/groupEnd` organises related logs. `console.time/timeEnd` measures performance. The `debugger` statement pauses execution in DevTools at exactly that line. Breakpoints in the Sources panel let you step through code line by line.",
            code: `const users = [
  { id: 1, name: "Alice", role: "admin",  score: 92 },
  { id: 2, name: "Bob",   role: "user",   score: 78 },
  { id: 3, name: "Carol", role: "user",   score: 85 },
];

// Much more readable than console.log
console.table(users);

// Group related logs
console.group("User Processing");
users.forEach(u => {
  console.log(\`Processing \${u.name}...\`);
});
console.groupEnd();

// Measure performance
console.time("filter-and-sort");
const result = users
  .filter(u => u.role === "user")
  .sort((a, b) => b.score - a.score);
console.timeEnd("filter-and-sort");  // "filter-and-sort: 0.12ms"

// debugger — pauses in DevTools
function suspiciousFunction(data) {
  debugger;  // Opens Sources, pauses here
  return data.map(x => x * 2);
}`,
            codeNote: "debugger is the nuclear option — remove before committing. Prefer breakpoints in DevTools for exploratory debugging.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Error handling — code & reasoning",
          xp: 55,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is logged when this runs?",
              code: `function test() {
  try {
    throw new Error("boom");
  } catch (e) {
    console.log("caught:", e.message);
    return "from catch";
  } finally {
    console.log("finally ran");
  }
}
console.log(test());`,
              options: [
                '"caught: boom", "finally ran", "from catch"',
                '"caught: boom", "from catch", "finally ran"',
                '"finally ran", "caught: boom", "from catch"',
                '"caught: boom", "finally ran"',
              ],
              correct: 0,
              body: "catch runs first (logs 'caught: boom'), then finally runs before the function returns (logs 'finally ran'), then test() returns 'from catch'.",
            },
            {
              id: "c2",
              question: "What is the best way to re-throw unrecognised errors?",
              code: `try {
  riskyOperation();
} catch (e) {
  if (e instanceof ValidationError) {
    handleValidation(e);
  } else {
    // What goes here?
  }
}`,
              options: [
                "console.log(e)",
                "return null",
                "throw e",
                "e.handled = true",
              ],
              correct: 2,
              body: "throw e re-throws the original error so it propagates up the call stack. Silently ignoring unknown errors hides real bugs.",
            },
            {
              id: "c3",
              question: "What's wrong with this error handling?",
              code: `async function loadUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    return await res.json();
  } catch (e) {}  // empty catch
}`,
              options: [
                "async functions don't need try/catch",
                "The empty catch silently swallows all errors — bugs become invisible",
                "fetch doesn't throw so catch never runs",
                "Nothing is wrong",
              ],
              correct: 1,
              body: "An empty catch block hides all errors. Network failures, parse errors, and logic bugs all disappear silently. Always log or handle caught errors.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 20 — Local Storage (150 XP)
    // ─────────────────────────────────────────────
    {
      no: 20,
      name: "Local Storage & Session Storage",
      difficulty: "Advanced",
      duration: "12 min",
      totalXP: 150,
      parts: [
        {
          id: 1,
          title: "localStorage Basics",
          subtitle: "Persist data across sessions",
          xp: 33,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [{
            heading: "localStorage saves data between browser sessions.",
            body: "`localStorage` stores string key-value pairs that survive page refreshes and browser restarts (until manually cleared). It's synchronous and limited to ~5MB per origin. The API: `setItem(key, val)`, `getItem(key)` (returns null if missing), `removeItem(key)`, `clear()`. Objects must be serialised with `JSON.stringify` before storing.",
            code: `// Set items
localStorage.setItem("theme", "dark");
localStorage.setItem("lang", "en");

// Get items
const theme = localStorage.getItem("theme");   // "dark"
const missing = localStorage.getItem("font");  // null (not set)

// Safe get with fallback
const fontSize = localStorage.getItem("fontSize") ?? "16px";

// Remove and clear
localStorage.removeItem("lang");
// localStorage.clear();  // removes everything

// Store objects (must stringify)
const user = { name: "Alice", role: "admin" };
localStorage.setItem("user", JSON.stringify(user));

// Retrieve objects (must parse)
const saved = JSON.parse(localStorage.getItem("user") ?? "null");
console.log(saved?.name);  // "Alice"`,
            codeNote: "localStorage.getItem returns null (not undefined) for missing keys. Always use ?? not || for null defaults.",
          }],
        },
        {
          id: 2,
          title: "sessionStorage & Comparison",
          subtitle: "Tab-scoped storage",
          xp: 33,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "sessionStorage lives only as long as the tab.",
            body: "`sessionStorage` has the identical API as `localStorage` but is cleared when the tab closes. It's isolated per tab — two tabs don't share session data. Use it for data that should reset on each visit: form progress within a session, step wizards, temporary state. Use `localStorage` for preferences that should persist across sessions.",
            code: `// sessionStorage — same API, tab-scoped
sessionStorage.setItem("step", "2");
sessionStorage.setItem("formData", JSON.stringify({ email: "a@b.com" }));

const step = sessionStorage.getItem("step");  // "2"

// Comparison
//               localStorage    sessionStorage
// Survives reload?    Yes            Yes
// Survives tab close? Yes            No
// Shared across tabs? Yes            No
// Size limit:        ~5MB           ~5MB
// API:              Identical      Identical

// Helper to abstract storage
function createStorage(type = "local") {
  const store = type === "local" ? localStorage : sessionStorage;
  return {
    get: (key) => JSON.parse(store.getItem(key) ?? "null"),
    set: (key, val) => store.setItem(key, JSON.stringify(val)),
    del: (key) => store.removeItem(key),
  };
}

const local = createStorage("local");
local.set("cart", [{ id: 1, qty: 2 }]);
console.log(local.get("cart"));  // [{ id: 1, qty: 2 }]`,
            codeNote: "The helper pattern is worth building — it handles JSON serialisation automatically and prevents repetition.",
          }],
        },
        {
          id: 3,
          title: "The storage Event",
          subtitle: "Sync state across tabs",
          xp: 33,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [{
            heading: "The storage event syncs localStorage changes across tabs.",
            body: "When localStorage changes in one tab, all OTHER tabs on the same origin receive a `storage` event. The event object has `key`, `oldValue`, `newValue`, and `url`. It doesn't fire in the tab that made the change. This enables real-time sync: theme changes, login/logout, cart updates — all reflected across open tabs.",
            code: `// In any tab — fires when ANOTHER tab changes localStorage
window.addEventListener("storage", (event) => {
  console.log("Key changed:", event.key);
  console.log("Old:", event.oldValue);
  console.log("New:", event.newValue);

  if (event.key === "theme") {
    document.body.className = event.newValue;
    console.log("Theme synced across tabs!");
  }

  if (event.key === "auth-token" && !event.newValue) {
    // Another tab logged out — redirect here too
    window.location.href = "/login";
  }
});

// Trigger from this tab (won't fire event here, but will in others)
localStorage.setItem("theme", "dark");`,
            codeNote: "The storage event fires in OTHER tabs only — never in the tab that set the value. Great for logout sync.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Storage — patterns and pitfalls",
          xp: 51,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does getItem return for a key that doesn't exist?",
              code: `const val = localStorage.getItem("nonExistentKey");
console.log(val, typeof val);`,
              options: [
                "undefined, 'undefined'",
                "null, 'object'",
                '\'null\', \'string\'',
                "0, 'number'",
              ],
              correct: 1,
              body: "localStorage.getItem returns null (the value), and typeof null is 'object' — the well-known JS quirk.",
            },
            {
              id: "c2",
              question: "What happens to sessionStorage when the user duplicates a tab?",
              code: `// User has Tab A open with sessionStorage data
// User duplicates Tab A into Tab B`,
              options: [
                "Tab B gets a copy of Tab A's sessionStorage",
                "Tab B starts with empty sessionStorage",
                "Both tabs share the same sessionStorage",
                "Tab A's sessionStorage is cleared",
              ],
              correct: 0,
              body: "Tab duplication copies sessionStorage to the new tab. After that they're independent — changes in one don't affect the other.",
            },
            {
              id: "c3",
              question: "Why is this pattern safer than direct localStorage calls?",
              code: `const storage = {
  get: (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};`,
              options: [
                "It uses a different storage mechanism",
                "It handles JSON serialization automatically and provides a null fallback",
                "It encrypts the data",
                "It increases the storage limit",
              ],
              correct: 1,
              body: "The wrapper handles JSON.parse/stringify automatically and uses ?? 'null' to avoid JSON.parse(null) errors. Less boilerplate, fewer bugs.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 21 — The Event Loop (200 XP)
    // ─────────────────────────────────────────────
    {
      no: 21,
      name: "The JavaScript Event Loop",
      difficulty: "Expert",
      duration: "16 min",
      totalXP: 200,
      parts: [
        {
          id: 1,
          title: "Call Stack & Web APIs",
          subtitle: "How JS executes code",
          xp: 45,
          color: "#EF4444",
          glow: "rgba(239,68,68,0.35)",
          steps: [{
            heading: "One thread, one call stack — but async tasks live elsewhere.",
            body: "The call stack is where synchronous JavaScript executes — LIFO (Last In, First Out). When you call a function, it's pushed; when it returns, it's popped. Async operations (setTimeout, fetch, DOM events) are handed to Web APIs run by the browser. When they complete, their callbacks are queued — they don't jump back onto the call stack immediately.",
            code: `function c() { console.log("c"); }
function b() { c(); console.log("b"); }
function a() { b(); console.log("a"); }

a();
// Call stack trace:
// a() pushed → b() pushed → c() pushed
// c() pops (logs "c")
// b() pops (logs "b")
// a() pops (logs "a")
// Output: c, b, a

// Async operation goes to Web API
console.log("Start");
setTimeout(() => {
  console.log("Timeout");  // Queued by Web API after 0ms
}, 0);
console.log("End");
// Output: Start, End, Timeout
// setTimeout callback waits for call stack to be empty`,
            codeNote: "The call stack must be completely empty before any queued callback (setTimeout, Promise) can run.",
          }],
        },
        {
          id: 2,
          title: "Microtask vs Macrotask Queue",
          subtitle: "Priority determines order",
          xp: 45,
          color: "#F97316",
          glow: "rgba(249,115,22,0.35)",
          steps: [{
            heading: "Microtasks always run before the next macrotask.",
            body: "There are two queues: the microtask queue (Promises, queueMicrotask) and the macrotask queue (setTimeout, setInterval, I/O). The event loop drains ALL microtasks before picking the next macrotask. This is why Promise callbacks run before setTimeout callbacks even when both are ready.",
            code: `console.log("1 - Sync");

setTimeout(() => console.log("2 - Macro (setTimeout)"), 0);

Promise.resolve()
  .then(() => console.log("3 - Micro (Promise .then)"))
  .then(() => console.log("4 - Micro (chained .then)"));

queueMicrotask(() => console.log("5 - Micro (queueMicrotask)"));

console.log("6 - Sync");

// Exact output:
// 1 - Sync
// 6 - Sync
// 3 - Micro (Promise .then)
// 4 - Micro (chained .then)
// 5 - Micro (queueMicrotask)
// 2 - Macro (setTimeout)`,
            codeNote: "Mental model: sync code → drain ALL microtasks → one macrotask → drain ALL microtasks → repeat.",
          }],
        },
        {
          id: 3,
          title: "Blocking & Yielding the Loop",
          subtitle: "Why heavy sync code freezes the UI",
          xp: 45,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Heavy synchronous code blocks rendering.",
            body: "The browser can only render between event loop iterations. Heavy sync code — a long loop, a blocking calculation — keeps the call stack occupied and prevents rendering. The UI freezes. Fix: split the work into chunks using setTimeout(fn, 0) to yield control back to the event loop between chunks. This lets the browser render in between.",
            code: `// BAD — blocks UI for ~500ms
function blockingTask() {
  const start = Date.now();
  while (Date.now() - start < 500) {}  // busy wait
  console.log("Done — but UI was frozen the whole time!");
}
// blockingTask();

// GOOD — yields between chunks
function processInChunks(items, chunkSize = 100) {
  let index = 0;

  function processNext() {
    const end = Math.min(index + chunkSize, items.length);
    for (let i = index; i < end; i++) {
      process(items[i]);
    }
    index = end;

    if (index < items.length) {
      setTimeout(processNext, 0);  // yield — let browser breathe
    } else {
      console.log("All done!");
    }
  }

  processNext();
}`,
            codeNote: "For very heavy computation, use Web Workers (next chapter) — they run on a separate thread entirely.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Event loop — expert execution order",
          xp: 65,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the exact output order?",
              code: `async function run() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}
run();
console.log("C");`,
              options: ["A, B, C", "A, C, B", "C, A, B", "A, B then C"],
              correct: 1,
              body: "run() starts: logs A. await yields (schedules B as microtask). run() suspended. C logs synchronously. Microtask queue drains: B logs. Output: A, C, B.",
            },
            {
              id: "c2",
              question: "What happens when microtasks infinitely queue themselves?",
              code: `function infinite() {
  Promise.resolve().then(infinite);
}
infinite();
setTimeout(() => console.log("Never runs"), 0);`,
              options: [
                "setTimeout runs after all promises complete",
                "setTimeout never runs — microtask queue never empties",
                "Stack overflow occurs",
                "JS engine detects the loop and stops it",
              ],
              correct: 1,
              body: "Each .then() schedules another microtask. The queue never empties. setTimeout (macrotask) never gets a turn. The browser freezes.",
            },
            {
              id: "c3",
              question: "Why does this NOT print 0, 1, 2 as expected?",
              code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
              options: [
                "setTimeout doesn't work inside for loops",
                "By the time callbacks run, the loop has ended and var i = 3",
                "The event loop runs the callbacks before the loop ends",
                "Closures prevent setTimeout from seeing i",
              ],
              correct: 1,
              body: "The loop completes synchronously (i becomes 3). Then the event loop runs all three setTimeout callbacks — each sees the same var i = 3. Solution: use let.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 22 — Prototypes (190 XP)
    // ─────────────────────────────────────────────
    {
      no: 22,
      name: "Prototypes & Prototype Chain",
      difficulty: "Expert",
      duration: "16 min",
      totalXP: 190,
      parts: [
        {
          id: 1,
          title: "The Prototype Chain",
          subtitle: "How JS finds properties",
          xp: 42,
          color: "#EF4444",
          glow: "rgba(239,68,68,0.35)",
          steps: [{
            heading: "Every object has a hidden link to its prototype.",
            body: "When you access a property on an object, JS first checks the object itself. If not found, it climbs to the object's prototype. Then to the prototype's prototype. This chain ends at `Object.prototype` (whose prototype is null). `hasOwnProperty()` checks if a property is on the object itself, not inherited. `Object.getPrototypeOf(obj)` returns the prototype.",
            code: `function Person(name) {
  this.name = name;  // own property
}
// Method on prototype — shared by all instances
Person.prototype.greet = function() {
  return \`Hi, I'm \${this.name}\`;
};

const alice = new Person("Alice");

console.log(alice.greet());           // "Hi, I'm Alice"
console.log(alice.hasOwnProperty("name"));   // true (own)
console.log(alice.hasOwnProperty("greet"));  // false (on prototype)

// Chain: alice → Person.prototype → Object.prototype → null
console.log(Object.getPrototypeOf(alice) === Person.prototype);  // true
console.log(Object.getPrototypeOf(Person.prototype) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null (end of chain)`,
            codeNote: "greet is defined once on the prototype and shared by ALL instances. No copy per object — memory efficient.",
          }],
        },
        {
          id: 2,
          title: "Object.create & Prototypal Inheritance",
          subtitle: "Delegation without classes",
          xp: 42,
          color: "#F97316",
          glow: "rgba(249,115,22,0.35)",
          steps: [{
            heading: "Object.create builds inheritance without class syntax.",
            body: "`Object.create(proto)` creates a new object with `proto` as its prototype. When you access a property not on the object, it's looked up on `proto`. This is pure prototypal inheritance — delegation. It's simpler than classes for some patterns and is what classes compile down to.",
            code: `const animal = {
  breathe() { return \`\${this.name} breathes\`; },
  eat(food) { return \`\${this.name} eats \${food}\`; },
};

// dog delegates to animal for shared methods
const dog = Object.create(animal);
dog.name = "Rex";
dog.bark = function() { return "Woof!"; };

console.log(dog.breathe());   // "Rex breathes" — from animal
console.log(dog.bark());      // "Woof!" — own method
console.log(dog.eat("meat")); // "Rex eats meat" — from animal

console.log(dog.hasOwnProperty("breathe"));  // false (delegated)
console.log(dog.hasOwnProperty("name"));      // true (own)

// Object.create(null) — no prototype at all
const pureMap = Object.create(null);
pureMap.key = "value";
// No .toString(), .hasOwnProperty() etc. — clean data store`,
            codeNote: "Object.create(null) creates an object with absolutely no prototype. Safer for use as dictionaries/maps.",
          }],
        },
        {
          id: 3,
          title: "Class vs Prototype — Same Thing",
          subtitle: "Classes are syntactic sugar",
          xp: 42,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "ES6 classes compile down to prototype code.",
            body: "Classes don't change how JavaScript works — they're syntax sugar over prototype-based inheritance. Both approaches produce the same prototype chain. Understanding this explains why `typeof ClassName === 'function'` and why class methods are on the prototype, not each instance. It also explains how to extend built-ins like Array.",
            code: `// Class syntax
class Cat {
  constructor(name) { this.name = name; }
  meow() { return \`\${this.name}: Meow!\`; }
}

// Equivalent prototype syntax
function Cat2(name) { this.name = name; }
Cat2.prototype.meow = function() { return \`\${this.name}: Meow!\`; };

const c1 = new Cat("Whiskers");
const c2 = new Cat2("Felix");

console.log(c1.meow());  // "Whiskers: Meow!"
console.log(c2.meow());  // "Felix: Meow!"

// Both produce same prototype structure
console.log(typeof Cat);    // "function" — class IS a function!
console.log(c1.meow === c1.__proto__.meow);   // true
console.log(c2.meow === Cat2.prototype.meow); // true

// Extending Array
class Stack extends Array {
  peek() { return this[this.length - 1]; }
}
const s = new Stack();
s.push(1, 2, 3);
console.log(s.peek());  // 3`,
            codeNote: "The fact that class is typeof 'function' shows classes are just special constructor functions under the hood.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Prototypes — deep reasoning",
          xp: 64,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does this output?",
              code: `function Animal(name) { this.name = name; }
Animal.prototype.type = "animal";

const dog = new Animal("Rex");
dog.type = "dog";

console.log(dog.type);
delete dog.type;
console.log(dog.type);`,
              options: [
                '"dog", then undefined',
                '"dog", then "animal"',
                '"animal", then "animal"',
                '"dog", then "dog"',
              ],
              correct: 1,
              body: "dog.type = 'dog' creates an own property. After delete, the own property is gone. JS climbs the chain to Animal.prototype.type = 'animal'.",
            },
            {
              id: "c2",
              question: "What does Object.create(null) create?",
              code: `const obj = Object.create(null);
obj.name = "test";
console.log(obj.hasOwnProperty("name"));`,
              options: [
                "true",
                "false",
                "TypeError — hasOwnProperty is not a function",
                "undefined",
              ],
              correct: 2,
              body: "Object.create(null) creates an object with NO prototype. It has no .hasOwnProperty method. Calling it throws TypeError.",
            },
            {
              id: "c3",
              question: "Where is the greet method stored in memory?",
              code: `class Person {
  constructor(name) { this.name = name; }
  greet() { return \`Hi, \${this.name}\`; }
}
const a = new Person("Alice");
const b = new Person("Bob");`,
              options: [
                "Once on each instance (a and b each have their own copy)",
                "Once on Person.prototype, shared by all instances",
                "Once in the class definition and copied on each new call",
                "Nowhere — it's recreated each time greet() is called",
              ],
              correct: 1,
              body: "Class methods are defined on the prototype, not on each instance. a.greet === b.greet === Person.prototype.greet — same function in memory.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 23 — Generators & Iterators (190 XP)
    // ─────────────────────────────────────────────
    {
      no: 23,
      name: "Iterators, Generators & Symbols",
      difficulty: "Expert",
      duration: "16 min",
      totalXP: 190,
      parts: [
        {
          id: 1,
          title: "Iterators",
          subtitle: "The iteration protocol",
          xp: 42,
          color: "#EF4444",
          glow: "rgba(239,68,68,0.35)",
          steps: [{
            heading: "An iterator is any object with a next() method.",
            body: "The iterator protocol requires a `next()` method that returns `{ value, done }`. An iterable is an object with a `[Symbol.iterator]()` method that returns an iterator. `for...of`, spread `[...]`, and destructuring all consume iterables. Arrays, strings, Maps, and Sets are all built-in iterables.",
            code: `// Manual iterator
function rangeIterator(start, end) {
  let current = start;
  return {
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

const iter = rangeIterator(1, 3);
console.log(iter.next());  // { value: 1, done: false }
console.log(iter.next());  // { value: 2, done: false }
console.log(iter.next());  // { value: 3, done: false }
console.log(iter.next());  // { value: undefined, done: true }

// Making an object iterable
const range = {
  from: 1, to: 4,
  [Symbol.iterator]() { return rangeIterator(this.from, this.to); }
};

console.log([...range]);         // [1, 2, 3, 4]
for (const n of range) console.log(n);  // 1, 2, 3, 4`,
            codeNote: "for...of calls [Symbol.iterator]() to get an iterator, then repeatedly calls .next() until done: true.",
          }],
        },
        {
          id: 2,
          title: "Generator Functions",
          subtitle: "Pausable functions with yield",
          xp: 42,
          color: "#F97316",
          glow: "rgba(249,115,22,0.35)",
          steps: [{
            heading: "Generators pause at yield and resume on next().",
            body: "`function*` declares a generator. Each `yield` pauses execution and returns a value. `.next()` resumes. Generators are both iterables and iterators — they implement both protocols. Infinite generators (using `while(true)`) produce values on-demand without pre-computing them all.",
            code: `function* count(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;  // pause here, return i
  }
}

const gen = count(1, 3);
console.log(gen.next());  // { value: 1, done: false }
console.log(gen.next());  // { value: 2, done: false }
console.log(gen.next());  // { value: 3, done: false }
console.log(gen.next());  // { value: undefined, done: true }

// Works with for...of (generators are iterable)
for (const n of count(1, 5)) console.log(n);  // 1, 2, 3, 4, 5
console.log([...count(1, 4)]);                 // [1, 2, 3, 4]

// Infinite generator
function* idGenerator(prefix = "ID") {
  let n = 1;
  while (true) {
    yield \`\${prefix}-\${String(n++).padStart(4, "0")}\`;
  }
}
const ids = idGenerator("USR");
console.log(ids.next().value);  // "USR-0001"
console.log(ids.next().value);  // "USR-0002"`,
            codeNote: "Infinite generators never exhaust — always use break or take only what you need.",
          }],
        },
        {
          id: 3,
          title: "yield* & Async Generators",
          subtitle: "Delegate and stream async data",
          xp: 42,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "yield* delegates to another iterable. Async generators stream async data.",
            body: "`yield*` inside a generator delegates to another iterable — it yields all values from it before continuing. Async generators (`async function*`) yield Promises, consumed with `for await...of`. They're perfect for streaming data from APIs page by page — load only what's needed.",
            code: `// yield* delegation
function* numbers() { yield 1; yield 2; yield 3; }
function* letters() { yield "a"; yield "b"; }

function* combined() {
  yield* numbers();  // yields all from numbers()
  yield* letters();  // then all from letters()
  yield "done";
}
console.log([...combined()]);  // [1, 2, 3, "a", "b", "done"]

// Async generator for paginated API
async function* fetchPages(baseUrl) {
  let page = 1;
  while (true) {
    const res = await fetch(\`\${baseUrl}?page=\${page}\`);
    const data = await res.json();
    if (!data.items.length) return;  // done
    yield data.items;                // yield this page
    page++;
  }
}

async function loadAll() {
  for await (const items of fetchPages("/api/products")) {
    console.log("Page of items:", items.length);
    // Process items, then fetch next page automatically
  }
}`,
            codeNote: "Async generators are the cleanest way to paginate API data — each iteration fetches the next page on demand.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Generators — predict and write",
          xp: 64,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the output of this generator?",
              code: `function* gen() {
  yield 1;
  yield 2;
  return 3;
  yield 4;
}
const g = gen();
console.log(g.next());
console.log(g.next());
console.log(g.next());
console.log(g.next());`,
              options: [
                "{value:1, done:false}, {value:2, done:false}, {value:3, done:false}, {value:4, done:true}",
                "{value:1, done:false}, {value:2, done:false}, {value:3, done:true}, {value:undefined, done:true}",
                "{value:1, done:false}, {value:2, done:true}, {value:3, done:true}, {value:undefined, done:true}",
                "SyntaxError — return before yield 4",
              ],
              correct: 1,
              body: "return sets done:true and the value. yield 4 after return is unreachable. Subsequent .next() calls return {value: undefined, done: true}.",
            },
            {
              id: "c2",
              question: "What does [Symbol.iterator] enable?",
              code: `const obj = {
  data: [10, 20, 30],
  [Symbol.iterator]() {
    let i = 0;
    return { next: () => i < this.data.length
      ? { value: this.data[i++], done: false }
      : { done: true }
    };
  }
};
console.log([...obj]);`,
              options: [
                "SyntaxError — plain objects can't be iterated",
                "[10, 20, 30]",
                "[Symbol.iterator]",
                "undefined",
              ],
              correct: 1,
              body: "Adding [Symbol.iterator] makes obj iterable. Spread (...) calls it to collect values: [10, 20, 30].",
            },
            {
              id: "c3",
              question: "What is the advantage of an infinite generator over a pre-computed array?",
              code: `// Option A: pre-computed
const ids = Array.from({ length: 1000000 }, (_, i) => i);

// Option B: infinite generator
function* infiniteIds() {
  let i = 0;
  while (true) yield i++;
}`,
              options: [
                "Option A is faster to access individual values",
                "Option B uses no memory upfront — values created only when requested",
                "Option B is faster because generators are optimised by the engine",
                "They are identical in memory usage",
              ],
              correct: 1,
              body: "Option A allocates a 1M element array immediately. Option B creates values lazily — zero upfront cost. Essential for infinite or very large sequences.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 24 — Web APIs (190 XP)
    // ─────────────────────────────────────────────
    {
      no: 24,
      name: "Web APIs — setTimeout, Intersection Observer, Web Workers",
      difficulty: "Expert",
      duration: "16 min",
      totalXP: 190,
      parts: [
        {
          id: 1,
          title: "Timers & requestAnimationFrame",
          subtitle: "Scheduling code at the right time",
          xp: 42,
          color: "#EF4444",
          glow: "rgba(239,68,68,0.35)",
          steps: [{
            heading: "Timers schedule tasks. rAF syncs with the display.",
            body: "`setTimeout(fn, ms)` runs once after delay. `setInterval(fn, ms)` repeats. Always store the return value to cancel later. `requestAnimationFrame(fn)` fires before the next browser repaint — the correct way to animate at 60fps. It automatically pauses when the tab is hidden, saving CPU/battery.",
            code: `// setTimeout — run once
const timerId = setTimeout(() => console.log("After 2s"), 2000);
clearTimeout(timerId);  // cancel if needed

// setInterval — repeat
let count = 0;
const intervalId = setInterval(() => {
  count++;
  console.log("Tick:", count);
  if (count === 5) clearInterval(intervalId);  // stop after 5
}, 1000);

// requestAnimationFrame — animation
const box = document.querySelector("#box");
let x = 0;

function animate() {
  x += 2;
  box.style.transform = \`translateX(\${x}px)\`;

  if (x < 400) {
    requestAnimationFrame(animate);  // schedule next frame
  }
}
requestAnimationFrame(animate);  // start`,
            codeNote: "Never use setInterval for animations — it's not synced to screen refresh and can tear. Always use requestAnimationFrame.",
          }],
        },
        {
          id: 2,
          title: "Intersection Observer",
          subtitle: "Detect elements entering the viewport",
          xp: 42,
          color: "#F97316",
          glow: "rgba(249,115,22,0.35)",
          steps: [{
            heading: "IntersectionObserver detects visibility without scroll events.",
            body: "Listening to scroll events for lazy loading is expensive — fires hundreds of times per second. `IntersectionObserver` fires only when an element's visibility changes relative to the viewport. It's async, runs off the main thread, and is the performant way to implement lazy loading, infinite scroll, and sticky headers.",
            code: `// Lazy load images
const images = document.querySelectorAll("img[data-src]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;    // swap placeholder → real src
        img.removeAttribute("data-src");
        observer.unobserve(img);      // stop watching once loaded
        img.classList.add("loaded");
      }
    });
  },
  {
    threshold: 0.1,      // fire when 10% visible
    rootMargin: "200px", // start loading 200px before visible
  }
);

images.forEach(img => observer.observe(img));

// Infinite scroll
const sentinel = document.querySelector("#load-more");
const scrollObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) loadMorePosts();
});
scrollObserver.observe(sentinel);`,
            codeNote: "rootMargin lets you trigger loading before the element enters the viewport — better UX, content is ready when user scrolls.",
          }],
        },
        {
          id: 3,
          title: "Web Workers",
          subtitle: "True parallelism in the browser",
          xp: 42,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Workers run JS in a background thread — UI stays smooth.",
            body: "Web Workers run in a separate OS thread with no access to the DOM. Communication is via `postMessage()` — structured clone algorithm copies data between threads. Perfect for CPU-intensive tasks: image processing, data transformation, ML inference, sorting huge datasets. The main thread stays responsive.",
            code: `// ── worker.js ──
self.addEventListener("message", (e) => {
  const { type, data } = e.data;

  if (type === "SORT") {
    const sorted = [...data].sort((a, b) => a - b);
    self.postMessage({ type: "SORTED", result: sorted });
  }

  if (type === "SUM") {
    const sum = data.reduce((a, b) => a + b, 0);
    self.postMessage({ type: "SUMMED", result: sum });
  }
});

// ── main.js ──
const worker = new Worker("worker.js");

// Send work to the background thread
worker.postMessage({
  type: "SORT",
  data: [5, 3, 8, 1, 9, 2, 7, 4, 6],
});

// Receive result — UI was never frozen
worker.addEventListener("message", (e) => {
  console.log("Result:", e.data.result);  // [1, 2, 3, 4, 5, 6, 7, 8, 9]
  worker.terminate();  // clean up when done
});`,
            codeNote: "Workers can't access the DOM — only do computation in them. Send DOM-related work back to the main thread via postMessage.",
          }],
        },
        {
          id: 4,
          title: "Chapter Challenge",
          subtitle: "Web APIs — expert application",
          xp: 64,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "Why is requestAnimationFrame better than setInterval for animations?",
              code: `// Option A
setInterval(() => moveElement(), 16);

// Option B
function loop() {
  moveElement();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);`,
              options: [
                "Option A runs at exactly 60fps; Option B is unpredictable",
                "Option B syncs with display refresh, pauses in hidden tabs, prevents tearing",
                "They are identical for animations",
                "Option B runs faster because it skips frames",
              ],
              correct: 1,
              body: "rAF syncs with the browser's repaint cycle (exactly when a new frame is drawn), pauses when tab is hidden (saves battery), and prevents visual tearing.",
            },
            {
              id: "c2",
              question: "What limitation must Web Workers work within?",
              code: `// worker.js
self.addEventListener("message", (e) => {
  // Can the worker do this?
  document.querySelector("#output").textContent = e.data;
});`,
              options: [
                "Workers can access the DOM — this works",
                "Workers cannot access the DOM — this throws ReferenceError",
                "Workers can read but not write the DOM",
                "Workers need special permissions to access the DOM",
              ],
              correct: 1,
              body: "Web Workers have no access to the DOM (document, window don't exist). They must send results back to the main thread via postMessage for DOM updates.",
            },
            {
              id: "c3",
              question: "What does rootMargin: '200px' do in IntersectionObserver?",
              code: `new IntersectionObserver(callback, {
  threshold: 0,
  rootMargin: "200px",
});`,
              options: [
                "Fires only when the element is 200px inside the viewport",
                "Fires 200px before the element enters the viewport",
                "Creates a 200px margin around the element",
                "Delays the callback by 200 pixels of scroll",
              ],
              correct: 1,
              body: "rootMargin extends the observer's detection area. '200px' means the callback fires when the element is 200px away from the viewport — perfect for pre-loading content.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 25 — JS Performance (200 XP)
    // ─────────────────────────────────────────────
    {
      no: 25,
      name: "JavaScript Performance & Best Practices",
      difficulty: "Expert",
      duration: "18 min",
      totalXP: 200,
      parts: [
        {
          id: 1,
          title: "DOM Performance",
          subtitle: "Avoid layout thrashing",
          xp: 45,
          color: "#EF4444",
          glow: "rgba(239,68,68,0.35)",
          steps: [{
            heading: "Mixing DOM reads and writes causes expensive reflows.",
            body: "Layout thrashing happens when you alternate reading DOM layout properties (offsetHeight, getBoundingClientRect) and writing styles in a loop. Each read forces the browser to recalculate layout. Fix: batch all reads first, then all writes. `requestAnimationFrame` can also separate read/write phases.",
            code: `const items = document.querySelectorAll(".item");

// BAD — layout thrashing: read/write/read/write...
for (const item of items) {
  const h = item.offsetHeight;  // FORCE reflow
  item.style.height = h * 2 + "px";  // write → invalidates layout
  // Next iteration reads → forces reflow again!
}

// GOOD — batch reads, then writes
const heights = Array.from(items, item => item.offsetHeight); // read all
items.forEach((item, i) => {
  item.style.height = heights[i] * 2 + "px";  // write all
});
// Only one reflow total!

// DocumentFragment for bulk DOM inserts
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = \`Item \${i}\`;
  fragment.appendChild(li);  // append to fragment (no DOM reflow)
}
document.querySelector("ul").appendChild(fragment);  // one reflow`,
            codeNote: "Reading layout-triggering properties: offsetWidth/Height, clientWidth/Height, getBoundingClientRect, scrollTop.",
          }],
        },
        {
          id: 2,
          title: "Memory Leaks",
          subtitle: "Find and fix common leak patterns",
          xp: 45,
          color: "#F97316",
          glow: "rgba(249,115,22,0.35)",
          steps: [{
            heading: "Memory leaks happen when references prevent garbage collection.",
            body: "Common leak patterns: event listeners not removed when elements are destroyed, closures holding references to large objects, setInterval callbacks never cleared, global variables accumulating data. `WeakMap` and `WeakSet` hold weak references — objects in them can be garbage collected when nothing else references them.",
            code: `// LEAK: listener added, never removed
class Modal {
  open() {
    this.handler = () => this.close();
    document.addEventListener("keydown", this.handler);
  }
  // If close() isn't called, handler leaks forever
}

// FIX: always remove listeners
class Modal {
  open() {
    this.handler = (e) => {
      if (e.key === "Escape") this.close();
    };
    document.addEventListener("keydown", this.handler);
  }
  close() {
    document.removeEventListener("keydown", this.handler);
  }
}

// WeakMap — GC-friendly metadata storage
const metadata = new WeakMap();

class Component {
  constructor(el) {
    metadata.set(el, { created: Date.now() });  // weak reference
  }
}
// When el is removed from DOM and all references gone,
// WeakMap entry is garbage collected automatically`,
            codeNote: "WeakMap keys must be objects. When the object is garbage collected, the WeakMap entry disappears — no manual cleanup needed.",
          }],
        },
        {
          id: 3,
          title: "Map, Set & Efficient Data Structures",
          subtitle: "Pick the right tool for the job",
          xp: 45,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [{
            heading: "Map and Set are faster than objects and arrays for certain operations.",
            body: "`Map` is better than objects for key-value stores with frequent additions/deletions and non-string keys. `Set` has O(1) `.has()` vs O(n) for arrays. Both maintain insertion order. Use `Set` for unique values, deduplication, and fast membership checks. Use `Map` for caches and frequency counters.",
            code: `// Set — O(1) lookup, unique values
const visited = new Set();
function visit(url) {
  if (visited.has(url)) return;  // O(1) — instant!
  visited.add(url);
  fetchPage(url);
}

// Array alternative — O(n) lookup — much slower at scale
// if (visitedArr.includes(url)) return;

// Deduplicate array with Set
const nums = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(nums)];  // [1, 2, 3, 4]

// Map — better than object for dynamic key-value
const cache = new Map();
function compute(n) {
  if (cache.has(n)) return cache.get(n);  // O(1)
  const result = expensiveCalc(n);
  cache.set(n, result);
  return result;
}

// Map can have any type as key
const elData = new Map();
const btn = document.querySelector("#btn");
elData.set(btn, { clicks: 0 });  // DOM node as key!`,
            codeNote: "Set.has() is O(1). Array.includes() is O(n). For 10,000 items, Set is ~10,000x faster for lookups.",
          }],
        },
        {
          id: 4,
          title: "Final Boss Challenge",
          subtitle: "Expert JavaScript mastery",
          xp: 65,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.5)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "This code causes layout thrashing. What is the minimum fix?",
              code: `const boxes = document.querySelectorAll(".box");
for (const box of boxes) {
  const w = box.offsetWidth;
  box.style.width = (w * 2) + "px";
}`,
              options: [
                "Use getElementById instead of querySelector",
                "Read all widths first into an array, then set all widths in a second loop",
                "Wrap in requestAnimationFrame",
                "Use CSS transitions instead",
              ],
              correct: 1,
              body: "Layout thrashing is caused by alternating reads and writes. Batch all reads first (store widths), then batch all writes (set widths) to trigger only one reflow.",
            },
            {
              id: "c2",
              question: "What will this WeakMap allow that a regular Map wouldn't?",
              code: `const wm = new WeakMap();
let obj = { data: "large dataset" };
wm.set(obj, { meta: "info" });

obj = null;  // remove the only reference to obj`,
              options: [
                "The WeakMap entry persists forever",
                "The garbage collector can now free obj's memory — no leak",
                "wm.get(obj) still works after obj = null",
                "WeakMap prevents obj from being modified",
              ],
              correct: 1,
              body: "WeakMap holds weak references. When obj = null removes the last strong reference, GC can collect obj. Regular Map would keep obj alive (memory leak).",
            },
            {
              id: "c3",
              question: "Which data structure is most efficient for this use case?",
              code: `// Track which user IDs have been processed
// Requirements:
// - Fast "has this been processed?" checks
// - Add new IDs frequently
// - No duplicate entries needed
// - ~1 million entries`,
              options: [
                "Array — most familiar and flexible",
                "Object — key-value is natural for IDs",
                "Set — O(1) lookup, deduplication built-in, designed for this",
                "Map — best for key-value with metadata",
              ],
              correct: 2,
              body: "Set is ideal: O(1) has(), automatic deduplication, no overhead of key-value pairs. Array.includes() at 1M entries would be catastrophically slow.",
            },
          ],
        },
      ],
    },
  ],
}



// ─── data/pythonCourse.js ─────────────────────────────────────────────────────

export const pythonCourse = {
  language: "Python",
  totalChapters: 25,
  accentColor: "#3b82f6",
  accentLight: "#60a5fa",
  chapters: [
    // ─────────────────────────────────────────────
    // CHAPTER 1 — Introduction to Python  [MCQ]
    // ─────────────────────────────────────────────
    {
      no: 1,
      name: "Introduction to Python",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Discover what Python is, why the world loves it, and write your very first line of code.",
      parts: [
        {
          id: 1,
          title: "What is Python?",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: false,
          steps: [
            {
              heading: "The Language That Runs Everywhere.",
              body:
                "Think of Python as a translator between you and your computer. Normally, computers only understand ones and zeros — pure noise to us. Python lets you write instructions that are close to plain English, and it converts them into something the machine understands.\n\nPython was created in 1991 by Guido van Rossum. His goal was simple: make code feel less like a puzzle and more like writing a sentence. Today Python runs Netflix recommendations, Instagram, NASA simulations, and ChatGPT.",
              code: `# The '#' symbol makes a comment — Python ignores it completely.
# Comments are notes for humans, not the computer.

print("Hello, World!")
# Output: Hello, World!`,
            },
            {
              body:
                "Python can act as a calculator right out of the box. You write math almost like you would on paper. Two symbols worth knowing: ** means 'to the power of', and % gives you the leftover (remainder) after dividing.",
              code: `print(2 + 3)     # 5
print(10 - 4)    # 6
print(3 * 7)     # 21
print(10 / 3)    # 3.333...
print(10 // 3)   # 3  (floor division — drops the decimal)
print(2 ** 8)    # 256 (2 to the power 8)
print(17 % 5)    # 2  (17 divided by 5 leaves 2 over)`,
            },
          ],
        },
        {
          id: 2,
          title: "print() and input(): Speak & Listen",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: false,
          steps: [
            {
              heading: "Your Program's Voice and Ears.",
              body:
                "print() is your program's voice. Whatever you put inside the brackets appears on the screen. Think of it as a megaphone — you hand it something, it shouts it out.\n\nYou can print words (wrapped in quotes), numbers, or the result of math. The comma between items in print() automatically adds a space.",
              code: `print("I am learning Python!")
print(42)
print("Result:", 3 + 7)
print("Pi is roughly", 3.14)`,
            },
            {
              body:
                "input() is your program's ears. It pauses and waits for the user to type something, then hands that text back to you.\n\nBig rule: input() ALWAYS gives you back text (a string), even if the user typed a number. To use that number in math, you need to convert it using int() or float().",
              code: `name = input("Enter your name: ")
print("Welcome,", name)

age = input("Your age: ")
age = int(age)           # convert text → whole number
print("In 5 years:", age + 5)`,
            },
          ],
        },
        {
          id: 3,
          title: "Your First Mini Program",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: false,
          steps: [
            {
              heading: "Input. Process. Output. That's All.",
              body:
                "Every program ever built does three things: take input, do something with it, give output. Even NASA's software follows this pattern — it just does fancier things in the middle.\n\nHere is a tip calculator. No tricks — just what you have already learned.",
              code: `bill = input("Enter bill amount: ")
bill = float(bill)        # float keeps decimal values (e.g. 250.50)

tip = bill * 0.10         # 10% tip
total = bill + tip

print("Tip:", tip)
print("Total:", total)`,
            },
            {
              body:
                "We used float() instead of int() because money has decimals. int(9.99) would give us 9 — cutting off the cents. Always match the conversion to the data you expect.",
              code: `print(int(9.99))    # 9   (cuts the decimal)
print(float(9))     # 9.0 (keeps decimal format)
print(str(100))     # '100' (turns number into text)`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 1 Boss: The Basics Quiz",
          subtitle: "Prove You Got It.",
          xp: 40,
          type: "mcq_test",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: true,
          challenges: [
            {
              id: 'c1',
              code: null,
              question: "What does print() do?",
              options: [
                "Saves output to a file",
                "Displays text on the screen",
                "Reads input from the user",
                "Creates a variable",
              ],
              correct: 1,
            },
            {
              id: 'c2',
              code: null,
              question: "What is the output of: print(2 ** 4) ?",
              options: ["6", "8", "16", "24"],
              correct: 2,
            },
            {
              id: 'c3',
              code: null,
              question: "What does input() always return?",
              options: ["int", "float", "bool", "str"],
              correct: 3,
            },
            {
              id: 'c4',
              code: null,
              question: "What does print(17 % 5) output?",
              options: ["3", "2", "12", "3.4"],
              correct: 1,
            },
            {
              id: 'c5',
              code: null,
              question: "Which line correctly converts the string '42' to an integer?",
              options: [
                "int = 42",
                "42 = int(age)",
                "age = int('42')",
                "integer('42')",
              ],
              correct: 2,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 2 — Variables & Data Types  [MCQ]
    // ─────────────────────────────────────────────
    {
      no: 2,
      name: "Variables & Data Types",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Learn to store information in labeled boxes and understand the four main kinds of data Python works with.",
      parts: [
        {
          id: 1,
          title: "Variables: The Labeled Box",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: false,
          steps: [
            {
              heading: "Named Storage for Your Data.",
              body:
                "A variable is like a labeled storage box. You give the box a name, put a value inside, and whenever you need that value again, you call the box by name. Python remembers what's inside.\n\nYou create a variable with = (the assignment operator). Name on the left, value on the right.",
              code: `player_name = "Alex"
player_score = 150
player_health = 98.5
is_alive = True

print(player_name)    # Alex
print(player_score)   # 150`,
            },
            {
              body:
                "Variable naming rules:\n• No spaces — use underscores instead: player_name ✓\n• Cannot start with a number: 1player ✗\n• Case-sensitive: score and Score are two different boxes\n\nGood names describe what's inside. Bad names make you guess.",
              code: `# Good names
user_age = 25
total_price = 49.99
is_logged_in = True

# Confusing but valid
x = 25
tp = 49.99

# This CRASHES — can't start with a number
# 1st_user = "Alex"`,
            },
          ],
        },
        {
          id: 2,
          title: "The Four Main Data Types",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: false,
          steps: [
            {
              heading: "Understanding What Your Data Actually Is.",
              body:
                "Not all boxes hold the same kind of thing. Python has different data types:\n\n• int — whole numbers: 5, 100, -3\n• float — decimals: 3.14, -0.5\n• str — text in quotes: 'hello', '42'\n• bool — only two values: True or False\n\nPython picks the type automatically based on what you write.",
              code: `age = 21              # int
temperature = 36.6    # float
city = "Delhi"        # str
is_online = True      # bool

# Check any variable's type
print(type(age))          # <class 'int'>
print(type(city))         # <class 'str'>
print(type(is_online))    # <class 'bool'>`,
            },
            {
              body:
                "You can convert between types using int(), float(), str(), and bool(). This is called type casting. It is like repacking the same item into a differently shaped box.",
              code: `price_text = "99"          # str
price_num = int(price_text)  # int: 99
print(price_num + 1)       # 100

score = 4.9
print(int(score))          # 4 — decimals are cut off, not rounded!

level = 7
print("Level: " + str(level))  # must convert to join with text`,
            },
          ],
        },
        {
          id: 3,
          title: "f-Strings: The Fill-in-the-Blank Trick",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: false,
          steps: [
            {
              body:
                "f-strings are the cleanest way to mix variables and text. Put the letter f right before your opening quote, then wrap any variable or expression in curly braces {}. Python fills in the blank automatically.\n\nIt is like a template letter: 'Dear {name}, your balance is {amount}.'",
              code: `name = "Priya"
score = 95

print(f"Hello, {name}!")
print(f"{name} scored {score} points.")
print(f"Double score: {score * 2}")`,
            },
            {
              body:
                "You can do math, call methods, or format numbers directly inside the {}. This is much cleaner than concatenation with + which gets messy fast.",
              code: `price = 49.99
qty = 3

# Old way — messy
print("Total: " + str(price * qty))

# f-string — clean
print(f"Total: {price * qty}")

# Round to 2 decimal places with :.2f
print(f"Total: {price * qty:.2f}")`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 2 Boss: Variables Quiz",
          heading: "Variables & Types Mastery Test.",
          xp: 40,
          type: "mcq_test",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: true,
          challenges: [
            {
              question: "What data type is 3.14?",
              options: ["int", "str", "float", "bool"],
              correct: 2,
            },
            {
              question: "What will print(type(True)) show?",
              options: [
                "<class 'str'>",
                "<class 'int'>",
                "<class 'bool'>",
                "<class 'float'>",
              ],
              correct: 2,
            },
            {
              question: "Which is a valid variable name in Python?",
              options: ["2player", "player name", "player_name", "player-name"],
              correct: 2,
            },
            {
              question: "What does print(f'Score: {4 * 5}') output?",
              options: ["Score: {4 * 5}", "Score: 4 * 5", "Score: 20", "Error"],
              correct: 2,
            },
            {
              question: "What is the value of int(7.9)?",
              options: ["8", "7", "7.9", "Error"],
              correct: 1,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 3 — Conditionals  [MCQ]
    // ─────────────────────────────────────────────
    {
      no: 3,
      name: "Conditionals: The Crossroads of Logic",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Teach your program how to make decisions and choose different paths based on the situation.",
      parts: [
        {
          id: 1,
          title: "The 'if' Statement: The Bouncer",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Choose One Path. Abandon the Other.",
              body:
                "An 'if' statement is like a bouncer at a club. The bouncer checks a condition ('Are you 18 or older?'). If the answer is True, you get in and the code inside runs. If it is False, you are turned away and that code is skipped completely.",
              code: `age = 20

if age >= 18:
    print("Welcome to the club!")

# Nothing happens if age is less than 18`,
            },
            {
              body:
                "The lines after the 'if' must be indented (pushed 4 spaces to the right). In Python, indentation is not optional styling — it is the rule that tells the computer which lines belong inside the if block.\n\nLines that are NOT indented run no matter what.",
              code: `score = 100

if score == 100:
    print("Perfect score!")      # runs only if True
    print("You get a gold star!") # runs only if True

print("Game over.")  # always runs, not inside the if`,
            },
          ],
        },
        {
          id: 2,
          title: "else & elif: Plan B and Plan C",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Have Backup Plans. Always.",
              body:
                "'else' is your backup plan. If the 'if' condition is False, the 'else' block runs instead. Think of it as a two-door entry — if you pass the check you go through door A, otherwise door B.",
              code: `is_raining = True

if is_raining:
    print("Take an umbrella.")
else:
    print("Wear sunglasses.")`,
            },
            {
              body:
                "'elif' (else if) lets you check multiple conditions in order. Python checks the first, then the second, then the third, and stops the moment one is True. It is like trying on shirts — stop when one fits.",
              code: `temperature = 28

if temperature > 35:
    print("It's scorching hot!")
elif temperature > 25:
    print("It's warm and nice.")
elif temperature > 15:
    print("A bit cool.")
else:
    print("Bundle up, it's cold!")`,
            },
          ],
        },
        {
          id: 3,
          title: "Logical Operators: and, or, not",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Combine Conditions. Build Complex Logic.",
              body:
                "'and' requires BOTH conditions to be True — like needing both a key AND a password to open a locked door.\n'or' needs just ONE to be True — like getting a discount if you are a student OR a senior.",
              code: `has_ticket = True
has_id = True

if has_ticket and has_id:
    print("You can board.")

is_student = False
is_senior = True

if is_student or is_senior:
    print("Discount applied!")`,
            },
            {
              body:
                "'not' flips a condition upside down. True becomes False, False becomes True. Use it when it is easier to say what you do NOT want.",
              code: `is_banned = False

if not is_banned:
    print("Access granted.")

password = ""

if not password:    # empty string is treated as False
    print("Please enter a password.")`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 3 Boss: Conditionals Quiz",
          heading: "Test Your Logic. Ace the Quiz.",
          xp: 40,
          type: "mcq_test",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: true,
          challenges: [
            {
              question: "What does 'elif' stand for?",
              options: ["end if", "else if", "extra if", "equal if"],
              correct: 1,
            },
            {
              question:
                "What will this print?\nif 5 > 10:\n    print('A')\nelse:\n    print('B')",
              options: ["A", "B", "AB", "Nothing"],
              correct: 1,
            },
            {
              question: "Which operator requires BOTH conditions to be True?",
              options: ["or", "not", "and", "both"],
              correct: 2,
            },
            {
              question: "What does 'not False' evaluate to?",
              options: ["False", "None", "True", "Error"],
              correct: 2,
            },
            {
              question: "How do you correctly check if x equals 10?",
              options: ["x = 10", "x === 10", "x == 10", "x equals 10"],
              correct: 2,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 4 — Lists  [MCQ]
    // ─────────────────────────────────────────────
    {
      no: 4,
      name: "Lists: Your First Data Collection",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Store multiple items in one variable and learn how to access, change, and slice through them.",
      parts: [
        {
          id: 1,
          title: "Creating Lists: The Cargo Train",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Store Multiple Items. In Order.",
              body:
                "A list is like a cargo train. Instead of holding one thing, the train has multiple carriages, each with a different piece of data. Build a list using square brackets [], separating each item with a comma.\n\nLists can hold any type of data — text, numbers, booleans, even other lists.",
              code: `inventory = ["Sword", "Shield", "Potion"]
scores = [95, 87, 100, 72]
mixed = ["Alice", 25, True]

print(inventory)        # ['Sword', 'Shield', 'Potion']
print(len(scores))      # 4  (counts items)`,
            },
            {
              body:
                "Each item has a position called an index. Python counts from 0, not 1. First item → index 0, second → index 1, and so on.\n\nNegative indexes count from the end: -1 is always the last item.",
              code: `colors = ["Red", "Green", "Blue"]

print(colors[0])    # Red    (first)
print(colors[1])    # Green  (second)
print(colors[2])    # Blue   (third)
print(colors[-1])   # Blue   (last)`,
            },
          ],
        },
        {
          id: 2,
          title: "Modifying Lists: Add, Remove, Change",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Lists Aren't Locked. Change Them Anytime.",
              body:
                "Lists are mutable — you can change them after creation. Target the index and assign a new value. It is like swapping the cargo in one specific carriage.",
              code: `menu = ["Pizza", "Burger", "Salad"]

menu[1] = "Tacos"     # replace Burger
print(menu)           # ['Pizza', 'Tacos', 'Salad']`,
            },
            {
              body:
                ".append() adds an item to the END of the list. .remove() removes the first item that matches the value you give it. .pop() removes by index (and returns what was removed).",
              code: `cart = ["Apple", "Banana"]

cart.append("Orange")      # add to end
cart.remove("Banana")      # remove by value
cart.pop(0)                # remove by index (removes "Apple")

print(cart)  # ['Orange']`,
            },
          ],
        },
        {
          id: 3,
          title: "Slicing: Grab a Chunk",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Extract Part of a List. Precision Targeting.",
              body:
                "Slicing extracts a portion of a list using [start:stop]. The start is included, the stop is NOT. Think of slicing a loaf of bread — you pick where to start cutting and where to stop.",
              code: `letters = ["A", "B", "C", "D", "E"]

print(letters[1:4])  # ['B', 'C', 'D']
print(letters[:3])   # ['A', 'B', 'C']  (from the start)
print(letters[2:])   # ['C', 'D', 'E']  (to the end)
print(letters[:])    # full copy`,
            },
            {
              body:
                "len() counts the total number of items in a list. sorted() returns a new sorted list without changing the original. Both come up constantly in real programs.",
              code: `numbers = [42, 7, 99, 15, 3]

print(len(numbers))       # 5
print(sorted(numbers))    # [3, 7, 15, 42, 99]
print(numbers)            # [42, 7, 99, 15, 3]  unchanged`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 4 Boss: Lists Quiz",
          heading: "Master Lists. Answer Every Question.",
          xp: 40,
          type: "mcq_test",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          isChallengepart: true,
          challenges: [
            {
              question: "What is the index of the FIRST item in a Python list?",
              options: ["1", "-1", "0", "first"],
              correct: 2,
            },
            {
              question: "What does .append('X') do to a list?",
              options: [
                "Adds X at index 0",
                "Adds X to the end",
                "Removes X",
                "Sorts the list",
              ],
              correct: 1,
            },
            {
              question:
                "What does items[1:3] return from ['A', 'B', 'C', 'D']?",
              options: [
                "['A', 'B', 'C']",
                "['B', 'C', 'D']",
                "['B', 'C']",
                "['A', 'B']",
              ],
              correct: 2,
            },
            {
              question: "What does items[-1] return from ['X', 'Y', 'Z']?",
              options: ["'X'", "'Y'", "'Z'", "Error"],
              correct: 2,
            },
            {
              question: "What does len(['a', 'b', 'c']) return?",
              options: ["2", "3", "4", "0"],
              correct: 1,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 5 — Loops  [CODING TEST — first one]
    // ─────────────────────────────────────────────
    {
      no: 5,
      name: "Loops: Repeat Without the Boredom",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Automate repetitive tasks by telling Python to do something over and over — instantly and without complaining.",
      parts: [
        {
          id: 1,
          title: "The 'for' Loop: The Card Dealer",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Repeat for Every Item. One by One.",
              body:
                "Imagine a card dealer handing out one card at a time until the deck is empty. A 'for' loop does exactly that with a list. It goes through every item, temporarily names it, runs your code, then moves to the next one.",
              code: `weapons = ["Sword", "Bow", "Axe"]

for weapon in weapons:
    print("Equipping:", weapon)

# Output:
# Equipping: Sword
# Equipping: Bow
# Equipping: Axe`,
            },
            {
              body:
                "If you want to repeat code a set number of times without a list, use range(). range(5) generates numbers 0 through 4. range(1, 6) gives you 1 through 5.",
              code: `for i in range(3):
    print("Loading...")

for i in range(1, 6):
    print(f"Level {i}")`,
            },
          ],
        },
        {
          id: 2,
          title: "The 'while' Loop: The Running Engine",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Keep Going While True. Stop When False.",
              body:
                "A 'while' loop keeps running AS LONG AS a condition is True. It is like a car engine that runs as long as there is gas. It checks the condition before each repeat — the moment it becomes False, the loop stops.",
              code: `lives = 3

while lives > 0:
    print(f"Lives left: {lives}")
    lives = lives - 1

print("Game over!")`,
            },
            {
              body:
                "If the condition never becomes False, the loop runs forever (an infinite loop) and your program freezes. Always make sure something inside the loop eventually changes the condition.",
              code: `countdown = 5

while countdown > 0:
    print(countdown)
    countdown -= 1    # same as: countdown = countdown - 1

print("Blast off!")`,
            },
          ],
        },
        {
          id: 3,
          title: "break & continue: Skip and Escape",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Emergency Exit and Skip Buttons.",
              body:
                "'break' is the emergency exit. The moment Python hits it, the loop ends immediately — no matter how many items are left. Use it when you found what you needed and there is no reason to keep searching.",
              code: `items = ["rock", "rock", "gold", "rock"]

for item in items:
    if item == "gold":
        print("Found gold! Stopping.")
        break
    print("Just a rock...")`,
            },
            {
              body:
                "'continue' is like skipping a song on a playlist. Instead of ending the loop, it skips the rest of the current lap and jumps to the next one.",
              code: `for num in range(1, 7):
    if num == 4:
        continue    # skip 4, go to 5
    print(num)

# Output: 1 2 3 5 6`,
            },
          ],
        },
         {
          id: 5,
          title: "Code Challenge",
          subtitle: "Work with variables",
          xp: 50,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.4)",
          codeChallenge: {
            prompt: "Write a function called swapCase that takes a string and swaps casing.",
            description: "Given a string, return a new string where every uppercase letter becomes lowercase, and every lowercase letter becomes uppercase. For example: swapCase(\"Hello\") → \"hELLO\"",
            starterCode: `function swapCase(str) {\n  // write your code here\n}`,
            hint: "Loop through each character. Use char === char.toUpperCase() to detect uppercase. Build a result string.",
            testCases: [
              { call: 'swapCase("Hello")', expected: "hELLO", label: 'swapCase("Hello")' },
              { call: 'swapCase("JavaScript")', expected: "jAVAsCRIPT", label: 'swapCase("JavaScript")' },
              { call: 'swapCase("abc")', expected: "ABC", label: 'swapCase("abc")' },
            ],
          },
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 6 — Functions
    // ─────────────────────────────────────────────
    {
      no: 6,
      name: "Functions: Write Once, Use Everywhere",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Stop copy-pasting code. Wrap reusable logic in a function and call it whenever you need it.",
      parts: [
        {
          id: 1,
          title: "Defining Functions: The Recipe Card",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Write Once. Use Forever.",
              body:
                "A function is like a recipe card. You write the steps once, give the recipe a name, and whenever you want that dish, you just call the name — no rewriting needed.\n\nUse 'def' to define a function. Everything indented below it is the function's body.",
              code: `def greet():
    print("Hello there!")
    print("Welcome to the app.")

# Call it as many times as you like
greet()
greet()`,
            },
            {
              body:
                "Functions can accept inputs called 'parameters'. These are like blanks in your recipe ('add ___ cups of flour'). When you call the function you fill in the blank with actual values called 'arguments'.",
              code: `def greet_user(name):
    print(f"Hello, {name}!")

greet_user("Alice")    # Hello, Alice!
greet_user("Bob")      # Hello, Bob!
greet_user("Priya")    # Hello, Priya!`,
            },
          ],
        },
        {
          id: 2,
          title: "Return Values: Getting Something Back",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Functions Return Results. Pass Data Back.",
              body:
                "Some functions do not just print — they give something back. Use 'return' to send a value out. Think of it as the chef handing you the finished dish. The function stops the moment it hits return.",
              code: `def add(a, b):
    return a + b

result = add(3, 5)
print(result)        # 8

print(add(10, 20))   # 30`,
            },
            {
              body:
                "You can give parameters default values. If the caller does not provide that argument, the default is used. This makes functions flexible without forcing every caller to fill every blank.",
              code: `def power(base, exponent=2):
    return base ** exponent

print(power(5))        # 25  (default exponent = 2)
print(power(5, 3))     # 125
print(power(2, 10))    # 1024`,
            },
          ],
        },
        {
          id: 3,
          title: "Scope: What Happens in the Function, Stays There",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Privacy Within Your Function.",
              body:
                "Variables created inside a function only exist INSIDE that function. This is called local scope. It is like a chef's notepad — the notes are only in the kitchen, not in the dining room.\n\nTrying to access that variable outside the function will crash your program.",
              code: `def make_sandwich():
    filling = "tuna"       # local variable
    print(f"Making a {filling} sandwich")

make_sandwich()

# print(filling)    ← CRASH: 'filling' doesn't exist out here`,
            },
            {
              body:
                "Variables defined OUTSIDE all functions are global — available everywhere. But the clean habit is to pass data in through parameters and send it out through return. It keeps functions predictable and self-contained.",
              code: `discount = 0.10   # global

def apply_discount(price):
    return price * (1 - discount)  # reads global fine

print(apply_discount(100))   # 90.0
print(apply_discount(250))   # 225.0`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 6 Boss: The Calculator",
          heading: "Build a Tool. Make It Work.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          instructions:
            "Build a basic calculator using a function.\n\n1. Create a function called 'calculate' that takes three parameters: num1, operator ('+', '-', '*', '/'), and num2.\n2. Based on the operator, return the correct result.\n3. If the operator is '/' and num2 is 0, return the string 'Cannot divide by zero'.\n4. Call the function and print results for:\n   - calculate(10, '+', 5)\n   - calculate(10, '/', 0)\n   - calculate(3, '*', 7)",
          startingCode: `# Create your calculate function here:


# Test it:
print(calculate(10, '+', 5))
print(calculate(10, '/', 0))
print(calculate(3, '*', 7))`,
          expectedOutput: `15\nCannot divide by zero\n21`,
          solutionCode: `def calculate(num1, operator, num2):
    if operator == '+':
        return num1 + num2
    elif operator == '-':
        return num1 - num2
    elif operator == '*':
        return num1 * num2
    elif operator == '/':
        if num2 == 0:
            return "Cannot divide by zero"
        return num1 / num2

print(calculate(10, '+', 5))
print(calculate(10, '/', 0))
print(calculate(3, '*', 7))`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 7 — Dictionaries
    // ─────────────────────────────────────────────
    {
      no: 7,
      name: "Dictionaries: The Smart Lookup Table",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Store data as key-value pairs — like a real dictionary where every word has a definition.",
      parts: [
        {
          id: 1,
          title: "Creating Dictionaries: Word & Definition",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Lookup Tables. Named Access.",
              body:
                "A Python dictionary works like a real dictionary: you look up a word (the key) and get its meaning (the value). Instead of index numbers, you use meaningful names to access data.\n\nDictionaries use curly braces {} with key: value pairs separated by commas.",
              code: `player = {
    "name": "Alex",
    "level": 5,
    "health": 100,
    "is_alive": True
}

print(player["name"])    # Alex
print(player["level"])   # 5`,
            },
            {
              body:
                "Keys are usually strings. Values can be anything — numbers, lists, booleans, or other dictionaries. You access a value by putting its key in square brackets.",
              code: `car = {
    "brand": "Toyota",
    "year": 2023,
    "colors": ["Red", "Blue", "White"]
}

print(car["brand"])       # Toyota
print(car["colors"][0])   # Red`,
            },
          ],
        },
        {
          id: 2,
          title: "Modifying Dictionaries: Add, Update, Remove",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Change Dicts. They're Not Locked.",
              body:
                "To update a value, target the key and assign a new one. To add a brand new key-value pair, just assign to a key that does not exist yet — Python creates it automatically.",
              code: `profile = {"username": "coder99", "score": 200}

profile["score"] = 350       # update existing
profile["rank"] = "Gold"     # add new key

print(profile)`,
            },
            {
              body:
                "del removes a key permanently. .pop() removes it and also returns the value. .get() is a safe way to read a key — if the key does not exist, it returns None instead of crashing.",
              code: `config = {"theme": "dark", "sound": True, "volume": 80}

del config["sound"]                # remove
v = config.pop("volume")           # remove and capture value
print(v)                           # 80

print(config.get("theme"))         # dark
print(config.get("fps"))           # None  (no crash!)`,
            },
          ],
        },
        {
          id: 3,
          title: "Looping Through Dictionaries",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Iterate Keys, Values, or Both.",
              body:
                "Loop over a dictionary three ways: .keys() for keys only, .values() for values only, .items() for both at the same time. .items() is the one you will use most.",
              code: `grades = {"Alice": 92, "Bob": 78, "Priya": 95}

for name, score in grades.items():
    print(f"{name}: {score}")`,
            },
            {
              body:
                "Use the 'in' keyword to check if a key exists before accessing it. This prevents a KeyError crash when you are not sure if the key is there.",
              code: `settings = {"volume": 70, "brightness": 80}

if "volume" in settings:
    print("Volume:", settings["volume"])

if "theme" not in settings:
    print("No theme set, using default.")`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 7 Boss: The Contact Book",
          heading: "Organize Data. Use Dictionaries Right.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          instructions:
            "Build a mini contact book.\n\n1. Create a 'contacts' dictionary with 3 entries: 'Alice'→'555-0001', 'Bob'→'555-0002', 'Charlie'→'555-0003'.\n2. Add a new contact: 'Diana' with number '999-0000'.\n3. Update Alice's number to '555-9999'.\n4. Loop through the dictionary and print each entry in the format:\n   'Name: [name] | Phone: [number]'",
          startingCode: `# Create your contacts dictionary:
contacts = {}

# Add Diana:

# Update Alice:

# Loop and print:
`,
          expectedOutput: `Name: Alice | Phone: 555-9999\nName: Bob | Phone: 555-0002\nName: Charlie | Phone: 555-0003\nName: Diana | Phone: 999-0000`,
          solutionCode: `contacts = {
    "Alice": "555-0001",
    "Bob": "555-0002",
    "Charlie": "555-0003"
}

contacts["Diana"] = "999-0000"
contacts["Alice"] = "555-9999"

for name, phone in contacts.items():
    print(f"Name: {name} | Phone: {phone}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 8 — Strings Deep Dive
    // ─────────────────────────────────────────────
    {
      no: 8,
      name: "Strings: More Than Just Text",
      difficulty: "Beginner",
      totalXp: 100,
      summary:
        "Discover powerful string methods that let you search, replace, split, and transform text effortlessly.",
      parts: [
        {
          id: 1,
          title: "Indexing & Case Methods",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Strings Are Sequences. Slice and Transform Them.",
              body:
                "Strings are sequences of characters — like a list but for text. Each character has an index starting from 0. You can slice them exactly like lists using [start:stop].",
              code: `word = "Python"

print(word[0])     # P
print(word[-1])    # n  (last character)
print(word[1:4])   # yth
print(len(word))   # 6`,
            },
            {
              body:
                "Strings are immutable — you cannot change a character in place. But you can create a new transformed version using methods like .upper(), .lower(), and .title().",
              code: `text = "hello world"

print(text.upper())    # HELLO WORLD
print(text.lower())    # hello world
print(text.title())    # Hello World  (capitalizes each word)`,
            },
          ],
        },
        {
          id: 2,
          title: "Search & Replace",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Find What You're Looking For. Change It.",
              body:
                ".find() returns the index where a substring starts. If not found, it returns -1 (not a crash). .count() counts how many times something appears.",
              code: `sentence = "I love Python and Python loves me"

print(sentence.find("Python"))    # 7
print(sentence.count("Python"))   # 2
print(sentence.find("Java"))      # -1 (not found)`,
            },
            {
              body:
                ".replace() swaps out every occurrence of one substring with another. .strip() removes whitespace from both ends — essential when cleaning user input that might have accidental spaces.",
              code: `message = "  Hello World  "

print(message.strip())                           # "Hello World"
print(message.strip().replace("World", "Python"))  # "Hello Python"

email = "  USER@GMAIL.COM  "
print(email.strip().lower())    # user@gmail.com`,
            },
          ],
        },
        {
          id: 3,
          title: "Split & Join",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Break Strings Apart. Stitch Them Back.",
              body:
                ".split() breaks a string into a list by cutting at a separator (default is space). Think of it as cutting a sentence into individual words.",
              code: `sentence = "Python is really fun"
words = sentence.split()
print(words)   # ['Python', 'is', 'really', 'fun']

data = "Alice,25,Engineer"
parts = data.split(",")
print(parts)   # ['Alice', '25', 'Engineer']`,
            },
            {
              body:
                ".join() is the opposite — it stitches a list of strings together with a separator between each item. You call it ON the separator string.",
              code: `words = ["Python", "is", "awesome"]
print(" ".join(words))     # Python is awesome

tags = ["python", "coding", "beginner"]
print(", ".join(tags))     # python, coding, beginner`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 8 Boss: The Email Validator",
          heading: "Validate Input. Clean Strings.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          instructions:
            "Build a basic email validator.\n\n1. Given 'email', strip whitespace and convert to lowercase.\n2. If '@' is not in the email, print 'Invalid: missing @'.\n3. Otherwise, split at '@'. If the part before is empty, or the part after has no '.', print 'Invalid: bad format'.\n4. If everything passes, print 'Valid email: ' followed by the cleaned email.",
          startingCode: `email = "  User@Example.COM  "

# Step 1: Clean the email

# Step 2: Check for '@'

# Step 3: Validate format

# Step 4: Print result
`,
          expectedOutput: `Valid email: user@example.com`,
          solutionCode: `email = "  User@Example.COM  "

email = email.strip().lower()

if "@" not in email:
    print("Invalid: missing @")
else:
    parts = email.split("@")
    if parts[0] == "" or "." not in parts[1]:
        print("Invalid: bad format")
    else:
        print("Valid email:", email)`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 9 — Tuples & Sets  [Intermediate]
    // ─────────────────────────────────────────────
    {
      no: 9,
      name: "Tuples & Sets: Two Underrated Tools",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Meet tuples (locked lists) and sets (no-duplicate collections) — each perfect for a specific job.",
      parts: [
        {
          id: 1,
          title: "Tuples: The Locked List",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Immutable. Locked. Can't Change.",
              body:
                "A tuple is like a list, but locked. Once created, you cannot change, add, or remove anything. Think of GPS coordinates — once you record a location, you do not want it to accidentally change.\n\nCreate a tuple with parentheses () instead of [].",
              code: `coordinates = (28.6, 77.2)    # lat, long
rgb = (255, 128, 0)
days = ("Mon", "Tue", "Wed", "Thu", "Fri")

print(coordinates[0])    # 28.6
print(days[2])           # Wed

# This would crash:
# coordinates[0] = 0    ← tuples cannot be changed`,
            },
            {
              body:
                "Tuple unpacking lets you assign each item to a separate variable in one line — one of Python's neatest tricks.",
              code: `point = (10, 20, 30)

x, y, z = point    # unpack
print(x)   # 10
print(y)   # 20

# Swap two variables in one line
a, b = 5, 10
a, b = b, a
print(a, b)    # 10 5`,
            },
          ],
        },
        {
          id: 2,
          title: "Sets: No Duplicates Allowed",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Unique Items Only. Automatic Deduplication.",
              body:
                "A set is like a bag that automatically kicks out duplicates. Every item is unique. Great for finding what unique values exist in a collection.\n\nCreate a set with curly braces {} — like a dictionary but without the colons.",
              code: `colors = {"red", "blue", "green", "red", "blue"}
print(colors)     # {'red', 'blue', 'green'}  — duplicates gone!

# Convert a list to a set to remove duplicates
scores = [90, 85, 90, 75, 85, 100]
unique_scores = set(scores)
print(unique_scores)   # {75, 85, 90, 100}`,
            },
            {
              body:
                "Sets support math-style operations: union (all items from both), intersection (only items in both), difference (items in one but not the other).",
              code: `team_a = {"Alice", "Bob", "Charlie"}
team_b = {"Bob", "Diana", "Alice"}

print(team_a | team_b)   # everyone
print(team_a & team_b)   # {'Alice', 'Bob'}  in both
print(team_a - team_b)   # {'Charlie'}  only in team_a`,
            },
          ],
        },
        {
          id: 3,
          title: "When to Use What: List vs Tuple vs Set",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "The Right Tool for the Right Job.",
              body:
                "Choosing the right structure matters:\n\n• List — ordered, changeable, allows duplicates → use when the collection changes\n• Tuple — ordered, locked, allows duplicates → use for fixed records (coordinates, RGB)\n• Set — unordered, unique items → use when uniqueness is what matters",
              code: `# List: shopping cart that changes
cart = ["Apple", "Milk", "Bread"]
cart.append("Eggs")

# Tuple: GPS location (shouldn't change)
location = (28.6139, 77.2090)

# Set: unique visitors today
visitors = {"Alice", "Bob", "Alice", "Charlie"}
print(len(visitors))   # 3`,
            },
            {
              body:
                "Checking if an item is in a set is very fast, even with millions of items. If you are constantly asking 'is this value in my collection?', a set beats a list significantly for large datasets.",
              code: `banned = {"spammer99", "bot123", "troll007"}

username = "spammer99"

if username in banned:
    print("Access denied.")

banned.add("new_troll")      # add to set
banned.discard("bot123")     # remove safely (no crash if missing)`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 9 Boss: The Duplicate Detector",
          heading: "Use Sets Wisely. Remove Duplicates.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          instructions:
            "You work at a streaming service cleaning up watch data.\n\n1. Given a list 'watch_history' with movie names (some repeated), find all unique movies using a set.\n2. Print: 'Unique movies watched: X'\n3. You also have a 'premium_catalog' set. Find which unique movies the user watched that are in the premium catalog.\n4. Print those premium movies one per line, sorted alphabetically.",
          startingCode: `watch_history = ["Inception", "Dune", "Inception", "Interstellar", "Dune", "The Matrix", "Dune"]
premium_catalog = {"Inception", "Interstellar", "Avatar", "The Matrix"}

# Step 1: Unique movies

# Step 2: Print count

# Step 3: Find premium movies watched

# Step 4: Print sorted
`,
          expectedOutput: `Unique movies watched: 4\nInception\nInterstellar\nThe Matrix`,
          solutionCode: `watch_history = ["Inception", "Dune", "Inception", "Interstellar", "Dune", "The Matrix", "Dune"]
premium_catalog = {"Inception", "Interstellar", "Avatar", "The Matrix"}

unique_movies = set(watch_history)
print(f"Unique movies watched: {len(unique_movies)}")

premium_watched = unique_movies & premium_catalog
for movie in sorted(premium_watched):
    print(movie)`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 10 — File Handling
    // ─────────────────────────────────────────────
    {
      no: 10,
      name: "File Handling: Making Your Programs Remember",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Save and load data from actual files so your program's work survives after it closes.",
      parts: [
        {
          id: 1,
          title: "Reading Files: Opening the Book",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Load Data from Disk. Persistent Storage.",
              body:
                "Reading a file is like opening a book: you open it, read the content, then close it. Python's open() handles this. Always use the 'with' keyword — it closes the file automatically when you are done, even if something goes wrong.",
              code: `# First, write a file so we have something to read
with open("notes.txt", "w") as file:
    file.write("Hello from Python!\\n")
    file.write("This is line 2.")

# Now read it back
with open("notes.txt", "r") as file:
    content = file.read()
    print(content)`,
            },
            {
              body:
                ".read() gets the whole file as one big string. .readlines() gives a list where each item is one line. Loop over the lines and call .strip() to remove the newline character at the end of each.",
              code: `with open("notes.txt", "r") as file:
    lines = file.readlines()

for line in lines:
    print(line.strip())    # strip removes trailing \\n`,
            },
          ],
        },
        {
          id: 2,
          title: "Writing Files: Saving Your Work",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Write Data to Disk. Make It Permanent.",
              body:
                "Mode 'w' (write) creates a new file or wipes an existing one. Mode 'a' (append) adds to the END without deleting existing content.\n\nThink of 'w' as a whiteboard eraser + fresh writing, and 'a' as a sticky note on the board.",
              code: `# 'w' mode: creates or overwrites
with open("log.txt", "w") as file:
    file.write("App started.\\n")

# 'a' mode: adds to existing content
with open("log.txt", "a") as file:
    file.write("User logged in.\\n")
    file.write("User logged out.\\n")`,
            },
            {
              body:
                ".writelines() writes a whole list of strings in one call. Remember to include \\n at the end of each string, otherwise all lines get squished onto one line.",
              code: `scores = ["Alice: 95\\n", "Bob: 88\\n", "Priya: 100\\n"]

with open("scores.txt", "w") as file:
    file.writelines(scores)

with open("scores.txt", "r") as file:
    print(file.read())`,
            },
          ],
        },
        {
          id: 3,
          title: "Checking if a File Exists",
          xp: 20,
          type: "lesson",
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          steps: [
            {
              heading: "Knock Before Opening. Check First.",
              body:
                "Trying to read a file that does not exist causes a crash. Use the 'os' module to check first. Think of it as knocking before opening a door.",
              code: `import os

if os.path.exists("data.txt"):
    with open("data.txt", "r") as f:
        print(f.read())
else:
    print("File not found!")`,
            },
            {
              body:
                "Quick mode reference:\n• 'r' — read (default)\n• 'w' — write (creates or overwrites)\n• 'a' — append (adds to end)\n• 'r+' — read and write\n\nAlways use 'with open(...)' — cleaner and safer than manually calling .close().",
              code: `import os

log_file = "app_log.txt"

with open(log_file, "a") as log:
    log.write("Program ran.\\n")

with open(log_file, "r") as log:
    print(log.read())`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 10 Boss: The Grade Logger",
          heading: "Read and Write. Persist Data.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          color: "#FFD43B",
          glow: "rgba(255,212,59,0.35)",
          instructions:
            "Build a grade logging system.\n\n1. You have a list of tuples called 'results'. Each tuple is (name, score).\n2. Write all results to 'grades.txt'. Format each line as: 'Name: [name] | Score: [score]'\n3. Read the file back and print its contents.\n4. Calculate and print the average score: 'Average score: [avg]'",
          startingCode: `results = [("Alice", 92), ("Bob", 78), ("Priya", 95), ("Carlos", 88)]

# Step 1: Write to grades.txt

# Step 2: Read and print

# Step 3: Print average
`,
          expectedOutput: `Name: Alice | Score: 92\nName: Bob | Score: 78\nName: Priya | Score: 95\nName: Carlos | Score: 88\nAverage score: 88.25`,
          solutionCode: `results = [("Alice", 92), ("Bob", 78), ("Priya", 95), ("Carlos", 88)]

with open("grades.txt", "w") as f:
    for name, score in results:
        f.write(f"Name: {name} | Score: {score}\\n")

with open("grades.txt", "r") as f:
    print(f.read().strip())

avg = sum(score for _, score in results) / len(results)
print(f"Average score: {avg}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 11 — Error Handling
    // ─────────────────────────────────────────────
    {
      no: 11,
      name: "Error Handling: Don't Let Your Program Crash",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Catch mistakes gracefully with try/except so your program keeps running instead of blowing up.",
      parts: [
        {
          id: 1,
          title: "try & except: The Safety Net",
          xp: 20,
          type: "lesson",
          steps: [
            {
              heading: "Anticipate Crashes. Recover Gracefully.",
              body:
                "When something goes wrong in Python, it raises an error and the whole program stops. A try/except block is a safety net — you put risky code in 'try', and if it crashes, 'except' catches it and runs a backup plan instead of dying.",
              code: `try:
    result = 10 / 0    # ZeroDivisionError
    print(result)
except:
    print("Something went wrong!")

print("Program keeps running.")`,
            },
            {
              body:
                "Catch specific error types to handle each one differently. This is better than catching everything blindly — like a doctor treating the specific problem, not just saying 'you're sick'.",
              code: `try:
    number = int(input("Enter a number: "))
    print(100 / number)
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("Can't divide by zero!")`,
            },
          ],
        },
        {
          id: 2,
          title: "else, finally & error messages",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "'else' runs only if NO error happened — the success path. 'finally' runs NO MATTER WHAT — even if there's a crash. Use finally for cleanup like closing a file.",
              code: `try:
    value = int("42")
except ValueError:
    print("Conversion failed.")
else:
    print(f"Converted: {value}")
finally:
    print("This always runs.")`,
            },
            {
              body:
                "The 'as e' syntax captures the actual error message. Great for debugging or showing the user exactly what went wrong.",
              code: `try:
    my_list = [1, 2, 3]
    print(my_list[10])       # IndexError
except IndexError as e:
    print(f"Error: {e}")

# Output:
# Error: list index out of range`,
            },
          ],
        },
        {
          id: 3,
          title: "Raising Your Own Errors",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "You can raise errors on purpose using 'raise'. This lets you enforce rules in your own functions — reject bad input early before it causes a confusing crash deep in your code.",
              code: `def set_age(age):
    if age < 0 or age > 130:
        raise ValueError(f"{age} is not a valid age!")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(e)    # -5 is not a valid age!`,
            },
            {
              body:
                "Common errors to know:\n• ValueError — wrong value ('abc' → int)\n• TypeError — wrong type (int + str)\n• IndexError — list index out of range\n• KeyError — dict key does not exist\n• FileNotFoundError — file does not exist",
              code: `user = {"name": "Alex"}

try:
    print(user["email"])    # KeyError
except KeyError:
    print("Email not found in profile.")`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 11 Boss: The Safe Calculator",
          heading: "Handle Errors. Never Crash.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build a calculator that never crashes.\n\n1. Create 'safe_divide(a, b)' that divides a by b.\n2. If b is 0, raise a ValueError: 'Denominator cannot be zero'.\n3. Wrap three calls in try/except:\n   - safe_divide(10, 2) → print the result\n   - safe_divide(10, 0) → catch ValueError, print 'Error: [message]'\n   - safe_divide(10, 'x') → catch TypeError, print 'Type error occurred'",
          startingCode: `def safe_divide(a, b):
    # Your logic here
    pass

# Test 1
try:
    print(safe_divide(10, 2))
except Exception as e:
    print(f"Error: {e}")

# Test 2
try:
    print(safe_divide(10, 0))
except ValueError as e:
    print(f"Error: {e}")

# Test 3
try:
    print(safe_divide(10, 'x'))
except TypeError:
    print("Type error occurred")`,
          expectedOutput: `5.0\nError: Denominator cannot be zero\nType error occurred`,
          solutionCode: `def safe_divide(a, b):
    if b == 0:
        raise ValueError("Denominator cannot be zero")
    return a / b

try:
    print(safe_divide(10, 2))
except Exception as e:
    print(f"Error: {e}")

try:
    print(safe_divide(10, 0))
except ValueError as e:
    print(f"Error: {e}")

try:
    print(safe_divide(10, 'x'))
except TypeError:
    print("Type error occurred")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 12 — List Comprehensions
    // ─────────────────────────────────────────────
    {
      no: 12,
      name: "List Comprehensions: Python's Superpower",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Write entire loops in a single clean line — the Pythonic way to build and filter collections.",
      parts: [
        {
          id: 1,
          title: "The One-Liner Loop",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "A list comprehension builds a new list from a loop — in one line. The structure is: [expression for item in iterable]. Read it as: 'give me [this] for each [item] in [this collection]'.",
              code: `# Old way — 3 lines
squares = []
for n in range(1, 6):
    squares.append(n ** 2)

# List comprehension — 1 line, same result
squares = [n ** 2 for n in range(1, 6)]
print(squares)    # [1, 4, 9, 16, 25]`,
            },
            {
              body:
                "Any expression works — not just math. Uppercase every name, build formatted strings, double every value — all in one clean line.",
              code: `names = ["alice", "bob", "priya"]

caps = [name.upper() for name in names]
print(caps)    # ['ALICE', 'BOB', 'PRIYA']

greetings = [f"Hello, {name}!" for name in names]
print(greetings)`,
            },
          ],
        },
        {
          id: 2,
          title: "Adding a Filter with 'if'",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Add a filter at the end with 'if'. Only items that pass the condition get included — like a guest list where only certain people make it in.\n\nStructure: [expression for item in iterable if condition]",
              code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

evens = [n for n in numbers if n % 2 == 0]
print(evens)    # [2, 4, 6, 8, 10]

big = [n for n in numbers if n > 5]
print(big)      # [6, 7, 8, 9, 10]`,
            },
            {
              body:
                "Combine transformation AND filtering in one go. This is where comprehensions really shine.",
              code: `words = ["hello", "world", "python", "fun", "code"]

# Long words only, in uppercase
result = [w.upper() for w in words if len(w) > 4]
print(result)    # ['HELLO', 'WORLD', 'PYTHON']`,
            },
          ],
        },
        {
          id: 3,
          title: "Dictionary & Set Comprehensions",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Comprehensions work for dictionaries too. Use {} with a key: value pair. Structure: {key: value for item in iterable}.",
              code: `students = ["Alice", "Bob", "Priya"]
scores = [92, 78, 95]

# zip() pairs two lists together
gradebook = {name: score for name, score in zip(students, scores)}
print(gradebook)

sq = {n: n**2 for n in range(1, 6)}
print(sq)    # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}`,
            },
            {
              body:
                "Set comprehensions use {} like dict comprehensions but without the colon. The result is a set — unique values only.",
              code: `sentence = "hello world hello python world"

unique_words = {word for word in sentence.split()}
print(unique_words)    # {'hello', 'world', 'python'}`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 12 Boss: The Data Pipeline",
          heading: "Transform Data. Use Comprehensions.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Process a user dataset with comprehensions.\n\n1. You have a list of dicts called 'users', each with 'name' and 'score'.\n2. Create 'passing_names' — a list comprehension of uppercased names where score >= 70.\n3. Create 'score_map' — a dict comprehension mapping name → score for ALL users.\n4. Print 'passing_names' then 'score_map'.",
          startingCode: `users = [
    {"name": "Alice", "score": 92},
    {"name": "Bob", "score": 55},
    {"name": "Priya", "score": 88},
    {"name": "Carlos", "score": 67},
    {"name": "Diana", "score": 75},
]

# passing_names:

# score_map:

# Print both:
`,
          expectedOutput: `['ALICE', 'PRIYA', 'DIANA']\n{'Alice': 92, 'Bob': 55, 'Priya': 88, 'Carlos': 67, 'Diana': 75}`,
          solutionCode: `users = [
    {"name": "Alice", "score": 92},
    {"name": "Bob", "score": 55},
    {"name": "Priya", "score": 88},
    {"name": "Carlos", "score": 67},
    {"name": "Diana", "score": 75},
]

passing_names = [u["name"].upper() for u in users if u["score"] >= 70]
score_map = {u["name"]: u["score"] for u in users}

print(passing_names)
print(score_map)`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 13 — Modules & Imports
    // ─────────────────────────────────────────────
    {
      no: 13,
      name: "Modules & Imports: Don't Build What Already Exists",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Tap into Python's massive library of pre-built tools and learn how to organize your own code into reusable files.",
      parts: [
        {
          id: 1,
          title: "Importing Built-in Modules",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Python ships with hundreds of built-in modules — pre-written code libraries ready to use. 'import' activates them. Think of it as opening a specific toolbox from a garage full of toolboxes.",
              code: `import math

print(math.pi)           # 3.141592...
print(math.sqrt(25))     # 5.0
print(math.floor(4.9))   # 4
print(math.ceil(4.1))    # 5`,
            },
            {
              body:
                "The 'random' module generates random numbers, picks random items, and shuffles lists — invaluable for games, simulations, and testing.",
              code: `import random

print(random.randint(1, 100))              # random int 1-100
print(random.choice(["heads", "tails"]))   # random pick

deck = ["Ace", "King", "Queen", "Jack"]
random.shuffle(deck)
print(deck)   # shuffled!`,
            },
          ],
        },
        {
          id: 2,
          title: "from … import: Grab Just What You Need",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Instead of importing the whole toolbox, grab just the specific tool using 'from module import function'. Saves typing and keeps your code clean.",
              code: `from math import sqrt, pi

print(sqrt(144))   # 12.0  (no need for math.sqrt)
print(pi)          # 3.14159...

from random import randint, choice
print(randint(1, 10))
print(choice(["rock", "paper", "scissors"]))`,
            },
            {
              body:
                "Two modules you will use constantly in real projects: 'datetime' for dates and times, 'os' for interacting with the file system.",
              code: `from datetime import datetime
import os

now = datetime.now()
print(now.year)
print(now.strftime("%Y-%m-%d"))   # 2025-07-15

print(os.getcwd())                # current folder path
print(os.path.exists("notes.txt"))  # True or False`,
            },
          ],
        },
        {
          id: 3,
          title: "Creating Your Own Modules",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Any Python file you create IS a module. Save it as 'helpers.py' and any other file in the same folder can import from it. This is how large projects stay organized — split code into files, import what you need.",
              code: `# --- helpers.py ---
def greet(name):
    return f"Hello, {name}!"

def square(n):
    return n ** 2

# --- main.py ---
import helpers

print(helpers.greet("Alice"))    # Hello, Alice!
print(helpers.square(7))         # 49`,
            },
            {
              body:
                "Third-party packages extend Python even further. Install them with pip (Python's package manager). The entire Python ecosystem — pandas, flask, requests, tensorflow — is one command away.",
              code: `# In your terminal:
# pip install requests

# Then in Python:
import requests

response = requests.get("https://api.github.com")
print(response.status_code)   # 200 means success`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 13 Boss: The Fortune Teller",
          heading: "Tap Into Libraries. Don't Reinvent.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build a fortune teller using modules.\n\n1. Import 'random' and 'datetime'.\n2. Create a list called 'fortunes' with at least 5 different fortune strings.\n3. Pick a random fortune using random.choice() and store it in 'fortune'.\n4. Get the current year from datetime.\n5. Print in the format: '[YEAR] Fortune: [fortune]'",
          startingCode: `# Import modules


# Create fortunes list


# Pick random fortune and get year


# Print result
`,
          expectedOutput: `2025 Fortune: Great things await you this year.`,
          solutionCode: `import random
from datetime import datetime

fortunes = [
    "Great things await you this year.",
    "Your hard work will pay off soon.",
    "A surprise is coming your way.",
    "Trust the process.",
    "Today is a great day to start something new."
]

fortune = random.choice(fortunes)
year = datetime.now().year
print(f"{year} Fortune: {fortune}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 14 — OOP: Classes & Objects
    // ─────────────────────────────────────────────
    {
      no: 14,
      name: "Classes & Objects: Building Blueprints",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Model real-world things as objects using classes — the foundation of modern software development.",
      parts: [
        {
          id: 1,
          title: "Classes: The Blueprint",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "A class is a blueprint. An object is something built from that blueprint. Think of a class as the plan for a house — it defines the rooms and layout. Every actual house built from that plan is an object.\n\nDefine a class with the 'class' keyword. Class names start with a capital letter by convention.",
              code: `class Dog:
    def bark(self):
        print("Woof!")

# Create two objects from the same blueprint
dog1 = Dog()
dog2 = Dog()

dog1.bark()    # Woof!
dog2.bark()    # Woof!`,
            },
            {
              body:
                "The __init__ method is the constructor — it runs automatically the moment you create a new object and sets up its initial data. 'self' refers to the specific object being created.",
              code: `class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def bark(self):
        print(f"{self.name} says: Woof!")

fido = Dog("Fido", "Labrador")
rex = Dog("Rex", "German Shepherd")

fido.bark()         # Fido says: Woof!
print(rex.breed)    # German Shepherd`,
            },
          ],
        },
        {
          id: 2,
          title: "Attributes & Methods",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Attributes are the data an object stores (name, health, score). Methods are the actions it can take (attack, heal, move). Together they describe what an object IS and what it can DO.",
              code: `class Player:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.score = 0

    def take_damage(self, amount):
        self.health -= amount
        print(f"{self.name} took {amount} damage. HP: {self.health}")

    def gain_points(self, pts):
        self.score += pts
        print(f"{self.name} has {self.score} points.")

hero = Player("Alex")
hero.take_damage(20)
hero.gain_points(50)`,
            },
            {
              body:
                "Methods can return values just like regular functions. Every object created from the same class is independent — changing one does not affect the others.",
              code: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

r1 = Rectangle(5, 3)
r2 = Rectangle(10, 4)

print(r1.area())        # 15
print(r2.perimeter())   # 28`,
            },
          ],
        },
        {
          id: 3,
          title: "The __str__ Method: A Readable Name Tag",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "When you print an object, Python shows something ugly like '<__main__.Dog object at 0x...>'. Define __str__ to control what prints instead — like giving your object a name tag.",
              code: `class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages

    def __str__(self):
        return f"'{self.title}' by {self.author} ({self.pages} pages)"

b = Book("Dune", "Frank Herbert", 412)
print(b)    # 'Dune' by Frank Herbert (412 pages)`,
            },
            {
              body:
                "Objects manage their own state internally. You tell them WHAT to do, they handle HOW to update their data. This is the core idea of OOP.",
              code: `class BankAccount:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds")
        else:
            self.balance -= amount

    def __str__(self):
        return f"{self.owner}: ₹{self.balance}"

acc = BankAccount("Priya")
acc.deposit(1000)
acc.withdraw(300)
print(acc)    # Priya: ₹700`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 14 Boss: The RPG Character",
          heading: "Plan Objects. Model the Real World.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build a complete RPG character class.\n\n1. Create class 'Hero' with __init__ taking 'name' and 'hero_class'.\n   Set: health=100, attack_power=10, level=1.\n2. Add method 'attack(enemy_name)' that prints:\n   '[Name] strikes [enemy] for [X] damage!'\n3. Add method 'level_up()' that raises level by 1, attack_power by 5, and prints:\n   '[Name] reached level [X]!'\n4. Add __str__ returning:\n   '[Name] | Class: [class] | Level: [lvl] | HP: [hp]'\n5. Create a hero, call attack(), call level_up(), then print the hero.",
          startingCode: `class Hero:
    # Your code here
    pass

# Test:
hero = Hero("Aria", "Warrior")
hero.attack("Dragon")
hero.level_up()
print(hero)`,
          expectedOutput: `Aria strikes Dragon for 10 damage!\nAria reached level 2!\nAria | Class: Warrior | Level: 2 | HP: 100`,
          solutionCode: `class Hero:
    def __init__(self, name, hero_class):
        self.name = name
        self.hero_class = hero_class
        self.health = 100
        self.attack_power = 10
        self.level = 1

    def attack(self, enemy_name):
        print(f"{self.name} strikes {enemy_name} for {self.attack_power} damage!")

    def level_up(self):
        self.level += 1
        self.attack_power += 5
        print(f"{self.name} reached level {self.level}!")

    def __str__(self):
        return f"{self.name} | Class: {self.hero_class} | Level: {self.level} | HP: {self.health}"

hero = Hero("Aria", "Warrior")
hero.attack("Dragon")
hero.level_up()
print(hero)`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 15 — Inheritance
    // ─────────────────────────────────────────────
    {
      no: 15,
      name: "Inheritance: Build on What You Have",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Create new classes that inherit all the features of existing ones — and add their own twist on top.",
      parts: [
        {
          id: 1,
          title: "Inheriting from a Parent Class",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Inheritance is a parent-child relationship between classes. A child inherits everything from the parent but can also have its own unique features on top.\n\nWrite the parent class name in parentheses after the child class name.",
              code: `class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(f"{self.name} is eating.")

class Dog(Animal):    # Dog inherits from Animal
    def bark(self):
        print(f"{self.name} says: Woof!")

dog = Dog("Fido")
dog.eat()     # inherited from Animal
dog.bark()    # Dog's own method`,
            },
            {
              body:
                "The child gets everything from the parent for free. You only write what is NEW or DIFFERENT. That is the whole point — no copy-pasting code.",
              code: `class Vehicle:
    def __init__(self, brand, speed):
        self.brand = brand
        self.speed = speed

    def move(self):
        print(f"{self.brand} moving at {self.speed} km/h")

class Car(Vehicle):
    def honk(self):
        print(f"{self.brand}: Beep beep!")

my_car = Car("Toyota", 120)
my_car.move()    # from Vehicle
my_car.honk()    # Car's own`,
            },
          ],
        },
        {
          id: 2,
          title: "Overriding & super()",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "A child class can override a parent method by redefining it with the same name. When called, Python uses the child's version. Same dish name, different recipe.",
              code: `class Animal:
    def speak(self):
        print("...")

class Cat(Animal):
    def speak(self):     # override
        print("Meow!")

class Duck(Animal):
    def speak(self):     # override
        print("Quack!")

Cat().speak()     # Meow!
Duck().speak()    # Quack!`,
            },
            {
              body:
                "super() calls the parent's version of a method from inside the child. Use it when you want to EXTEND the parent's behaviour, not fully replace it.",
              code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Employee(Person):
    def __init__(self, name, age, company):
        super().__init__(name, age)    # run Person's __init__
        self.company = company

    def introduce(self):
        print(f"I'm {self.name}, {self.age}, at {self.company}.")

emp = Employee("Alex", 28, "Google")
emp.introduce()`,
            },
          ],
        },
        {
          id: 3,
          title: "isinstance() & Multiple Inheritance",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "isinstance(obj, Class) checks if an object is an instance of a class — or ANY of its parents. This is how you safely check what type of object you have before acting on it.",
              code: `class Animal: pass
class Dog(Animal): pass

fido = Dog()

print(isinstance(fido, Dog))      # True
print(isinstance(fido, Animal))   # True  (Dog IS an Animal)
print(isinstance(fido, str))      # False`,
            },
            {
              body:
                "Python allows a class to inherit from more than one parent. Use carefully, but it is powerful for mixing in features — like a child who inherits cooking from one parent and music from the other.",
              code: `class Flyable:
    def fly(self):
        print(f"{self.name} is flying!")

class Swimmable:
    def swim(self):
        print(f"{self.name} is swimming!")

class Duck(Flyable, Swimmable):
    def __init__(self, name):
        self.name = name

d = Duck("Donald")
d.fly()     # Donald is flying!
d.swim()    # Donald is swimming!`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 15 Boss: The Shape Calculator",
          heading: "Reuse Code. Inherit Like a Pro.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build a shape inheritance hierarchy.\n\n1. Create base class 'Shape' with __init__ taking 'color'. Add method describe() printing 'A [color] shape'.\n2. Create 'Circle(Shape)' with 'color' and 'radius'. Override describe() to print 'A [color] circle with radius [r]'. Add area() returning 3.14159 * r^2.\n3. Create 'Rectangle(Shape)' with 'color', 'width', 'height'. Override describe(). Add area().\n4. Create one Circle and one Rectangle, call describe() and print area() for each.",
          startingCode: `class Shape:
    pass

class Circle(Shape):
    pass

class Rectangle(Shape):
    pass

# Test:
c = Circle("red", 5)
r = Rectangle("blue", 4, 6)
c.describe()
print(c.area())
r.describe()
print(r.area())`,
          expectedOutput: `A red circle with radius 5\n78.53975\nA blue rectangle 4x6\n24`,
          solutionCode: `class Shape:
    def __init__(self, color):
        self.color = color

    def describe(self):
        print(f"A {self.color} shape")

class Circle(Shape):
    def __init__(self, color, radius):
        super().__init__(color)
        self.radius = radius

    def describe(self):
        print(f"A {self.color} circle with radius {self.radius}")

    def area(self):
        return 3.14159 * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, color, width, height):
        super().__init__(color)
        self.width = width
        self.height = height

    def describe(self):
        print(f"A {self.color} rectangle {self.width}x{self.height}")

    def area(self):
        return self.width * self.height

c = Circle("red", 5)
r = Rectangle("blue", 4, 6)
c.describe()
print(c.area())
r.describe()
print(r.area())`,
        },
      ],
    },
    // ─────────────────────────────────────────────
    // CHAPTER 16 — Lambda & Functional Tools
    // ─────────────────────────────────────────────
    {
      no: 16,
      name: "Lambda & Functional Tools",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Write tiny one-line functions and use map/filter to process data in a clean, Pythonic way.",
      parts: [
        {
          id: 1,
          title: "Lambda: The Sticky Note Function",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "A regular function is like a recipe card you write, name, and store for later. A lambda is a sticky note — a quick, nameless, one-line function you use right now and throw away.\n\nSyntax: lambda parameters: expression\n\nNo 'def', no 'return', no name required.",
              code: `# Regular function
def square(x):
    return x ** 2
 
# Same thing as a lambda
square = lambda x: x ** 2
print(square(5))    # 25
 
add = lambda a, b: a + b
print(add(3, 7))    # 10`,
            },
            {
              body:
                "Lambdas shine when passed directly as an argument to another function. Instead of defining a whole function just to sort a list, write the logic inline.",
              code: `students = [("Alice", 92), ("Bob", 78), ("Priya", 95)]
 
# Sort by score — the lambda picks which part to sort by
sorted_students = sorted(students, key=lambda s: s[1])
print(sorted_students)
 
# Find the top scorer
top = max(students, key=lambda s: s[1])
print(f"Top scorer: {top[0]}")   # Priya`,
            },
          ],
        },
        {
          id: 2,
          title: "map(): Transform Every Item",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "map() is like a conveyor belt with a machine at the end. Every item passes through the machine and comes out transformed. You give map() a function and a list, it applies the function to every single item.\n\nWrap the result in list() to see it.",
              code: `numbers = [1, 2, 3, 4, 5]
 
squared = list(map(lambda n: n ** 2, numbers))
print(squared)    # [1, 4, 9, 16, 25]
 
names = ["alice", "bob", "priya"]
caps = list(map(str.upper, names))
print(caps)    # ['ALICE', 'BOB', 'PRIYA']`,
            },
            {
              body:
                "map() does not change the original list. It builds a brand new one. You can also pass a regular function to map() — it does not have to be a lambda.",
              code: `prices = [100, 250, 80, 320]
 
def apply_tax(price):
    return round(price * 1.18, 2)   # 18% GST
 
final_prices = list(map(apply_tax, prices))
print(final_prices)    # [118.0, 295.0, 94.4, 377.6]`,
            },
          ],
        },
        {
          id: 3,
          title: "filter(): Keep Only What You Want",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "filter() is a bouncer for lists. You give it a function that returns True or False. Items that pass (True) get through, the rest are removed. Only the survivors make it into the new list.",
              code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 
evens = list(filter(lambda n: n % 2 == 0, numbers))
print(evens)    # [2, 4, 6, 8, 10]
 
scores = [45, 80, 33, 92, 60, 55]
passing = list(filter(lambda s: s >= 60, scores))
print(passing)  # [80, 92, 60]`,
            },
            {
              body:
                "You can chain map() and filter() together. First filter the list down, then transform what's left. Think of it as a two-step pipeline — sort out the bad, then polish the good.",
              code: `words = ["hello", "hi", "hey", "world", "wow", "python"]
 
# Keep only words starting with 'h', then uppercase them
result = list(map(str.upper, filter(lambda w: w.startswith("h"), words)))
print(result)    # ['HELLO', 'HI', 'HEY']`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 16 Boss: The Product Filter",
          heading: "Chain Operations. Process Like a Pro.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "You work at an online store and need to process a product list.\n\n1. You have a list of dicts called 'products'. Each has 'name', 'price', and 'in_stock'.\n2. Use filter() to get only products that are in stock.\n3. Use map() on those results to apply a 10% discount to their prices (round to 2 decimal places).\n4. Print each discounted product in the format:\n   '[name]: ₹[discounted_price]'",
          startingCode: `products = [
    {"name": "Headphones", "price": 1500, "in_stock": True},
    {"name": "Keyboard",   "price": 800,  "in_stock": False},
    {"name": "Mouse",      "price": 500,  "in_stock": True},
    {"name": "Monitor",    "price": 8000, "in_stock": True},
    {"name": "Webcam",     "price": 1200, "in_stock": False},
]
 
# Step 1: Filter in-stock products
 
# Step 2: Apply 10% discount with map()
 
# Step 3: Print each result
`,
          expectedOutput: `Headphones: ₹1350.0\nMouse: ₹450.0\nMonitor: ₹7200.0`,
          solutionCode: `products = [
    {"name": "Headphones", "price": 1500, "in_stock": True},
    {"name": "Keyboard",   "price": 800,  "in_stock": False},
    {"name": "Mouse",      "price": 500,  "in_stock": True},
    {"name": "Monitor",    "price": 8000, "in_stock": True},
    {"name": "Webcam",     "price": 1200, "in_stock": False},
]
 
in_stock = filter(lambda p: p["in_stock"], products)
 
def apply_discount(p):
    return {"name": p["name"], "price": round(p["price"] * 0.9, 2)}
 
discounted = list(map(apply_discount, in_stock))
 
for p in discounted:
    print(f"{p['name']}: ₹{p['price']}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 17 — Decorators
    // ─────────────────────────────────────────────
    {
      no: 17,
      name: "Decorators: Supercharge Your Functions",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Add extra behaviour to a function without touching its code — like clipping on a power-up.",
      parts: [
        {
          id: 1,
          title: "Functions Inside Functions",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Before decorators make sense, you need to know two things:\n1. Functions can be stored in variables.\n2. Functions can be defined inside other functions.\n\nThink of a function like a recipe card. You can hand that card to someone, store it in a drawer, or slip it inside another card.",
              code: `def greet():
    print("Hello!")
 
# Store the function in a variable — no () means don't call it yet
say_hi = greet
say_hi()    # Hello!
 
# Function inside a function
def outer():
    def inner():
        print("I am inside!")
    inner()    # call the inner function
 
outer()    # I am inside!`,
            },
            {
              body:
                "A function can also RETURN another function. This is the key idea behind decorators — a function that wraps another function and gives it back with extra behaviour added.",
              code: `def make_loud(func):
    def wrapper():
        print("--- START ---")
        func()
        print("--- END ---")
    return wrapper   # return the wrapper, don't call it
 
def say_hello():
    print("Hello!")
 
loud_hello = make_loud(say_hello)
loud_hello()
# --- START ---
# Hello!
# --- END ---`,
            },
          ],
        },
        {
          id: 2,
          title: "The @ Syntax: Clean Decoration",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Writing 'func = decorator(func)' every time is messy. Python gives you a cleaner shortcut — put @ and the decorator name right above the function. Python does the wrapping automatically.\n\nThink of @ as a clip-on power-up for a function.",
              code: `def shout(func):
    def wrapper():
        print(">>> ATTENTION <<<")
        func()
    return wrapper
 
@shout          # same as: announce = shout(announce)
def announce():
    print("Python is awesome!")
 
announce()
# >>> ATTENTION <<<
# Python is awesome!`,
            },
            {
              body:
                "To decorate functions that accept arguments, use *args and **kwargs in your wrapper. These are catch-all containers that accept any number of arguments — whatever the original function needs.",
              code: `def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"Calling: {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Done.")
        return result
    return wrapper
 
@log_call
def add(a, b):
    return a + b
 
total = add(5, 3)
print(total)
# Calling: add
# Done.
# 8`,
            },
          ],
        },
        {
          id: 3,
          title: "Practical Decorators: Timer & Access Guard",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "A timing decorator measures how long a function takes to run. You import the 'time' module, record the start and end, and print the difference. Great for finding slow code.",
              code: `import time
 
def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper
 
@timer
def slow_add(a, b):
    time.sleep(0.5)    # pretend it's doing heavy work
    return a + b
 
print(slow_add(3, 4))`,
            },
            {
              body:
                "An access-guard decorator blocks a function unless a condition is met. This is how real web apps protect admin pages — check the permission first, run the function only if allowed.",
              code: `def require_login(func):
    def wrapper(user, *args, **kwargs):
        if not user.get("logged_in"):
            print("Access denied. Please log in.")
            return
        return func(user, *args, **kwargs)
    return wrapper
 
@require_login
def view_dashboard(user):
    print(f"Welcome, {user['name']}!")
 
view_dashboard({"name": "Alice", "logged_in": True})
view_dashboard({"name": "Bob",   "logged_in": False})`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 17 Boss: The Retry Decorator",
          heading: "Enhance Functions. Wrap With Power.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build a decorator that automatically retries a failing function.\n\n1. Create a decorator called 'retry' that takes a parameter 'times' (how many attempts).\n2. If the decorated function raises an exception, catch it, print 'Attempt [n] failed: [error]', and try again.\n3. If all attempts fail, print 'All [n] attempts failed.' and stop.\n4. Decorate the function 'unstable_connection' (already given) with @retry(times=3).\n5. Call unstable_connection().",
          startingCode: `import random
 
# Build your decorator here:
def retry(times):
    pass
 
 
@retry(times=3)
def unstable_connection():
    if random.random() < 0.7:   # 70% chance of failing
        raise ConnectionError("Network timeout")
    print("Connection successful!")
 
# Set seed so the test is predictable
random.seed(42)
unstable_connection()
`,
          expectedOutput: `Attempt 1 failed: Network timeout\nAttempt 2 failed: Network timeout\nConnection successful!`,
          solutionCode: `import random
 
def retry(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"Attempt {attempt} failed: {e}")
            print(f"All {times} attempts failed.")
        return wrapper
    return decorator
 
@retry(times=3)
def unstable_connection():
    if random.random() < 0.7:
        raise ConnectionError("Network timeout")
    print("Connection successful!")
 
random.seed(42)
unstable_connection()`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 18 — Generators & Iterators
    // ─────────────────────────────────────────────
    {
      no: 18,
      name: "Generators: Produce Data On Demand",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Create sequences that produce one item at a time instead of loading everything into memory at once.",
      parts: [
        {
          id: 1,
          title: "The Problem with Big Lists",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "If you create a list of one million numbers, Python builds ALL of them in memory right now. That is like printing an entire book just to read the first page.\n\nA generator is smarter — it produces one item at a time, only when you ask for it. Like a book that prints one page at a time as you turn to it.",
              code: `# This builds ALL 1,000,000 numbers in memory at once
big_list = list(range(1_000_000))
 
# This creates a generator — uses almost zero memory
big_gen = range(1_000_000)   # range is already a generator-like object
 
# You can loop through both the same way
for n in big_gen:
    if n > 3:
        break
    print(n)`,
            },
            {
              body:
                "The 'next()' function pulls the next value out of a generator one at a time. When nothing is left, it raises a StopIteration error. This is what for-loops use automatically behind the scenes.",
              code: `colors = iter(["red", "green", "blue"])   # iter() makes any list an iterator
 
print(next(colors))    # red
print(next(colors))    # green
print(next(colors))    # blue
 
# One more next() would crash — nothing left`,
            },
          ],
        },
        {
          id: 2,
          title: "yield: The Pause Button",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "A generator function looks like a normal function but uses 'yield' instead of 'return'. 'yield' hands out one value and then PAUSES — it freezes in place, remembers everything, and waits for the next request.",
              code: `def count_up(limit):
    n = 1
    while n <= limit:
        yield n      # hand out n, then pause
        n += 1
 
gen = count_up(4)
 
print(next(gen))    # 1
print(next(gen))    # 2
print(next(gen))    # 3`,
            },
            {
              body:
                "You can loop through a generator with a for-loop just like a list. Python keeps calling next() behind the scenes until StopIteration — you never see it.",
              code: `def even_numbers(limit):
    for n in range(2, limit + 1, 2):
        yield n
 
for num in even_numbers(10):
    print(num)
 
# Output: 2 4 6 8 10`,
            },
          ],
        },
        {
          id: 3,
          title: "Generator Expressions: Compact Generators",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Just like list comprehensions, you can write a generator in one line using () instead of []. It does exactly the same thing but WITHOUT building the full list — memory-friendly.",
              code: `# List comprehension — builds the full list NOW
squares_list = [n ** 2 for n in range(1, 6)]
 
# Generator expression — produces values one at a time
squares_gen = (n ** 2 for n in range(1, 6))
 
for val in squares_gen:
    print(val)
 
# Generator expressions work great with sum(), max(), min()
total = sum(n ** 2 for n in range(1, 101))
print(total)    # 338350`,
            },
            {
              body:
                "When to use generators vs lists:\n• Use a list when you need to access items multiple times or by index.\n• Use a generator when you only loop through once and the data could be large.\n\nA good mental check: 'Do I need ALL of this in memory at once?' If no — use a generator.",
              code: `import sys
 
# Compare memory usage
numbers_list = [n for n in range(100_000)]
numbers_gen  = (n for n in range(100_000))
 
print(sys.getsizeof(numbers_list))   # ~800,000 bytes
print(sys.getsizeof(numbers_gen))    # ~104 bytes — tiny!`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 18 Boss: The Infinite Counter",
          heading: "Produce Data On Demand. Lazy Eval.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build a generator-powered pipeline.\n\n1. Create a generator function 'fibonacci()' that yields Fibonacci numbers forever (no limit). Start with 0, 1, then each next number is the sum of the previous two.\n2. Create another generator function 'take(n, gen)' that yields only the first n items from any generator.\n3. Use both together to collect the first 10 Fibonacci numbers into a list.\n4. Print the list.",
          startingCode: `# Step 1: Fibonacci generator (infinite)
def fibonacci():
    pass
 
# Step 2: take() generator
def take(n, gen):
    pass
 
# Step 3 & 4: Get first 10 and print
result = list(take(10, fibonacci()))
print(result)
`,
          expectedOutput: `[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
          solutionCode: `def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
 
def take(n, gen):
    count = 0
    for item in gen:
        if count >= n:
            break
        yield item
        count += 1
 
result = list(take(10, fibonacci()))
print(result)`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 19 — Working with JSON
    // ─────────────────────────────────────────────
    {
      no: 19,
      name: "JSON: The Language of the Internet",
      difficulty: "Intermediate",
      totalXp: 100,
      summary:
        "Read and write JSON — the universal format used to move data between apps, APIs, and files.",
      parts: [
        {
          id: 1,
          title: "What is JSON and Why Does It Matter?",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "JSON (JavaScript Object Notation) is just text that looks like a Python dictionary. When apps talk to each other over the internet — sending login data, fetching weather, talking to any API — they almost always send JSON.\n\nPython's built-in 'json' module converts between JSON text and Python dictionaries.",
              code: `import json
 
# A JSON string (what you'd receive from an API)
json_text = '{"name": "Alice", "score": 95, "active": true}'
 
# Convert JSON text → Python dictionary
data = json.loads(json_text)
 
print(data["name"])    # Alice
print(type(data))      # <class 'dict'>`,
            },
            {
              body:
                "json.loads() = Load String → turns JSON text into a Python dict.\njson.dumps() = Dump String → turns a Python dict into JSON text.\n\nThink of it like translation: loads() is 'translate FROM JSON', dumps() is 'translate TO JSON'.",
              code: `import json
 
user = {"name": "Bob", "level": 5, "premium": False}
 
# Python dict → JSON text
json_string = json.dumps(user)
print(json_string)          # {"name": "Bob", "level": 5, "premium": false}
print(type(json_string))    # <class 'str'>
 
# Pretty print with indentation
print(json.dumps(user, indent=2))`,
            },
          ],
        },
        {
          id: 2,
          title: "Reading & Writing JSON Files",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "json.load() (no 's') reads directly from a file object. json.dump() (no 's') writes directly to a file object. The 's' version works with strings, the non-'s' version works with files.",
              code: `import json
 
# Write a dictionary to a JSON file
settings = {"theme": "dark", "volume": 80, "notifications": True}
 
with open("settings.json", "w") as f:
    json.dump(settings, f, indent=2)
 
# Read it back
with open("settings.json", "r") as f:
    loaded = json.load(f)
 
print(loaded["theme"])    # dark`,
            },
            {
              body:
                "JSON supports these types: string, number, boolean (true/false), null, array (list), and object (dict). When converting, Python's None becomes null, True becomes true, False becomes false.",
              code: `import json
 
data = {
    "username": "priya99",
    "age": 24,
    "verified": True,
    "bio": None,
    "scores": [95, 88, 100]
}
 
output = json.dumps(data, indent=2)
print(output)
# "verified": true  ← Python True → JSON true
# "bio": null       ← Python None → JSON null`,
            },
          ],
        },
        {
          id: 3,
          title: "Navigating Nested JSON",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Real-world JSON is rarely flat. It has lists inside dicts, dicts inside lists, layers deep. Treat it exactly like nested Python dicts and lists — chain square brackets to dig in.",
              code: `import json
 
response = '''
{
  "user": {
    "name": "Carlos",
    "badges": ["Beginner", "Loop Master", "OOP Pro"],
    "stats": { "xp": 1250, "streak": 7 }
  }
}
'''
 
data = json.loads(response)
 
print(data["user"]["name"])             # Carlos
print(data["user"]["badges"][1])        # Loop Master
print(data["user"]["stats"]["xp"])      # 1250`,
            },
            {
              body:
                "Use a loop to process a list of objects in JSON. This is the most common pattern when working with APIs — you get a list of items back and loop through them to extract what you need.",
              code: `import json
 
leaderboard_json = '[{"name":"Alice","xp":980},{"name":"Bob","xp":750},{"name":"Priya","xp":1100}]'
 
players = json.loads(leaderboard_json)
 
for player in players:
    print(f"{player['name']}: {player['xp']} XP")
 
top = max(players, key=lambda p: p["xp"])
print(f"Leader: {top['name']}")    # Priya`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 19 Boss: The Save System",
          heading: "Move Data Worldwide. Use JSON.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build a game save and load system using JSON.\n\n1. You have a dictionary called 'game_state' with player info.\n2. Save it to a file called 'save.json' using json.dump() with indent=2.\n3. Load it back from the file.\n4. The player levelled up! Increase 'level' by 1 and add 500 to 'xp'.\n5. Save the updated state back to the file.\n6. Load once more and print:\n   'Player: [name] | Level: [level] | XP: [xp]'",
          startingCode: `import json
 
game_state = {
    "name": "Aria",
    "level": 4,
    "xp": 1200,
    "inventory": ["Sword", "Shield"]
}
 
# Step 1: Save to save.json
 
# Step 2: Load it back
 
# Step 3: Level up and add XP
 
# Step 4: Save updated state
 
# Step 5: Load again and print
`,
          expectedOutput: `Player: Aria | Level: 5 | XP: 1700`,
          solutionCode: `import json
 
game_state = {
    "name": "Aria",
    "level": 4,
    "xp": 1200,
    "inventory": ["Sword", "Shield"]
}
 
with open("save.json", "w") as f:
    json.dump(game_state, f, indent=2)
 
with open("save.json", "r") as f:
    state = json.load(f)
 
state["level"] += 1
state["xp"] += 500
 
with open("save.json", "w") as f:
    json.dump(state, f, indent=2)
 
with open("save.json", "r") as f:
    final = json.load(f)
 
print(f"Player: {final['name']} | Level: {final['level']} | XP: {final['xp']}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 20 — Regular Expressions
    // ─────────────────────────────────────────────
    {
      no: 20,
      name: "Regular Expressions: Find Anything in Text",
      difficulty: "Advanced",
      totalXp: 100,
      summary:
        "Use powerful pattern matching to search, validate, and extract information from any text.",
      parts: [
        {
          id: 1,
          title: "What is a Regex Pattern?",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "A regular expression (regex) is a pattern that describes a shape of text. Instead of searching for exact words, you describe the STRUCTURE — like saying 'find me anything that looks like an email' instead of 'find specifically user@gmail.com'.\n\nPython's 're' module handles regex. re.search() looks for a match anywhere in the text.",
              code: `import re
 
text = "My phone number is 9876543210 and I live in Delhi."
 
# \\d matches any digit, {10} means exactly 10 of them
match = re.search(r"\\d{10}", text)
 
if match:
    print("Found:", match.group())    # 9876543210`,
            },
            {
              body:
                "Key building blocks:\n• \\d — any digit (0-9)\n• \\w — any word character (letters, digits, _)\n• \\s — any whitespace (space, tab)\n• .  — any single character\n• +  — one or more of the previous\n• *  — zero or more of the previous\n• ?  — zero or one (optional)\n• {n} — exactly n of the previous",
              code: `import re
 
# \\w+ means one or more word characters
re.search(r"\\w+", "hello world")    # matches 'hello'
 
# \\d+ means one or more digits
re.search(r"\\d+", "Room 42")        # matches '42'
 
# .+ means any character, one or more
re.search(r"H.+d", "Hello World")   # matches 'Hello World'`,
            },
          ],
        },
        {
          id: 2,
          title: "findall(), sub(), and Anchors",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "re.search() finds the FIRST match. re.findall() finds ALL matches and returns them as a list. Use findall when you want to extract every occurrence of a pattern.",
              code: `import re
 
text = "Call us at 9876543210 or 9123456789 for support."
 
# Find every 10-digit number
phones = re.findall(r"\\d{10}", text)
print(phones)    # ['9876543210', '9123456789']
 
# Find all words starting with capital letter
sentence = "Alice and Bob visited New Delhi"
caps = re.findall(r"[A-Z]\\w+", sentence)
print(caps)    # ['Alice', 'Bob', 'New', 'Delhi']`,
            },
            {
              body:
                "re.sub() replaces matches with something else — like find-and-replace but with a pattern. ^ anchors to the START of text, $ anchors to the END. Use them to validate that something matches from beginning to end.",
              code: `import re
 
# Censor bad word with stars
text = "This is a badword in a sentence."
clean = re.sub(r"badword", "***", text)
print(clean)
 
# ^ and $ — full match validation
# Is the string ONLY digits?
print(bool(re.match(r"^\\d+$", "12345")))    # True
print(bool(re.match(r"^\\d+$", "123ab")))    # False`,
            },
          ],
        },
        {
          id: 3,
          title: "Groups: Capturing Specific Parts",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Wrapping part of your pattern in () creates a capturing group. Instead of returning the whole match, you can pull out just the specific part you care about using .group(1), .group(2), etc.",
              code: `import re
 
log = "2025-07-15 ERROR: Disk full on server-02"
 
# Capture date and error type separately
match = re.search(r"(\\d{4}-\\d{2}-\\d{2}) (\\w+):", log)
 
if match:
    print(match.group(1))    # 2025-07-15
    print(match.group(2))    # ERROR`,
            },
            {
              body:
                "re.compile() pre-compiles a pattern into a reusable object. If you use the same pattern many times, compile it once and reuse it — it runs faster and keeps your code cleaner.",
              code: `import re
 
email_pattern = re.compile(r"[\\w.-]+@[\\w.-]+\\.\\w{2,}")
 
emails = [
    "alice@gmail.com",
    "not-an-email",
    "bob.smith@company.org",
    "bad@",
    "priya@school.edu"
]
 
for e in emails:
    if email_pattern.match(e):
        print(f"Valid:   {e}")
    else:
        print(f"Invalid: {e}")`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 20 Boss: The Log Parser",
          heading: "Pattern Match. Extract Data.",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Parse a server log file using regex.\n\nYou have a list of log strings called 'logs'. Each line looks like:\n'2025-07-15 14:32:01 ERROR User 'admin' failed login from 192.168.1.5'\n\n1. Extract all lines where the level is 'ERROR'.\n2. From those lines, extract the IP address (format: digits.digits.digits.digits).\n3. Print each error line's timestamp and IP in the format:\n   '[timestamp] → IP: [ip]'\n4. Print the total error count: 'Total errors: [n]'",
          startingCode: `import re
 
logs = [
    "2025-07-15 14:32:01 ERROR User 'admin' failed login from 192.168.1.5",
    "2025-07-15 14:33:10 INFO  Page loaded successfully",
    "2025-07-15 14:35:22 ERROR Database timeout from 10.0.0.23",
    "2025-07-15 14:36:05 WARN  Memory usage at 85%",
    "2025-07-15 14:37:44 ERROR Null pointer in module auth from 172.16.0.8",
]
 
# Extract error lines, timestamp and IP, then print
`,
          expectedOutput: `2025-07-15 14:32:01 → IP: 192.168.1.5\n2025-07-15 14:35:22 → IP: 10.0.0.23\n2025-07-15 14:37:44 → IP: 172.16.0.8\nTotal errors: 3`,
          solutionCode: `import re
 
logs = [
    "2025-07-15 14:32:01 ERROR User 'admin' failed login from 192.168.1.5",
    "2025-07-15 14:33:10 INFO  Page loaded successfully",
    "2025-07-15 14:35:22 ERROR Database timeout from 10.0.0.23",
    "2025-07-15 14:36:05 WARN  Memory usage at 85%",
    "2025-07-15 14:37:44 ERROR Null pointer in module auth from 172.16.0.8",
]
 
error_count = 0
 
for log in logs:
    if "ERROR" in log:
        timestamp = re.search(r"\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}", log)
        ip = re.search(r"\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}", log)
        if timestamp and ip:
            print(f"{timestamp.group()} → IP: {ip.group()}")
        error_count += 1
 
print(f"Total errors: {error_count}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 21 — Recursion
    // ─────────────────────────────────────────────
    {
      no: 21,
      name: "Recursion: A Function That Calls Itself",
      difficulty: "Advanced",
      totalXp: 100,
      summary:
        "Solve big problems by breaking them into smaller copies of the same problem — and letting the function call itself.",
      parts: [
        {
          id: 1,
          title: "The Mirror in a Mirror",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Recursion is when a function calls itself. Imagine standing between two mirrors — you see a reflection of a reflection of a reflection... but eventually it stops.\n\nEvery recursive function needs TWO things:\n1. A base case — the condition that STOPS the recursion.\n2. A recursive call — where the function calls itself with a smaller problem.",
              code: `def countdown(n):
    if n == 0:           # base case — stop here
        print("Go!")
        return
    print(n)
    countdown(n - 1)     # recursive call with smaller n
 
countdown(5)
# 5 4 3 2 1 Go!`,
            },
            {
              body:
                "Without a base case, the function calls itself forever until Python runs out of space and crashes with a 'RecursionError'. Always make sure each recursive call moves CLOSER to the base case.",
              code: `def factorial(n):
    if n == 0 or n == 1:   # base case
        return 1
    return n * factorial(n - 1)   # calls itself with n-1
 
print(factorial(5))    # 120  (5 × 4 × 3 × 2 × 1)
print(factorial(6))    # 720`,
            },
          ],
        },
        {
          id: 2,
          title: "Tracing a Recursive Call",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "The key to understanding recursion is tracing it step by step. Each call pauses and waits for the call below it to return. Think of stacking plates — the last plate placed is the first one taken off.",
              code: `# factorial(3) trace:
# factorial(3) → 3 * factorial(2)
#                    factorial(2) → 2 * factorial(1)
#                                       factorial(1) → returns 1
#                    factorial(2) → 2 * 1 = 2
# factorial(3) → 3 * 2 = 6
 
def factorial(n):
    print(f"  factorial({n}) called")
    if n <= 1:
        return 1
    result = n * factorial(n - 1)
    print(f"  factorial({n}) returning {result}")
    return result
 
factorial(3)`,
            },
            {
              body:
                "Recursion is powerful for problems that naturally split into smaller copies of themselves. Summing a list, traversing a folder tree, searching nested data — all are natural fits.",
              code: `def sum_list(numbers):
    if len(numbers) == 0:        # base case: empty list = 0
        return 0
    return numbers[0] + sum_list(numbers[1:])   # first + rest
 
print(sum_list([1, 2, 3, 4, 5]))    # 15`,
            },
          ],
        },
        {
          id: 3,
          title: "Recursion vs Loops — When to Use Which",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Loops and recursion can often solve the same problem. Loops are faster and use less memory. Recursion is cleaner and more readable for problems that are naturally tree-shaped or nested.\n\nRule of thumb: use a loop for simple repetition, use recursion when the problem naturally contains smaller copies of itself.",
              code: `# Fibonacci with a loop — efficient
def fib_loop(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
 
# Fibonacci with recursion — elegant but slow for big n
def fib_recursive(n):
    if n <= 1:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)
 
print(fib_loop(10))       # 55
print(fib_recursive(10))  # 55`,
            },
            {
              body:
                "Recursion shines when dealing with nested structures like folders inside folders, or a tree of comments and replies. A loop would need to track depth manually — recursion handles it naturally.",
              code: `def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten(item))   # go deeper
        else:
            result.append(item)
    return result
 
data = [1, [2, 3], [4, [5, 6]], 7]
print(flatten(data))    # [1, 2, 3, 4, 5, 6, 7]`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 21 Boss: The Folder Explorer",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "A file system is stored as a nested dictionary. Folders contain more folders or files (strings).\n\nWrite a recursive function called 'list_files' that:\n1. Takes a directory dict as input.\n2. Loops through each key (name) and value (contents).\n3. If the value is a dict → it's a folder, recurse into it with the folder name as a prefix.\n4. If the value is a string → it's a file, print the full path as 'prefix/name'.\n\nCall list_files(file_system, '') to start with an empty prefix.",
          startingCode: `file_system = {
    "documents": {
        "resume.pdf": "file",
        "notes": {
            "todo.txt": "file",
            "ideas.txt": "file"
        }
    },
    "photos": {
        "holiday.jpg": "file"
    },
    "readme.md": "file"
}
 
def list_files(directory, prefix):
    pass   # Your recursive code here
 
list_files(file_system, "")
`,
          expectedOutput: `documents/resume.pdf\ndocuments/notes/todo.txt\ndocuments/notes/ideas.txt\nphotos/holiday.jpg\nreadme.md`,
          solutionCode: `file_system = {
    "documents": {
        "resume.pdf": "file",
        "notes": {
            "todo.txt": "file",
            "ideas.txt": "file"
        }
    },
    "photos": {
        "holiday.jpg": "file"
    },
    "readme.md": "file"
}
 
def list_files(directory, prefix):
    for name, content in directory.items():
        path = f"{prefix}{name}" if not prefix else f"{prefix}/{name}"
        if isinstance(content, dict):
            list_files(content, path)
        else:
            print(path)
 
list_files(file_system, "")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 22 — Sorting & Searching Algorithms
    // ─────────────────────────────────────────────
    {
      no: 22,
      name: "Sorting & Searching: The Logic Behind the Magic",
      difficulty: "Advanced",
      totalXp: 100,
      summary:
        "Understand how computers sort and search through data — and implement classic algorithms yourself.",
      parts: [
        {
          id: 1,
          title: "Linear Search: Check One by One",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Linear search is the simplest search — start at the beginning and check every item until you find what you want. Like looking for your keys by checking every pocket one at a time.\n\nIt works on ANY list but gets slow on large ones — if the list has 1 million items and the target is last, you check 1 million times.",
              code: `def linear_search(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i     # return the index
    return -1            # not found
 
names = ["Alice", "Bob", "Priya", "Carlos"]
 
print(linear_search(names, "Priya"))    # 2
print(linear_search(names, "Diana"))    # -1`,
            },
            {
              body:
                "Binary search is much faster — but it only works on a SORTED list. It cuts the remaining items in half every step, like guessing a number by always picking the midpoint.",
              code: `# Manual binary search to show the idea
numbers = [2, 5, 8, 12, 16, 23, 38, 45, 72, 91]
 
target = 23
left, right = 0, len(numbers) - 1
 
while left <= right:
    mid = (left + right) // 2
    if numbers[mid] == target:
        print(f"Found at index {mid}")
        break
    elif numbers[mid] < target:
        left = mid + 1     # go right
    else:
        right = mid - 1    # go left`,
            },
          ],
        },
        {
          id: 2,
          title: "Bubble Sort: Bubbling Up the Biggest",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Bubble sort compares two neighbours at a time and swaps them if they are in the wrong order. The largest item slowly 'bubbles up' to the end with each pass — like the heaviest bubble rising to the surface.",
              code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]   # swap
    return arr
 
numbers = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(numbers))    # [11, 12, 22, 25, 34, 64, 90]`,
            },
            {
              body:
                "Bubble sort is easy to understand but slow on large data. Python's built-in sorted() and .sort() use a much faster algorithm called Timsort. In real projects, always use the built-in. Bubble sort is for learning the concept.",
              code: `# Python built-ins — fast and clean
numbers = [5, 2, 9, 1, 7]
 
ascending  = sorted(numbers)           # returns new list
numbers.sort(reverse=True)             # sorts in place
 
print(ascending)   # [1, 2, 5, 7, 9]
print(numbers)     # [9, 7, 5, 2, 1]`,
            },
          ],
        },
        {
          id: 3,
          title: "Merge Sort: Divide and Conquer",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Merge sort splits the list in half, sorts each half, then merges the two sorted halves back together. This repeats recursively until each half has just one item (which is already sorted by definition).\n\nThink of sorting two separate piles of sorted cards and then interleaving them perfectly.",
              code: `def merge_sort(arr):
    if len(arr) <= 1:      # base case
        return arr
 
    mid = len(arr) // 2
    left  = merge_sort(arr[:mid])    # sort left half
    right = merge_sort(arr[mid:])    # sort right half
 
    return merge(left, right)        # merge them
 
def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
 
print(merge_sort([38, 27, 43, 3, 9, 82, 10]))`,
            },
            {
              body:
                "Speed comparison:\n• Bubble sort — slow: checks n² times for n items\n• Merge sort — much faster: only n × log(n) steps\n\nFor 1000 items, bubble sort does ~1,000,000 comparisons. Merge sort does ~10,000. That gap grows fast.",
              code: `# Quick demonstration of sorted() with a custom key
people = [
    {"name": "Carlos", "age": 31},
    {"name": "Alice",  "age": 25},
    {"name": "Bob",    "age": 28},
]
 
by_age  = sorted(people, key=lambda p: p["age"])
by_name = sorted(people, key=lambda p: p["name"])
 
for p in by_age:
    print(p["name"], p["age"])`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 22 Boss: The Leader Board Sorter",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "You manage a game leaderboard.\n\n1. Implement 'binary_search(sorted_list, target)' that returns the index of 'target' in a pre-sorted list of scores, or -1 if not found.\n2. You are given a list of player dicts. Sort them:\n   - Primary: by 'score' descending\n   - Secondary: if scores are equal, sort by 'name' ascending\n3. Print the top 3 players: '[rank]. [name]: [score]'\n4. Use your binary_search on the sorted scores list to find score 780 and print:\n   'Score 780 found at rank: [rank]' (rank = index + 1)",
          startingCode: `players = [
    {"name": "Zara",   "score": 950},
    {"name": "Alice",  "score": 780},
    {"name": "Bob",    "score": 780},
    {"name": "Priya",  "score": 1100},
    {"name": "Carlos", "score": 860},
    {"name": "Diana",  "score": 920},
]
 
def binary_search(sorted_list, target):
    pass
 
# Sort players
 
# Print top 3
 
# Binary search for score 780 in sorted scores list
`,
          expectedOutput: `1. Priya: 1100\n2. Zara: 950\n3. Diana: 920\nScore 780 found at rank: 4`,
          solutionCode: `players = [
    {"name": "Zara",   "score": 950},
    {"name": "Alice",  "score": 780},
    {"name": "Bob",    "score": 780},
    {"name": "Priya",  "score": 1100},
    {"name": "Carlos", "score": 860},
    {"name": "Diana",  "score": 920},
]
 
def binary_search(sorted_list, target):
    left, right = 0, len(sorted_list) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
 
players_sorted = sorted(players, key=lambda p: (-p["score"], p["name"]))
 
for i, p in enumerate(players_sorted[:3], 1):
    print(f"{i}. {p['name']}: {p['score']}")
 
scores_sorted = sorted([p["score"] for p in players_sorted])
idx = binary_search(scores_sorted, 780)
if idx != -1:
    rank = len(scores_sorted) - idx
    # Find rank in descending list
desc_scores = [p["score"] for p in players_sorted]
rank = desc_scores.index(780) + 1
print(f"Score 780 found at rank: {rank}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 23 — APIs & HTTP Requests
    // ─────────────────────────────────────────────
    {
      no: 23,
      name: "APIs: Talking to the Outside World",
      difficulty: "Advanced",
      totalXp: 100,
      summary:
        "Fetch live data from the internet, send data to servers, and understand how real applications communicate.",
      parts: [
        {
          id: 1,
          title: "What is an API?",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "An API (Application Programming Interface) is a waiter in a restaurant. You (the app) sit at the table, give your order (a request) to the waiter, who takes it to the kitchen (the server) and brings back the food (the response). You never go into the kitchen.\n\nAPIs let apps talk to other apps over the internet without knowing how the other side works internally.",
              code: `import requests
 
# A real free API — no key needed
response = requests.get("https://api.github.com")
 
print(response.status_code)    # 200 = success
print(type(response.json()))   # <class 'dict'>
print(response.json()["current_user_url"])`,
            },
            {
              body:
                "HTTP status codes are the waiter's signal:\n• 200 — OK, here is your food\n• 201 — Created, your order was placed\n• 404 — Not found, that dish does not exist\n• 500 — Server error, the kitchen is on fire\n\nAlways check the status code before trusting the response.",
              code: `import requests
 
url = "https://jsonplaceholder.typicode.com/users/1"
response = requests.get(url)
 
if response.status_code == 200:
    user = response.json()
    print(user["name"])
    print(user["email"])
else:
    print(f"Error: {response.status_code}")`,
            },
          ],
        },
        {
          id: 2,
          title: "GET vs POST: Fetching vs Sending",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "GET requests fetch data — you are reading a menu. POST requests send data — you are placing an order. GET puts parameters in the URL. POST sends data in the request body (hidden).",
              code: `import requests
 
# GET — fetch a specific post
response = requests.get(
    "https://jsonplaceholder.typicode.com/posts",
    params={"userId": 1}   # adds ?userId=1 to the URL
)
 
posts = response.json()
print(f"Found {len(posts)} posts")
print(posts[0]["title"])`,
            },
            {
              body:
                "POST — send data to create something. The server processes the data you send and usually returns the created object. In real apps, this is how you submit forms, create accounts, or send messages.",
              code: `import requests
 
new_post = {
    "title":  "My First Post",
    "body":   "Hello from Python!",
    "userId": 1
}
 
response = requests.post(
    "https://jsonplaceholder.typicode.com/posts",
    json=new_post    # automatically sets Content-Type header
)
 
print(response.status_code)    # 201 Created
print(response.json())`,
            },
          ],
        },
        {
          id: 3,
          title: "Headers, Auth & Error Handling",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Headers carry extra information with a request — like attaching a cover letter to your order. Common headers include 'Authorization' (your API key or token) and 'Content-Type' (what format you're sending).",
              code: `import requests
 
headers = {
    "Authorization": "Bearer YOUR_TOKEN_HERE",
    "Accept": "application/json"
}
 
# This pattern is used for any authenticated API
response = requests.get(
    "https://api.example.com/profile",
    headers=headers
)
 
# We are using a placeholder URL — it won't work without a real token
print(response.status_code)`,
            },
            {
              body:
                "Always wrap API calls in try/except. Networks are unreliable — timeouts happen, servers go down, URLs change. Failing gracefully keeps your app running instead of crashing the moment Wi-Fi flickers.",
              code: `import requests
 
def fetch_user(user_id):
    try:
        url = f"https://jsonplaceholder.typicode.com/users/{user_id}"
        response = requests.get(url, timeout=5)   # crash if takes > 5 sec
        response.raise_for_status()               # crash if 4xx or 5xx
        return response.json()
    except requests.exceptions.Timeout:
        return {"error": "Request timed out"}
    except requests.exceptions.HTTPError as e:
        return {"error": str(e)}
 
print(fetch_user(1)["name"])     # Leanne Graham
print(fetch_user(999))           # error — user doesn't exist`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 23 Boss: The Weather Reporter",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Fetch and display data from a public API.\n\nUsing the JSONPlaceholder API (https://jsonplaceholder.typicode.com):\n\n1. Fetch the list of all users: GET /users\n2. For each user, fetch their posts: GET /posts?userId=[id]\n3. Print a report for the top 3 users (by number of posts) in the format:\n   '[name] ([email]) — [count] posts'\n4. Wrap all requests in try/except and print 'API error: [message]' if anything fails.",
          startingCode: `import requests
 
BASE = "https://jsonplaceholder.typicode.com"
 
# Step 1: Fetch all users
 
# Step 2: For each user fetch their post count
 
# Step 3: Sort by post count, print top 3
 
# Wrap in try/except
`,
          expectedOutput: `Chelsey Dietrich (Lucio_Hettinger@annie.ca) — 10 posts\nClementina DuBuque (Rey.Padberg@karina.biz) — 10 posts\nErvin Howell (Shanna@melissa.tv) — 10 posts`,
          solutionCode: `import requests
 
BASE = "https://jsonplaceholder.typicode.com"
 
try:
    users_resp = requests.get(f"{BASE}/users", timeout=5)
    users_resp.raise_for_status()
    users = users_resp.json()
 
    user_post_counts = []
 
    for user in users:
        posts_resp = requests.get(f"{BASE}/posts", params={"userId": user["id"]}, timeout=5)
        posts_resp.raise_for_status()
        count = len(posts_resp.json())
        user_post_counts.append((user["name"], user["email"], count))
 
    top3 = sorted(user_post_counts, key=lambda u: u[2], reverse=True)[:3]
 
    for name, email, count in top3:
        print(f"{name} ({email}) — {count} posts")
 
except requests.exceptions.RequestException as e:
    print(f"API error: {e}")`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 24 — Concurrency: Threads & async
    // ─────────────────────────────────────────────
    {
      no: 24,
      name: "Concurrency: Doing Multiple Things at Once",
      difficulty: "Advanced",
      totalXp: 100,
      summary:
        "Speed up your programs by running tasks in parallel using threading and Python's async/await pattern.",
      parts: [
        {
          id: 1,
          title: "Threads: Running Two Things Side by Side",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "By default, Python runs one line at a time. Threading is like hiring a second worker to do a different task at the same time while the first keeps going.\n\nThe 'threading' module creates and manages threads. Each thread is an independent worker running a function.",
              code: `import threading
import time
 
def task(name, seconds):
    print(f"{name} started")
    time.sleep(seconds)
    print(f"{name} done after {seconds}s")
 
# Without threads — total time = 1 + 2 = 3 seconds
# task("Task A", 1)
# task("Task B", 2)
 
# With threads — total time ≈ 2 seconds (they run at the same time)
t1 = threading.Thread(target=task, args=("Task A", 1))
t2 = threading.Thread(target=task, args=("Task B", 2))
 
t1.start()
t2.start()
 
t1.join()   # wait for t1 to finish
t2.join()   # wait for t2 to finish
print("All done!")`,
            },
            {
              body:
                "Threads share the same memory. This is great for efficiency but dangerous — two threads might try to change the same variable at the same time. A Lock prevents this by allowing only one thread in at a time, like a single-stall bathroom.",
              code: `import threading
 
counter = 0
lock = threading.Lock()
 
def increment():
    global counter
    for _ in range(100_000):
        with lock:           # only one thread at a time
            counter += 1
 
t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)
 
t1.start(); t2.start()
t1.join();  t2.join()
 
print(counter)    # reliably 200,000`,
            },
          ],
        },
        {
          id: 2,
          title: "async & await: Waiting Without Blocking",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "async/await is for tasks that spend a lot of time waiting — like web requests, reading files, or database calls. Instead of blocking (freezing) while waiting, Python does other work and comes back when the result is ready.\n\nThink of it as placing an online order. You don't stand at the door waiting — you do other things until it arrives.",
              code: `import asyncio
 
async def fetch_data(name, delay):
    print(f"Fetching {name}...")
    await asyncio.sleep(delay)   # simulate waiting (non-blocking)
    print(f"{name} done!")
    return f"Data from {name}"
 
async def main():
    # Run both at the same time
    results = await asyncio.gather(
        fetch_data("API 1", 2),
        fetch_data("API 2", 1),
    )
    print(results)
 
asyncio.run(main())`,
            },
            {
              body:
                "Key rules:\n• A function defined with 'async def' is a coroutine — it can pause.\n• 'await' tells Python 'pause here and do other things while we wait'.\n• Use asyncio.gather() to run multiple coroutines at the same time.\n• asyncio.run() starts the whole async engine.",
              code: `import asyncio
 
async def greet(name):
    await asyncio.sleep(0.1)
    return f"Hello, {name}!"
 
async def main():
    names = ["Alice", "Bob", "Priya"]
    tasks = [greet(name) for name in names]
    results = await asyncio.gather(*tasks)
    for r in results:
        print(r)
 
asyncio.run(main())`,
            },
          ],
        },
        {
          id: 3,
          title: "Threading vs async: Picking the Right Tool",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Use threads when:\n• Your tasks are CPU-light but involve waiting (file I/O, network)\n• You are working with older libraries that are not async-compatible\n\nUse async/await when:\n• You have MANY tasks waiting at the same time (hundreds of web requests)\n• You are building a web server, chatbot, or real-time app",
              code: `# Thread pool — clean way to run many threads
from concurrent.futures import ThreadPoolExecutor
import time
 
def download(url):
    time.sleep(0.5)   # simulate download
    return f"Downloaded: {url}"
 
urls = ["site1.com", "site2.com", "site3.com", "site4.com"]
 
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(download, urls))
 
for r in results:
    print(r)`,
            },
            {
              body:
                "asyncio is not faster because it uses multiple CPU cores. It is faster because it never WASTES TIME sitting around doing nothing while waiting. One worker handles many tasks by being smart about pausing and resuming.",
              code: `import asyncio
 
async def simulate_request(n):
    await asyncio.sleep(0.1)
    return n * n
 
async def main():
    # Run 10 'requests' — total time ≈ 0.1s, not 1s
    results = await asyncio.gather(*[simulate_request(i) for i in range(10)])
    print(results)
 
asyncio.run(main())`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 24 Boss: The Async Downloader",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Simulate an async file downloader.\n\n1. Create an async function 'download(filename, size_mb)' that:\n   - Prints 'Starting: [filename] ([size_mb]MB)'\n   - Awaits asyncio.sleep(size_mb * 0.1) to simulate download time\n   - Prints 'Finished: [filename]'\n   - Returns '[filename] downloaded'\n\n2. Create async 'main()' that downloads these files concurrently using asyncio.gather():\n   - 'video.mp4' (50MB), 'music.mp3' (5MB), 'photo.jpg' (2MB), 'document.pdf' (1MB)\n\n3. After all downloads, print each result.\n4. Run main() with asyncio.run().",
          startingCode: `import asyncio
 
async def download(filename, size_mb):
    pass
 
async def main():
    files = [
        ("video.mp4",    50),
        ("music.mp3",    5),
        ("photo.jpg",    2),
        ("document.pdf", 1),
    ]
    # Download all concurrently and print results
 
asyncio.run(main())
`,
          expectedOutput: `Starting: video.mp4 (50MB)\nStarting: music.mp3 (5MB)\nStarting: photo.jpg (2MB)\nStarting: document.pdf (1MB)\nFinished: document.pdf\nFinished: photo.jpg\nFinished: music.mp3\nFinished: video.mp4\ndocument.pdf downloaded\nphoto.jpg downloaded\nmusic.mp3 downloaded\nvideo.mp4 downloaded`,
          solutionCode: `import asyncio
 
async def download(filename, size_mb):
    print(f"Starting: {filename} ({size_mb}MB)")
    await asyncio.sleep(size_mb * 0.1)
    print(f"Finished: {filename}")
    return f"{filename} downloaded"
 
async def main():
    files = [
        ("video.mp4",    50),
        ("music.mp3",    5),
        ("photo.jpg",    2),
        ("document.pdf", 1),
    ]
    results = await asyncio.gather(*[download(f, s) for f, s in files])
    for r in sorted(results, key=lambda x: x):
        print(r)
 
asyncio.run(main())`,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // CHAPTER 25 — Final Boss: Build a Real CLI App
    // ─────────────────────────────────────────────
    {
      no: 25,
      name: "Final Project: Build a Task Manager CLI",
      difficulty: "Advanced",
      totalXp: 100,
      summary:
        "Put everything together — OOP, file handling, JSON, error handling, and clean code — to build a real, working command-line application.",
      parts: [
        {
          id: 1,
          title: "Planning the App",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "Before writing a single line, plan what the app does and how it is structured. A Task Manager needs to:\n• Add a task (title + priority)\n• List all tasks\n• Mark a task as done\n• Delete a task\n• Save tasks to a JSON file so they survive after the program closes\n\nThis is how real developers think before coding.",
              code: `# Data shape — what each task looks like
task = {
    "id": 1,
    "title": "Learn Python",
    "priority": "high",
    "done": False
}
 
# File structure
# tasks.json — persisted task list
# task_manager.py — the main program
 
# Core functions we will need:
# - load_tasks()
# - save_tasks(tasks)
# - add_task(tasks, title, priority)
# - list_tasks(tasks)
# - complete_task(tasks, task_id)
# - delete_task(tasks, task_id)`,
            },
            {
              body:
                "The TaskManager class wraps all the functions together. This is OOP in practice — the class owns the data and the methods that operate on it. Keeping everything in one class makes the code easy to extend later.",
              code: `import json, os
 
class TaskManager:
    FILE = "tasks.json"
 
    def __init__(self):
        self.tasks = self.load()
 
    def load(self):
        if os.path.exists(self.FILE):
            with open(self.FILE) as f:
                return json.load(f)
        return []
 
    def save(self):
        with open(self.FILE, "w") as f:
            json.dump(self.tasks, f, indent=2)
 
tm = TaskManager()
print("Loaded tasks:", len(tm.tasks))`,
            },
          ],
        },
        {
          id: 2,
          title: "Adding & Listing Tasks",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "The add() method creates a new task dict and appends it to the list. We auto-generate the ID from the list length. We save immediately after every change so nothing is lost.",
              code: `def add(self, title, priority="medium"):
    task = {
        "id": len(self.tasks) + 1,
        "title": title,
        "priority": priority,
        "done": False
    }
    self.tasks.append(task)
    self.save()
    print(f"Added: [{task['id']}] {title}")
 
# Usage
tm = TaskManager()
tm.add("Buy groceries")
tm.add("Finish Python course", "high")`,
            },
            {
              body:
                "The list() method formats and prints all tasks. A ✓ shows done tasks, an empty box shows pending ones. Sort by priority so high-priority tasks appear first.",
              code: `def list_tasks(self):
    if not self.tasks:
        print("No tasks yet.")
        return
 
    order = {"high": 0, "medium": 1, "low": 2}
    sorted_tasks = sorted(self.tasks, key=lambda t: order.get(t["priority"], 1))
 
    for t in sorted_tasks:
        status = "✓" if t["done"] else "○"
        print(f"[{status}] {t['id']}. ({t['priority']}) {t['title']}")`,
            },
          ],
        },
        {
          id: 3,
          title: "Completing & Deleting Tasks",
          xp: 20,
          type: "lesson",
          steps: [
            {
              body:
                "complete() finds a task by ID and flips its 'done' flag to True. We use a generator expression inside next() for a clean one-liner lookup — read it as 'find the first task where id matches'.",
              code: `def complete(self, task_id):
    task = next((t for t in self.tasks if t["id"] == task_id), None)
    if task:
        task["done"] = True
        self.save()
        print(f"Done: {task['title']}")
    else:
        print(f"Task {task_id} not found.")
 
def delete(self, task_id):
    original_len = len(self.tasks)
    self.tasks = [t for t in self.tasks if t["id"] != task_id]
    if len(self.tasks) < original_len:
        self.save()
        print(f"Deleted task {task_id}.")
    else:
        print(f"Task {task_id} not found.")`,
            },
            {
              body:
                "The command-line menu ties everything together. It keeps running in a while loop, reads user input, and routes to the right method. This is the backbone of any CLI app — an input loop.",
              code: `def run(self):
    while True:
        print("\\n1. Add  2. List  3. Complete  4. Delete  5. Quit")
        choice = input("Choice: ").strip()
 
        if choice == "1":
            title    = input("Title: ")
            priority = input("Priority (high/medium/low): ") or "medium"
            self.add(title, priority)
        elif choice == "2":
            self.list_tasks()
        elif choice == "3":
            self.complete(int(input("Task ID: ")))
        elif choice == "4":
            self.delete(int(input("Task ID: ")))
        elif choice == "5":
            print("Goodbye!")
            break`,
            },
          ],
        },
        {
          id: 4,
          title: "Chapter 25 Final Boss: The Complete Task Manager",
          xp: 40,
          type: "coding_test",
          isChallengepart: true,
          instructions:
            "Build the complete TaskManager class and run a script that:\n\n1. Creates a TaskManager.\n2. Adds 3 tasks:\n   - 'Write unit tests' (high)\n   - 'Update README' (low)\n   - 'Fix login bug' (high)\n3. Lists all tasks (sorted: high first).\n4. Completes task with ID 1.\n5. Deletes task with ID 2.\n6. Lists tasks again.\n\nNo file I/O needed for this test — store tasks only in memory (skip load/save).",
          startingCode: `class TaskManager:
    def __init__(self):
        self.tasks = []
 
    def add(self, title, priority="medium"):
        pass
 
    def list_tasks(self):
        pass
 
    def complete(self, task_id):
        pass
 
    def delete(self, task_id):
        pass
 
 
tm = TaskManager()
tm.add("Write unit tests", "high")
tm.add("Update README", "low")
tm.add("Fix login bug", "high")
 
print("--- Initial List ---")
tm.list_tasks()
 
tm.complete(1)
tm.delete(2)
 
print("--- Updated List ---")
tm.list_tasks()
`,
          expectedOutput: `--- Initial List ---\n[○] 1. (high) Write unit tests\n[○] 3. (high) Fix login bug\n[○] 2. (low) Update README\nDone: Write unit tests\nDeleted task 2.\n--- Updated List ---\n[✓] 1. (high) Write unit tests\n[○] 3. (high) Fix login bug`,
          solutionCode: `class TaskManager:
    def __init__(self):
        self.tasks = []
 
    def add(self, title, priority="medium"):
        task = {
            "id": len(self.tasks) + 1,
            "title": title,
            "priority": priority,
            "done": False
        }
        self.tasks.append(task)
 
    def list_tasks(self):
        order = {"high": 0, "medium": 1, "low": 2}
        sorted_tasks = sorted(self.tasks, key=lambda t: order.get(t["priority"], 1))
        for t in sorted_tasks:
            status = "✓" if t["done"] else "○"
            print(f"[{status}] {t['id']}. ({t['priority']}) {t['title']}")
 
    def complete(self, task_id):
        task = next((t for t in self.tasks if t["id"] == task_id), None)
        if task:
            task["done"] = True
            print(f"Done: {task['title']}")
        else:
            print(f"Task {task_id} not found.")
 
    def delete(self, task_id):
        original_len = len(self.tasks)
        self.tasks = [t for t in self.tasks if t["id"] != task_id]
        if len(self.tasks) < original_len:
            print(f"Deleted task {task_id}.")
        else:
            print(f"Task {task_id} not found.")
 
 
tm = TaskManager()
tm.add("Write unit tests", "high")
tm.add("Update README", "low")
tm.add("Fix login bug", "high")
 
print("--- Initial List ---")
tm.list_tasks()
 
tm.complete(1)
tm.delete(2)
 
print("--- Updated List ---")
tm.list_tasks()`,
        },
      ],
    },
  ],
}

// ─── data/cppCourse.js ────────────────────────────────────────────────────────
// Complete C++ course — 25 chapters, progressive difficulty.

export const cppCourse = {
  language: "C++",
  accentColor: "#3b82f6",
  accentLight: "#93c5fd",
  totalChapters: 25,
  chapters: [

    // ── BEGINNER (Ch 1–7) ─────────────────────────────────────────────────────

    {
      no: 1,
      name: "Introduction to C++",
      difficulty: "Beginner",
      duration: "10 min",
      xp: 100,
      summary: "Understand what C++ is, its history, and why it remains one of the most powerful languages ever created.",
      body: `C++ was created by Bjarne Stroustrup at Bell Labs in 1979 as an extension of C, adding object-oriented features. It compiles directly to machine code, making it extremely fast — often matching or exceeding C in performance. C++ is used where raw speed matters: operating systems, game engines, browsers, databases, and embedded systems. It supports multiple programming paradigms: procedural, object-oriented, generic, and functional. Every major game engine (Unreal, Unity core), browser engine (V8, WebKit), and database (MySQL, MongoDB) is written in C++.`,
      uses: [
        "Game development: Unreal Engine, AAA game logic.",
        "System programming: OS kernels, device drivers.",
        "High-frequency trading and financial systems.",
        "Browsers: Chrome's V8 engine, Firefox's SpiderMonkey.",
        "Embedded systems and IoT firmware.",
      ],
      keyFeatures: [
        "Compiled language — code compiled directly to machine code for maximum speed.",
        "Statically typed — type checking at compile time catches errors early.",
        "Manual memory management — full control with new/delete.",
        "Zero-overhead abstractions — abstractions cost nothing at runtime.",
        "Multi-paradigm — OOP, procedural, generic, and functional all supported.",
      ],
      examples: [
        {
          title: "Hello World",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
          body: "#include brings in the iostream library. cout is the standard output stream. main() is the program's entry point.",
        },
        {
          title: "Compiling and running",
          code: `// Save as hello.cpp\n// Compile: g++ -o hello hello.cpp\n// Run:     ./hello\n\n#include <iostream>\n\nint main() {\n    std::cout << "C++ is fast!" << std::endl;\n    return 0;\n}`,
          body: "g++ is the GNU C++ compiler. -o names the output executable. std:: is the standard namespace prefix.",
        },
        {
          title: "Basic input and output",
          code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    cin >> name;\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}`,
          body: "cin reads input from the user. The >> operator extracts into the variable. string requires the <string> header.",
        },
      ],
      tip: "Always return 0 from main(). It signals to the OS that the program finished successfully. Non-zero indicates an error.",
    },

    {
      no: 2,
      name: "Variables, Data Types & Constants",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 110,
      summary: "Declare variables with explicit types and understand C++'s rich set of built-in data types.",
      body: `C++ is statically typed — every variable must have a declared type at compile time. Fundamental types include int (integer), double (decimal), char (single character), bool (true/false), and void (no value). C++11 introduced auto for type deduction. const declares immutable values; constexpr computes values at compile time. Understanding type sizes matters in C++ because they directly affect memory and performance.`,
      uses: [
        "Storing game scores, coordinates, player health as specific types.",
        "constexpr for compile-time constants — zero runtime overhead.",
        "Choosing int vs long vs size_t based on data range.",
      ],
      keyFeatures: [
        "int: typically 4 bytes. long long: 8 bytes. short: 2 bytes.",
        "float: 4-byte decimal (less precise). double: 8-byte (preferred).",
        "auto: compiler deduces the type from the initialiser.",
        "const: runtime constant. constexpr: compile-time constant.",
        "Uniform initialisation: int x{5}; prevents narrowing conversions.",
        "std::string for text (requires <string>).",
      ],
      examples: [
        {
          title: "Fundamental types",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 25;\n    double price = 99.99;\n    char grade = 'A';\n    bool isActive = true;\n    auto name = string("Alice"); // auto deduces string\n\n    cout << age << " " << price << " " << grade << endl;\n    cout << sizeof(int) << " bytes\\n";  // 4\n    cout << sizeof(double) << " bytes\\n"; // 8\n    return 0;\n}`,
          body: "sizeof() returns the byte size of a type — crucial for understanding memory layout.",
        },
        {
          title: "const and constexpr",
          code: `#include <iostream>\nusing namespace std;\n\nconstexpr double PI = 3.14159265358979;\nconstexpr int MAX_PLAYERS = 8;\n\nint main() {\n    const int userId = 42; // runtime constant\n    // userId = 43; // Error: cannot assign to const\n\n    double area = PI * 5 * 5;\n    cout << "Area: " << area << endl; // 78.5398\n    return 0;\n}`,
          body: "constexpr values are evaluated at compile time — they exist in the binary as literals, no runtime cost.",
        },
        {
          title: "Type conversion",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 7, b = 2;\n    cout << a / b << endl;          // 3 (integer division!)\n    cout << (double)a / b << endl;  // 3.5 (C-style cast)\n    cout << static_cast<double>(a) / b; // 3.5 (C++ cast, preferred)\n    return 0;\n}`,
          body: "Integer division truncates. Use static_cast<double> for proper division. C++ casts are safer and more readable than C-style casts.",
        },
      ],
      tip: "Prefer double over float for decimals — the extra precision prevents many subtle bugs. Only use float when memory is critical.",
    },

    {
      no: 3,
      name: "Operators & Expressions",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 110,
      summary: "Perform calculations, compare values, and build logical expressions using C++ operators.",
      body: `C++ supports all standard operators: arithmetic (+, -, *, /, %), comparison (==, !=, <, >), logical (&&, ||, !), bitwise (&, |, ^, ~, <<, >>), and assignment. The bitwise operators are heavily used in C++ for low-level work like flags, masks, and performance optimisation. The ternary operator and compound assignment (+=, -=, etc.) keep code concise.`,
      uses: [
        "Bitwise flags: packing multiple boolean options into a single integer.",
        "Modulo for cyclic behaviour: position % arraySize.",
        "Bit shifting for fast multiplication/division by powers of 2.",
      ],
      keyFeatures: [
        "Arithmetic: +, -, *, /, % (integer remainder).",
        "Bitwise: &, |, ^, ~, <<, >> — operate on individual bits.",
        "Compound assignment: +=, -=, *=, /=, &=, |=, <<=.",
        "Prefix vs postfix: ++x increments before use; x++ increments after.",
        "Precedence: * before +, && before ||. Use parentheses for clarity.",
      ],
      examples: [
        {
          title: "Arithmetic and modulo",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 17;\n    cout << x % 5 << endl;    // 2 (remainder)\n    cout << x / 5 << endl;    // 3 (integer quotient)\n    cout << (x % 2 == 0 ? "Even" : "Odd") << endl; // Odd\n\n    // Compound assignment\n    x += 3;  // x = 20\n    x *= 2;  // x = 40\n    cout << x << endl; // 40\n    return 0;\n}`,
          body: "Modulo is extremely useful for wrapping around arrays, creating cycles, and checking even/odd.",
        },
        {
          title: "Bitwise operators",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Flags packed in one int\n    const int READ    = 0b001; // 1\n    const int WRITE   = 0b010; // 2\n    const int EXECUTE = 0b100; // 4\n\n    int perms = READ | WRITE;  // 3 (combine)\n    cout << (perms & READ) << endl;    // 1 (has READ)\n    cout << (perms & EXECUTE) << endl; // 0 (no EXECUTE)\n\n    // Fast multiply/divide by 2\n    int n = 8;\n    cout << (n << 1) << endl; // 16 (n * 2)\n    cout << (n >> 1) << endl; // 4  (n / 2)\n    return 0;\n}`,
          body: "Bitwise OR combines flags; AND checks if a flag is set. Left/right shift multiplies/divides by powers of 2.",
        },
      ],
      tip: "Bit shifting (n << 1) is faster than multiplication (n * 2) but compilers optimise both identically in modern code. Use whichever is more readable.",
    },

    {
      no: 4,
      name: "Control Flow — if, switch, Loops",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 120,
      summary: "Control your program's execution path with conditionals and loops.",
      body: `C++ control flow is similar to C and Java. if/else chains conditions; switch tests a single value against multiple cases. C++ has three loop types: for (count-based), while (condition-based), do-while (runs at least once). The range-based for loop (C++11) is the cleanest way to iterate over containers. break exits a loop; continue skips the current iteration; goto exists but is rarely used.`,
      uses: [
        "Game loops: while (gameRunning) { update(); render(); }",
        "Input validation: loop until valid input received.",
        "Menu systems with switch statements.",
      ],
      keyFeatures: [
        "Range-based for: for (auto& item : container) — C++11, clean iteration.",
        "switch with fallthrough: multiple cases share one body without break.",
        "do-while: guarantees at least one execution — good for menus.",
        "C++17 if with initialiser: if (int x = f(); x > 0) { ... }",
        "break/continue work in all loop types.",
      ],
      examples: [
        {
          title: "Range-based for loop",
          code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> scores = {85, 92, 78, 96, 88};\n\n    int total = 0;\n    for (const auto& s : scores) {\n        total += s;\n    }\n    cout << "Average: " << total / scores.size() << endl; // 87\n    return 0;\n}`,
          body: "Range-based for with const auto& avoids copying elements. & gives a reference; const prevents accidental modification.",
        },
        {
          title: "switch statement",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int day = 3;\n    switch (day) {\n        case 1: cout << "Monday"; break;\n        case 2: cout << "Tuesday"; break;\n        case 3: cout << "Wednesday"; break; // runs\n        case 6:\n        case 7: cout << "Weekend"; break;   // fallthrough\n        default: cout << "Weekday";\n    }\n    return 0;\n}`,
          body: "Without break, execution falls through to the next case. Cases 6 and 7 share the same output.",
        },
        {
          title: "C++17 if with initialiser",
          code: `#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n    map<string, int> scores = {{"Alice", 95}, {"Bob", 72}};\n\n    // Init and test in one line\n    if (auto it = scores.find("Alice"); it != scores.end()) {\n        cout << "Found: " << it->second << endl; // 95\n    } else {\n        cout << "Not found" << endl;\n    }\n    // 'it' is scoped to the if block — cleaner!\n    return 0;\n}`,
          body: "The initialiser in if() limits the variable's scope to the if/else block — prevents polluting the outer scope.",
        },
      ],
      tip: "Use range-based for loops for containers whenever you don't need the index. Use a classic for loop when you need the index.",
    },

    {
      no: 5,
      name: "Functions & Function Overloading",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 130,
      summary: "Define reusable, type-safe functions and leverage C++'s unique function overloading feature.",
      body: `Functions in C++ must declare their return type and parameter types. C++ supports function overloading — multiple functions with the same name but different parameter types or counts. The compiler picks the right one automatically. Default parameters provide fallback values. Inline functions hint the compiler to paste the function body at the call site for speed. Function declarations (prototypes) allow calling a function before its definition.`,
      uses: [
        "Overloading print() to handle int, double, and string uniformly.",
        "Default parameters for API functions with optional config.",
        "Inline for tiny, frequently-called utility functions.",
      ],
      keyFeatures: [
        "Function overloading: same name, different signatures.",
        "Default parameters: void greet(string name = \"Guest\").",
        "Pass by value vs pass by reference (&) vs pointer (*).",
        "const reference parameters: void f(const string& s) — no copy, no modify.",
        "inline keyword: hints compiler to expand function body at call site.",
        "Function prototypes: declare before main, define after.",
      ],
      examples: [
        {
          title: "Function overloading",
          code: `#include <iostream>\nusing namespace std;\n\nvoid print(int n)    { cout << "Int: " << n << endl; }\nvoid print(double d) { cout << "Double: " << d << endl; }\nvoid print(string s) { cout << "String: " << s << endl; }\n\nint main() {\n    print(42);       // Int: 42\n    print(3.14);     // Double: 3.14\n    print("Hello");  // String: Hello\n    return 0;\n}`,
          body: "The compiler selects the right function based on argument types at compile time — zero runtime overhead.",
        },
        {
          title: "Pass by reference",
          code: `#include <iostream>\nusing namespace std;\n\n// Pass by value — copy made, original unchanged\nvoid doubleVal(int x) { x *= 2; }\n\n// Pass by reference — modifies original\nvoid doubleRef(int& x) { x *= 2; }\n\nint main() {\n    int a = 5, b = 5;\n    doubleVal(a);\n    doubleRef(b);\n    cout << a << endl; // 5 — unchanged\n    cout << b << endl; // 10 — modified\n    return 0;\n}`,
          body: "& in the parameter makes it a reference — the function works directly on the caller's variable, no copy.",
        },
        {
          title: "Default parameters",
          code: `#include <iostream>\nusing namespace std;\n\nvoid createUser(string name, int age = 18, string role = "user") {\n    cout << name << " | " << age << " | " << role << endl;\n}\n\nint main() {\n    createUser("Alice");             // Alice | 18 | user\n    createUser("Bob", 25);           // Bob | 25 | user\n    createUser("Carol", 30, "admin"); // Carol | 30 | admin\n    return 0;\n}`,
          body: "Default parameters must be at the end of the parameter list. They make functions flexible without overloading.",
        },
      ],
      tip: "Prefer pass by const reference (const T&) for large objects to avoid copying. Use pass by value for small types like int and bool.",
    },

    {
      no: 6,
      name: "Arrays, Strings & std::vector",
      difficulty: "Beginner",
      duration: "16 min",
      xp: 140,
      summary: "Store sequences of data in arrays and the superior std::vector container.",
      body: `C-style arrays are fixed-size and decay to pointers — dangerous and limited. std::vector (from <vector>) is the modern replacement: dynamic, safe, and feature-rich. std::string (from <string>) is the C++ alternative to char arrays. Vectors automatically resize, provide bounds-checked access with .at(), and work with all STL algorithms. Almost all modern C++ code uses vector over raw arrays.`,
      uses: [
        "std::vector for any dynamic list: players, inventory, results.",
        "std::string for all text processing.",
        "2D vectors for grids, matrices, and tables.",
      ],
      keyFeatures: [
        "vector<T>: push_back(), pop_back(), size(), empty(), clear().",
        "vector::at(i): bounds-checked access (throws on out-of-range).",
        "vector[i]: unchecked access — faster, but dangerous if index is wrong.",
        "vector initialiser list: vector<int> v = {1, 2, 3};",
        "string: +, +=, length(), substr(), find(), replace().",
        "2D vector: vector<vector<int>> grid(rows, vector<int>(cols, 0));",
      ],
      examples: [
        {
          title: "std::vector basics",
          code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {10, 20, 30};\n    nums.push_back(40);\n    nums.push_back(50);\n\n    cout << "Size: " << nums.size() << endl; // 5\n    cout << "First: " << nums.front() << endl; // 10\n    cout << "Last: "  << nums.back()  << endl; // 50\n\n    for (int n : nums) cout << n << " ";\n    cout << endl;\n    return 0;\n}`,
          body: "push_back() appends to the end. front()/back() access first/last. No manual memory management needed.",
        },
        {
          title: "std::string operations",
          code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s = "Hello, World!";\n    cout << s.length() << endl;         // 13\n    cout << s.substr(7, 5) << endl;    // "World"\n    cout << s.find("World") << endl;   // 7\n\n    s.replace(7, 5, "C++");\n    cout << s << endl; // "Hello, C++!"\n\n    // Convert int to string\n    int n = 42;\n    string ns = to_string(n);\n    cout << "Number: " + ns << endl; // "Number: 42"\n    return 0;\n}`,
          body: "substr(pos, len) extracts a substring. find() returns the index or string::npos if not found.",
        },
        {
          title: "2D vector (matrix)",
          code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 3x3 matrix initialised to 0\n    vector<vector<int>> matrix(3, vector<int>(3, 0));\n\n    // Fill diagonal\n    for (int i = 0; i < 3; i++)\n        matrix[i][i] = i + 1;\n\n    for (auto& row : matrix) {\n        for (int val : row) cout << val << " ";\n        cout << endl;\n    }\n    // 1 0 0\n    // 0 2 0\n    // 0 0 3\n    return 0;\n}`,
          body: "2D vectors are vectors of vectors. Inner vector(cols, 0) initialises each row with zeros.",
        },
      ],
      tip: "Use vector.at(i) during development — it throws a clear exception on out-of-bounds. Switch to vector[i] only in performance-critical, proven code.",
    },

    {
      no: 7,
      name: "Pointers & References",
      difficulty: "Beginner",
      duration: "18 min",
      xp: 160,
      summary: "Understand C++'s most powerful — and most feared — feature: direct memory access through pointers.",
      body: `A pointer stores the memory address of another variable. Pointers enable dynamic memory allocation, efficient data passing, and building data structures. A reference is an alias — an alternative name for an existing variable. References are safer than pointers (can't be null, can't be reseated). Modern C++ prefers references and smart pointers over raw pointers. Understanding pointers is still essential for reading legacy code and understanding how memory works.`,
      uses: [
        "Dynamic memory allocation: new/delete for runtime-sized data.",
        "Passing large objects efficiently without copying.",
        "Building linked lists, trees, and graphs.",
        "Interfacing with C libraries and hardware registers.",
      ],
      keyFeatures: [
        "& (address-of operator): gets the address of a variable.",
        "* (dereference operator): accesses the value at an address.",
        "nullptr: the null pointer constant (replaces NULL).",
        "References must be initialised and cannot be changed to refer to something else.",
        "Pointer arithmetic: ptr++ moves to the next element.",
        "const pointer vs pointer to const — two different restrictions.",
      ],
      examples: [
        {
          title: "Pointer basics",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 42;\n    int* ptr = &x; // ptr holds the address of x\n\n    cout << x << endl;       // 42 (value)\n    cout << &x << endl;      // 0x... (address)\n    cout << ptr << endl;     // same address\n    cout << *ptr << endl;    // 42 (dereference)\n\n    *ptr = 100;              // change x through pointer\n    cout << x << endl;       // 100\n    return 0;\n}`,
          body: "& gets the address; * follows the address to get the value. ptr and &x hold the same address.",
        },
        {
          title: "References vs pointers",
          code: `#include <iostream>\nusing namespace std;\n\nvoid squarePtr(int* p)  { *p = (*p) * (*p); }\nvoid squareRef(int& r)  {  r = r * r; }\n\nint main() {\n    int a = 4, b = 5;\n    squarePtr(&a); // must pass address\n    squareRef(b);  // pass directly — cleaner!\n\n    cout << a << endl; // 16\n    cout << b << endl; // 25\n    return 0;\n}`,
          body: "References have cleaner syntax and can't be accidentally null. Prefer references over pointers when the value must exist.",
        },
        {
          title: "Dynamic allocation",
          code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int* p = new int(99);       // allocate on heap\n    cout << *p << endl;         // 99\n    delete p;                   // free memory!\n    p = nullptr;                // prevent dangling pointer\n\n    // Dynamic array\n    int n = 5;\n    int* arr = new int[n];\n    for (int i = 0; i < n; i++) arr[i] = i * 10;\n    cout << arr[2] << endl;     // 20\n    delete[] arr;               // must use delete[]\n    return 0;\n}`,
          body: "new allocates on the heap; delete frees it. Forgetting delete causes memory leaks. Always set pointer to nullptr after delete.",
        },
      ],
      tip: "In modern C++, prefer std::unique_ptr and std::shared_ptr over raw new/delete. They automatically free memory — no leaks possible.",
    },

    // ── INTERMEDIATE (Ch 8–15) ────────────────────────────────────────────────

    {
      no: 8,
      name: "Object-Oriented Programming — Classes & Objects",
      difficulty: "Intermediate",
      duration: "18 min",
      xp: 160,
      summary: "Model real-world entities as classes with data and behaviour bundled together.",
      body: `A class defines a blueprint for objects — it bundles data (member variables) and behaviour (member functions/methods). Access specifiers (public, private, protected) control visibility. The constructor initialises an object; the destructor cleans up when it's destroyed. Member initialiser lists in constructors are more efficient than assignment inside the constructor body. This, Encapsulation, hides implementation details behind a public interface.`,
      uses: [
        "Modelling game entities: Player, Enemy, Weapon.",
        "Encapsulating data: BankAccount hides its balance behind methods.",
        "Building reusable components in large codebases.",
      ],
      keyFeatures: [
        "public: accessible anywhere. private: only within the class. protected: class + subclasses.",
        "Constructor: same name as class, no return type, initialises object.",
        "Destructor: ~ClassName() — called automatically when object goes out of scope.",
        "Member initialiser list: ClassName(int x) : member(x) {} — more efficient.",
        "this pointer: points to the current object instance.",
        "const member functions: void f() const — cannot modify member variables.",
      ],
      examples: [
        {
          title: "Basic class with encapsulation",
          code: `#include <iostream>\nusing namespace std;\n\nclass Rectangle {\nprivate:\n    double width, height;\n\npublic:\n    Rectangle(double w, double h) : width(w), height(h) {}\n\n    double area()     const { return width * height; }\n    double perimeter() const { return 2 * (width + height); }\n    void resize(double factor) { width *= factor; height *= factor; }\n};\n\nint main() {\n    Rectangle r(5.0, 3.0);\n    cout << r.area() << endl;      // 15\n    r.resize(2.0);\n    cout << r.area() << endl;      // 60\n    return 0;\n}`,
          body: "Private data can't be changed directly — only through public methods. This is encapsulation.",
        },
        {
          title: "Constructor and destructor",
          code: `#include <iostream>\nusing namespace std;\n\nclass FileHandler {\n    string filename;\npublic:\n    FileHandler(const string& f) : filename(f) {\n        cout << "Opening: " << filename << endl;\n    }\n    ~FileHandler() {\n        cout << "Closing: " << filename << endl;\n    }\n    void read() { cout << "Reading " << filename << endl; }\n};\n\nint main() {\n    FileHandler f("data.txt"); // constructor called\n    f.read();\n    // destructor called automatically at end of scope\n    return 0;\n}\n// Opening: data.txt\n// Reading data.txt\n// Closing: data.txt`,
          body: "The destructor runs automatically when the object goes out of scope — no manual cleanup needed. This is RAII.",
        },
      ],
      tip: "RAII (Resource Acquisition Is Initialisation) — acquire resources in the constructor, release in the destructor. This pattern makes C++ memory management safe and automatic.",
    },

    {
      no: 9,
      name: "Inheritance & Polymorphism",
      difficulty: "Intermediate",
      duration: "18 min",
      xp: 170,
      summary: "Build class hierarchies with inheritance and achieve runtime polymorphism with virtual functions.",
      body: `Inheritance lets a derived class inherit data and behaviour from a base class, reusing and extending it. Virtual functions enable polymorphism — calling a derived class's method through a base class pointer. The virtual keyword marks a function for dynamic dispatch; override confirms you're overriding a base function. Pure virtual functions (= 0) create abstract classes that cannot be instantiated — only subclasses can.`,
      uses: [
        "Shape hierarchy: Circle, Rectangle, Triangle all inherit from Shape.",
        "Plugin systems: different handlers share a common interface.",
        "Game entities: all game objects share a base GameObject with update() and render().",
      ],
      keyFeatures: [
        "class Derived : public Base — public inheritance.",
        "virtual void f() — enables dynamic dispatch (runtime polymorphism).",
        "override keyword — compiler verifies you're actually overriding.",
        "virtual ~Base() — virtual destructor essential for polymorphic delete.",
        "Pure virtual: virtual void f() = 0 — makes class abstract.",
        "final keyword — prevents further inheritance or overriding.",
      ],
      examples: [
        {
          title: "Virtual functions and polymorphism",
          code: `#include <iostream>\n#include <vector>\n#include <memory>\nusing namespace std;\n\nclass Shape {\npublic:\n    virtual double area() const = 0; // pure virtual\n    virtual string name() const = 0;\n    virtual ~Shape() = default;\n};\n\nclass Circle : public Shape {\n    double r;\npublic:\n    Circle(double r) : r(r) {}\n    double area() const override { return 3.14159 * r * r; }\n    string name() const override { return "Circle"; }\n};\n\nclass Square : public Shape {\n    double s;\npublic:\n    Square(double s) : s(s) {}\n    double area() const override { return s * s; }\n    string name() const override { return "Square"; }\n};\n\nint main() {\n    vector<unique_ptr<Shape>> shapes;\n    shapes.push_back(make_unique<Circle>(5));\n    shapes.push_back(make_unique<Square>(4));\n\n    for (auto& s : shapes)\n        cout << s->name() << ": " << s->area() << endl;\n    return 0;\n}`,
          body: "unique_ptr handles memory. The right area() is called at runtime based on the actual object type — polymorphism.",
        },
        {
          title: "Access levels in inheritance",
          code: `#include <iostream>\nusing namespace std;\n\nclass Animal {\npublic:\n    string name;\n    Animal(const string& n) : name(n) {}\n    virtual void speak() const { cout << name << " makes a sound"; }\n};\n\nclass Dog : public Animal {\npublic:\n    Dog(const string& n) : Animal(n) {}\n    void speak() const override { cout << name << " says: Woof!"; }\n    void fetch() const { cout << name << " fetches!"; }\n};\n\nint main() {\n    Animal* a = new Dog("Rex");\n    a->speak(); // "Rex says: Woof!" — dynamic dispatch\n    delete a;\n    return 0;\n}`,
          body: "Even though a is an Animal pointer, the Dog::speak() is called because speak() is virtual.",
        },
      ],
      tip: "Always declare base class destructors as virtual. Without it, deleting a derived object through a base pointer only calls the base destructor — memory leak!",
    },

    {
      no: 10,
      name: "Templates & Generic Programming",
      difficulty: "Intermediate",
      duration: "16 min",
      xp: 170,
      summary: "Write code that works with any type using C++ templates — the foundation of the STL.",
      body: `Templates allow writing type-independent code. A function template generates a version for each type it's called with. A class template creates a type-parametrised class (like vector<int> or vector<string>). Template specialisation provides custom behaviour for specific types. Templates are resolved at compile time — zero runtime overhead. The entire Standard Template Library (STL) is built on templates.`,
      uses: [
        "Generic containers: stack<T>, queue<T>, pair<K,V>.",
        "Generic algorithms: sort, find, transform work on any container.",
        "Type-safe utility functions: max, min, swap.",
      ],
      keyFeatures: [
        "template<typename T> — declares a type parameter.",
        "Function templates: instantiated automatically from usage.",
        "Class templates: must specify type explicitly: Stack<int>.",
        "Template specialisation: custom implementation for a specific type.",
        "Multiple type parameters: template<typename K, typename V>.",
        "auto return type (C++14): template<typename T> auto f(T x) -> T.",
      ],
      examples: [
        {
          title: "Function template",
          code: `#include <iostream>\nusing namespace std;\n\ntemplate<typename T>\nT maxOf(T a, T b) {\n    return (a > b) ? a : b;\n}\n\ntemplate<typename T>\nvoid printArray(const T* arr, int size) {\n    for (int i = 0; i < size; i++)\n        cout << arr[i] << " ";\n    cout << endl;\n}\n\nint main() {\n    cout << maxOf(3, 7) << endl;        // 7\n    cout << maxOf(3.14, 2.71) << endl;  // 3.14\n    cout << maxOf(string("a"), string("z")) << endl; // z\n\n    int nums[] = {1, 2, 3, 4, 5};\n    printArray(nums, 5); // 1 2 3 4 5\n    return 0;\n}`,
          body: "The compiler generates a separate maxOf function for each type — int, double, string. All at compile time.",
        },
        {
          title: "Class template — generic Stack",
          code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\ntemplate<typename T>\nclass Stack {\n    vector<T> data;\npublic:\n    void push(const T& val) { data.push_back(val); }\n    void pop() { if (!data.empty()) data.pop_back(); }\n    T top() const { return data.back(); }\n    bool empty() const { return data.empty(); }\n    int size() const { return data.size(); }\n};\n\nint main() {\n    Stack<int> s;\n    s.push(10); s.push(20); s.push(30);\n    cout << s.top() << endl; // 30\n    s.pop();\n    cout << s.top() << endl; // 20\n    return 0;\n}`,
          body: "Stack<int> and Stack<string> are completely separate classes generated from the same template.",
        },
      ],
      tip: "Template errors can be verbose and confusing. Use static_assert inside templates to give helpful compile-time error messages.",
    },

    {
      no: 11,
      name: "The STL — Containers & Algorithms",
      difficulty: "Intermediate",
      duration: "18 min",
      xp: 170,
      summary: "Use the Standard Template Library's battle-tested containers and algorithms instead of writing your own.",
      body: `The STL provides three things: containers (data structures), algorithms (sort, search, transform), and iterators (unified traversal). Key containers: vector (dynamic array), list (doubly linked), deque (double-ended queue), set (sorted unique), map (sorted key-value), unordered_map (hash table). Algorithms live in <algorithm> and work on any container via iterators. Knowing the STL is the difference between amateur and professional C++.`,
      uses: [
        "unordered_map for O(1) lookup tables (word counts, caches).",
        "set for maintaining sorted unique collections.",
        "std::sort, std::find, std::transform on any container.",
        "priority_queue for scheduling and pathfinding (Dijkstra's).",
      ],
      keyFeatures: [
        "vector: O(1) access, O(1) push_back amortised.",
        "map/set: O(log n) operations (Red-Black tree).",
        "unordered_map/set: O(1) average (hash table).",
        "Iterators: begin(), end() — pointers into containers.",
        "std::sort(begin, end) — introsort, O(n log n).",
        "std::find, std::count, std::transform, std::accumulate.",
      ],
      examples: [
        {
          title: "map and unordered_map",
          code: `#include <iostream>\n#include <map>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    // Word frequency count\n    string words[] = {"apple","banana","apple","cherry","banana","apple"};\n    unordered_map<string, int> freq;\n\n    for (const auto& w : words)\n        freq[w]++;\n\n    for (const auto& [word, count] : freq)\n        cout << word << ": " << count << endl;\n    // apple: 3, banana: 2, cherry: 1 (order may vary)\n    return 0;\n}`,
          body: "unordered_map[key]++ creates the key with 0 if absent, then increments. O(1) per operation.",
        },
        {
          title: "STL algorithms",
          code: `#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\nusing namespace std;\n\nint main() {\n    vector<int> v = {5, 2, 8, 1, 9, 3};\n\n    sort(v.begin(), v.end()); // {1,2,3,5,8,9}\n\n    auto it = find(v.begin(), v.end(), 8);\n    cout << "Found 8 at index: " << distance(v.begin(), it) << endl; // 4\n\n    int sum = accumulate(v.begin(), v.end(), 0);\n    cout << "Sum: " << sum << endl; // 28\n\n    // transform: double each element\n    transform(v.begin(), v.end(), v.begin(), [](int x){ return x * 2; });\n    for (int n : v) cout << n << " "; // 2 4 6 10 16 18\n    return 0;\n}`,
          body: "STL algorithms take iterator ranges. Lambda expressions (C++11) make them flexible and concise.",
        },
      ],
      tip: "Learn the complexity of each container operation. Choosing unordered_map over map can turn an O(n log n) into O(n) for lookup-heavy code.",
    },

    {
      no: 12,
      name: "Smart Pointers & Modern Memory Management",
      difficulty: "Intermediate",
      duration: "16 min",
      xp: 170,
      summary: "Eliminate memory leaks permanently with C++11 smart pointers.",
      body: `Smart pointers are RAII wrappers around raw pointers that automatically manage memory. unique_ptr has exclusive ownership — deleted when it goes out of scope. shared_ptr shares ownership via reference counting — deleted when the last owner goes away. weak_ptr observes a shared_ptr without owning it (breaks circular references). In modern C++, raw new/delete should be extremely rare.`,
      uses: [
        "unique_ptr for single-owner resources (file handles, textures).",
        "shared_ptr for shared ownership (cache entries, shared config).",
        "weak_ptr to break reference cycles (parent-child tree nodes).",
      ],
      keyFeatures: [
        "make_unique<T>() — creates unique_ptr (preferred over new).",
        "make_shared<T>() — creates shared_ptr (more efficient than shared_ptr(new T)).",
        "unique_ptr: move-only — can't copy, only transfer ownership with std::move.",
        "shared_ptr: copyable — each copy increments reference count.",
        "weak_ptr: must lock() to access — returns shared_ptr or nullptr.",
        "get() — access raw pointer (use carefully).",
      ],
      examples: [
        {
          title: "unique_ptr",
          code: `#include <iostream>\n#include <memory>\nusing namespace std;\n\nclass Resource {\npublic:\n    Resource() { cout << "Acquired\\n"; }\n    ~Resource() { cout << "Released\\n"; }\n    void use() { cout << "Using\\n"; }\n};\n\nint main() {\n    {\n        auto res = make_unique<Resource>();\n        res->use();\n    } // automatically released here!\n\n    // Transfer ownership\n    auto a = make_unique<int>(42);\n    auto b = move(a); // a is now null\n    cout << *b << endl; // 42\n    return 0;\n}`,
          body: "unique_ptr releases memory when it goes out of scope — no delete needed, no leaks possible.",
        },
        {
          title: "shared_ptr and weak_ptr",
          code: `#include <iostream>\n#include <memory>\nusing namespace std;\n\nint main() {\n    shared_ptr<int> a = make_shared<int>(100);\n    shared_ptr<int> b = a; // both own the int\n\n    cout << a.use_count() << endl; // 2\n    cout << *a << endl;            // 100\n\n    b.reset(); // b releases ownership\n    cout << a.use_count() << endl; // 1\n\n    weak_ptr<int> w = a; // observe without owning\n    if (auto locked = w.lock()) { // safely access\n        cout << *locked << endl;  // 100\n    }\n    return 0;\n}`,
          body: "use_count() shows how many shared_ptrs own the resource. weak_ptr::lock() returns a temporary shared_ptr or nullptr.",
        },
      ],
      tip: "Default to unique_ptr. Only reach for shared_ptr when multiple owners genuinely need to share a resource's lifetime.",
    },

    {
      no: 13,
      name: "Lambda Expressions & std::function",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 160,
      summary: "Write compact, inline functions with lambdas — modern C++'s most powerful syntactic addition.",
      body: `Lambda expressions (C++11) create anonymous function objects inline. They can capture variables from their surrounding scope by value or reference. std::function is a type-erased wrapper that can hold any callable (lambdas, function pointers, functors). Lambdas are essential for working with STL algorithms, callbacks, and event handlers. Generic lambdas (C++14) use auto parameters for template-like flexibility.`,
      uses: [
        "Custom comparators for sort: sort with specific ordering.",
        "Callbacks: pass behaviour to a function without defining a named function.",
        "One-shot utility: a computation used in exactly one place.",
      ],
      keyFeatures: [
        "[capture](params) -> return { body } — full lambda syntax.",
        "[=] captures all by value; [&] captures all by reference.",
        "[x, &y] — capture x by value, y by reference.",
        "mutable — allows modifying captured-by-value variables.",
        "Generic lambda (C++14): [](auto x, auto y) { return x + y; }",
        "std::function<ReturnType(ParamTypes)> — stores any callable.",
      ],
      examples: [
        {
          title: "Lambdas with STL",
          code: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> v = {5, 3, 8, 1, 9, 2};\n\n    // Sort descending\n    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });\n    for (int n : v) cout << n << " "; // 9 8 5 3 2 1\n    cout << endl;\n\n    // Count elements > 4\n    int count = count_if(v.begin(), v.end(), [](int n) { return n > 4; });\n    cout << "Above 4: " << count << endl; // 3\n    return 0;\n}`,
          body: "Lambda as comparator for sort. count_if with lambda predicate — clean, no named function needed.",
        },
        {
          title: "Capture and std::function",
          code: `#include <iostream>\n#include <functional>\nusing namespace std;\n\nfunction<int(int)> makeAdder(int n) {\n    return [n](int x) { return x + n; }; // capture n by value\n}\n\nint main() {\n    auto add5 = makeAdder(5);\n    auto add10 = makeAdder(10);\n\n    cout << add5(3)  << endl; // 8\n    cout << add10(3) << endl; // 13\n\n    // Capture by reference\n    int total = 0;\n    vector<int> nums = {1, 2, 3, 4, 5};\n    for_each(nums.begin(), nums.end(), [&total](int n) { total += n; });\n    cout << total << endl; // 15\n    return 0;\n}`,
          body: "Capturing n by value in makeAdder creates a closure. Each adder remembers its own n.",
        },
      ],
      tip: "Capture by reference [&] in lambdas that outlive their scope is a common source of dangling reference bugs. Capture by value [=] when in doubt.",
    },

    {
      no: 14,
      name: "File I/O & Streams",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 150,
      summary: "Read from and write to files using C++'s stream-based I/O system.",
      body: `C++ uses a stream abstraction for I/O. The <fstream> library provides ifstream (input file stream), ofstream (output file stream), and fstream (both). Streams support reading line by line with getline(), formatting with precision and width manipulators, and binary I/O for non-text data. Stream state flags (fail, eof, bad) indicate errors. Always close files — or better, let RAII do it automatically when the stream goes out of scope.`,
      uses: [
        "Reading config files, CSV data, log files.",
        "Saving game state or user settings to disk.",
        "Processing large datasets line by line.",
        "Binary serialisation of objects.",
      ],
      keyFeatures: [
        "ofstream out(\"file.txt\") — open for writing (creates/overwrites).",
        "ifstream in(\"file.txt\") — open for reading.",
        "ios::app — append mode. ios::binary — binary mode.",
        "getline(stream, string) — reads a full line including spaces.",
        "is_open(), good(), eof(), fail() — stream state checks.",
        "setprecision(), setw(), left, right — formatting manipulators.",
      ],
      examples: [
        {
          title: "Write and read a file",
          code: `#include <iostream>\n#include <fstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write\n    ofstream out("scores.txt");\n    out << "Alice 95\\n" << "Bob 87\\n" << "Carol 91\\n";\n    out.close();\n\n    // Read line by line\n    ifstream in("scores.txt");\n    string line;\n    while (getline(in, line)) {\n        cout << line << endl;\n    }\n    return 0;\n}`,
          body: "ofstream writes text. getline reads until newline — handles spaces in lines correctly unlike >> which stops at whitespace.",
        },
        {
          title: "CSV parsing",
          code: `#include <iostream>\n#include <fstream>\n#include <sstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Simulate reading: name,age,score\n    string csvData = "Alice,28,95\\nBob,22,87\\nCarol,31,91";\n    istringstream stream(csvData);\n    string line;\n\n    while (getline(stream, line)) {\n        istringstream row(line);\n        string name, ageStr, scoreStr;\n        getline(row, name, ',');\n        getline(row, ageStr, ',');\n        getline(row, scoreStr, ',');\n        cout << name << " age=" << ageStr << " score=" << scoreStr << endl;\n    }\n    return 0;\n}`,
          body: "stringstream turns a string into a stream — perfect for parsing. getline with delimiter splits on commas.",
        },
      ],
      tip: "Wrap file streams in a small class or use them in a block scope — when the stream object is destroyed, the file closes automatically. No need to call close() manually.",
    },

    {
      no: 15,
      name: "Exception Handling",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 160,
      summary: "Handle runtime errors gracefully using C++'s try/catch/throw exception mechanism.",
      body: `Exceptions provide a structured way to handle errors that propagate up the call stack. throw raises an exception; try marks code that might throw; catch handles it. C++ can throw any type, but throwing std::exception subclasses is best practice. The exception hierarchy includes std::runtime_error, std::invalid_argument, std::out_of_range, and more. noexcept marks functions guaranteed not to throw — enabling compiler optimisations.`,
      uses: [
        "Reporting invalid function arguments.",
        "Handling file not found, network errors, parse failures.",
        "Propagating errors from deep call stacks to the top level.",
      ],
      keyFeatures: [
        "throw expr — raises any type as an exception.",
        "catch(const exception& e) — catches by const reference (avoids slicing).",
        "catch(...) — catches everything (use as last resort).",
        "std::exception::what() — returns the error message.",
        "noexcept — marks functions that guarantee no exceptions.",
        "Custom exceptions: inherit from std::runtime_error.",
      ],
      examples: [
        {
          title: "try / catch",
          code: `#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\ndouble divide(double a, double b) {\n    if (b == 0)\n        throw invalid_argument("Division by zero");\n    return a / b;\n}\n\nint main() {\n    try {\n        cout << divide(10, 2) << endl;  // 5\n        cout << divide(10, 0) << endl;  // throws!\n    } catch (const invalid_argument& e) {\n        cerr << "Error: " << e.what() << endl;\n    } catch (const exception& e) {\n        cerr << "Unknown: " << e.what() << endl;\n    }\n    return 0;\n}`,
          body: "Catch most-specific exceptions first, then more general ones. cerr is the standard error stream.",
        },
        {
          title: "Custom exception class",
          code: `#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\nclass NetworkError : public runtime_error {\n    int errorCode;\npublic:\n    NetworkError(const string& msg, int code)\n        : runtime_error(msg), errorCode(code) {}\n    int code() const { return errorCode; }\n};\n\nint main() {\n    try {\n        throw NetworkError("Connection refused", 503);\n    } catch (const NetworkError& e) {\n        cout << e.what() << " (code: " << e.code() << ")" << endl;\n    }\n    return 0;\n}`,
          body: "Custom exceptions carry extra context. Inheriting from runtime_error gives you what() for free.",
        },
      ],
      tip: "Don't use exceptions for normal control flow — they're expensive. Use them for truly exceptional, unexpected conditions.",
    },

    // ── ADVANCED (Ch 16–25) ───────────────────────────────────────────────────

    {
      no: 16,
      name: "Move Semantics & Rvalue References",
      difficulty: "Advanced",
      duration: "16 min",
      xp: 190,
      summary: "Eliminate unnecessary copies with C++11's move semantics — the key to high-performance C++.",
      body: `Copy semantics duplicate data. Move semantics transfer ownership — stealing resources from a temporary object instead of copying them. Rvalue references (T&&) bind to temporaries. The move constructor and move assignment operator implement this. std::move() casts an lvalue to an rvalue reference, enabling a move. This is critical for performance when working with large objects like vectors and strings.`,
      uses: [
        "Returning large objects from functions without copying (NRVO + move).",
        "Efficient container insertion: emplace_back vs push_back.",
        "Implementing fast swap operations.",
      ],
      keyFeatures: [
        "Lvalue: has a name/address. Rvalue: temporary, no name.",
        "T&& — rvalue reference. Binds to temporaries.",
        "Move constructor: takes T&& and steals resources.",
        "std::move() — casts to rvalue reference (doesn't actually move).",
        "Rule of Five: if you define destructor/copy, define move too.",
        "emplace_back(args) — constructs in-place, no temporary.",
      ],
      examples: [
        {
          title: "Observing move semantics",
          code: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    string big = string(1000000, 'x'); // 1MB string\n\n    // Copy — duplicates 1MB\n    string copy1 = big;\n    cout << big.size() << endl;  // 1000000 — still intact\n\n    // Move — transfers ownership, no copy!\n    string moved = move(big);\n    cout << big.size() << endl;  // 0 — big is now empty\n    cout << moved.size() << endl; // 1000000\n    return 0;\n}`,
          body: "move() transfers ownership of the string's internal buffer. The original is left empty. Zero allocation.",
        },
        {
          title: "Move constructor",
          code: `#include <iostream>\n#include <utility>\nusing namespace std;\n\nclass Buffer {\n    int* data;\n    size_t size;\npublic:\n    Buffer(size_t s) : size(s), data(new int[s]) {\n        cout << "Allocated " << s << endl;\n    }\n    // Move constructor — steals data pointer\n    Buffer(Buffer&& other) : data(other.data), size(other.size) {\n        other.data = nullptr; // leave source empty\n        other.size = 0;\n        cout << "Moved\\n";\n    }\n    ~Buffer() { delete[] data; }\n};\n\nBuffer makeBuffer() {\n    return Buffer(1024); // move (or NRVO) — no copy\n}\n\nint main() {\n    Buffer b = makeBuffer(); // "Allocated 1024" + possibly "Moved"\n    return 0;\n}`,
          body: "The move constructor steals the pointer instead of allocating new memory and copying data.",
        },
      ],
      tip: "Use emplace_back() over push_back() when adding new elements to vectors. It constructs in-place, saving a move or copy.",
    },

    {
      no: 17,
      name: "Operator Overloading",
      difficulty: "Advanced",
      duration: "14 min",
      xp: 180,
      summary: "Give custom types natural, intuitive syntax by overloading operators.",
      body: `Operator overloading lets user-defined types use built-in operators (+, -, *, ==, <<, etc.). This makes code with custom types read as naturally as code with ints. Nearly all operators can be overloaded. Some operators (=, [], (), ->) should be member functions. Others (<<, >>) should be friend functions. Overload only when it genuinely improves readability — don't make * mean "send email".`,
      uses: [
        "Vector2D + Vector2D for 2D math.",
        "Matrix * Matrix for linear algebra.",
        "Custom string class with + concatenation.",
        "cout << MyObject for printing.",
      ],
      keyFeatures: [
        "Member vs free function: binary ops with symmetric types are better as free.",
        "friend keyword: allows access to private members from outside.",
        "Return *this for chaining: operator+= should return reference.",
        "const correctness: const methods for operators that don't modify.",
        "Comparison operators: define <=> (C++20 spaceship) for all comparisons.",
      ],
      examples: [
        {
          title: "Vector2D with operators",
          code: `#include <iostream>\nusing namespace std;\n\nstruct Vec2 {\n    double x, y;\n    Vec2(double x = 0, double y = 0) : x(x), y(y) {}\n\n    Vec2 operator+(const Vec2& o) const { return {x+o.x, y+o.y}; }\n    Vec2 operator*(double s) const { return {x*s, y*s}; }\n    bool operator==(const Vec2& o) const { return x==o.x && y==o.y; }\n\n    friend ostream& operator<<(ostream& os, const Vec2& v) {\n        return os << "(" << v.x << ", " << v.y << ")";\n    }\n};\n\nint main() {\n    Vec2 a(1, 2), b(3, 4);\n    cout << a + b << endl;  // (4, 6)\n    cout << a * 3 << endl;  // (3, 6)\n    return 0;\n}`,
          body: "operator<< as friend gives access to private members and integrates with cout naturally.",
        },
      ],
      tip: "If you overload ==, also overload !=. If you overload <, overload all six comparison operators (or use C++20's <=> spaceship operator).",
    },

    {
      no: 18,
      name: "Concurrency — Threads & Mutexes",
      difficulty: "Advanced",
      duration: "16 min",
      xp: 190,
      summary: "Run code in parallel using C++11's standard threading library.",
      body: `C++11 added native threading support via <thread>, <mutex>, <atomic>, and <future>. std::thread runs a function concurrently. Shared data between threads causes race conditions — protect with std::mutex. std::atomic provides lock-free operations on simple types. std::async and std::future run tasks asynchronously and retrieve results. Modern C++ concurrency is high-level compared to pthreads.`,
      uses: [
        "Parallel data processing: split an array across multiple threads.",
        "Background tasks: loading assets while UI stays responsive.",
        "Async I/O: multiple network requests simultaneously.",
        "Producer-consumer pipelines.",
      ],
      keyFeatures: [
        "thread t(func, args) — create and start a thread.",
        "t.join() — wait for thread to finish.",
        "mutex m; lock_guard<mutex> lk(m) — RAII lock.",
        "unique_lock — more flexible than lock_guard (supports timed locks).",
        "atomic<int> — thread-safe integer without mutex.",
        "async(func) returns future<T> — get result with .get().",
      ],
      examples: [
        {
          title: "std::thread and mutex",
          code: `#include <iostream>\n#include <thread>\n#include <mutex>\nusing namespace std;\n\nmutex mtx;\nint counter = 0;\n\nvoid increment(int n) {\n    for (int i = 0; i < n; i++) {\n        lock_guard<mutex> lock(mtx); // RAII lock\n        counter++;\n    } // lock released here\n}\n\nint main() {\n    thread t1(increment, 10000);\n    thread t2(increment, 10000);\n    t1.join();\n    t2.join();\n    cout << counter << endl; // 20000 (safe!)\n    return 0;\n}`,
          body: "Without the mutex, two threads writing counter simultaneously would cause data races and unpredictable results.",
        },
        {
          title: "std::async and future",
          code: `#include <iostream>\n#include <future>\nusing namespace std;\n\nlong long sumRange(long long from, long long to) {\n    long long sum = 0;\n    for (long long i = from; i <= to; i++) sum += i;\n    return sum;\n}\n\nint main() {\n    // Run in background\n    auto f = async(launch::async, sumRange, 1, 1000000LL);\n    cout << \"Computing...\" << endl;\n    cout << \"Result: \" << f.get() << endl; // blocks until done\n    return 0;\n}`,
          body: "async runs the function in a thread pool. .get() waits for the result and returns it (or rethrows any exception).",
        },
      ],
      tip: "Avoid sharing data between threads when possible. Prefer message passing (queues) or immutable data. Shared mutable state is the root of most concurrency bugs.",
    },

    {
      no: 19,
      name: "Modern C++20 Features",
      difficulty: "Advanced",
      duration: "14 min",
      xp: 180,
      summary: "Explore the biggest C++ update in a decade: concepts, ranges, coroutines, and modules.",
      body: `C++20 introduced major features: Concepts constrain template type parameters for clear error messages. Ranges provide a lazy, composable pipeline API over containers. Coroutines enable co_await/co_yield for async/generator patterns. Modules replace header files for faster compilation. std::span provides a safe non-owning view over arrays. These features collectively modernise C++ dramatically.`,
      uses: [
        "Concepts for self-documenting, constrained templates.",
        "Ranges for readable data pipelines: filter | transform | take.",
        "Coroutines for async networking code.",
        "Modules for 10x faster compile times in large projects.",
      ],
      keyFeatures: [
        "concept: named set of requirements for template parameters.",
        "requires clause: inline constraint on templates.",
        "std::ranges::sort, filter_view, transform_view.",
        "co_await, co_yield, co_return — coroutine keywords.",
        "std::span<T> — lightweight view over contiguous data.",
        "Designated initialisers: Point p = {.x = 1, .y = 2};",
      ],
      examples: [
        {
          title: "Concepts",
          code: `#include <iostream>\n#include <concepts>\nusing namespace std;\n\ntemplate<typename T>\nconcept Numeric = is_arithmetic_v<T>;\n\ntemplate<Numeric T>\nT add(T a, T b) { return a + b; }\n\nint main() {\n    cout << add(3, 4) << endl;       // 7\n    cout << add(3.14, 2.71) << endl; // 5.85\n    // add(string("a"), string("b")); // Compile error: not Numeric\n    return 0;\n}`,
          body: "Concepts provide clear, readable constraints. The error message says 'not Numeric' instead of pages of template gibberish.",
        },
        {
          title: "Ranges pipeline",
          code: `#include <iostream>\n#include <vector>\n#include <ranges>\nusing namespace std;\n\nint main() {\n    vector<int> v = {1,2,3,4,5,6,7,8,9,10};\n\n    // Lazy pipeline: filter evens, square them, take first 3\n    auto result = v\n        | views::filter([](int x){ return x % 2 == 0; })\n        | views::transform([](int x){ return x * x; })\n        | views::take(3);\n\n    for (int n : result) cout << n << \" \"; // 4 16 36\n    return 0;\n}`,
          body: "Ranges are lazy — no intermediate vectors allocated. The pipeline processes elements on-demand.",
        },
      ],
      tip: "C++20 concepts make template error messages human-readable. Adopt them for any template code — your future self will thank you.",
    },

    {
      no: 20,
      name: "Design Patterns in C++",
      difficulty: "Advanced",
      duration: "16 min",
      xp: 190,
      summary: "Apply classic software engineering patterns to write flexible, extensible, maintainable C++ code.",
      body: `Design patterns are reusable solutions to recurring problems. Three categories: Creational (Singleton, Factory), Structural (Adapter, Decorator), Behavioural (Observer, Strategy). In C++, patterns are implemented with interfaces (abstract classes), templates, and functors. Knowing patterns makes you productive on any large codebase and helps you communicate design decisions clearly.`,
      uses: [
        "Singleton for configuration, loggers, thread pools.",
        "Observer for event systems (GUI, game events).",
        "Strategy for swappable algorithms (different sorting or compression).",
        "Factory for creating objects without knowing their concrete type.",
      ],
      keyFeatures: [
        "Singleton: one instance, global access — use sparingly.",
        "Factory Method: create objects via interface, hide concrete type.",
        "Observer: subject notifies multiple observers of state changes.",
        "Strategy: encapsulate interchangeable algorithms behind an interface.",
        "CRTP (Curiously Recurring Template Pattern) — compile-time polymorphism.",
      ],
      examples: [
        {
          title: "Singleton pattern",
          code: `#include <iostream>\nusing namespace std;\n\nclass Logger {\n    Logger() = default; // private constructor\npublic:\n    static Logger& instance() {\n        static Logger inst; // created once, on first call\n        return inst;\n    }\n    Logger(const Logger&) = delete;  // no copy\n    void log(const string& msg) { cout << \"[LOG] \" << msg << endl; }\n};\n\nint main() {\n    Logger::instance().log("App started");\n    Logger::instance().log("User logged in");\n    return 0;\n}`,
          body: "Static local variable is initialised once, thread-safely (C++11). Delete copy constructor to prevent duplication.",
        },
        {
          title: "Observer pattern",
          code: `#include <iostream>\n#include <vector>\n#include <functional>\nusing namespace std;\n\nclass Button {\n    vector<function<void()>> listeners;\npublic:\n    void onClick(function<void()> handler) {\n        listeners.push_back(handler);\n    }\n    void click() {\n        for (auto& h : listeners) h();\n    }\n};\n\nint main() {\n    Button btn;\n    btn.onClick([] { cout << \"Handler 1: button clicked!\\n\"; });\n    btn.onClick([] { cout << \"Handler 2: logging click\\n\"; });\n    btn.click(); // both handlers called\n    return 0;\n}`,
          body: "Using std::function and lambdas makes the Observer pattern lightweight and flexible without abstract interfaces.",
        },
      ],
      tip: "Don't force patterns — use them when they naturally fit the problem. Overusing patterns leads to over-engineered code that's hard to read.",
    },

    {
      no: 21,
      name: "Preprocessor, Compilation Model & Build Systems",
      difficulty: "Expert",
      duration: "14 min",
      xp: 200,
      summary: "Understand how C++ code transforms from source files to executable binary.",
      body: `C++ compilation has four stages: preprocessing (macros, #include expansion), compilation (source to object file), assembly, and linking (combining object files). The preprocessor handles #define, #ifdef, #include. Header guards prevent double inclusion. Build systems (Make, CMake) automate compilation of multi-file projects. Understanding this model explains include order, ODR (One Definition Rule) violations, and linker errors.`,
      uses: [
        "CMake for cross-platform build configuration.",
        "#ifdef for platform-specific code.",
        "Precompiled headers for faster compilation.",
        "Understanding and fixing linker errors.",
      ],
      keyFeatures: [
        "#include: paste file contents. <> for system; \"\" for local.",
        "#define: text substitution. Avoid for constants — use constexpr.",
        "#ifdef/#ifndef/#endif: conditional compilation.",
        "#pragma once: modern header guard (compiler extension).",
        "Translation unit: one .cpp + its included headers.",
        "ODR: each entity defined exactly once across all translation units.",
      ],
      examples: [
        {
          title: "Header guard and #ifdef",
          code: `// math_utils.h\n#pragma once  // or use #ifndef MATH_UTILS_H / #define / #endif\n\n#include <cmath>\n\nconstexpr double PI = 3.14159265358979;\n\ninline double circleArea(double r) {\n    return PI * r * r;\n}\n\n// Platform detection\n#ifdef _WIN32\n    #define PLATFORM "Windows"\n#elif __linux__\n    #define PLATFORM "Linux"\n#else\n    #define PLATFORM "Unknown"\n#endif`,
          body: "#pragma once prevents the header from being included twice. #ifdef enables platform-specific code.",
        },
        {
          title: "CMake basics",
          code: `# CMakeLists.txt\ncmake_minimum_required(VERSION 3.15)\nproject(MyApp)\n\nset(CMAKE_CXX_STANDARD 20)\n\nadd_executable(MyApp\n    src/main.cpp\n    src/game.cpp\n    src/player.cpp\n)\n\ntarget_include_directories(MyApp PRIVATE include)\n\n# Build:\n# mkdir build && cd build\n# cmake .. && cmake --build .`,
          body: "CMake generates platform-appropriate build files (Makefiles on Linux, Visual Studio solutions on Windows).",
        },
      ],
      tip: "Always use #pragma once at the top of every header file. It's simpler and faster than traditional include guards.",
    },

    {
      no: 22,
      name: "Metaprogramming & constexpr",
      difficulty: "Expert",
      duration: "14 min",
      xp: 200,
      summary: "Compute values and make decisions at compile time — turning runtime costs into zero-cost constants.",
      body: `Template metaprogramming (TMP) uses templates to perform computations during compilation. constexpr functions and variables evaluate at compile time. C++17 if constexpr enables compile-time conditional branches. C++20 consteval forces compile-time evaluation. This eliminates runtime overhead for known values and enables sophisticated zero-cost abstractions.`,
      uses: [
        "Compile-time type traits and type transformations.",
        "Compile-time lookup tables and math constants.",
        "Static assertions for validating template usage.",
        "SFINAE and concepts for conditional template instantiation.",
      ],
      keyFeatures: [
        "constexpr function: evaluated at compile or runtime depending on usage.",
        "consteval function (C++20): must be evaluated at compile time.",
        "if constexpr: branch eliminated at compile time based on condition.",
        "static_assert: compile-time assertion with custom message.",
        "type_traits: is_integral_v<T>, is_same_v<T,U>, remove_reference_t<T>.",
        "std::tuple and std::variant for heterogeneous compile-time types.",
      ],
      examples: [
        {
          title: "constexpr functions",
          code: `#include <iostream>\nusing namespace std;\n\nconstexpr long long factorial(int n) {\n    return n <= 1 ? 1 : n * factorial(n - 1);\n}\n\nconstexpr double power(double base, int exp) {\n    return exp == 0 ? 1.0 : base * power(base, exp - 1);\n}\n\nint main() {\n    constexpr long long f10 = factorial(10); // computed at compile time!\n    constexpr double p = power(2.0, 10);     // = 1024.0, compile time\n\n    static_assert(f10 == 3628800, \"Factorial wrong!\");\n    cout << f10 << endl; // 3628800\n    cout << p << endl;   // 1024\n    return 0;\n}`,
          body: "constexpr f10 and p are computed by the compiler — they're literals in the binary. No runtime calculation.",
        },
        {
          title: "if constexpr and type traits",
          code: `#include <iostream>\n#include <type_traits>\n#include <string>\nusing namespace std;\n\ntemplate<typename T>\nstring describe(T val) {\n    if constexpr (is_integral_v<T>)\n        return \"integer: \" + to_string(val);\n    else if constexpr (is_floating_point_v<T>)\n        return \"float: \" + to_string(val);\n    else\n        return \"other\";\n}\n\nint main() {\n    cout << describe(42) << endl;   // integer: 42\n    cout << describe(3.14) << endl; // float: 3.140000\n    return 0;\n}`,
          body: "if constexpr removes dead branches at compile time — only the matching branch exists in the generated code.",
        },
      ],
      tip: "constexpr is one of C++'s most powerful features. If a value can be known at compile time, make it constexpr — it costs nothing at runtime.",
    },

    {
      no: 23,
      name: "Memory Layout, Cache & Performance",
      difficulty: "Expert",
      duration: "16 min",
      xp: 200,
      summary: "Understand how data layout in memory affects performance and write cache-friendly code.",
      body: `Modern CPUs are fast; memory is the bottleneck. Cache lines (typically 64 bytes) are the unit of memory transfer. Accessing data in sequential order (cache-friendly) is 10-100x faster than random access (cache-miss intensive). Struct layout and padding affect size. Alignment ensures CPU can access data efficiently. Data-Oriented Design (DOD) structures data for cache efficiency over OOP convenience.`,
      uses: [
        "Game engines: DOD for processing thousands of entities per frame.",
        "High-frequency trading: layout-optimised order books.",
        "Scientific computing: matrix storage order for SIMD.",
        "Embedded systems: minimising struct padding to save RAM.",
      ],
      keyFeatures: [
        "sizeof(struct) may exceed sum of members due to padding.",
        "alignas(N): align a variable or struct to N-byte boundary.",
        "Struct of Arrays (SoA) vs Array of Structs (AoS).",
        "Cache line: 64 bytes. Accessing >1 element per line = efficient.",
        "False sharing: two threads on same cache line cause contention.",
        "alignof(T): returns alignment requirement of a type.",
      ],
      examples: [
        {
          title: "Struct padding",
          code: `#include <iostream>\nusing namespace std;\n\nstruct BadLayout {\n    char a;    // 1 byte\n    // 7 bytes padding!\n    double b;  // 8 bytes\n    char c;    // 1 byte\n    // 7 bytes padding!\n}; // total: 24 bytes!\n\nstruct GoodLayout {\n    double b;  // 8 bytes\n    char a;    // 1 byte\n    char c;    // 1 byte\n    // 6 bytes padding\n}; // total: 16 bytes\n\nint main() {\n    cout << sizeof(BadLayout)  << endl; // 24\n    cout << sizeof(GoodLayout) << endl; // 16\n    return 0;\n}`,
          body: "Order members largest to smallest to minimise padding. 24 vs 16 bytes — 33% memory saving.",
        },
        {
          title: "Array of Structs vs Struct of Arrays",
          code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\n// AoS — common OOP approach\nstruct Particle {\n    float x, y, z;    // position\n    float vx, vy, vz; // velocity\n    float mass;\n};\nvector<Particle> particles_aos(1000);\n\n// SoA — cache-friendly for processing one field at a time\nstruct Particles {\n    vector<float> x, y, z;\n    vector<float> vx, vy, vz;\n    vector<float> mass;\n    Particles(int n) : x(n),y(n),z(n),vx(n),vy(n),vz(n),mass(n) {}\n};\nParticles particles_soa(1000);\n\n// When updating positions: SoA loads only x,y,z into cache\n// AoS loads velocity and mass too — wasted cache space`,
          body: "SoA is 2-4x faster for operations touching one field of many objects — all x values are contiguous in memory.",
        },
      ],
      tip: "Profile first with a tool like perf or Intel VTune before optimising. The bottleneck is rarely where you expect it.",
    },

    {
      no: 24,
      name: "Networking & Sockets",
      difficulty: "Expert",
      duration: "14 min",
      xp: 200,
      summary: "Write network-capable C++ programs using socket APIs and modern libraries.",
      body: `C++ networking uses POSIX sockets (Linux/macOS) or Winsock (Windows) at the lowest level. Sockets are file-like objects for sending and receiving data over TCP or UDP. TCP is connection-oriented and reliable. UDP is connectionless and fast. Modern C++ uses libraries like Boost.Asio or C++23's std::net for async networking. Understanding raw sockets is foundational even if you use a library.`,
      uses: [
        "Game servers: managing player connections.",
        "HTTP clients: implementing REST API calls without curl.",
        "Custom protocols: chat apps, multiplayer game networking.",
        "Monitoring tools: sending metrics over UDP.",
      ],
      keyFeatures: [
        "socket(AF_INET, SOCK_STREAM, 0) — create TCP socket.",
        "bind(), listen(), accept() — server-side workflow.",
        "connect() — client connects to server.",
        "send() / recv() — send and receive data.",
        "TCP: reliable, ordered. UDP: fast, unreliable, low latency.",
        "Boost.Asio: cross-platform, async networking library.",
      ],
      examples: [
        {
          title: "TCP server skeleton",
          code: `#include <sys/socket.h>\n#include <netinet/in.h>\n#include <unistd.h>\n#include <cstring>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int server = socket(AF_INET, SOCK_STREAM, 0);\n\n    sockaddr_in addr{};\n    addr.sin_family = AF_INET;\n    addr.sin_port = htons(8080);\n    addr.sin_addr.s_addr = INADDR_ANY;\n\n    bind(server, (sockaddr*)&addr, sizeof(addr));\n    listen(server, 5);\n    cout << \"Listening on port 8080...\" << endl;\n\n    int client = accept(server, nullptr, nullptr);\n    const char* msg = \"Hello from C++ server!\\n\";\n    send(client, msg, strlen(msg), 0);\n\n    close(client);\n    close(server);\n    return 0;\n}`,
          body: "socket() creates the endpoint. bind() assigns address. listen() queues connections. accept() blocks until a client connects.",
        },
        {
          title: "Boost.Asio async TCP",
          code: `// Using Boost.Asio for async I/O (industry standard)\n#include <boost/asio.hpp>\nusing boost::asio::ip::tcp;\n\nasync function pattern with Boost.Asio:\n\nboost::asio::io_context io;\ntcp::acceptor acceptor(io, tcp::endpoint(tcp::v4(), 8080));\n\nvoid accept_loop() {\n    auto socket = make_shared<tcp::socket>(io);\n    acceptor.async_accept(*socket, [socket](auto ec) {\n        if (!ec) {\n            // handle client\n        }\n        accept_loop(); // accept next connection\n    });\n}\n\n// io.run(); // event loop`,
          body: "Boost.Asio uses async callbacks for non-blocking I/O — handles thousands of connections on a single thread.",
        },
      ],
      tip: "Use Boost.Asio or asio standalone for production networking. Raw POSIX sockets are for learning the fundamentals.",
    },

    {
      no: 25,
      name: "Best Practices & Writing Production C++",
      difficulty: "Expert",
      duration: "16 min",
      xp: 220,
      summary: "Elevate your C++ to professional quality with modern idioms, tools, and engineering principles.",
      body: `Production C++ requires more than working code — it needs safety, performance, and maintainability. Follow the C++ Core Guidelines (Bjarne Stroustrup + Herb Sutter). Use static analysis (clang-tidy, cppcheck), sanitizers (ASan, UBSan, TSan) to catch bugs. Adopt modern C++ idioms: RAII, smart pointers, const-correctness, prefer algorithms over loops. Profile before optimising. Write tests with Google Test or Catch2.`,
      uses: [
        "Code reviews at top tech companies expect these practices.",
        "Sanitizers catch memory bugs, races, and undefined behaviour in CI.",
        "Static analysis in CI/CD pipelines catches issues before code review.",
      ],
      keyFeatures: [
        "RAII everywhere — resources tied to object lifetimes.",
        "const-correctness: mark everything const that can be.",
        "Prefer algorithms over raw loops — clearer intent.",
        "Use sanitizers: -fsanitize=address,undefined in debug builds.",
        "clang-format for consistent style. clang-tidy for static analysis.",
        "Profile with perf, Valgrind, or Intel VTune before optimising.",
        "Write unit tests for all public interfaces.",
      ],
      examples: [
        {
          title: "Const-correctness",
          code: `#include <vector>\n#include <string>\nusing namespace std;\n\nclass UserList {\n    vector<string> users;\npublic:\n    void add(const string& name) {   // const ref — no copy\n        users.push_back(name);\n    }\n\n    // const method — guarantees no modification\n    size_t count() const { return users.size(); }\n\n    // Returns const ref — caller can't modify\n    const string& get(size_t i) const { return users[i]; }\n\n    // Non-const overload — returns modifiable ref\n    string& get(size_t i) { return users[i]; }\n};`,
          body: "Const-correctness documents intent and catches accidental mutations at compile time.",
        },
        {
          title: "Sanitizer usage",
          code: `# Build with address and undefined behaviour sanitizers\ng++ -g -fsanitize=address,undefined -o myapp main.cpp\n./myapp\n\n# Thread sanitizer (can't combine with ASan)\ng++ -g -fsanitize=thread -o myapp main.cpp\n./myapp\n\n# Example: ASan catches this:\nvoid buggy() {\n    int arr[5];\n    arr[10] = 42; // out-of-bounds write\n    // ASan: heap-buffer-overflow at address...\n}`,
          body: "Sanitizers add runtime checks that catch memory errors with exact stack traces. Run all tests with sanitizers enabled.",
        },
        {
          title: "Effective code style",
          code: `// Prefer this:\nauto it = find_if(users.begin(), users.end(),\n    [&](const User& u) { return u.id == targetId; });\nif (it != users.end()) { process(*it); }\n\n// Over this:\nUser* found = nullptr;\nfor (int i = 0; i < users.size(); i++) {\n    if (users[i].id == targetId) {\n        found = &users[i];\n        break;\n    }\n}\nif (found) { process(*found); }\n\n// Both are correct. The first states INTENT clearly.\n// Use the C++ Core Guidelines: https://isocpp.github.io/CppCoreGuidelines`,
          body: "Algorithm-based code states what you want; loop-based code states how. Prefer algorithms for readability and safety.",
        },
      ],
      tip: "Read the C++ Core Guidelines (free online). It's co-authored by the language creator and covers everything from naming to concurrency to performance.",
    },
  ],
}




// ─── data/javaCourse.js ───────────────────────────────────────────────────────
// Complete Java course — 25 chapters, progressive difficulty.

export const javaCourse = {
  language: "Java",
  accentColor: "#ef4444",
  accentLight: "#f87171",
  totalChapters: 25,
  chapters: [

    // ── BEGINNER (Ch 1–7) ─────────────────────────────────────────────────────

    {
      no: 1,
      name: "Introduction to Java",
      difficulty: "Beginner",
      duration: "10 min",
      xp: 100,
      summary: "Discover Java's history, the JVM, and why 'Write Once, Run Anywhere' made it the world's most-used enterprise language.",
      body: `Java was created by James Gosling at Sun Microsystems in 1995. It introduced the Java Virtual Machine (JVM) — Java code compiles to platform-independent bytecode that the JVM executes on any OS. This "Write Once, Run Anywhere" philosophy made Java dominate enterprise software. Java is strongly typed, garbage-collected, and object-oriented by design. It powers Android apps, backend APIs (Spring Boot), big data tools (Hadoop, Kafka), and billions of enterprise applications worldwide.`,
      uses: [
        "Enterprise backend: Spring Boot powers millions of production APIs.",
        "Android development (Java + Kotlin).",
        "Big Data: Hadoop MapReduce, Apache Kafka, Apache Spark are Java/JVM.",
        "Financial systems: banks rely on Java's stability and performance.",
        "Desktop apps with JavaFX.",
      ],
      keyFeatures: [
        "Platform independent: bytecode runs on any JVM.",
        "Strongly typed: all types declared explicitly at compile time.",
        "Automatic garbage collection — no manual memory management.",
        "Pure OOP: everything (except primitives) is an object.",
        "Rich standard library (JDK) covering I/O, networking, concurrency.",
      ],
      examples: [
        {
          title: "Hello World",
          code: `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
          body: "Every Java program needs a class. main() is the entry point. The class name must match the filename (HelloWorld.java).",
        },
        {
          title: "User input",
          code: `import java.util.Scanner;\n\npublic class Greeter {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}`,
          body: "Scanner reads from System.in. Always close the scanner to release the resource.",
        },
        {
          title: "Compile and run",
          code: `// 1. Save as HelloWorld.java\n// 2. Compile: javac HelloWorld.java\n//    Creates: HelloWorld.class (bytecode)\n// 3. Run:     java HelloWorld\n\n// Or with modern Java (single-file):\n// java HelloWorld.java`,
          body: "javac compiles to .class bytecode. java runs the bytecode on the JVM. The JVM translates to native machine code at runtime (JIT).",
        },
      ],
      tip: "The filename must exactly match the public class name, including case. HelloWorld.java must contain 'public class HelloWorld'.",
    },

    {
      no: 2,
      name: "Variables, Data Types & Type Casting",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 110,
      summary: "Learn Java's primitive and reference types, variable declarations, and safe type conversion.",
      body: `Java has two categories of types: primitives (int, double, boolean, char, byte, short, long, float) and reference types (String, arrays, objects). Primitives store values directly; references store addresses. Java is strongly typed — every variable must be declared with a type. var (Java 10+) enables local type inference. Type casting converts between compatible types: widening (automatic, safe) and narrowing (explicit, may lose data).`,
      uses: [
        "Choosing byte/short for memory-constrained arrays.",
        "long for timestamps (milliseconds since epoch).",
        "double for calculations; BigDecimal for financial precision.",
      ],
      keyFeatures: [
        "8 primitives: byte(1), short(2), int(4), long(8), float(4), double(8), boolean(1), char(2).",
        "String is immutable — every modification creates a new object.",
        "var (Java 10+): type inferred from right-hand side.",
        "Widening: int → long → float → double (automatic).",
        "Narrowing: (int) 3.14 → 3 (explicit cast, truncates).",
        "Wrapper classes: Integer, Double, Boolean — objects wrapping primitives.",
      ],
      examples: [
        {
          title: "Primitive types",
          code: `public class Types {\n    public static void main(String[] args) {\n        int age = 25;\n        long bigNum = 9_000_000_000L; // L suffix for long\n        double price = 99.99;\n        boolean active = true;\n        char grade = 'A';\n\n        // Java 10+ type inference\n        var name = "Alice"; // inferred as String\n\n        System.out.println(Integer.MAX_VALUE); // 2147483647\n        System.out.println(Double.MIN_VALUE);  // 5E-324\n    }\n}`,
          body: "Use _ in numeric literals for readability. Long literals need L suffix. var infers the type from the assignment.",
        },
        {
          title: "Type casting",
          code: `public class Casting {\n    public static void main(String[] args) {\n        // Widening (implicit)\n        int i = 42;\n        long l = i;       // auto\n        double d = i;     // auto\n\n        // Narrowing (explicit)\n        double pi = 3.14159;\n        int truncated = (int) pi; // 3 — decimal lost!\n\n        // String conversions\n        String s = String.valueOf(42);  // int → String\n        int n = Integer.parseInt("100"); // String → int\n        System.out.println(truncated + \", \" + n);\n    }\n}`,
          body: "Narrowing casts can lose data — always be explicit. Integer.parseInt() throws NumberFormatException on invalid strings.",
        },
      ],
      tip: "Use int for most integers, double for most decimals, and String for text. Reach for the others only when you have a specific reason.",
    },

    {
      no: 3,
      name: "Operators, Expressions & String Formatting",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 110,
      summary: "Master Java operators and produce formatted output with printf and String.format.",
      body: `Java operators include arithmetic (+, -, *, /, %), comparison (==, !=, <, >), logical (&&, ||, !), bitwise (&, |, ^, ~, <<, >>, >>>), and ternary (? :). For objects, == compares references; .equals() compares content. Java 15+ added text blocks for multi-line strings. String.format() and printf produce formatted output. The + operator concatenates Strings but can be slow in loops — use StringBuilder instead.`,
      uses: [
        "% for pagination, even/odd checks, circular arrays.",
        ">>> unsigned right shift for bit manipulation.",
        "String.format() for producing formatted reports and messages.",
      ],
      keyFeatures: [
        "== compares primitive values but reference identity for objects.",
        ".equals() compares object content — always use for Strings.",
        "String.format(\"%s is %d years old\", name, age).",
        "printf(\"%,.2f%n\", price) — formatted console output.",
        "Text block (Java 15+): \"\"\" multi-line string \"\"\".",
        "StringBuilder: efficient mutable string for loops.",
      ],
      examples: [
        {
          title: "String equality and format",
          code: `public class Operators {\n    public static void main(String[] args) {\n        String a = new String("hello");\n        String b = new String("hello");\n\n        System.out.println(a == b);      // false! (different objects)\n        System.out.println(a.equals(b)); // true  (same content)\n\n        double price = 1234567.89;\n        System.out.printf("Price: %,.2f%n", price); // Price: 1,234,567.89\n\n        String msg = String.format("%-10s | %5d", "Alice", 95);\n        System.out.println(msg); // "Alice      |    95"\n    }\n}`,
          body: "Always use .equals() for String comparison. Format specifiers: %s=string, %d=int, %f=float, %n=newline.",
        },
        {
          title: "Text blocks and StringBuilder",
          code: `public class Strings {\n    public static void main(String[] args) {\n        // Text block (Java 15+)\n        String json = \"\"\"\n                {\n                    "name": "Alice",\n                    "age": 28\n                }\n                \"\"\";\n        System.out.println(json);\n\n        // StringBuilder for efficient concatenation\n        StringBuilder sb = new StringBuilder();\n        for (int i = 1; i <= 5; i++) {\n            sb.append(i);\n            if (i < 5) sb.append(\", \");\n        }\n        System.out.println(sb); // 1, 2, 3, 4, 5\n    }\n}`,
          body: "Text blocks preserve indentation context. StringBuilder is O(n) total vs String + which is O(n²) in a loop.",
        },
      ],
      tip: "Never compare Strings with ==. Always use .equals() or .equalsIgnoreCase(). This is one of Java's most common beginner bugs.",
    },

    {
      no: 4,
      name: "Control Flow — if, switch, Loops",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 120,
      summary: "Direct program execution with conditionals and loops, including Java 14's modern switch expressions.",
      body: `Java provides if/else, switch, for, while, do-while, and the enhanced for-each loop. Java 14+ introduced switch expressions — a cleaner alternative that returns values and uses arrow syntax without fall-through. The for-each loop (for (Type item : collection)) is the idiomatic way to iterate over arrays and collections. break and continue work in all loops; labelled break exits nested loops.`,
      uses: [
        "Switch expressions for clean enum-based state machines.",
        "For-each for iterating over lists and arrays.",
        "Labelled break for exiting nested loops in parsing code.",
      ],
      keyFeatures: [
        "Traditional switch: needs break to prevent fall-through.",
        "Switch expression (Java 14+): arrow case, no fall-through, returns value.",
        "Enhanced for-each: for (String s : list) — read-only, no index.",
        "do-while: body runs at least once.",
        "Labelled break: outer: for(...) { break outer; }",
        "Java 21 pattern matching in switch: case Integer i when i > 0.",
      ],
      examples: [
        {
          title: "Switch expression (Java 14+)",
          code: `public class SwitchDemo {\n    public static void main(String[] args) {\n        int day = 3;\n\n        // Modern switch expression\n        String dayName = switch (day) {\n            case 1 -> "Monday";\n            case 2 -> "Tuesday";\n            case 3 -> "Wednesday"; // returns this\n            case 6, 7 -> "Weekend";\n            default -> "Weekday";\n        };\n        System.out.println(dayName); // Wednesday\n    }\n}`,
          body: "Arrow cases (->): no fall-through, returns a value directly. Multiple values per case with comma.",
        },
        {
          title: "Enhanced for-each",
          code: `import java.util.List;\n\npublic class ForEach {\n    public static void main(String[] args) {\n        int[] scores = {85, 92, 78, 96, 88};\n        int total = 0;\n        for (int score : scores) total += score;\n        System.out.println("Average: " + total / scores.length);\n\n        List<String> names = List.of("Alice", "Bob", "Carol");\n        for (String name : names) {\n            System.out.println("Hello, " + name);\n        }\n    }\n}`,
          body: "For-each is clean and safe. Use a classic for loop when you need the index.",
        },
        {
          title: "Pattern matching switch (Java 21)",
          code: `public class PatternSwitch {\n    static String describe(Object obj) {\n        return switch (obj) {\n            case Integer i when i > 0 -> "Positive int: " + i;\n            case Integer i            -> "Non-positive int: " + i;\n            case String s             -> "String of length " + s.length();\n            case null                 -> "null value\";\n            default                   -> \"Other: \" + obj;\n        };\n    }\n    public static void main(String[] args) {\n        System.out.println(describe(42));      // Positive int: 42\n        System.out.println(describe("Hello")); // String of length 5\n    }\n}`,
          body: "Pattern matching switch (Java 21) combines type checking, casting, and conditions in one clean expression.",
        },
      ],
      tip: "Use the new switch expression syntax (Java 14+) whenever possible — it's cleaner and eliminates fall-through bugs entirely.",
    },

    {
      no: 5,
      name: "Methods & Variable Scope",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 120,
      summary: "Define and call methods, understand parameter passing, and control variable visibility with scope.",
      body: `Java methods define reusable blocks of behaviour inside a class. Methods have a return type, name, and parameter list. Java passes everything by value — primitives copy the value; references copy the address (so the object is shared, not the reference). static methods belong to the class; instance methods belong to objects. Varargs (...) accepts a variable number of arguments. Method overloading allows the same name with different parameters.`,
      uses: [
        "Static utility methods: Math.max(), Integer.parseInt().",
        "Instance methods for object behaviour: account.deposit(100).",
        "Varargs for flexible API methods: printf(format, args...).",
      ],
      keyFeatures: [
        "void return type — method returns nothing.",
        "static: belongs to class, callable without creating an object.",
        "Pass by value: primitives are copied; references share the object.",
        "Method overloading: same name, different parameter types/count.",
        "Varargs: void f(int... nums) — nums is treated as int[].",
        "Recursion: method calls itself — needs a base case.",
      ],
      examples: [
        {
          title: "Pass by value vs reference",
          code: `public class Passing {\n    static void incrementPrimitive(int x) {\n        x++; // local copy — original unchanged\n    }\n\n    static void appendToList(java.util.List<String> list) {\n        list.add("new item"); // same object — DOES modify original\n    }\n\n    public static void main(String[] args) {\n        int n = 5;\n        incrementPrimitive(n);\n        System.out.println(n); // 5 — unchanged\n\n        var list = new java.util.ArrayList<String>();\n        appendToList(list);\n        System.out.println(list.size()); // 1 — modified!\n    }\n}`,
          body: "References are copied but still point to the same object. The object can be modified; the reference itself cannot be redirected.",
        },
        {
          title: "Varargs and overloading",
          code: `public class Methods {\n    // Varargs\n    static int sum(int... numbers) {\n        int total = 0;\n        for (int n : numbers) total += n;\n        return total;\n    }\n\n    // Overloaded methods\n    static String format(int n)     { return \"int: \" + n; }\n    static String format(double d)  { return \"double: \" + d; }\n    static String format(String s)  { return \"string: '\" + s + \"'\"; }\n\n    public static void main(String[] args) {\n        System.out.println(sum(1, 2, 3));       // 6\n        System.out.println(sum(10, 20, 30, 40)); // 100\n        System.out.println(format(42));          // int: 42\n        System.out.println(format(\"hi\"));        // string: 'hi'\n    }\n}`,
          body: "Varargs must be the last parameter. Overloaded methods are resolved at compile time based on argument types.",
        },
      ],
      tip: "Think of Java as 'pass by value of the reference'. The reference is copied, but it still points to the original object — modifications to the object are visible to the caller.",
    },

    {
      no: 6,
      name: "Arrays & the Collections Framework",
      difficulty: "Beginner",
      duration: "16 min",
      xp: 140,
      summary: "Store data in arrays and leverage Java's powerful Collections Framework for flexible data structures.",
      body: `Java arrays are fixed-size, zero-indexed, and typed. For dynamic collections, use the Collections Framework: ArrayList (dynamic array), LinkedList, HashSet (unique, unordered), TreeSet (sorted), HashMap (key-value, unordered), TreeMap (sorted), LinkedHashMap (insertion-ordered). Prefer interfaces (List, Set, Map) as variable types — programs to interfaces, not implementations. Java 9+ factory methods (List.of(), Map.of()) create immutable collections instantly.`,
      uses: [
        "ArrayList for any ordered, dynamic list.",
        "HashMap for lookup tables, caching, word counts.",
        "HashSet for uniqueness checks and deduplication.",
        "TreeMap for sorted key-value data.",
      ],
      keyFeatures: [
        "Arrays.sort(), Arrays.fill(), Arrays.copyOf() — array utilities.",
        "ArrayList<T>: add(), remove(), get(), size(), contains().",
        "HashMap<K,V>: put(), get(), containsKey(), getOrDefault().",
        "Collections.sort(), Collections.unmodifiableList() utilities.",
        "List.of(), Set.of(), Map.of() — immutable factory methods (Java 9+).",
        "Iterator and for-each work on all Collections.",
      ],
      examples: [
        {
          title: "ArrayList and HashMap",
          code: `import java.util.*;\n\npublic class Collections {\n    public static void main(String[] args) {\n        // ArrayList\n        List<String> names = new ArrayList<>(List.of("Alice", "Bob"));\n        names.add("Carol");\n        names.remove("Bob");\n        System.out.println(names); // [Alice, Carol]\n\n        // HashMap\n        Map<String, Integer> scores = new HashMap<>();\n        scores.put("Alice", 95);\n        scores.put("Bob", 87);\n        scores.merge("Alice", 5, Integer::sum); // Alice: 95 + 5 = 100\n        System.out.println(scores.getOrDefault("Carol", 0)); // 0\n        scores.forEach((k, v) -> System.out.println(k + ": " + v));\n    }\n}`,
          body: "merge() is perfect for accumulation. getOrDefault() avoids null checks. forEach with lambda for clean iteration.",
        },
        {
          title: "Set operations and sorting",
          code: `import java.util.*;\n\npublic class SetsAndSort {\n    public static void main(String[] args) {\n        // HashSet — unique values\n        Set<String> set = new HashSet<>(Arrays.asList(\"a\",\"b\",\"a\",\"c\"));\n        System.out.println(set); // [a, b, c] (order may vary)\n\n        // TreeSet — sorted unique\n        Set<Integer> sorted = new TreeSet<>(Set.of(5, 1, 3, 2, 4));\n        System.out.println(sorted); // [1, 2, 3, 4, 5]\n\n        // Sort list with custom comparator\n        List<String> words = new ArrayList<>(List.of(\"banana\",\"apple\",\"cherry\"));\n        words.sort(Comparator.comparingInt(String::length));\n        System.out.println(words); // [apple, banana, cherry]\n    }\n}`,
          body: "TreeSet sorts automatically. Comparator.comparingInt() creates a clean comparator from a key extractor.",
        },
      ],
      tip: "Declare collections using interfaces: List<String> list = new ArrayList<>() — this lets you swap implementations without changing the rest of your code.",
    },

    {
      no: 7,
      name: "Object-Oriented Programming — Classes & Objects",
      difficulty: "Beginner",
      duration: "16 min",
      xp: 150,
      summary: "Build the foundation of Java development: designing classes with fields, constructors, and methods.",
      body: `In Java, a class is a blueprint for objects. Fields store state; methods define behaviour. Constructors initialise objects. Access modifiers (public, private, protected, package-private) control visibility. Encapsulation hides implementation: keep fields private, expose behaviour through public methods. Java 16+ records provide compact, immutable data classes. Java 14+ introduced sealed classes for closed type hierarchies.`,
      uses: [
        "Domain modelling: User, Product, Order, Invoice.",
        "Records for simple data carriers (DTOs, response objects).",
        "Service classes encapsulating business logic.",
      ],
      keyFeatures: [
        "private fields + public getters/setters — classic encapsulation.",
        "this() — call another constructor from within a constructor.",
        "static fields: shared across all instances. static methods: class-level.",
        "record (Java 16+): auto-generates constructor, getters, equals, hashCode, toString.",
        "final field: must be set in constructor, never changed after.",
        "toString() override for human-readable output.",
      ],
      examples: [
        {
          title: "Encapsulated class",
          code: `public class BankAccount {\n    private String owner;\n    private double balance;\n\n    public BankAccount(String owner, double initialBalance) {\n        this.owner = owner;\n        this.balance = initialBalance;\n    }\n\n    public void deposit(double amount) {\n        if (amount <= 0) throw new IllegalArgumentException("Must be positive");\n        balance += amount;\n    }\n\n    public double getBalance() { return balance; } // getter only — no setter\n\n    @Override\n    public String toString() {\n        return String.format(\"%s: $%.2f\", owner, balance);\n    }\n}`,
          body: "Balance has no setter — it can only change via deposit/withdraw. This is encapsulation enforcing business rules.",
        },
        {
          title: "Records (Java 16+)",
          code: `// Compact immutable data class\npublic record Point(double x, double y) {\n    // Optional custom method\n    double distanceTo(Point other) {\n        return Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Point p1 = new Point(0, 0);\n        Point p2 = new Point(3, 4);\n        System.out.println(p2.x());                // 3.0\n        System.out.println(p1.distanceTo(p2));     // 5.0\n        System.out.println(p1);                    // Point[x=0.0, y=0.0]\n    }\n}`,
          body: "Records auto-generate all boilerplate: constructor, getters (x(), y()), equals(), hashCode(), toString().",
        },
      ],
      tip: "Start with records for simple data containers — they're concise and immutable. Upgrade to a full class only when you need mutable state or complex logic.",
    },

    // ── INTERMEDIATE (Ch 8–16) ────────────────────────────────────────────────

    {
      no: 8,
      name: "Inheritance, Interfaces & Abstract Classes",
      difficulty: "Intermediate",
      duration: "18 min",
      xp: 160,
      summary: "Build class hierarchies with inheritance and define contracts with interfaces.",
      body: `Java supports single-class inheritance (extends) but multiple-interface implementation (implements). Abstract classes define partial implementations; interfaces define pure contracts. Java 8+ interfaces can have default and static methods — interfaces are now nearly as powerful as abstract classes. The @Override annotation ensures you're actually overriding a method. sealed classes (Java 17+) restrict which classes can extend them.`,
      uses: [
        "Interface for contracts: Comparable, Serializable, Runnable.",
        "Abstract class for partial implementation: AbstractList.",
        "Inheritance for is-a relationships: Dog extends Animal.",
      ],
      keyFeatures: [
        "extends: single class inheritance.",
        "implements: multiple interfaces.",
        "abstract class: cannot be instantiated; may have abstract and concrete methods.",
        "interface default method: provides default implementation without breaking existing code.",
        "@Override: compiler verifies you're actually overriding.",
        "super.method() — call parent's version of an overridden method.",
        "sealed/permits (Java 17+): restrict subclass hierarchy.",
      ],
      examples: [
        {
          title: "Abstract class and interface",
          code: `interface Drawable {\n    void draw();\n    default String describe() { return \"A drawable shape\"; } // default\n}\n\nabstract class Shape implements Drawable {\n    abstract double area();\n    // draw() still abstract — subclass must implement\n}\n\nclass Circle extends Shape {\n    private double radius;\n    Circle(double r) { this.radius = r; }\n\n    @Override public double area() { return Math.PI * radius * radius; }\n    @Override public void draw() { System.out.println(\"Drawing circle r=\" + radius); }\n}\n\nclass Main {\n    public static void main(String[] args) {\n        Shape s = new Circle(5);\n        s.draw();                   // Drawing circle r=5.0\n        System.out.println(s.area()); // 78.54...\n        System.out.println(s.describe()); // A drawable shape\n    }\n}`,
          body: "Circle implements draw() (from Drawable) and area() (from Shape). It inherits describe() for free.",
        },
        {
          title: "Multiple interface implementation",
          code: `interface Flyable   { default String move() { return \"flying\"; } }\ninterface Swimmable { default String move() { return \"swimming\"; } }\n\nclass Duck implements Flyable, Swimmable {\n    // Must override because two interfaces have same default method\n    @Override\n    public String move() {\n        return Flyable.super.move() + \" and \" + Swimmable.super.move();\n    }\n}\n\n// Main\nDuck d = new Duck();\nSystem.out.println(d.move()); // flying and swimming`,
          body: "When two interfaces have the same default method, the class must override it. Use InterfaceName.super.method() to call a specific one.",
        },
      ],
      tip: "Prefer interfaces over abstract classes. Interfaces allow multiple implementation, are more flexible, and with default methods provide almost everything abstract classes do.",
    },

    {
      no: 9,
      name: "Generics",
      difficulty: "Intermediate",
      duration: "16 min",
      xp: 160,
      summary: "Write type-safe, reusable code with Java generics — the foundation of the Collections Framework.",
      body: `Generics allow classes, interfaces, and methods to operate on type parameters. This enables type-safe containers (List<String>) and reusable algorithms without casting. Wildcards (? extends T, ? super T) add flexibility. Bounded type parameters (T extends Comparable<T>) constrain acceptable types. Generics are erased at runtime (type erasure) — they're a compile-time feature only. Understanding generics is essential for using the Collections Framework effectively.`,
      uses: [
        "Generic utility classes: Pair<K,V>, Result<T,E>.",
        "Generic methods: sort any Comparable list.",
        "Wildcard parameters for flexible API methods.",
      ],
      keyFeatures: [
        "class Box<T> — T is the type parameter.",
        "<T extends Comparable<T>> — bounded type parameter.",
        "? (wildcard): unknown type. ? extends T: T or subtype. ? super T: T or supertype.",
        "PECS rule: Producer Extends, Consumer Super.",
        "Type erasure: generics are compile-time only; List<String> and List<Integer> are both List at runtime.",
        "Generic methods: static <T> T identity(T t).",
      ],
      examples: [
        {
          title: "Generic class and method",
          code: `public class Pair<A, B> {\n    private A first;\n    private B second;\n\n    public Pair(A first, B second) {\n        this.first = first;\n        this.second = second;\n    }\n    public A getFirst()  { return first; }\n    public B getSecond() { return second; }\n\n    @Override\n    public String toString() { return \"(\" + first + \", \" + second + \")\"; }\n}\n\n// Generic method\nstatic <T extends Comparable<T>> T max(T a, T b) {\n    return a.compareTo(b) >= 0 ? a : b;\n}\n\n// Usage:\nPair<String, Integer> p = new Pair<>(\"Alice\", 95);\nSystem.out.println(p);               // (Alice, 95)\nSystem.out.println(max(\"apple\", \"banana\")); // banana`,
          body: "T extends Comparable<T> ensures T can be compared. Works with String, Integer, Double, etc.",
        },
        {
          title: "Wildcards",
          code: `import java.util.*;\n\npublic class Wildcards {\n    // Reads from list — ? extends Number (producer extends)\n    static double sum(List<? extends Number> list) {\n        return list.stream().mapToDouble(Number::doubleValue).sum();\n    }\n\n    // Adds to list — ? super Integer (consumer super)\n    static void addNumbers(List<? super Integer> list) {\n        list.add(1); list.add(2); list.add(3);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(sum(List.of(1, 2, 3)));      // 6.0\n        System.out.println(sum(List.of(1.1, 2.2)));    // 3.3\n\n        List<Number> numbers = new ArrayList<>();\n        addNumbers(numbers);\n        System.out.println(numbers); // [1, 2, 3]\n    }\n}`,
          body: "PECS: use extends when reading (sum), use super when writing (addNumbers). This maximises API flexibility.",
        },
      ],
      tip: "When in doubt about wildcards, remember PECS: Producer Extends, Consumer Super. If you read from a generic collection, use extends. If you write to it, use super.",
    },

    {
      no: 10,
      name: "Exceptions & Error Handling",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 150,
      summary: "Handle errors gracefully using Java's exception hierarchy and try-with-resources.",
      body: `Java uses a checked/unchecked exception model. Checked exceptions (Exception subclasses) must be declared or handled. Unchecked exceptions (RuntimeException subclasses) don't need declaration. try-with-resources (Java 7+) automatically closes AutoCloseable resources. Multi-catch (Java 7+) handles multiple exceptions in one block. Custom exceptions carry additional context. Best practice: catch specific exceptions, avoid swallowing exceptions silently.`,
      uses: [
        "Checked: IOException for file operations (must handle).",
        "Unchecked: NullPointerException, ArrayIndexOutOfBoundsException.",
        "Custom: UserNotFoundException with HTTP status code.",
        "try-with-resources for file, database, network connections.",
      ],
      keyFeatures: [
        "try/catch/finally — finally always runs for cleanup.",
        "try-with-resources: resource auto-closed via AutoCloseable.",
        "Multi-catch: catch (IOException | SQLException e).",
        "throws declaration: void f() throws IOException.",
        "throw new RuntimeException(\"msg\", cause) — wrap with cause.",
        "Custom exceptions: extend Exception (checked) or RuntimeException (unchecked).",
      ],
      examples: [
        {
          title: "try-with-resources",
          code: `import java.io.*;\n\npublic class FileRead {\n    public static void main(String[] args) {\n        try (var reader = new BufferedReader(new FileReader("data.txt"))) {\n            String line;\n            while ((line = reader.readLine()) != null) {\n                System.out.println(line);\n            }\n        } catch (FileNotFoundException e) {\n            System.err.println(\"File not found: \" + e.getMessage());\n        } catch (IOException e) {\n            System.err.println(\"Read error: \" + e.getMessage());\n        }\n        // reader automatically closed — even if exception thrown!\n    }\n}`,
          body: "try-with-resources closes the reader automatically when the block exits, regardless of exception. No finally needed.",
        },
        {
          title: "Custom exception",
          code: `public class UserNotFoundException extends RuntimeException {\n    private final String userId;\n\n    public UserNotFoundException(String userId) {\n        super(\"User not found: \" + userId);\n        this.userId = userId;\n    }\n    public String getUserId() { return userId; }\n}\n\n// Usage:\npublic User findUser(String id) {\n    return users.stream()\n        .filter(u -> u.getId().equals(id))\n        .findFirst()\n        .orElseThrow(() -> new UserNotFoundException(id));\n}`,
          body: "RuntimeException subclass — no need to declare throws. Carries userId for richer error handling by callers.",
        },
      ],
      tip: "Never catch Exception or Throwable broadly and swallow it silently — it hides bugs. Always log or rethrow. At minimum, log with e.printStackTrace().",
    },

    {
      no: 11,
      name: "Functional Programming — Lambdas & Streams",
      difficulty: "Intermediate",
      duration: "20 min",
      xp: 190,
      summary: "Transform data elegantly with Java 8's lambda expressions and Stream API.",
      body: `Java 8 introduced lambdas (anonymous functions) and the Stream API — the biggest Java update since Java 5. Streams provide a declarative, pipeline-based way to process collections: filter, map, reduce, collect, sort. They can be sequential or parallel (parallelStream()). Functional interfaces (Predicate, Function, Consumer, Supplier) define single-method contracts for lambdas. Method references (::) are clean shortcuts for simple lambdas.`,
      uses: [
        "Filter, transform, and aggregate lists in one readable expression.",
        "Replacing verbose for loops with clean pipeline code.",
        "Parallel processing of large datasets with parallelStream().",
        "Optional<T> for null-safe return values.",
      ],
      keyFeatures: [
        "Lambda: (params) -> body. Type inferred from context.",
        "Method reference: ClassName::method, instance::method, ClassName::new.",
        "Stream operations: filter(), map(), flatMap(), sorted(), distinct().",
        "Terminal operations: collect(), count(), sum(), findFirst(), anyMatch().",
        "Collectors.toList(), groupingBy(), joining(), partitioningBy().",
        "Optional<T>: map(), filter(), orElse(), orElseThrow(), ifPresent().",
      ],
      examples: [
        {
          title: "Stream pipeline",
          code: `import java.util.*;\nimport java.util.stream.*;\n\npublic class Streams {\n    record Student(String name, int grade, double gpa) {}\n\n    public static void main(String[] args) {\n        var students = List.of(\n            new Student(\"Alice\", 12, 3.9),\n            new Student(\"Bob\",   11, 3.2),\n            new Student(\"Carol\", 12, 3.7),\n            new Student(\"Dave\",  10, 2.8)\n        );\n\n        // Filter grade 12, sort by GPA desc, get names\n        List<String> topSeniors = students.stream()\n            .filter(s -> s.grade() == 12)\n            .sorted(Comparator.comparingDouble(Student::gpa).reversed())\n            .map(Student::name)\n            .collect(Collectors.toList());\n\n        System.out.println(topSeniors); // [Alice, Carol]\n    }\n}`,
          body: "The pipeline reads like English: filter seniors → sort by GPA descending → extract names → collect to list.",
        },
        {
          title: "groupingBy and statistics",
          code: `import java.util.*;\nimport java.util.stream.*;\n\nvar words = List.of(\"apple\",\"ant\",\"banana\",\"bear\",\"cherry\",\"cat\");\n\n// Group by first letter\nMap<Character, List<String>> byLetter = words.stream()\n    .collect(Collectors.groupingBy(w -> w.charAt(0)));\nSystem.out.println(byLetter);\n// {a=[apple, ant], b=[banana, bear], c=[cherry, cat]}\n\n// Statistics\nvar stats = words.stream()\n    .mapToInt(String::length)\n    .summaryStatistics();\nSystem.out.println(\"Max length: \" + stats.getMax()); // 6`,
          body: "groupingBy is like SQL GROUP BY. summaryStatistics() gives count, sum, min, max, average in one pass.",
        },
        {
          title: "Optional",
          code: `import java.util.*;\n\npublic class OptionalDemo {\n    static Optional<String> findByEmail(List<String> emails, String domain) {\n        return emails.stream()\n            .filter(e -> e.endsWith(\"@\" + domain))\n            .findFirst();\n    }\n\n    public static void main(String[] args) {\n        var emails = List.of(\"alice@gmail.com\", \"bob@work.com\");\n\n        String result = findByEmail(emails, \"gmail.com\")\n            .map(String::toUpperCase)\n            .orElse(\"Not found\");\n\n        System.out.println(result); // ALICE@GMAIL.COM\n    }\n}`,
          body: "Optional eliminates NullPointerException by forcing callers to handle the absent case explicitly.",
        },
      ],
      tip: "Streams are lazy — intermediate operations (filter, map) don't run until a terminal operation is called. This enables efficient short-circuiting with findFirst(), anyMatch(), etc.",
    },

    {
      no: 12,
      name: "Concurrency — Threads & ExecutorService",
      difficulty: "Intermediate",
      duration: "18 min",
      xp: 180,
      summary: "Run code in parallel safely using Java's threading model and ExecutorService.",
      body: `Java has robust concurrency support built into the language and runtime. Threads can be created by implementing Runnable or extending Thread. ExecutorService manages thread pools — reusing threads is far more efficient than creating new ones. synchronized blocks and methods prevent race conditions. volatile ensures visibility across threads. java.util.concurrent provides atomic types, locks, BlockingQueue, CountDownLatch, and more.`,
      uses: [
        "Web servers: one thread per request (or async).",
        "Background tasks: loading data while UI responds.",
        "Parallel computation: splitting arrays across CPU cores.",
        "Producer-consumer: BlockingQueue between threads.",
      ],
      keyFeatures: [
        "Runnable/Callable: functional interfaces for thread tasks.",
        "ExecutorService: thread pool. submit() + Future<T>.",
        "synchronized: mutual exclusion for blocks and methods.",
        "volatile: guarantees visibility (not atomicity).",
        "AtomicInteger, AtomicReference: lock-free thread-safe ops.",
        "CompletableFuture: async programming with chaining.",
      ],
      examples: [
        {
          title: "ExecutorService and Callable",
          code: `import java.util.concurrent.*;\nimport java.util.*;\n\npublic class Concurrent {\n    public static void main(String[] args) throws Exception {\n        var executor = Executors.newFixedThreadPool(4);\n\n        // Submit tasks, get futures\n        List<Future<Integer>> futures = new ArrayList<>();\n        for (int i = 0; i < 8; i++) {\n            final int taskId = i;\n            futures.add(executor.submit(() -> {\n                Thread.sleep(100);\n                return taskId * taskId;\n            }));\n        }\n\n        for (Future<Integer> f : futures)\n            System.out.print(f.get() + \" \"); // 0 1 4 9 16 25 36 49\n\n        executor.shutdown();\n    }\n}`,
          body: "Thread pool reuses 4 threads to run 8 tasks. f.get() blocks until the result is available.",
        },
        {
          title: "CompletableFuture",
          code: `import java.util.concurrent.CompletableFuture;\n\npublic class AsyncDemo {\n    public static void main(String[] args) throws Exception {\n        CompletableFuture<String> future = CompletableFuture\n            .supplyAsync(() -> fetchUser(1))      // async\n            .thenApply(user -> user.toUpperCase()) // transform\n            .thenApply(u -> \"Hello, \" + u)         // transform\n            .exceptionally(e -> \"Error: \" + e.getMessage()); // error\n\n        System.out.println(future.get()); // Hello, ALICE\n    }\n    static String fetchUser(int id) { return \"Alice\"; }\n}`,
          body: "CompletableFuture chains async operations without blocking. exceptionally handles errors at any stage.",
        },
      ],
      tip: "Never call Thread.sleep() in production concurrent code to synchronise. Use proper synchronisation primitives: CountDownLatch, CyclicBarrier, or CompletableFuture.",
    },

    {
      no: 13,
      name: "I/O — Files, Paths & NIO.2",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 160,
      summary: "Read and write files efficiently using Java's modern NIO.2 API introduced in Java 7.",
      body: `Java's NIO.2 (java.nio.file) replaced the old File class. Path and Files provide a clean, fluent API. Files.readString() / Files.writeString() are the simplest options for text. Files.lines() returns a lazy Stream for large files. Files.walk() traverses directory trees. WatchService monitors the file system for changes. Serialisation allows converting objects to byte streams for storage or network transmission.`,
      uses: [
        "Reading config files, processing CSV/JSON from disk.",
        "Batch processing: streaming large log files line by line.",
        "File system monitoring for hot-reload features.",
        "Saving user settings via serialisation.",
      ],
      keyFeatures: [
        "Path.of(\"dir/file.txt\") — create a Path.",
        "Files.readString(path) / Files.writeString(path, content).",
        "Files.lines(path) — lazy Stream<String> over lines.",
        "Files.walk(dir) — Stream<Path> of all files recursively.",
        "Files.createDirectories(), Files.copy(), Files.move(), Files.delete().",
        "StandardOpenOption: APPEND, CREATE, TRUNCATE_EXISTING.",
      ],
      examples: [
        {
          title: "Read and write files",
          code: `import java.nio.file.*;\nimport java.io.IOException;\n\npublic class FileIO {\n    public static void main(String[] args) throws IOException {\n        Path file = Path.of(\"output.txt\");\n\n        // Write\n        Files.writeString(file, \"Hello, NIO.2!\\nLine 2\\n\");\n\n        // Read all at once\n        String content = Files.readString(file);\n        System.out.println(content);\n\n        // Read line by line (lazy Stream)\n        Files.lines(file).forEach(System.out::println);\n\n        // Append\n        Files.writeString(file, \"Line 3\\n\", StandardOpenOption.APPEND);\n    }\n}`,
          body: "Files.writeString() is the simplest way to write text. Files.lines() is memory-efficient for large files — it's a lazy stream.",
        },
        {
          title: "Walking directories",
          code: `import java.nio.file.*;\nimport java.io.IOException;\n\npublic class DirWalk {\n    public static void main(String[] args) throws IOException {\n        Path src = Path.of(\"src\");\n\n        // Find all .java files\n        try (var stream = Files.walk(src)) {\n            stream\n                .filter(p -> p.toString().endsWith(\".java\"))\n                .forEach(System.out::println);\n        }\n\n        // Count total size\n        long totalBytes = Files.walk(src)\n            .filter(Files::isRegularFile)\n            .mapToLong(p -> {\n                try { return Files.size(p); } catch (IOException e) { return 0; }\n            }).sum();\n        System.out.println(\"Total: \" + totalBytes + \" bytes\");\n    }\n}`,
          body: "Files.walk() returns a Stream<Path>. Use try-with-resources to ensure the stream is closed. Filter and process like any stream.",
        },
      ],
      tip: "Use Files.lines() instead of Files.readAllLines() for large files — lines() is lazy and doesn't load everything into memory at once.",
    },

    {
      no: 14,
      name: "Design Patterns in Java",
      difficulty: "Intermediate",
      duration: "16 min",
      xp: 170,
      summary: "Apply proven design patterns to write flexible, maintainable, enterprise-quality Java code.",
      body: `Design patterns are reusable solutions to recurring design problems. Java's OOP nature makes patterns like Builder, Factory, Observer, Strategy, Singleton, and Decorator natural fits. Many are built into the JDK itself: Iterator, Decorator (IO streams), Strategy (Comparator), Observer (EventListeners). Understanding patterns is essential for working with frameworks like Spring, which uses Factory, Proxy, Template Method, and Observer extensively.`,
      uses: [
        "Builder for complex object construction (StringBuilder, HTTP clients).",
        "Factory for creating objects without specifying exact type.",
        "Observer for event-driven UI and game systems.",
        "Strategy for interchangeable algorithms.",
      ],
      keyFeatures: [
        "Builder: fluent API for constructing complex objects step by step.",
        "Singleton: one instance via static factory — often replaced by DI containers.",
        "Factory Method: subclasses decide which class to instantiate.",
        "Observer: subject notifies registered listeners of state changes.",
        "Strategy: encapsulates interchangeable algorithms behind an interface.",
        "Decorator: wraps object to add behaviour without subclassing.",
      ],
      examples: [
        {
          title: "Builder pattern",
          code: `public class HttpRequest {\n    private final String url;\n    private final String method;\n    private final int timeout;\n    private final Map<String, String> headers;\n\n    private HttpRequest(Builder b) {\n        this.url = b.url; this.method = b.method;\n        this.timeout = b.timeout; this.headers = b.headers;\n    }\n\n    public static class Builder {\n        private final String url;\n        private String method = \"GET\";\n        private int timeout = 30;\n        private Map<String, String> headers = new HashMap<>();\n\n        public Builder(String url) { this.url = url; }\n        public Builder method(String m) { this.method = m; return this; }\n        public Builder timeout(int t) { this.timeout = t; return this; }\n        public Builder header(String k, String v) { headers.put(k,v); return this; }\n        public HttpRequest build() { return new HttpRequest(this); }\n    }\n}\n\n// Usage:\nvar req = new HttpRequest.Builder(\"https://api.example.com/users\")\n    .method(\"POST\")\n    .timeout(60)\n    .header(\"Authorization\", \"Bearer token123\")\n    .build();`,
          body: "Builder prevents telescoping constructors (many parameters). Each method returns 'this' for fluent chaining.",
        },
        {
          title: "Strategy pattern",
          code: `import java.util.*;\n\n@FunctionalInterface\ninterface SortStrategy {\n    void sort(int[] arr);\n}\n\nclass Sorter {\n    private SortStrategy strategy;\n    Sorter(SortStrategy s) { this.strategy = s; }\n    void setStrategy(SortStrategy s) { this.strategy = s; }\n    void sort(int[] arr) { strategy.sort(arr); }\n}\n\n// Usage — lambda IS the strategy:\nSorter sorter = new Sorter(arr -> Arrays.sort(arr));\nint[] data = {5, 2, 8, 1};\nsorter.sort(data);\nSystem.out.println(Arrays.toString(data)); // [1, 2, 5, 8]\n\n// Swap strategy at runtime:\nsorter.setStrategy(arr -> { /* reverse sort */ });`,
          body: "With Java 8+, Strategy is often just a functional interface implemented by a lambda — no concrete class needed.",
        },
      ],
      tip: "In modern Java with lambdas and records, many patterns are much simpler than in classic OOP. Strategy becomes a functional interface; Builder is often replaced by a record with factory methods.",
    },

    {
      no: 15,
      name: "Annotations & Reflection",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 170,
      summary: "Add metadata to code with annotations and inspect/modify it at runtime with reflection.",
      body: `Annotations are metadata tags attached to code elements. Built-in annotations: @Override, @Deprecated, @SuppressWarnings, @FunctionalInterface. Custom annotations define metadata read by frameworks. Reflection allows inspecting and invoking class members at runtime — the foundation of Spring, JUnit, Jackson, and Hibernate. Reflection is powerful but slow — use it sparingly. Modern Java records and sealed classes reduce the need for reflection-heavy patterns.`,
      uses: [
        "Framework development: Spring uses annotations for DI, mapping.",
        "Testing: JUnit uses @Test, @BeforeEach, @ParameterizedTest.",
        "Serialisation: Jackson uses @JsonProperty, @JsonIgnore.",
        "Validation: @NotNull, @Size from Jakarta Bean Validation.",
      ],
      keyFeatures: [
        "@interface: defines a custom annotation.",
        "@Retention(RUNTIME): annotation available via reflection at runtime.",
        "@Target(METHOD): restricts where annotation can be applied.",
        "Class.forName(), getDeclaredMethods(), invoke() — reflection API.",
        "getDeclaredAnnotations() — read annotations at runtime.",
        "Proxy class: create dynamic proxy implementations at runtime.",
      ],
      examples: [
        {
          title: "Custom annotation",
          code: `import java.lang.annotation.*;\n\n@Retention(RetentionPolicy.RUNTIME)\n@Target(ElementType.METHOD)\npublic @interface Timed {\n    String description() default \"\";\n}\n\npublic class Service {\n    @Timed(description = \"User lookup\")\n    public String findUser(String id) {\n        return \"User_\" + id;\n    }\n}\n\n// Process at runtime:\nfor (var method : Service.class.getDeclaredMethods()) {\n    var ann = method.getAnnotation(Timed.class);\n    if (ann != null) {\n        System.out.println(method.getName() + \": \" + ann.description());\n        // findUser: User lookup\n    }\n}`,
          body: "@Retention(RUNTIME) makes the annotation available via reflection. @Target restricts to methods only.",
        },
        {
          title: "Reflection — dynamic invocation",
          code: `import java.lang.reflect.*;\n\npublic class ReflectionDemo {\n    public static void main(String[] args) throws Exception {\n        Class<?> clazz = Class.forName(\"java.util.ArrayList\");\n        Object list = clazz.getDeclaredConstructor().newInstance();\n\n        Method add = clazz.getMethod(\"add\", Object.class);\n        add.invoke(list, \"Hello\");\n        add.invoke(list, \"World\");\n\n        Method size = clazz.getMethod(\"size\");\n        System.out.println(size.invoke(list)); // 2\n\n        // Inspect fields of any class\n        for (Field f : String.class.getDeclaredFields())\n            System.out.println(f.getName() + \": \" + f.getType());\n    }\n}`,
          body: "Reflection creates instances and calls methods by name. This is how Spring creates beans and injects dependencies.",
        },
      ],
      tip: "Reflection bypasses compile-time safety and is 10-100x slower than direct calls. Use it only in framework code that genuinely needs it.",
    },

    // ── ADVANCED (Ch 16–25) ───────────────────────────────────────────────────

    {
      no: 16,
      name: "Java Modules (JPMS)",
      difficulty: "Advanced",
      duration: "14 min",
      xp: 175,
      summary: "Organise large applications with Java 9's module system for stronger encapsulation.",
      body: `The Java Platform Module System (JPMS), introduced in Java 9, adds a higher-level component system above packages. A module declares what it requires and what it exports, providing true encapsulation at package level. The JDK itself is modularised (java.base, java.sql, java.xml, etc.). Modules enable custom JRE images with jlink, faster startup, and enforced API boundaries. Critical for large enterprise and library development.`,
      uses: [
        "Enforcing internal package privacy in large codebases.",
        "Creating minimal custom JRE images for Docker containers.",
        "Publishing libraries with well-defined public APIs.",
      ],
      keyFeatures: [
        "module-info.java: module declaration file.",
        "requires: declares dependencies on other modules.",
        "exports: makes a package accessible to other modules.",
        "opens: allows reflection access to a package.",
        "uses/provides: service loader mechanism.",
        "jlink: assemble a minimal custom JRE.",
      ],
      examples: [
        {
          title: "module-info.java",
          code: `// src/com.myapp/module-info.java\nmodule com.myapp {\n    requires java.sql;          // needs SQL module\n    requires java.logging;       // needs logging\n\n    exports com.myapp.api;       // public API package\n    // com.myapp.internal is NOT exported — hidden!\n\n    opens com.myapp.model to java.xml.bind; // reflection for JAXB\n}\n\n// Another module\nmodule com.myapp.tests {\n    requires com.myapp;           // depends on main module\n    requires org.junit.jupiter.api;\n    opens com.myapp.tests;        // JUnit needs reflection access\n}`,
          body: "Unexported packages are invisible to other modules — true encapsulation, not just convention.",
        },
      ],
      tip: "For most applications, packages and access modifiers are sufficient. Use the module system for published libraries and microservices where API surface control matters.",
    },

    {
      no: 17,
      name: "Spring Boot Fundamentals",
      difficulty: "Advanced",
      duration: "20 min",
      xp: 200,
      summary: "Build production-ready REST APIs with Spring Boot — Java's dominant web framework.",
      body: `Spring Boot is an opinionated framework that auto-configures a Spring application. It embeds Tomcat, configures beans automatically, and provides starters for every common concern. Core concepts: IoC Container (beans managed by Spring), Dependency Injection (Spring injects dependencies), @RestController for HTTP endpoints, @Service for business logic, @Repository for data access. Spring Data JPA handles database persistence with minimal boilerplate.`,
      uses: [
        "REST APIs for mobile apps and SPAs.",
        "Microservices with Spring Cloud.",
        "Batch processing with Spring Batch.",
        "Event-driven services with Spring for Kafka/RabbitMQ.",
      ],
      keyFeatures: [
        "@SpringBootApplication: main class with auto-configuration.",
        "@RestController + @GetMapping: define HTTP endpoints.",
        "@Service, @Repository, @Component: Spring-managed beans.",
        "@Autowired or constructor injection: automatic dependency injection.",
        "application.properties: externalised configuration.",
        "Spring Data JPA: @Entity, @Repository, CrudRepository.",
      ],
      examples: [
        {
          title: "Simple REST controller",
          code: `import org.springframework.web.bind.annotation.*;\nimport java.util.*;\n\n@RestController\n@RequestMapping(\"/api/users\")\npublic class UserController {\n    private final UserService service;\n\n    // Constructor injection (preferred over @Autowired)\n    public UserController(UserService service) {\n        this.service = service;\n    }\n\n    @GetMapping\n    public List<User> getAll() { return service.findAll(); }\n\n    @GetMapping(\"/{id}\")\n    public User getById(@PathVariable Long id) {\n        return service.findById(id);\n    }\n\n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    public User create(@RequestBody @Valid CreateUserRequest req) {\n        return service.create(req);\n    }\n}`,
          body: "@RequestMapping sets the base URL. @PathVariable extracts URL parts. @RequestBody parses JSON into a Java object.",
        },
        {
          title: "Spring Data JPA repository",
          code: `import jakarta.persistence.*;\nimport org.springframework.data.jpa.repository.*;\nimport java.util.List;\n\n@Entity\n@Table(name = \"users\")\npublic class User {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String email;\n    // getters/setters or use Lombok @Data\n}\n\npublic interface UserRepository extends JpaRepository<User, Long> {\n    // Spring Data generates the query from the method name!\n    List<User> findByNameContaining(String keyword);\n    Optional<User> findByEmail(String email);\n    long countByName(String name);\n}`,
          body: "Spring Data generates SQL from method names. findByEmail generates 'SELECT * FROM users WHERE email = ?'.",
        },
      ],
      tip: "Use constructor injection over @Autowired field injection — it makes dependencies explicit, immutable, and testable without Spring.",
    },

    {
      no: 18,
      name: "Testing with JUnit 5 & Mockito",
      difficulty: "Advanced",
      duration: "16 min",
      xp: 180,
      summary: "Write reliable tests using JUnit 5 and mock dependencies with Mockito.",
      body: `Testing is not optional in professional Java development. JUnit 5 (Jupiter) is the standard testing framework with annotations: @Test, @BeforeEach, @AfterEach, @ParameterizedTest, @Nested. Assertions with assertThat (AssertJ) are more readable than JUnit's built-in assertions. Mockito creates test doubles for dependencies — mock objects that verify interactions. TDD (Test-Driven Development) and the Arrange-Act-Assert pattern keep tests clean.`,
      uses: [
        "Unit tests for individual classes in isolation.",
        "Integration tests for Spring Boot endpoints.",
        "Parameterised tests for multiple input scenarios.",
        "Mocking external services (HTTP clients, databases) in unit tests.",
      ],
      keyFeatures: [
        "@Test: marks a test method.",
        "@BeforeEach / @AfterEach: setup/teardown per test.",
        "@ParameterizedTest + @ValueSource / @CsvSource: data-driven tests.",
        "Mockito.mock(Class): creates a mock. when().thenReturn(): stub.",
        "verify(): asserts a method was called with specific arguments.",
        "AssertJ: fluent assertions — assertThat(result).isEqualTo(expected).",
      ],
      examples: [
        {
          title: "JUnit 5 and Mockito",
          code: `import org.junit.jupiter.api.*;\nimport org.mockito.*;\nimport static org.assertj.core.api.Assertions.*;\nimport static org.mockito.Mockito.*;\n\nclass UserServiceTest {\n    @Mock UserRepository repo;\n    @InjectMocks UserService service;\n\n    @BeforeEach\n    void setup() { MockitoAnnotations.openMocks(this); }\n\n    @Test\n    void findById_returnsUser_whenExists() {\n        // Arrange\n        var user = new User(1L, \"Alice\", \"alice@example.com\");\n        when(repo.findById(1L)).thenReturn(Optional.of(user));\n\n        // Act\n        var result = service.findById(1L);\n\n        // Assert\n        assertThat(result.getName()).isEqualTo(\"Alice\");\n        verify(repo, times(1)).findById(1L);\n    }\n}`,
          body: "@Mock creates the mock. @InjectMocks creates the service and injects the mock. verify() confirms the interaction.",
        },
        {
          title: "Parameterised test",
          code: `import org.junit.jupiter.params.*;\nimport org.junit.jupiter.params.provider.*;\nimport static org.assertj.core.api.Assertions.*;\n\nclass CalculatorTest {\n    Calculator calc = new Calculator();\n\n    @ParameterizedTest\n    @CsvSource({\n        \"2, 3, 5\",\n        \"0, 0, 0\",\n        \"-1, 1, 0\",\n        \"100, -50, 50\"\n    })\n    void add_returnsCorrectSum(int a, int b, int expected) {\n        assertThat(calc.add(a, b)).isEqualTo(expected);\n    }\n}`,
          body: "@CsvSource provides multiple input/output pairs. One test method covers all scenarios — no repetition.",
        },
      ],
      tip: "Test one thing per test method. Name tests descriptively: methodName_scenario_expectedResult. Tests are documentation — readable tests are invaluable.",
    },

    {
      no: 19,
      name: "Database Access with JDBC & JPA",
      difficulty: "Advanced",
      duration: "16 min",
      xp: 185,
      summary: "Connect Java applications to relational databases using JDBC and JPA/Hibernate.",
      body: `JDBC (Java Database Connectivity) is the low-level API for executing SQL. JPA (Jakarta Persistence API) is the high-level ORM standard; Hibernate is its most popular implementation. JPA maps Java objects to database tables using annotations. JPQL (JPA Query Language) is like SQL but uses entity class names. Spring Data JPA further reduces boilerplate by generating queries from method names. Connection pooling (HikariCP) is essential for production performance.`,
      uses: [
        "JDBC for fine-grained SQL control and stored procedures.",
        "JPA for CRUD-heavy applications with complex entity relationships.",
        "Spring Data JPA for rapid development.",
        "Flyway/Liquibase for database schema migration.",
      ],
      keyFeatures: [
        "JDBC: Connection, PreparedStatement, ResultSet.",
        "@Entity, @Table, @Column, @Id, @GeneratedValue.",
        "@OneToMany, @ManyToOne, @ManyToMany — relationship mapping.",
        "EntityManager: persist(), find(), merge(), remove().",
        "JPQL: SELECT u FROM User u WHERE u.age > :age.",
        "Lazy vs Eager loading: FetchType.LAZY / EAGER.",
      ],
      examples: [
        {
          title: "JPA entity relationships",
          code: `@Entity\npublic class Author {\n    @Id @GeneratedValue\n    private Long id;\n    private String name;\n\n    @OneToMany(mappedBy = \"author\", cascade = CascadeType.ALL,\n               fetch = FetchType.LAZY)\n    private List<Book> books = new ArrayList<>();\n}\n\n@Entity\npublic class Book {\n    @Id @GeneratedValue\n    private Long id;\n    private String title;\n\n    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"author_id\")\n    private Author author;\n}`,
          body: "cascade = ALL means operations on Author propagate to Books. LAZY loading fetches books only when accessed.",
        },
        {
          title: "JPQL query",
          code: `// In a Spring Data JPA repository\npublic interface BookRepository extends JpaRepository<Book, Long> {\n\n    // Method name query\n    List<Book> findByTitleContainingIgnoreCase(String keyword);\n\n    // JPQL query\n    @Query(\"SELECT b FROM Book b WHERE b.author.name = :authorName ORDER BY b.title\")\n    List<Book> findByAuthorName(@Param(\"authorName\") String name);\n\n    // Native SQL when needed\n    @Query(value = \"SELECT * FROM books WHERE published_year > ?\", nativeQuery = true)\n    List<Book> findPublishedAfter(int year);\n}`,
          body: "Spring Data generates SQL from method names for simple queries. Use @Query for complex queries. nativeQuery = true runs raw SQL.",
        },
      ],
      tip: "Use LAZY loading by default and only switch to EAGER when you always need the related data. N+1 query problems are the most common JPA performance issue.",
    },

    {
      no: 20,
      name: "Java Records, Sealed Classes & Pattern Matching",
      difficulty: "Advanced",
      duration: "14 min",
      xp: 175,
      summary: "Use Java 16-21's modern language features to write cleaner, safer, and more expressive code.",
      body: `Java has been modernising rapidly since Java 9. Records (Java 16) are compact immutable data carriers. Sealed classes (Java 17) restrict the type hierarchy to a known set of implementations — perfect for algebraic data types. Pattern matching for instanceof (Java 16) eliminates verbose casting. Text blocks (Java 15) simplify multiline strings. These features together enable a more functional, type-safe style of Java.`,
      uses: [
        "Records for DTOs, response objects, value objects.",
        "Sealed classes for result types (Success | Error), AST nodes.",
        "Pattern matching for clean type-based dispatch.",
      ],
      keyFeatures: [
        "record: compact immutable class with auto-generated boilerplate.",
        "sealed: restricts which classes can extend/implement.",
        "permits: explicitly lists allowed subclasses.",
        "Pattern matching instanceof: if (obj instanceof String s) use s directly.",
        "Deconstruction patterns (Java 21): switch (shape) { case Circle(double r) -> ... }",
      ],
      examples: [
        {
          title: "Sealed classes as result type",
          code: `public sealed interface Result<T> permits Result.Success, Result.Failure {\n    record Success<T>(T value) implements Result<T> {}\n    record Failure<T>(String error) implements Result<T> {}\n\n    static <T> Result<T> of(java.util.function.Supplier<T> fn) {\n        try { return new Success<>(fn.get()); }\n        catch (Exception e) { return new Failure<>(e.getMessage()); }\n    }\n}\n\n// Usage:\nResult<Integer> result = Result.of(() -> Integer.parseInt(\"42\"));\nString message = switch (result) {\n    case Result.Success<Integer> s -> \"Value: \" + s.value();\n    case Result.Failure<Integer> f -> \"Error: \" + f.error();\n};\nSystem.out.println(message); // Value: 42`,
          body: "Sealed + records + pattern matching switch = type-safe result handling without null checks or exceptions.",
        },
        {
          title: "Pattern matching instanceof",
          code: `Object obj = \"Hello, Java 21!\";\n\n// Old way:\nif (obj instanceof String) {\n    String s = (String) obj; // explicit cast\n    System.out.println(s.length());\n}\n\n// Modern way (Java 16+):\nif (obj instanceof String s) { // cast + bind in one\n    System.out.println(s.length()); // 16\n}\n\n// With guard:\nif (obj instanceof String s && s.length() > 5) {\n    System.out.println(\"Long string: \" + s);\n}`,
          body: "Pattern matching instanceof eliminates the explicit cast. The variable s is scoped to the if block.",
        },
      ],
      tip: "Use sealed interfaces with records for modelling domain state. It's the Java equivalent of algebraic data types — exhaustive switch guarantees you handle every case.",
    },

    {
      no: 21,
      name: "Virtual Threads — Project Loom",
      difficulty: "Expert",
      duration: "14 min",
      xp: 200,
      summary: "Scale Java applications to millions of concurrent tasks with Java 21's virtual threads.",
      body: `Project Loom (Java 21) introduces virtual threads — lightweight threads managed by the JVM, not the OS. Traditional platform threads are expensive (~1MB stack, OS overhead). Virtual threads are cheap (~few KB, JVM-managed) — you can create millions. When a virtual thread blocks (on I/O), it unmounts from the platform thread and another virtual thread runs. This makes blocking code as scalable as reactive/async code without the complexity.`,
      uses: [
        "High-concurrency servers: one virtual thread per request (old style, new scale).",
        "Migration from thread pools to simpler virtual thread-per-task model.",
        "Database-heavy apps: each query blocks but uses a virtual thread.",
      ],
      keyFeatures: [
        "Thread.ofVirtual().start(Runnable) — create a virtual thread.",
        "Executors.newVirtualThreadPerTaskExecutor() — executor for virtual threads.",
        "Virtual threads are cheap — create millions without concern.",
        "Blocking ops (I/O, sleep) unmount virtual thread automatically.",
        "Structured concurrency (Java 21 preview): group related tasks.",
        "Virtual threads don't help CPU-bound tasks — only I/O-bound.",
      ],
      examples: [
        {
          title: "One million virtual threads",
          code: `import java.util.concurrent.*;\n\npublic class VirtualThreads {\n    public static void main(String[] args) throws Exception {\n        // Create 1,000,000 virtual threads — no problem!\n        var executor = Executors.newVirtualThreadPerTaskExecutor();\n        var futures = new ArrayList<Future<?>>();\n\n        for (int i = 0; i < 1_000_000; i++) {\n            final int id = i;\n            futures.add(executor.submit(() -> {\n                Thread.sleep(1000); // blocks — but on virtual thread!\n                return id;\n            }));\n        }\n\n        executor.shutdown();\n        executor.awaitTermination(10, TimeUnit.SECONDS);\n        System.out.println(\"All done!\");\n    }\n}`,
          body: "1 million threads sleeping is fine with virtual threads. Each only uses ~few KB. Platform threads would crash the JVM.",
        },
        {
          title: "Spring Boot with virtual threads",
          code: `// application.properties:\n// spring.threads.virtual.enabled=true\n\n// Or programmatically:\n@Bean\npublic TomcatProtocolHandlerCustomizer<?> virtualThreads() {\n    return handler -> handler.setExecutor(\n        Executors.newVirtualThreadPerTaskExecutor()\n    );\n}\n\n// Now each HTTP request runs on its own virtual thread\n// Blocking database calls don't waste platform threads\n// Same code — massively improved throughput`,
          body: "One property enables virtual threads in Spring Boot 3.2+. Existing blocking code scales without any changes.",
        },
      ],
      tip: "Virtual threads don't improve CPU-bound tasks. They're for I/O-bound work (DB queries, HTTP calls, file I/O) where threads spend time waiting. Profile first.",
    },

    {
      no: 22,
      name: "Memory Management & GC Tuning",
      difficulty: "Expert",
      duration: "14 min",
      xp: 200,
      summary: "Understand Java's garbage collection and tune the JVM for production performance.",
      body: `The JVM manages memory automatically via Garbage Collection (GC). The heap is divided into generations: Young (Eden + Survivor), Old (Tenured), Metaspace. GC algorithms: Serial (single-threaded), G1GC (default Java 9+), ZGC (low-pause, Java 15+), Shenandoah. Understanding GC pauses, memory pressure, and object allocation patterns helps diagnose and fix production issues. JVM flags tune heap size, GC algorithm, and logging.`,
      uses: [
        "Diagnosing OutOfMemoryError in production.",
        "Reducing GC pause times for latency-sensitive services.",
        "Tuning heap size for containerised microservices.",
        "Finding memory leaks with heap dumps.",
      ],
      keyFeatures: [
        "-Xms / -Xmx: min/max heap size. -Xss: thread stack size.",
        "-XX:+UseG1GC / -XX:+UseZGC: GC algorithm selection.",
        "-verbose:gc / -Xlog:gc*: GC logging.",
        "Heap dump: -XX:+HeapDumpOnOutOfMemoryError.",
        "jmap, jstat, jconsole, VisualVM — monitoring tools.",
        "Soft/Weak/Phantom references for cache-friendly objects.",
      ],
      examples: [
        {
          title: "JVM tuning flags",
          code: `# Production JVM flags for a Spring Boot service:\njava \\\n  -server \\\n  -Xms512m \\\n  -Xmx2g \\\n  -XX:+UseG1GC \\\n  -XX:MaxGCPauseMillis=200 \\\n  -XX:+HeapDumpOnOutOfMemoryError \\\n  -XX:HeapDumpPath=/dumps/app.hprof \\\n  -Xlog:gc*:file=/logs/gc.log:time,uptime:filecount=5,filesize=20m \\\n  -jar myapp.jar`,
          body: "G1GC with 200ms pause target works well for most services. Heap dump on OOM enables post-mortem analysis.",
        },
        {
          title: "WeakReference for caches",
          code: `import java.lang.ref.*;\nimport java.util.*;\n\n// Cache that doesn't prevent GC of unused entries\nMap<String, WeakReference<byte[]>> cache = new HashMap<>();\n\nvoid cacheData(String key, byte[] data) {\n    cache.put(key, new WeakReference<>(data));\n}\n\nbyte[] getData(String key) {\n    WeakReference<byte[]> ref = cache.get(key);\n    if (ref != null) {\n        byte[] data = ref.get(); // might be null if GC'd\n        if (data != null) return data;\n    }\n    return loadFromDisk(key); // reload if evicted\n}\nbyte[] loadFromDisk(String key) { return new byte[0]; }`,
          body: "WeakReferences are cleared by GC when memory is needed. Perfect for caches that shouldn't prevent garbage collection.",
        },
      ],
      tip: "Don't pre-maturely tune GC. Profile first: collect GC logs, analyse with GCEasy.io or Eclipse Memory Analyzer (MAT). Fix the actual bottleneck.",
    },

    {
      no: 23,
      name: "Microservices with Spring Cloud",
      difficulty: "Expert",
      duration: "16 min",
      xp: 200,
      summary: "Build distributed microservice systems using Spring Cloud's service discovery, config, and resilience tools.",
      body: `Microservices split a monolith into independently deployable services. Spring Cloud provides: Eureka (service discovery), Spring Cloud Config (centralised configuration), Spring Cloud Gateway (API gateway), Resilience4J (circuit breaker, retry, rate limiter), OpenFeign (declarative HTTP clients), and Sleuth/Zipkin (distributed tracing). Each component solves a specific distributed systems problem.`,
      uses: [
        "Large teams working independently on separate services.",
        "Independent scaling of high-traffic components.",
        "Polyglot architecture — mix Java, Go, Python services.",
        "Zero-downtime deployments with circuit breakers.",
      ],
      keyFeatures: [
        "@EnableEurekaServer / @EnableDiscoveryClient — service registry.",
        "@FeignClient — declarative REST client with load balancing.",
        "@CircuitBreaker — fail fast when downstream service is down.",
        "@Retry — automatic retry with backoff.",
        "Spring Cloud Gateway: routing, rate limiting, auth filters.",
        "Distributed tracing with Micrometer + Zipkin.",
      ],
      examples: [
        {
          title: "Feign client with circuit breaker",
          code: `@FeignClient(name = \"user-service\", fallback = UserFallback.class)\npublic interface UserClient {\n    @GetMapping(\"/api/users/{id}\")\n    UserDTO findById(@PathVariable Long id);\n}\n\n@Component\npublic class UserFallback implements UserClient {\n    @Override\n    public UserDTO findById(Long id) {\n        return new UserDTO(id, \"Unknown User\", \"\"); // graceful fallback\n    }\n}\n\n// Service using the client:\n@Service\npublic class OrderService {\n    private final UserClient userClient;\n\n    public OrderDTO createOrder(Long userId, List<Long> itemIds) {\n        UserDTO user = userClient.findById(userId); // auto load-balanced + circuit broken\n        // ...\n    }\n}`,
          body: "Feign handles HTTP, load balancing, and retries. The fallback provides graceful degradation when user-service is down.",
        },
      ],
      tip: "Start with a modular monolith before splitting into microservices. Premature decomposition creates distributed systems complexity without the scale to justify it.",
    },

    {
      no: 24,
      name: "Reactive Programming with Project Reactor",
      difficulty: "Expert",
      duration: "14 min",
      xp: 200,
      summary: "Build non-blocking, backpressure-aware applications with Reactor's Flux and Mono.",
      body: `Reactive programming handles streams of asynchronous data with backpressure — the consumer controls how fast the producer emits. Project Reactor (used by Spring WebFlux) provides Mono<T> (0-1 item) and Flux<T> (0-N items). Operators (map, filter, flatMap, zip) transform reactive streams. Spring WebFlux enables fully non-blocking web applications. Reactive is ideal for I/O-heavy applications needing extreme scalability — though virtual threads now offer a simpler alternative.`,
      uses: [
        "High-throughput event streaming APIs.",
        "Real-time data feeds (stock prices, IoT sensors).",
        "Database reactive access with R2DBC.",
        "Composing multiple async operations without nested callbacks.",
      ],
      keyFeatures: [
        "Mono<T>: 0 or 1 async value (like CompletableFuture).",
        "Flux<T>: 0 to N async values (stream).",
        "subscribe(): start execution — reactive is lazy.",
        "flatMap(): async transformation that returns a Publisher.",
        "zip(): combine multiple publishers.",
        "onErrorResume(): handle errors and continue.",
      ],
      examples: [
        {
          title: "Mono and Flux basics",
          code: `import reactor.core.publisher.*;\n\n// Mono — single async value\nMono<String> userMono = Mono.just(\"Alice\")\n    .map(String::toUpperCase);\nuserMono.subscribe(System.out::println); // ALICE\n\n// Flux — multiple values\nFlux<Integer> numbers = Flux.range(1, 5)\n    .filter(n -> n % 2 == 0)\n    .map(n -> n * n);\nnumbers.subscribe(System.out::println);\n// 4\n// 16`,
          body: "Nothing executes until subscribe() is called — reactive is pull-based. Operators form a declaration of transformations.",
        },
        {
          title: "Spring WebFlux controller",
          code: `@RestController\n@RequestMapping(\"/api/users\")\npublic class UserController {\n    private final UserRepository repo; // reactive R2DBC repository\n\n    @GetMapping\n    public Flux<User> all() {\n        return repo.findAll(); // non-blocking\n    }\n\n    @GetMapping(\"/{id}\")\n    public Mono<ResponseEntity<User>> byId(@PathVariable Long id) {\n        return repo.findById(id)\n            .map(ResponseEntity::ok)\n            .defaultIfEmpty(ResponseEntity.notFound().build());\n    }\n\n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    public Mono<User> create(@RequestBody User user) {\n        return repo.save(user);\n    }\n}`,
          body: "WebFlux is fully non-blocking — one thread handles many concurrent requests by suspending on I/O operations.",
        },
      ],
      tip: "For most applications, Spring MVC + virtual threads is simpler than WebFlux with equivalent performance. Use WebFlux when you need streaming responses or SSE (Server-Sent Events).",
    },

    {
      no: 25,
      name: "Java Best Practices & Clean Code",
      difficulty: "Expert",
      duration: "16 min",
      xp: 220,
      summary: "Write professional Java code following Clean Code principles, SOLID, and Java-specific idioms.",
      body: `Professional Java is about more than working code. Follow SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Use Clean Code practices: meaningful names, small methods, no magic numbers, avoid deep nesting. Apply Effective Java items (Joshua Bloch): prefer immutability, minimise mutability, use static factories, avoid finalizers. Use Lombok to reduce boilerplate. SonarQube and Checkstyle enforce quality automatically.`,
      uses: [
        "Passing code reviews at top tech companies.",
        "Writing code that new team members can understand immediately.",
        "Reducing bugs through immutability and clear contracts.",
      ],
      keyFeatures: [
        "Immutability: final fields, defensive copies, unmodifiable collections.",
        "Prefer static factory methods over constructors (Effective Java Item 1).",
        "Minimise scope: declare variables as close to use as possible.",
        "Favour composition over inheritance.",
        "Use Optional correctly: return type, never parameter.",
        "Lombok: @Data, @Builder, @Slf4j, @RequiredArgsConstructor.",
      ],
      examples: [
        {
          title: "Immutable value object",
          code: `import java.util.List;\nimport java.util.Objects;\n\npublic final class Money {\n    private final long cents; // immutable — no setter\n    private final String currency;\n\n    private Money(long cents, String currency) { // private constructor\n        this.cents = cents;\n        this.currency = Objects.requireNonNull(currency);\n    }\n\n    // Static factory\n    public static Money of(long cents, String currency) {\n        return new Money(cents, currency);\n    }\n\n    public Money add(Money other) {\n        if (!currency.equals(other.currency))\n            throw new IllegalArgumentException(\"Currency mismatch\");\n        return new Money(cents + other.cents, currency); // returns new object\n    }\n\n    @Override public String toString() {\n        return String.format(\"%s %.2f\", currency, cents / 100.0);\n    }\n}`,
          body: "Final class prevents subclassing. Private constructor + static factory. Immutable — add() returns a new Money, never modifies this.",
        },
        {
          title: "SOLID — Single Responsibility",
          code: `// BAD: one class doing too much\nclass UserManager {\n    void createUser(String name) { /* DB logic */ }\n    void sendWelcomeEmail(String email) { /* email logic */ }\n    void generateReport() { /* report logic */ }\n}\n\n// GOOD: single responsibility\nclass UserRepository {\n    User save(User user) { /* only DB */ }\n}\n\nclass EmailService {\n    void sendWelcome(String email) { /* only email */ }\n}\n\nclass UserReportGenerator {\n    Report generate() { /* only reports */ }\n}\n\n// UserService orchestrates\nclass UserService {\n    UserService(UserRepository repo, EmailService email) {}\n    void registerUser(String name, String email) {\n        var user = repo.save(new User(name, email));\n        emailService.sendWelcome(email);\n    }\n}`,
          body: "Each class has one reason to change. Email changes don't affect DB code. Easy to test, mock, and reuse independently.",
        },
      ],
      tip: "Read 'Effective Java' by Joshua Bloch — it's the definitive guide to professional Java. Every item is practical and immediately applicable.",
    },

  ],
};



// ─── data/htmlCourse.js ───────────────────────────────────────────────────────

export const htmlCourse = {
  language: "HTML",
  accentColor: "#e34c26",
  accentLight: "#f06529",
  totalChapters: 22,
  chapters: [

    // ── BEGINNER (Ch 1–7) ──────────────────────────────────────────────────────

    {
      no: 1,
      name: "Introduction to HTML",
      difficulty: "Beginner",
      duration: "10 min",
      xp: 100,
      summary: "Discover what HTML is, how the web works, and write your very first web page.",
      body: `HTML (HyperText Markup Language) is the skeleton of every web page. Created by Tim Berners-Lee in 1991, it is not a programming language — it is a markup language that describes the structure and content of a document using tags. Browsers read HTML and render it visually. Every website you've ever visited — Google, YouTube, Instagram — starts with an HTML file. HTML works alongside CSS (styling) and JavaScript (behaviour) to create the complete web experience.`,
      uses: [
        "Building the structure and content of every web page.",
        "Creating documents: articles, portfolios, landing pages.",
        "Defining meaning for search engines (SEO via semantic tags).",
        "Providing the base layer that CSS and JavaScript operate on.",
      ],
      keyFeatures: [
        "Tags: HTML uses angle-bracket tags like <h1>, <p>, <div>.",
        "Elements: an opening tag + content + closing tag = an element.",
        "Nesting: elements live inside other elements forming a tree.",
        "DOCTYPE declaration tells the browser which HTML version to use.",
        "HTML5 is the current living standard — continuously updated.",
        "Case-insensitive but lowercase convention is universal.",
      ],
      examples: [
        {
          title: "The minimal HTML5 page",
          code: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>Welcome to my first web page.</p>\n  </body>\n</html>`,
          body: "DOCTYPE declares HTML5. <head> holds metadata. <body> holds visible content. Always include charset and viewport.",
        },
        {
          title: "Tags vs elements vs attributes",
          code: `<!-- Tag: just the angle-bracket part -->\n<!-- Element: opening tag + content + closing tag -->\n<!-- Attribute: extra info inside the opening tag -->\n\n<a href="https://codify.app" target="_blank">Visit Codify</a>\n\n<!--\n  Tag:       <a> and </a>\n  Element:   the whole thing\n  Attribute: href="..." and target="..."\n  Content:   "Visit Codify"\n-->`,
          body: "Attributes always go in the opening tag as name=\"value\" pairs. They modify or add info to an element.",
        },
        {
          title: "Self-closing vs paired tags",
          code: `<!-- Paired tags — need both open and close -->\n<p>This is a paragraph.</p>\n<h1>This is a heading.</h1>\n\n<!-- Self-closing / void elements — no closing tag -->\n<img src="logo.png" alt="Codify logo">\n<br>\n<hr>\n<input type="text" placeholder="Enter text">\n<meta charset="UTF-8">`,
          body: "Void elements have no content and no closing tag. In HTML5, the trailing slash (<br />) is optional.",
        },
      ],
      tip: "Always include <!DOCTYPE html>, charset UTF-8, and a viewport meta tag. These three lines prevent 80% of basic rendering bugs.",
    },

    {
      no: 2,
      name: "Text Content — Headings, Paragraphs & Formatting",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 110,
      summary: "Structure and format text on your page using headings, paragraphs, and inline text elements.",
      body: `Text is the foundation of most web content. HTML provides six levels of headings (h1–h6), paragraphs (p), and a set of inline elements for text formatting. Headings create visual hierarchy and are critical for SEO and accessibility — search engines and screen readers rely on heading structure to understand page organisation. Inline elements like <strong> and <em> add meaning, not just styling.`,
      uses: [
        "Blog posts and articles: headings structure content logically.",
        "SEO: h1 is the most important on-page SEO signal.",
        "Accessibility: screen readers navigate by headings.",
        "Emphasising key terms, showing code snippets inline, marking quotes.",
      ],
      keyFeatures: [
        "h1–h6: heading hierarchy — use one h1 per page, h2–h6 for subsections.",
        "<p>: block-level paragraph with automatic top/bottom margin.",
        "<strong>: bold with semantic importance (not just visual bold).",
        "<em>: italic with semantic emphasis.",
        "<br>: line break inside a paragraph.",
        "<hr>: thematic break — a horizontal rule.",
        "<blockquote>: for extended quotations from an external source.",
        "<code>: inline code snippet; <pre> for preserved whitespace blocks.",
      ],
      examples: [
        {
          title: "Heading hierarchy",
          code: `<h1>JavaScript Course</h1>\n\n<h2>Chapter 1: Introduction</h2>\n<p>JavaScript is the language of the web.</p>\n\n<h2>Chapter 2: Variables</h2>\n<h3>2.1 var, let, and const</h3>\n<p>Modern JS uses <strong>let</strong> and <strong>const</strong>.</p>\n\n<h3>2.2 Data Types</h3>\n<p>Types include <em>string</em>, <em>number</em>, and <em>boolean</em>.</p>`,
          body: "Only one h1 per page. Headings should nest logically — don't skip levels (h1 → h3 without h2).",
        },
        {
          title: "Inline text formatting",
          code: `<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>\n\n<p>The price is <del>$99</del> now only <ins>$49</ins>!</p>\n\n<p>Water formula: H<sub>2</sub>O</p>\n<p>Area = πr<sup>2</sup></p>\n\n<p>The function returns <code>undefined</code> by default.</p>\n\n<blockquote cite="https://example.com">\n  "Any fool can write code that a computer can understand.\n   Good programmers write code that humans can understand."\n  <cite>— Martin Fowler</cite>\n</blockquote>`,
          body: "Each tag carries semantic meaning: del = deleted text, ins = inserted text, kbd = keyboard input, cite = reference.",
        },
        {
          title: "Preformatted code block",
          code: `<pre><code>\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n</code></pre>`,
          body: "<pre> preserves whitespace and line breaks. Combined with <code>, it's used for code blocks on documentation sites.",
        },
      ],
      tip: "Use <strong> and <em> for meaning, not appearance. If you want bold/italic purely for looks, use CSS instead.",
    },

    {
      no: 3,
      name: "Links & Navigation",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 110,
      summary: "Connect pages together and create navigation using anchor links — the 'HyperText' in HTML.",
      body: `The anchor element <a> is what makes the web a web. It creates hyperlinks to other pages, sections on the same page, email addresses, phone numbers, and files. The href (hypertext reference) attribute defines the destination. Understanding absolute vs relative URLs, target behaviour, and accessibility best practices for links is essential for every web developer.`,
      uses: [
        "Navigation menus: linking between pages of a website.",
        "In-page anchor links: table of contents jumping to sections.",
        "External links to other websites.",
        "Email (mailto:) and phone (tel:) links.",
        "Download links for files.",
      ],
      keyFeatures: [
        "href: the destination — URL, path, #id, mailto:, tel:.",
        "Absolute URL: full address (https://example.com/page).",
        "Relative URL: path from current file (../about.html).",
        "target='_blank': opens in new tab — always add rel='noopener'.",
        "#id: jumps to element with that id on the same page.",
        "download attribute: prompts download instead of navigation.",
        "aria-label: describes link purpose for screen readers.",
      ],
      examples: [
        {
          title: "Types of links",
          code: `<!-- External link (opens in new tab safely) -->\n<a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">\n  MDN Web Docs\n</a>\n\n<!-- Relative link -->\n<a href="about.html">About Us</a>\n<a href="../courses/javascript.html">JS Course</a>\n\n<!-- Email and phone -->\n<a href="mailto:hello@codify.app">Email Us</a>\n<a href="tel:+911234567890">Call Us</a>\n\n<!-- Download -->\n<a href="resume.pdf" download="my-resume.pdf">Download CV</a>`,
          body: "rel='noopener noreferrer' prevents the new tab from accessing your page via window.opener — a security best practice.",
        },
        {
          title: "In-page anchor navigation (table of contents)",
          code: `<!-- Table of contents -->\n<nav>\n  <a href="#intro">Introduction</a>\n  <a href="#features">Key Features</a>\n  <a href="#examples">Examples</a>\n</nav>\n\n<!-- Sections with matching IDs -->\n<section id="intro">\n  <h2>Introduction</h2>\n  <p>Welcome to the course!</p>\n</section>\n\n<section id="features">\n  <h2>Key Features</h2>\n</section>\n\n<section id="examples">\n  <h2>Examples</h2>\n</section>`,
          body: "The # prefix in href refers to an element's id. Clicking the link scrolls the page to that element.",
        },
        {
          title: "Navigation menu structure",
          code: `<nav aria-label="Main navigation">\n  <ul>\n    <li><a href="/" aria-current="page">Home</a></li>\n    <li><a href="/courses">Courses</a></li>\n    <li><a href="/about">About</a></li>\n    <li><a href="/contact">Contact</a></li>\n  </ul>\n</nav>`,
          body: "Wrap nav links in a <nav> + <ul> structure. aria-current='page' marks the active link for screen readers.",
        },
      ],
      tip: "Never use 'click here' as link text. Use descriptive text like 'View JavaScript course' — it helps both users and search engines.",
    },

    {
      no: 4,
      name: "Images & Media",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 110,
      summary: "Embed images, audio, and video into web pages with proper accessibility and performance practices.",
      body: `Images make the web visual. The <img> element embeds images with a src (source) and mandatory alt (alternative text for accessibility). HTML5 introduced <picture> for responsive images and <figure>/<figcaption> for semantic image grouping. The <video> and <audio> elements embed media directly without plugins like Flash, which is now obsolete.`,
      uses: [
        "Displaying product photos, profile pictures, banners.",
        "Embedding tutorial videos directly on a page.",
        "Responsive images that serve different sizes for different screens.",
        "Accessible images with descriptive alt text for screen readers.",
      ],
      keyFeatures: [
        "alt: always required — describes image for accessibility and SEO.",
        "width/height attributes: prevent layout shift while loading.",
        "loading='lazy': defer off-screen images for better performance.",
        "<picture> + <source>: serve different image formats/sizes.",
        "<figure> + <figcaption>: semantic image with caption.",
        "<video controls>: built-in browser player with multiple sources.",
        "<audio controls>: audio player with src or nested <source>.",
      ],
      examples: [
        {
          title: "Responsive image with picture",
          code: `<!-- Basic image -->\n<img src="logo.png" alt="Codify logo" width="200" height="60">\n\n<!-- Responsive image with picture -->\n<picture>\n  <source media="(max-width: 600px)" srcset="hero-mobile.webp" type="image/webp">\n  <source media="(min-width: 601px)" srcset="hero-desktop.webp" type="image/webp">\n  <img src="hero-desktop.jpg" alt="Hero banner showing a developer at work"\n       loading="lazy" width="1200" height="600">\n</picture>`,
          body: "The browser picks the first matching <source>. Falls back to <img> if none match or format unsupported.",
        },
        {
          title: "Figure with caption",
          code: `<figure>\n  <img\n    src="chart.png"\n    alt="Bar chart showing monthly active users growing from 1k to 50k"\n    loading="lazy"\n    width="800"\n    height="400"\n  >\n  <figcaption>Fig 1. Monthly active users Q1–Q4 2024</figcaption>\n</figure>`,
          body: "<figure> groups the image with its caption semantically. Screen readers associate the caption with the image.",
        },
        {
          title: "Video and audio",
          code: `<!-- Video -->\n<video controls width="640" height="360" poster="thumbnail.jpg">\n  <source src="lesson.webm" type="video/webm">\n  <source src="lesson.mp4" type="video/mp4">\n  <p>Your browser doesn't support video. <a href="lesson.mp4">Download it</a>.</p>\n</video>\n\n<!-- Audio -->\n<audio controls>\n  <source src="podcast.ogg" type="audio/ogg">\n  <source src="podcast.mp3" type="audio/mpeg">\n  Your browser doesn't support audio.\n</audio>`,
          body: "Always provide multiple formats and a fallback message. poster sets the video thumbnail image.",
        },
      ],
      tip: "Always set explicit width and height on images. Without them, the browser doesn't know the image's size while loading, causing layout shifts (bad for Core Web Vitals).",
    },

    {
      no: 5,
      name: "Lists — Ordered, Unordered & Description",
      difficulty: "Beginner",
      duration: "10 min",
      xp: 100,
      summary: "Organise content into readable, semantic lists — one of the most-used HTML structures.",
      body: `Lists structure content into scannable items. HTML has three list types: unordered (<ul>) for items with no sequence, ordered (<ol>) for numbered steps, and description lists (<dl>) for term-definition pairs. Navigation menus are almost always ul/li under the hood. Lists can be nested for sub-items. Using the correct list type improves both readability and accessibility.`,
      uses: [
        "Navigation menus (ul + li is standard).",
        "Step-by-step instructions (ol).",
        "Feature lists, bullet points in articles.",
        "Glossaries and FAQs (dl + dt + dd).",
      ],
      keyFeatures: [
        "<ul>: unordered list — bullet points by default.",
        "<ol>: ordered list — numbers by default; type and start attributes customise.",
        "<li>: list item — child of both ul and ol.",
        "<dl>: description list container.",
        "<dt>: description term.",
        "<dd>: description details — indented under dt.",
        "Lists can be nested to any depth.",
        "ol type: '1', 'A', 'a', 'I', 'i' for different numbering styles.",
      ],
      examples: [
        {
          title: "Unordered and ordered lists",
          code: `<!-- Unordered -->\n<h3>Tech Stack</h3>\n<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript\n    <ul>\n      <li>React</li>\n      <li>Node.js</li>\n    </ul>\n  </li>\n</ul>\n\n<!-- Ordered -->\n<h3>Setup Steps</h3>\n<ol>\n  <li>Install Node.js</li>\n  <li>Run <code>npm install</code></li>\n  <li>Start with <code>npm run dev</code></li>\n</ol>`,
          body: "Nested lists create sub-items. The nested ul/ol goes inside the parent li element.",
        },
        {
          title: "Ordered list customisation",
          code: `<!-- Start at a different number -->\n<ol start="5">\n  <li>Step five</li>\n  <li>Step six</li>\n</ol>\n\n<!-- Uppercase Roman numerals -->\n<ol type="I">\n  <li>Introduction</li>\n  <li>Methodology</li>\n  <li>Results</li>\n</ol>\n\n<!-- Reverse order -->\n<ol reversed>\n  <li>Gold medal</li>\n  <li>Silver medal</li>\n  <li>Bronze medal</li>\n</ol>`,
          body: "start, type, and reversed are the three ol attributes. type uses CSS list-style-type under the hood.",
        },
        {
          title: "Description list for a glossary",
          code: `<dl>\n  <dt>HTML</dt>\n  <dd>HyperText Markup Language — the structure of web pages.</dd>\n\n  <dt>CSS</dt>\n  <dd>Cascading Style Sheets — the styling layer for web pages.</dd>\n\n  <dt>API</dt>\n  <dd>Application Programming Interface — a contract for how software talks to software.</dd>\n</dl>`,
          body: "<dl> is underused but perfect for glossaries, FAQs, and metadata pairs. One dt can have multiple dd elements.",
        },
      ],
      tip: "Style list markers with CSS list-style-type and list-style-image rather than using custom bullets in your HTML.",
    },

    {
      no: 6,
      name: "Tables",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 120,
      summary: "Display tabular data — rows and columns — using HTML's table elements correctly.",
      body: `Tables are for tabular data — information that has a logical row-and-column relationship. They are not for layout (CSS Grid/Flexbox replaced table-based layouts). A well-structured table uses thead, tbody, tfoot, th (header cells), and td (data cells). Accessibility is critical: screen readers read tables row-by-row, so proper th with scope attributes and a caption make tables comprehensible to all users.`,
      uses: [
        "Data tables: pricing plans, comparison charts, schedules.",
        "Financial reports: revenue tables, expense breakdowns.",
        "Sports standings, leaderboards.",
        "HTML email layouts (unfortunately, tables are still used here).",
      ],
      keyFeatures: [
        "<table>: wrapper for the entire table.",
        "<thead>, <tbody>, <tfoot>: semantic groupings for rows.",
        "<tr>: table row.",
        "<th>: header cell — bold, centred by default; scope='col/row' for accessibility.",
        "<td>: data cell.",
        "colspan: cell spans multiple columns.",
        "rowspan: cell spans multiple rows.",
        "<caption>: table title — improves accessibility.",
      ],
      examples: [
        {
          title: "Basic accessible table",
          code: `<table>\n  <caption>Course Pricing Plans</caption>\n  <thead>\n    <tr>\n      <th scope="col">Plan</th>\n      <th scope="col">Price</th>\n      <th scope="col">Courses</th>\n      <th scope="col">Support</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Free</td>\n      <td>$0/mo</td>\n      <td>5</td>\n      <td>Community</td>\n    </tr>\n    <tr>\n      <td>Pro</td>\n      <td>$9/mo</td>\n      <td>Unlimited</td>\n      <td>Email</td>\n    </tr>\n  </tbody>\n</table>`,
          body: "scope='col' on <th> tells screen readers that this header describes a column. Always include a caption.",
        },
        {
          title: "colspan and rowspan",
          code: `<table>\n  <thead>\n    <tr>\n      <th rowspan="2">Name</th>\n      <th colspan="2">Scores</th>\n    </tr>\n    <tr>\n      <th>Quiz</th>\n      <th>Exam</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Alice</td>\n      <td>95</td>\n      <td>88</td>\n    </tr>\n  </tbody>\n</table>`,
          body: "rowspan merges cells vertically; colspan merges horizontally. The 'Name' header spans 2 rows; 'Scores' spans 2 columns.",
        },
        {
          title: "Table with tfoot",
          code: `<table>\n  <thead>\n    <tr><th>Item</th><th>Price</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Laptop</td><td>$999</td></tr>\n    <tr><td>Mouse</td><td>$29</td></tr>\n    <tr><td>Keyboard</td><td>$79</td></tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <th scope="row">Total</th>\n      <td>$1,107</td>\n    </tr>\n  </tfoot>\n</table>`,
          body: "tfoot defines the footer row(s). Browsers may render it at the bottom when printing even if it appears early in source.",
        },
      ],
      tip: "Never use tables for page layout. If you're centering a page or making columns, use CSS Flexbox or Grid. Tables are only for data.",
    },

    {
      no: 7,
      name: "Forms — Inputs & Buttons",
      difficulty: "Beginner",
      duration: "16 min",
      xp: 130,
      summary: "Collect user input with forms — the primary way websites receive data from visitors.",
      body: `Forms are how users send data to a server — login, registration, search, checkout. The <form> element wraps inputs and defines how data is sent. Each input has a type (text, email, password, checkbox, radio, file, etc.) that controls its behaviour and validation. Labels must be associated with inputs for accessibility. The button type attribute controls whether it submits, resets, or does nothing.`,
      uses: [
        "Login and registration forms.",
        "Contact and feedback forms.",
        "Search bars.",
        "Checkout and payment forms.",
        "Surveys and quizzes.",
      ],
      keyFeatures: [
        "action: URL where form data is sent. method: GET or POST.",
        "<label for='id'>: associates label with input — click label focuses input.",
        "name attribute: the key in the submitted key=value pair.",
        "required, minlength, maxlength, pattern: built-in validation.",
        "placeholder: hint text inside the input.",
        "autocomplete: helps browsers autofill fields.",
        "fieldset + legend: groups related inputs semantically.",
        "button type='submit', 'reset', 'button': different behaviours.",
      ],
      examples: [
        {
          title: "Login form",
          code: `<form action="/login" method="POST" autocomplete="on">\n  <div>\n    <label for="email">Email address</label>\n    <input\n      type="email"\n      id="email"\n      name="email"\n      placeholder="you@example.com"\n      required\n      autocomplete="email"\n    >\n  </div>\n\n  <div>\n    <label for="password">Password</label>\n    <input\n      type="password"\n      id="password"\n      name="password"\n      minlength="8"\n      required\n      autocomplete="current-password"\n    >\n  </div>\n\n  <button type="submit">Sign In</button>\n  <a href="/forgot-password">Forgot password?</a>\n</form>`,
          body: "The for attribute on label matches the id on input — clicking the label focuses the input. Critical for accessibility.",
        },
        {
          title: "Input types",
          code: `<!-- Text variants -->\n<input type="text"     placeholder="Full name">\n<input type="email"    placeholder="Email">\n<input type="tel"      placeholder="Phone">\n<input type="url"      placeholder="Website">\n<input type="password" placeholder="Password">\n<input type="search"   placeholder="Search">\n\n<!-- Dates -->\n<input type="date">\n<input type="time">\n<input type="datetime-local">\n\n<!-- Numbers -->\n<input type="number" min="1" max="100" step="1">\n<input type="range"  min="0" max="100" value="50">\n\n<!-- Choice -->\n<input type="checkbox" id="agree"> <label for="agree">I agree</label>\n<input type="radio" name="plan" value="free"> Free\n<input type="radio" name="plan" value="pro">  Pro\n\n<!-- File and colour -->\n<input type="file" accept=".pdf,.doc">\n<input type="color" value="#e34c26">`,
          body: "Each type provides built-in validation, appropriate keyboards on mobile, and browser UI widgets.",
        },
        {
          title: "Select, textarea, and fieldset",
          code: `<form>\n  <fieldset>\n    <legend>Course Preferences</legend>\n\n    <label for="level">Experience level</label>\n    <select id="level" name="level">\n      <option value="">-- Choose --</option>\n      <optgroup label="Beginner">\n        <option value="absolute">Complete beginner</option>\n        <option value="some">Some coding experience</option>\n      </optgroup>\n      <optgroup label="Advanced">\n        <option value="pro">Professional developer</option>\n      </optgroup>\n    </select>\n\n    <label for="goals">Your learning goals</label>\n    <textarea\n      id="goals"\n      name="goals"\n      rows="4"\n      maxlength="500"\n      placeholder="What do you want to achieve?"\n    ></textarea>\n  </fieldset>\n\n  <button type="submit">Save Preferences</button>\n  <button type="reset">Clear</button>\n</form>`,
          body: "fieldset+legend groups related fields. optgroup organises select options. textarea needs an explicit closing tag.",
        },
      ],
      tip: "Associate every input with a label using matching for and id. Never use placeholder as a substitute for a label — placeholders disappear when the user types.",
    },

    // ── INTERMEDIATE (Ch 8–15) ─────────────────────────────────────────────────

    {
      no: 8,
      name: "Semantic HTML5 Elements",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 140,
      summary: "Replace meaningless <div> soup with semantic elements that describe content structure clearly.",
      body: `Semantic HTML means using elements that describe their purpose — <article> for an article, <nav> for navigation, <aside> for sidebar content. Before HTML5, developers wrapped everything in <div> tags (div soup). HTML5 introduced structural elements that convey meaning to browsers, search engines, and assistive technologies. This improves SEO, accessibility, and code readability dramatically.`,
      uses: [
        "SEO: search engines understand page structure better.",
        "Accessibility: screen readers use landmarks to navigate.",
        "Code readability: other developers instantly understand structure.",
        "Browser reading mode uses semantic structure to extract content.",
      ],
      keyFeatures: [
        "<header>: introductory content — site header or section header.",
        "<nav>: navigation links.",
        "<main>: primary unique content of the page — one per page.",
        "<article>: self-contained content (blog post, news article, comment).",
        "<section>: thematic grouping with a heading.",
        "<aside>: tangentially related content (sidebar, callout box).",
        "<footer>: footer for page or section.",
        "<time datetime=''>: machine-readable date/time.",
        "<address>: contact information.",
      ],
      examples: [
        {
          title: "Semantic page layout",
          code: `<body>\n  <header>\n    <a href="/" class="logo">Codify</a>\n    <nav aria-label="Main">\n      <ul>\n        <li><a href="/courses">Courses</a></li>\n        <li><a href="/about">About</a></li>\n      </ul>\n    </nav>\n  </header>\n\n  <main>\n    <article>\n      <header>\n        <h1>Getting Started with HTML</h1>\n        <p>By <address><a href="/author/alice">Alice</a></address>\n        on <time datetime="2024-03-15">March 15, 2024</time></p>\n      </header>\n      <p>HTML is the foundation of every web page...</p>\n    </article>\n\n    <aside>\n      <h2>Related Articles</h2>\n      <ul>...</ul>\n    </aside>\n  </main>\n\n  <footer>\n    <p>&copy; 2024 Codify. All rights reserved.</p>\n  </footer>\n</body>`,
          body: "Each element describes its role. Screen readers use these as landmarks — users can jump directly to <main> or <nav>.",
        },
        {
          title: "Article vs Section",
          code: `<!-- article: makes sense on its own (syndicate-able) -->\n<article>\n  <h2>10 CSS Tricks You Should Know</h2>\n  <p>Published in any RSS reader, this article stands alone.</p>\n</article>\n\n<!-- section: thematic grouping that needs context -->\n<section>\n  <h2>Course Features</h2>\n  <p>This section only makes sense in the context of this page.</p>\n</section>\n\n<!-- div: no semantic meaning — use only when no semantic element fits -->\n<div class="card-grid">\n  <!-- just a layout wrapper -->\n</div>`,
          body: "Ask: 'Does this content make sense on its own?' If yes → article. If it's a themed group → section. Pure layout → div.",
        },
        {
          title: "Details and Summary (native accordion)",
          code: `<details>\n  <summary>What is HTML?</summary>\n  <p>\n    HTML stands for HyperText Markup Language. It is the\n    standard language for creating web pages.\n  </p>\n</details>\n\n<details open>\n  <summary>Is HTML a programming language?</summary>\n  <p>\n    No — HTML is a markup language. It describes structure,\n    not logic or computation.\n  </p>\n</details>`,
          body: "<details>/<summary> creates a toggle without any JavaScript. The open attribute makes it expanded by default.",
        },
      ],
      tip: "Replace every meaningless <div> with the right semantic element. Ask yourself: 'What does this content represent?' Then find the tag for it.",
    },

    {
      no: 9,
      name: "HTML Attributes — Global, ARIA & Data",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 140,
      summary: "Use global attributes, custom data attributes, and ARIA roles to enhance functionality and accessibility.",
      body: `Every HTML element can carry attributes. Global attributes work on any element: id, class, style, title, hidden, tabindex, contenteditable, draggable, lang. Custom data-* attributes store extra information for JavaScript without visible impact. ARIA (Accessible Rich Internet Applications) attributes bridge the gap when semantic HTML isn't enough, making custom widgets accessible to screen readers.`,
      uses: [
        "id and class: CSS targeting and JavaScript selection.",
        "data-*: store metadata without server round-trips.",
        "ARIA roles and properties: make dynamic widgets accessible.",
        "tabindex: manage keyboard focus order.",
        "contenteditable: make any element editable in-place.",
      ],
      keyFeatures: [
        "id: unique per page — used for CSS, JS, and fragment links.",
        "class: multiple per element — used for CSS and JS grouping.",
        "data-*: custom attributes; access via element.dataset in JS.",
        "hidden: hides element from all users (including screen readers).",
        "tabindex='0': adds to natural tab order; '-1': focusable by JS only.",
        "role: overrides semantic meaning for ARIA (role='button', 'dialog').",
        "aria-label: provides accessible name when visible text is absent.",
        "aria-hidden='true': hides decorative content from screen readers.",
        "aria-expanded, aria-pressed, aria-selected: interactive state.",
      ],
      examples: [
        {
          title: "data-* attributes",
          code: `<!-- Store data without visible impact -->\n<button\n  data-product-id="42"\n  data-product-name="Laptop"\n  data-price="999"\n  class="add-to-cart"\n>\n  Add to Cart\n</button>\n\n<script>\n  document.querySelector(".add-to-cart").addEventListener("click", (e) => {\n    const { productId, productName, price } = e.target.dataset;\n    console.log(\`Adding \${productName} (\${productId}) — $\${price}\`);\n  });\n</script>`,
          body: "data-* attributes become camelCase in JS dataset: data-product-id becomes dataset.productId.",
        },
        {
          title: "ARIA for custom interactive elements",
          code: `<!-- Custom toggle button (not a native checkbox) -->\n<div\n  role="checkbox"\n  aria-checked="false"\n  tabindex="0"\n  id="dark-mode-toggle"\n>\n  Dark Mode\n</div>\n\n<!-- Announcement region for screen readers -->\n<div\n  aria-live="polite"\n  aria-atomic="true"\n  id="notification"\n>\n  <!-- Updated by JS: screen reader announces changes -->\n</div>\n\n<!-- Icon button without visible text -->\n<button aria-label="Close dialog">\n  <svg aria-hidden="true" focusable="false"><!-- X icon --></svg>\n</button>`,
          body: "aria-live='polite' announces dynamic content changes to screen readers. aria-hidden hides decorative icons.",
        },
        {
          title: "Global attributes showcase",
          code: `<!-- contenteditable: browser-native editing -->\n<p contenteditable="true" spellcheck="true">\n  Click me to edit this text directly.\n</p>\n\n<!-- title: tooltip on hover -->\n<abbr title="HyperText Markup Language">HTML</abbr>\n\n<!-- lang: override language for an element -->\n<p>The French say <span lang="fr">Bonjour</span> as a greeting.</p>\n\n<!-- draggable: HTML5 drag-and-drop -->\n<div draggable="true" id="drag-item">Drag me!</div>`,
          body: "Global attributes like contenteditable and draggable enable rich interactions without JavaScript frameworks.",
        },
      ],
      tip: "Use semantic HTML before reaching for ARIA. ARIA should fix accessibility gaps, not compensate for using the wrong element.",
    },

    {
      no: 10,
      name: "HTML Head — Meta, SEO & Open Graph",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 140,
      summary: "Control how your page appears to browsers, search engines, and social media with the <head> section.",
      body: `The <head> element contains metadata that isn't rendered on the page but controls how the browser, search engines, and social platforms interpret your page. Essential tags include charset, viewport, title, description, canonical, and Open Graph tags (og:title, og:image) that control how your page appears when shared on Twitter, Facebook, or WhatsApp.`,
      uses: [
        "SEO: title and meta description drive search engine snippet.",
        "Social sharing: Open Graph controls LinkedIn/Facebook/Twitter previews.",
        "Character encoding: UTF-8 for international character support.",
        "Responsive design: viewport meta tag enables mobile layouts.",
        "Performance: preconnect, prefetch, preload hints.",
      ],
      keyFeatures: [
        "<title>: shown in browser tab and search results — keep under 60 chars.",
        "<meta name='description'>: search snippet — 150-160 chars.",
        "<meta name='viewport'>: enables responsive CSS breakpoints.",
        "<link rel='canonical'>: prevent duplicate content SEO issues.",
        "Open Graph: og:title, og:description, og:image, og:url.",
        "Twitter Card: twitter:card, twitter:title, twitter:image.",
        "<link rel='icon'> / favicon: browser tab icon.",
        "<link rel='preconnect'>: warm up third-party domain connections.",
      ],
      examples: [
        {
          title: "Complete production <head>",
          code: `<head>\n  <!-- Character encoding -->\n  <meta charset="UTF-8">\n\n  <!-- Responsive viewport -->\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n\n  <!-- Primary SEO -->\n  <title>Learn HTML for Free | Codify</title>\n  <meta name="description" content="Master HTML in 22 bite-sized chapters. Free, fun, and beginner-friendly. Start coding in minutes.">\n  <link rel="canonical" href="https://codify.app/courses/html">\n\n  <!-- Favicon -->\n  <link rel="icon" href="/favicon.ico" sizes="any">\n  <link rel="icon" href="/icon.svg" type="image/svg+xml">\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png">\n\n  <!-- Stylesheets -->\n  <link rel="stylesheet" href="/styles.css">\n</head>`,
          body: "This is a minimum production head. SVG favicons scale to any size. apple-touch-icon is used when adding to iPhone homescreen.",
        },
        {
          title: "Open Graph & Twitter Card",
          code: `<head>\n  <!-- Open Graph (Facebook, LinkedIn, WhatsApp, Slack) -->\n  <meta property="og:type"        content="website">\n  <meta property="og:title"       content="Learn HTML for Free | Codify">\n  <meta property="og:description" content="22 bite-sized chapters to HTML mastery.">\n  <meta property="og:image"       content="https://codify.app/og/html-course.png">\n  <meta property="og:url"         content="https://codify.app/courses/html">\n  <meta property="og:site_name"   content="Codify">\n\n  <!-- Twitter Card -->\n  <meta name="twitter:card"        content="summary_large_image">\n  <meta name="twitter:title"       content="Learn HTML for Free | Codify">\n  <meta name="twitter:description" content="22 bite-sized chapters to HTML mastery.">\n  <meta name="twitter:image"       content="https://codify.app/og/html-course.png">\n</head>`,
          body: "og:image should be 1200×630px. Twitter uses its own meta tags but falls back to Open Graph if absent.",
        },
        {
          title: "Performance hints in head",
          code: `<head>\n  <!-- Warm up connection to CDN early -->\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n\n  <!-- Load font stylesheet -->\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">\n\n  <!-- Preload critical above-the-fold image -->\n  <link rel="preload" as="image" href="/hero.webp">\n\n  <!-- Prefetch next page user is likely to visit -->\n  <link rel="prefetch" href="/courses/css.html">\n</head>`,
          body: "preconnect reduces DNS+TLS handshake time. preload fetches critical resources early. prefetch speculatively loads likely next pages.",
        },
      ],
      tip: "Test your Open Graph tags at https://opengraph.xyz before publishing. Nothing is more embarrassing than a broken preview when sharing your work.",
    },

    {
      no: 11,
      name: "HTML Accessibility (a11y)",
      difficulty: "Intermediate",
      duration: "16 min",
      xp: 150,
      summary: "Build web pages that everyone can use, including people who rely on assistive technologies.",
      body: `Accessibility (a11y — 11 letters between 'a' and 'y') means building for all users, including those with visual, motor, auditory, or cognitive disabilities. Over 1 billion people worldwide have a disability. Web accessibility is also a legal requirement in many countries (ADA, WCAG). Most accessibility is free — it comes from using correct semantic HTML, proper labels, sufficient colour contrast, and keyboard navigability.`,
      uses: [
        "Legal compliance: WCAG 2.1 AA is required in many jurisdictions.",
        "Wider audience: 15% of the global population has some disability.",
        "Better SEO: accessible pages are better understood by search engines.",
        "Improved UX: captions help in noisy environments, not just deaf users.",
      ],
      keyFeatures: [
        "Use semantic HTML first — it provides free accessibility.",
        "Every image needs meaningful alt text (or alt='' for decorative).",
        "Colour contrast: AA standard requires 4.5:1 for normal text.",
        "Keyboard navigation: all interactive elements must be tab-focusable.",
        "Focus management: modal dialogs should trap focus inside them.",
        "Skip navigation link: lets keyboard users jump to main content.",
        "lang attribute on <html>: tells screen readers the language.",
        "Don't rely on colour alone to convey information.",
      ],
      examples: [
        {
          title: "Skip to content link",
          code: `<!-- First element in body — visually hidden until focused -->\n<a href="#main-content" class="skip-link">Skip to main content</a>\n\n<!-- In CSS: -->\n<!--\n.skip-link {\n  position: absolute;\n  top: -100%;\n  left: 0;\n  background: #000;\n  color: #fff;\n  padding: 8px 16px;\n  z-index: 9999;\n}\n.skip-link:focus {\n  top: 0;\n}\n-->\n\n<nav>...</nav>\n\n<main id="main-content">\n  <h1>Page content starts here</h1>\n</main>`,
          body: "Skip links let keyboard users bypass repetitive navigation. Sighted users never see them unless they're navigating by keyboard.",
        },
        {
          title: "Accessible form validation",
          code: `<form novalidate>\n  <div class="field">\n    <label for="username">\n      Username\n      <span aria-hidden="true" class="required">*</span>\n    </label>\n    <input\n      type="text"\n      id="username"\n      name="username"\n      aria-required="true"\n      aria-describedby="username-hint username-error"\n      autocomplete="username"\n    >\n    <p id="username-hint" class="hint">3–20 characters, letters and numbers only.</p>\n    <p id="username-error" role="alert" class="error" hidden>\n      Username is required.\n    </p>\n  </div>\n</form>`,
          body: "aria-describedby links the input to both its hint and error message. role='alert' announces the error to screen readers immediately.",
        },
        {
          title: "Accessible icon button and image",
          code: `<!-- Decorative image — empty alt -->\n<img src="decorative-wave.svg" alt="">\n\n<!-- Informative image — descriptive alt -->\n<img src="error-icon.svg" alt="Error: ">\n<img src="avatar.jpg" alt="Alice's profile photo">\n\n<!-- Complex image — described elsewhere -->\n<img src="bar-chart.png"\n     alt="Bar chart showing sales growth"\n     aria-describedby="chart-description">\n<p id="chart-description">Sales grew from $1M in Q1 to $4M in Q4 2024.</p>\n\n<!-- Icon-only button -->\n<button type="button" aria-label="Delete item">\n  <svg aria-hidden="true" focusable="false">\n    <!-- trash icon SVG -->\n  </svg>\n</button>`,
          body: "Empty alt='' hides decorative images from screen readers. aria-label names icon buttons. aria-hidden hides decorative SVGs.",
        },
      ],
      tip: "Run your page through Lighthouse (F12 → Lighthouse tab) or axe DevTools extension. Target 90+ accessibility score before shipping.",
    },

    {
      no: 12,
      name: "HTML Forms — Advanced Validation & Attributes",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 140,
      summary: "Use HTML5's built-in validation attributes to catch errors before data reaches your server.",
      body: `HTML5 added powerful built-in form validation that works without JavaScript. Attributes like required, minlength, maxlength, min, max, step, and pattern enforce rules on input values. The :valid, :invalid, and :user-invalid CSS pseudo-classes let you style based on validation state. The novalidate attribute disables native validation so you can use JavaScript validation instead.`,
      uses: [
        "Client-side validation for instant user feedback.",
        "Reducing invalid data reaching the server.",
        "Email, URL, and date format enforcement.",
        "Custom regex patterns for postcodes, phone numbers.",
      ],
      keyFeatures: [
        "required: field must have a value.",
        "minlength / maxlength: character count limits.",
        "min / max: numeric or date range.",
        "step: valid increments for number/date inputs.",
        "pattern: regex — pattern='[A-Z]{2}[0-9]{4}' for custom formats.",
        "type='email' and type='url': built-in format validation.",
        "setCustomValidity(): set custom error messages via JS.",
        "checkValidity() / reportValidity(): JS programmatic validation.",
      ],
      examples: [
        {
          title: "Validation attributes in action",
          code: `<form>\n  <!-- Email validated by browser -->\n  <label for="email">Email</label>\n  <input type="email" id="email" required\n         placeholder="name@domain.com">\n\n  <!-- Password rules -->\n  <label for="pass">Password</label>\n  <input type="password" id="pass"\n         required\n         minlength="8"\n         maxlength="64"\n         pattern="(?=.*[A-Z])(?=.*[0-9]).{8,}"\n         title="At least 8 chars, one uppercase letter, one number">\n\n  <!-- Age range -->\n  <label for="age">Age</label>\n  <input type="number" id="age" min="13" max="120" step="1">\n\n  <!-- Indian postcode pattern -->\n  <label for="pin">PIN Code</label>\n  <input type="text" id="pin"\n         pattern="[1-9][0-9]{5}"\n         title="6-digit Indian PIN code">\n\n  <button type="submit">Submit</button>\n</form>`,
          body: "The browser shows native validation messages on submit. title is used as the validation tooltip for pattern.",
        },
        {
          title: "CSS styling validation states",
          code: `<!--\nCSS for valid/invalid states:\n\ninput:user-invalid {\n  border-color: #ef4444;\n  background: #fef2f2;\n}\n\ninput:valid:not(:placeholder-shown) {\n  border-color: #22c55e;\n  background: #f0fdf4;\n}\n\ninput:user-invalid + .error-msg {\n  display: block;\n}\n\n.error-msg {\n  display: none;\n  color: #ef4444;\n  font-size: 0.875rem;\n}\n-->\n\n<input type="email" required placeholder="Email">\n<span class="error-msg">Please enter a valid email address.</span>`,
          body: ":user-invalid only applies after the user has interacted — unlike :invalid which fires immediately on load.",
        },
        {
          title: "Custom validation with JS",
          code: `<form id="signup">\n  <input type="text" id="username" name="username" required>\n  <span id="username-msg" aria-live="polite"></span>\n  <button type="submit">Sign Up</button>\n</form>\n\n<script>\n  const input = document.getElementById("username");\n  const msg   = document.getElementById("username-msg");\n\n  input.addEventListener("input", () => {\n    if (input.value.includes(" ")) {\n      input.setCustomValidity("Username cannot contain spaces.");\n      msg.textContent = "No spaces allowed!";\n    } else {\n      input.setCustomValidity(""); // clears the error\n      msg.textContent = "";\n    }\n  });\n</script>`,
          body: "setCustomValidity('') clears a custom error. Non-empty string sets the error and blocks form submission.",
        },
      ],
      tip: "HTML5 validation is great for quick wins, but always validate on the server too. Client-side validation can be bypassed.",
    },

    {
      no: 13,
      name: "Embedded Content — iframe, Canvas & SVG",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 140,
      summary: "Embed external content, draw graphics, and use scalable vector graphics natively in HTML.",
      body: `HTML lets you embed entire web pages (<iframe>), draw raster graphics programmatically (<canvas>), and include scalable vector graphics (<svg>) inline. iframes embed maps, videos, and third-party widgets. Canvas is used for games and data visualisation. SVG is ideal for icons, logos, and illustrations that need to scale without quality loss.`,
      uses: [
        "Google Maps and Mapbox embeds via iframe.",
        "YouTube/Vimeo video embeds.",
        "Data visualisation and chart libraries (Chart.js uses canvas).",
        "Inline SVG for icons that respond to CSS color.",
        "HTML5 game development with Canvas API.",
      ],
      keyFeatures: [
        "<iframe src title>: embed external documents.",
        "sandbox attribute: restrict iframe permissions for security.",
        "allow: specify feature permissions (camera, microphone).",
        "<canvas id width height>: programmatically drawn raster graphics.",
        "getContext('2d'): get the 2D drawing API for canvas.",
        "<svg viewBox>: scalable vector graphics in XML format.",
        "SVG inline: inherits CSS and responds to currentColor.",
        "loading='lazy' on iframe: defer off-screen frames.",
      ],
      examples: [
        {
          title: "Responsive YouTube embed",
          code: `<!-- Container keeps 16:9 ratio at any width -->\n<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;">\n  <iframe\n    src="https://www.youtube.com/embed/dQw4w9WgXcQ"\n    title="Video lesson — Introduction to HTML"\n    style="position:absolute; top:0; left:0; width:100%; height:100%;"\n    frameborder="0"\n    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"\n    allowfullscreen\n    loading="lazy"\n  ></iframe>\n</div>`,
          body: "The padding-bottom: 56.25% trick creates a 16:9 responsive container. Always include a descriptive title for accessibility.",
        },
        {
          title: "Canvas drawing",
          code: `<canvas id="myCanvas" width="400" height="200"\n        style="border:1px solid #374151;"></canvas>\n\n<script>\n  const canvas = document.getElementById("myCanvas");\n  const ctx = canvas.getContext("2d");\n\n  // Background\n  ctx.fillStyle = "#111827";\n  ctx.fillRect(0, 0, 400, 200);\n\n  // Circle\n  ctx.beginPath();\n  ctx.arc(200, 100, 60, 0, Math.PI * 2);\n  ctx.fillStyle = "#eab308";\n  ctx.fill();\n\n  // Text\n  ctx.fillStyle = "#111827";\n  ctx.font = "bold 20px sans-serif";\n  ctx.textAlign = "center";\n  ctx.fillText("Codify", 200, 108);\n</script>`,
          body: "Canvas draws pixels imperatively. Every change requires a redraw. Best for animations and data visualisation.",
        },
        {
          title: "Inline SVG icon",
          code: `<!-- SVG inline in HTML — inherits CSS color -->\n<button class="btn-icon">\n  <svg\n    xmlns="http://www.w3.org/2000/svg"\n    viewBox="0 0 24 24"\n    width="20"\n    height="20"\n    fill="currentColor"\n    aria-hidden="true"\n    focusable="false"\n  >\n    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>\n  </svg>\n  Add to favourites\n</button>`,
          body: "fill='currentColor' means the SVG inherits the CSS color property — it changes on hover, dark mode etc. automatically.",
        },
      ],
      tip: "Always add title to iframes for accessibility. Add sandbox='allow-scripts allow-same-origin' to restrict what embedded content can do.",
    },

    {
      no: 14,
      name: "HTML Performance & Best Practices",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 140,
      summary: "Write HTML that loads fast, works reliably, and scores well on Core Web Vitals.",
      body: `HTML structure directly impacts page loading speed and user experience. Script loading strategies (defer, async), resource hints (preload, prefetch), proper image sizing, lazy loading, and avoiding render-blocking resources are the key techniques. Core Web Vitals — LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint) — are Google's performance metrics that affect search ranking.`,
      uses: [
        "Faster page loads that improve conversion rates.",
        "Better Core Web Vitals scores that improve SEO ranking.",
        "Reduced data usage for mobile users.",
        "Smoother experience for users on slow connections.",
      ],
      keyFeatures: [
        "defer: script loads in background, executes after HTML parsing.",
        "async: script loads in background, executes as soon as ready.",
        "type='module': scripts are deferred by default and use strict mode.",
        "loading='lazy' on img and iframe: defer off-screen loading.",
        "Explicit width/height on images: prevents layout shift (CLS).",
        "preload: fetch critical resources early (fonts, hero images).",
        "Place scripts at end of body or use defer — never blocking <head>.",
        "Minify HTML in production — remove comments and whitespace.",
      ],
      examples: [
        {
          title: "Script loading strategies",
          code: `<head>\n  <!-- BLOCKS rendering — bad for most scripts -->\n  <script src="bad.js"></script>\n\n  <!-- async: loads in parallel, runs when ready — good for analytics -->\n  <script async src="analytics.js"></script>\n\n  <!-- defer: loads in parallel, runs after HTML parsed — best for most -->\n  <script defer src="app.js"></script>\n\n  <!-- type=module: always deferred, uses ESM -->\n  <script type="module" src="main.js"></script>\n</head>`,
          body: "Use defer for app scripts. Use async for independent third-party scripts like analytics that don't depend on DOM.",
        },
        {
          title: "Preventing layout shift",
          code: `<!-- BAD: no dimensions — causes CLS while loading -->\n<img src="hero.jpg" alt="Hero">\n\n<!-- GOOD: explicit aspect ratio — reserves space -->\n<img src="hero.jpg" alt="Course hero image" width="1200" height="600">\n\n<!-- Also good: aspect-ratio via CSS -->\n<!--\nimg {\n  aspect-ratio: 2 / 1;\n  width: 100%;\n  height: auto;\n}\n-->\n\n<!-- Fonts: prevent invisible text during load -->\n<link rel="preload" as="font" href="inter.woff2"\n      type="font/woff2" crossorigin="anonymous">\n<!--\n@font-face {\n  font-family: 'Inter';\n  font-display: swap; /* shows fallback font while loading */\n}\n-->`,
          body: "Layout shift (CLS) happens when elements move after load. Reserve space with dimensions or aspect-ratio.",
        },
        {
          title: "Critical CSS inline + async rest",
          code: `<head>\n  <!-- Inline critical above-the-fold CSS to avoid render blocking -->\n  <style>\n    /* Only styles needed for first paint */\n    body { margin:0; font-family: system-ui; }\n    .hero { background:#111827; color:#fff; padding:4rem; }\n  </style>\n\n  <!-- Load full CSS asynchronously (non-render-blocking) -->\n  <link rel="preload" href="full.css" as="style"\n        onload="this.onload=null;this.rel='stylesheet'">\n  <noscript>\n    <link rel="stylesheet" href="full.css">\n  </noscript>\n</head>`,
          body: "Inline critical CSS eliminates the render-blocking stylesheet request. Non-critical CSS loads asynchronously via the preload trick.",
        },
      ],
      tip: "Test your page at pagespeed.web.dev. It shows exactly which HTML patterns are hurting your Core Web Vitals and how to fix them.",
    },

    // ── ADVANCED (Ch 15–22) ────────────────────────────────────────────────────

    {
      no: 15,
      name: "HTML Templates & Web Components",
      difficulty: "Advanced",
      duration: "16 min",
      xp: 160,
      summary: "Create reusable HTML components natively in the browser without any framework.",
      body: `Web Components are a suite of browser APIs that allow you to create custom, reusable HTML elements with encapsulated styles and behaviour. The three pillars are: Custom Elements (define new HTML tags), Shadow DOM (encapsulated DOM tree), and HTML Templates (<template> and <slot>). These are the standards that frameworks like React were designed around — and modern browsers support them natively.`,
      uses: [
        "Building a design system of reusable UI components.",
        "Encapsulating complex widgets (date pickers, carousels).",
        "Framework-agnostic component libraries.",
        "Micro-frontends — each team owns independent components.",
      ],
      keyFeatures: [
        "<template>: inert HTML fragment — not rendered until activated.",
        "<slot>: placeholder in Shadow DOM for user-provided content.",
        "customElements.define('tag-name', Class): register a custom element.",
        "Shadow DOM: encapsulated DOM tree — styles don't leak in or out.",
        "connectedCallback, disconnectedCallback: lifecycle hooks.",
        "observedAttributes + attributeChangedCallback: react to attr changes.",
        "adoptedCallback: element moved to a new document.",
        "Custom elements must have a hyphen in their name: my-button.",
      ],
      examples: [
        {
          title: "HTML template tag",
          code: `<template id="card-template">\n  <article class="card">\n    <img src="" alt="" class="card-img">\n    <div class="card-body">\n      <h3 class="card-title"></h3>\n      <p class="card-desc"></p>\n      <a href="#" class="card-link">Learn more</a>\n    </div>\n  </article>\n</template>\n\n<div id="card-container"></div>\n\n<script>\n  const courses = [\n    { title: "HTML", desc: "Build web structure", img: "html.png" },\n    { title: "CSS",  desc: "Style the web",      img: "css.png"  },\n  ];\n\n  const tmpl = document.getElementById("card-template");\n  const container = document.getElementById("card-container");\n\n  courses.forEach(course => {\n    const clone = tmpl.content.cloneNode(true);\n    clone.querySelector(".card-title").textContent = course.title;\n    clone.querySelector(".card-desc").textContent  = course.desc;\n    clone.querySelector(".card-img").src            = course.img;\n    clone.querySelector(".card-img").alt            = course.title;\n    container.appendChild(clone);\n  });\n</script>`,
          body: "<template> content is inert — not in the live DOM until cloneNode(true) is called. Perfect for repeating structures.",
        },
        {
          title: "Simple custom element",
          code: `<!-- Use in HTML like any tag -->\n<code-badge language="javascript">ES2024</code-badge>\n<code-badge language="python">3.12</code-badge>\n\n<script>\n  class CodeBadge extends HTMLElement {\n    static get observedAttributes() { return ["language"]; }\n\n    connectedCallback() {\n      this.render();\n    }\n\n    attributeChangedCallback() {\n      this.render();\n    }\n\n    render() {\n      const lang = this.getAttribute("language") || "code";\n      const colors = { javascript: "#eab308", python: "#3b82f6", css: "#a855f7" };\n      this.style.cssText = \`\n        display: inline-block;\n        background: \${colors[lang] || "#374151"}22;\n        color: \${colors[lang] || "#9ca3af"};\n        border: 1px solid currentColor;\n        padding: 2px 8px;\n        border-radius: 4px;\n        font-family: monospace;\n        font-size: 0.8em;\n      \`;\n    }\n  }\n\n  customElements.define("code-badge", CodeBadge);\n</script>`,
          body: "Custom elements must extend HTMLElement and be registered with a hyphenated name. observedAttributes triggers attributeChangedCallback.",
        },
        {
          title: "Shadow DOM encapsulation",
          code: `<fancy-card title="HTML Course" xp="150"></fancy-card>\n\n<script>\n  class FancyCard extends HTMLElement {\n    connectedCallback() {\n      // Shadow DOM — styles are encapsulated\n      const shadow = this.attachShadow({ mode: "open" });\n\n      shadow.innerHTML = \`\n        <style>\n          /* These styles ONLY apply inside this component */\n          :host { display: block; border-radius: 12px; overflow: hidden; }\n          .card { background: #1f2937; padding: 1.5rem; color: white; }\n          .xp { color: #eab308; font-size: 0.8rem; }\n        </style>\n        <div class="card">\n          <h3>\${this.getAttribute("title")}</h3>\n          <span class="xp">+\${this.getAttribute("xp")} XP</span>\n          <slot></slot>\n        </div>\n      \`;\n    }\n  }\n\n  customElements.define("fancy-card", FancyCard);\n</script>`,
          body: "Shadow DOM creates a style boundary. :host refers to the custom element itself. <slot> inserts child content from outside.",
        },
      ],
      tip: "Web Components are great for leaf UI components (badges, buttons, icons). For complex state management, combine them with vanilla JS or a framework.",
    },

    {
      no: 16,
      name: "HTML Internationalisation (i18n)",
      difficulty: "Advanced",
      duration: "12 min",
      xp: 150,
      summary: "Build web pages that work correctly for users across different languages and cultures.",
      body: `Internationalisation (i18n) in HTML covers language declarations, text directionality, character encoding, and locale-aware elements. The lang attribute on <html> is the most important — it affects screen reader pronunciation, search engine localisation, CSS :lang() selectors, and browser spelling. The dir attribute handles RTL languages like Arabic and Hebrew. The <bdi> and <bdo> elements manage bidirectional text.`,
      uses: [
        "Multilingual websites: serving content in Arabic, Hindi, Japanese.",
        "RTL support: mirroring layouts for Arabic and Hebrew readers.",
        "Correct screen reader pronunciation by language.",
        "Locale-aware date and number formats with Intl API.",
      ],
      keyFeatures: [
        "lang='en', lang='ar', lang='hi': ISO 639-1 language codes.",
        "lang='en-IN', lang='zh-TW': language + region subtag.",
        "dir='ltr' / dir='rtl' / dir='auto': text direction.",
        "<bdi>: bidirectional isolate — protects surrounding text direction.",
        "<bdo dir='rtl'>: overrides text direction for a span.",
        "hreflang on <link>: alternate language versions for SEO.",
        "charset='UTF-8': supports all Unicode characters.",
        "translate='no': mark content browsers should not auto-translate.",
      ],
      examples: [
        {
          title: "Language and direction",
          code: `<!-- English (LTR) page -->\n<html lang="en" dir="ltr">\n\n<!-- Arabic (RTL) page -->\n<html lang="ar" dir="rtl">\n\n<!-- Hindi -->\n<html lang="hi">\n\n<!-- Mixed content on one page -->\n<p>The word for peace in Arabic is <span lang="ar" dir="rtl">سلام</span>.</p>\n\n<!-- translate=no: don't translate code snippets -->\n<code translate="no">console.log("Hello")</code>`,
          body: "Setting lang correctly affects how browsers, screen readers, and translation tools handle the page.",
        },
        {
          title: "Alternate language versions (SEO)",
          code: `<head>\n  <!-- Tell search engines about language variants -->\n  <link rel="alternate" hreflang="en" href="https://codify.app/en/html">\n  <link rel="alternate" hreflang="hi" href="https://codify.app/hi/html">\n  <link rel="alternate" hreflang="ar" href="https://codify.app/ar/html">\n\n  <!-- x-default: page to show when no language matches -->\n  <link rel="alternate" hreflang="x-default" href="https://codify.app/html">\n</head>`,
          body: "hreflang prevents duplicate content penalties and helps search engines serve the right language version to users.",
        },
        {
          title: "BDI for user-generated content",
          code: `<!-- Without bdi: username could flip direction of surrounding text -->\n<p>Posted by <bdi>مرحبا123</bdi>: Great tutorial!</p>\n<!-- bdi isolates the username so its direction\n     doesn't affect "Posted by" or ": Great tutorial!" -->\n\n<!-- bdo: explicitly override direction -->\n<p>This text reads right to left: <bdo dir="rtl">Hello World</bdo></p>\n<!-- Renders as: dlroW olleH -->`,
          body: "<bdi> is critical for user-generated content where you don't control the text direction. Without it, RTL usernames can flip your UI layout.",
        },
      ],
      tip: "Set lang on the <html> element for every page. It's free, it helps millions of users, and Google rewards correctly localised pages.",
    },

    {
      no: 17,
      name: "HTML Microdata & Structured Data",
      difficulty: "Advanced",
      duration: "14 min",
      xp: 160,
      summary: "Annotate your HTML with structured data so search engines display rich results for your content.",
      body: `Structured data tells search engines exactly what your page content means — not just that it exists, but what it is. Google uses Schema.org vocabulary in JSON-LD (recommended), Microdata, or RDFa format to power rich results: star ratings, FAQ dropdowns, product prices, breadcrumbs, event cards, and recipe snippets in search results. Rich results dramatically improve click-through rates.`,
      uses: [
        "Products: show price, availability, rating in Google Search.",
        "Recipes: ingredients, cooking time, nutrition facts.",
        "Events: dates, location, ticket links.",
        "FAQ pages: challenges expand directly in search results.",
        "Articles: author, publish date, breadcrumbs in SERP.",
      ],
      keyFeatures: [
        "JSON-LD: recommended by Google — clean, separate from HTML.",
        "Schema.org: universal vocabulary for structured data types.",
        "Microdata: itemscope, itemtype, itemprop inline attributes.",
        "@type: the Schema type (Product, Article, FAQPage, Event).",
        "@context: always 'https://schema.org'.",
        "breadcrumb: BreadcrumbList with ListItem positions.",
        "Test with Google's Rich Results Test tool.",
        "Valid structured data ≠ guaranteed rich result — Google chooses.",
      ],
      examples: [
        {
          title: "JSON-LD for a Course page",
          code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Course",\n  "name": "Complete HTML Course",\n  "description": "Master HTML from beginner to advanced in 22 chapters.",\n  "provider": {\n    "@type": "Organization",\n    "name": "Codify",\n    "url": "https://codify.app"\n  },\n  "educationalLevel": "Beginner",\n  "teaches": ["HTML5", "Semantic HTML", "Accessibility"],\n  "hasCourseInstance": {\n    "@type": "CourseInstance",\n    "courseMode": "online",\n    "inLanguage": "en"\n  }\n}\n</script>`,
          body: "JSON-LD goes in the <head>. It's invisible to users but read by Google, Bing, and other search engines.",
        },
        {
          title: "FAQ structured data",
          code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Is HTML a programming language?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "No. HTML is a markup language that describes structure, not logic."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "How long does it take to learn HTML?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "The basics can be learned in a weekend. Mastery takes a few weeks of practice."\n      }\n    }\n  ]\n}\n</script>`,
          body: "FAQPage schema can display as expandable Q&A directly in Google Search results, increasing visibility dramatically.",
        },
        {
          title: "Breadcrumb structured data",
          code: `<!-- Visible breadcrumb -->\n<nav aria-label="Breadcrumb">\n  <ol>\n    <li><a href="/">Home</a></li>\n    <li><a href="/courses">Courses</a></li>\n    <li><span aria-current="page">HTML Course</span></li>\n  </ol>\n</nav>\n\n<!-- Structured data for search engines -->\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "BreadcrumbList",\n  "itemListElement": [\n    { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://codify.app/" },\n    { "@type": "ListItem", "position": 2, "name": "Courses", "item": "https://codify.app/courses" },\n    { "@type": "ListItem", "position": 3, "name": "HTML Course" }\n  ]\n}\n</script>`,
          body: "Breadcrumbs appear in Google Search below the page URL. They help users understand site structure and improve CTR.",
        },
      ],
      tip: "Test every structured data implementation at search.google.com/test/rich-results before publishing. Invalid JSON-LD silently fails.",
    },

    // ── EXPERT (Ch 18–22) ─────────────────────────────────────────────────────

    {
      no: 18,
      name: "HTML Security Best Practices",
      difficulty: "Expert",
      duration: "14 min",
      xp: 180,
      summary: "Protect your HTML pages from common web attacks including XSS, clickjacking, and CSRF.",
      body: `HTML itself is a vector for security vulnerabilities. Cross-Site Scripting (XSS) occurs when untrusted input is injected as HTML. Clickjacking embeds your page in an invisible iframe and tricks users into clicking. Content Security Policy (CSP) mitigates both. The sandbox attribute on iframes, rel='noopener' on links, and never using innerHTML with user data are the first lines of defence.`,
      uses: [
        "Preventing XSS attacks on user-generated content platforms.",
        "Stopping clickjacking on banking and authentication pages.",
        "Restricting third-party scripts with Content Security Policy.",
        "Secure form submissions and CSRF protection.",
      ],
      keyFeatures: [
        "Never use innerHTML with untrusted user data — use textContent.",
        "Content Security Policy via <meta http-equiv='Content-Security-Policy'>.",
        "X-Frame-Options equivalent: frame-ancestors in CSP.",
        "iframe sandbox: restricts scripts, forms, top navigation.",
        "rel='noopener noreferrer' on all target='_blank' links.",
        "autocomplete='off' on sensitive fields (CVV, OTP).",
        "Subresource Integrity (integrity + crossorigin) for CDN scripts.",
        "HTTPS: always serve pages over TLS — not optional in 2024.",
      ],
      examples: [
        {
          title: "XSS prevention",
          code: `<!-- DANGEROUS: never do this with user input -->\n<script>\n  // User submitted: <img src=x onerror=stealCookies()>\n  const userInput = getFromDatabase();\n  document.getElementById("output").innerHTML = userInput; // XSS!\n</script>\n\n<!-- SAFE: use textContent for plain text -->\n<script>\n  document.getElementById("output").textContent = userInput; // safe\n</script>\n\n<!-- SAFE: sanitise before using innerHTML -->\n<script>\n  // Using a library like DOMPurify\n  const clean = DOMPurify.sanitize(userInput);\n  document.getElementById("output").innerHTML = clean;\n</script>`,
          body: "textContent escapes all HTML. If you must use innerHTML, sanitise with DOMPurify first. Never trust raw user input.",
        },
        {
          title: "Content Security Policy",
          code: `<head>\n  <!-- Allow scripts only from own origin + trusted CDN -->\n  <meta\n    http-equiv="Content-Security-Policy"\n    content="\n      default-src 'self';\n      script-src 'self' https://cdnjs.cloudflare.com;\n      style-src 'self' https://fonts.googleapis.com;\n      img-src 'self' data: https:;\n      font-src https://fonts.gstatic.com;\n      frame-ancestors 'none';\n      upgrade-insecure-requests;\n    "\n  >\n</head>`,
          body: "frame-ancestors 'none' prevents clickjacking. upgrade-insecure-requests promotes HTTP to HTTPS automatically.",
        },
        {
          title: "Subresource Integrity",
          code: `<!-- Verify CDN resources haven't been tampered with -->\n<link\n  rel="stylesheet"\n  href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"\n  integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXholtpLxSBTJFk3XE80b7rRBkh2K+62g=="\n  crossorigin="anonymous"\n>\n\n<script\n  src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"\n  integrity="sha512-WFN04846sdKMIP5LKNphMaWzU7YpMyCU245etK3g/2ARYbPK9Ub18eG+ljU96qKRCWh+quCY7yefSmlkQw1ANQ=="\n  crossorigin="anonymous"\n></script>`,
          body: "The browser hashes the file and compares to integrity value. If it doesn't match (CDN compromised), the resource is blocked.",
        },
      ],
      tip: "The golden rule: treat ALL user input as hostile. Escape it before displaying, validate before processing, and sanitise before storing.",
    },

    {
      no: 19,
      name: "HTML5 APIs — Drag & Drop, Geolocation, Notifications",
      difficulty: "Expert",
      duration: "14 min",
      xp: 170,
      summary: "Leverage powerful browser APIs accessible directly from HTML and JavaScript.",
      body: `HTML5 introduced a rich set of browser APIs that provide native capabilities without plugins. The Drag and Drop API enables drag interactions with the draggable attribute. The Geolocation API accesses device location. The Notifications API shows OS-level notifications. The Clipboard API reads and writes the clipboard. The Fullscreen API puts any element into fullscreen. These APIs make web apps feel native.`,
      uses: [
        "Drag-and-drop file uploads and kanban boards.",
        "Location-based features: nearby stores, weather, maps.",
        "Push notification re-engagement for web apps.",
        "Copy-to-clipboard buttons.",
        "Fullscreen video players and presentations.",
      ],
      keyFeatures: [
        "draggable='true': marks element as draggable.",
        "dragstart, dragover, drop events: drag lifecycle.",
        "dataTransfer: passes data between drag source and drop target.",
        "navigator.geolocation.getCurrentPosition(): one-time location.",
        "watchPosition(): continuous location updates.",
        "Notification.requestPermission(): must be user-triggered.",
        "navigator.clipboard.writeText(): async clipboard write.",
        "document.documentElement.requestFullscreen(): fullscreen API.",
      ],
      examples: [
        {
          title: "Drag and drop",
          code: `<div id="source" draggable="true"\n     style="padding:1rem;background:#374151;color:white;cursor:grab;border-radius:8px;width:fit-content">\n  Drag me!\n</div>\n\n<div id="dropzone"\n     style="margin-top:1rem;padding:2rem;border:2px dashed #6b7280;border-radius:8px;min-height:100px">\n  Drop here\n</div>\n\n<script>\n  const src = document.getElementById("source");\n  const zone = document.getElementById("dropzone");\n\n  src.addEventListener("dragstart", e => {\n    e.dataTransfer.setData("text/plain", "dragged-item");\n    src.style.opacity = "0.5";\n  });\n\n  src.addEventListener("dragend", () => src.style.opacity = "1");\n\n  zone.addEventListener("dragover", e => {\n    e.preventDefault(); // required to allow drop\n    zone.style.borderColor = "#eab308";\n  });\n\n  zone.addEventListener("dragleave", () => zone.style.borderColor = "#6b7280");\n\n  zone.addEventListener("drop", e => {\n    e.preventDefault();\n    const data = e.dataTransfer.getData("text/plain");\n    zone.appendChild(src);\n    zone.style.borderColor = "#6b7280";\n  });\n</script>`,
          body: "dragover MUST call e.preventDefault() — that's what signals the browser that this zone accepts drops.",
        },
        {
          title: "Geolocation",
          code: `<button id="locate-btn">Find My Location</button>\n<p id="location-output">Click button to get location.</p>\n\n<script>\n  document.getElementById("locate-btn").addEventListener("click", () => {\n    if (!navigator.geolocation) {\n      document.getElementById("location-output").textContent =\n        "Geolocation not supported.";\n      return;\n    }\n\n    navigator.geolocation.getCurrentPosition(\n      (pos) => {\n        const { latitude, longitude, accuracy } = pos.coords;\n        document.getElementById("location-output").textContent =\n          \`Lat: \${latitude.toFixed(4)}, Lon: \${longitude.toFixed(4)} (±\${accuracy.toFixed(0)}m)\`;\n      },\n      (err) => {\n        document.getElementById("location-output").textContent =\n          \`Error: \${err.message}\`;\n      },\n      { enableHighAccuracy: true, timeout: 10000 }\n    );\n  });\n</script>`,
          body: "Geolocation requires user permission and HTTPS. Always handle the error callback — users often deny or are indoors.",
        },
        {
          title: "Copy to clipboard",
          code: `<button id="copy-btn" data-copy="npm install codify-cli">\n  Copy install command\n</button>\n\n<script>\n  document.getElementById("copy-btn").addEventListener("click", async (e) => {\n    const text = e.target.dataset.copy;\n    try {\n      await navigator.clipboard.writeText(text);\n      e.target.textContent = "Copied!";\n      setTimeout(() => e.target.textContent = "Copy install command", 2000);\n    } catch (err) {\n      console.error("Clipboard failed:", err);\n    }\n  });\n</script>`,
          body: "clipboard.writeText() requires a user gesture (click). It's async and returns a Promise. Always catch errors.",
        },
      ],
      tip: "Always check API support with 'if (navigator.geolocation)' before using. Not all browsers support all HTML5 APIs.",
    },

    {
      no: 20,
      name: "Progressive Enhancement & Graceful Degradation",
      difficulty: "Expert",
      duration: "12 min",
      xp: 160,
      summary: "Build web pages that work for everyone — from modern browsers to old ones, fast connections to slow.",
      body: `Progressive enhancement builds from a solid HTML base that works everywhere, then layers CSS styling and JavaScript behaviour for capable browsers. Graceful degradation is the inverse — build for modern browsers, then ensure it doesn't catastrophically fail on older ones. HTML's fault tolerance (browsers ignore unknown tags) is itself progressive enhancement built into the language. Feature detection with CSS @supports and JS 'in' checks are the tools.`,
      uses: [
        "Government and healthcare websites that must work on all devices.",
        "Global apps where users may have old Android devices.",
        "E-commerce: checkout must work even when JS fails.",
        "Newsroom: article must be readable even without CSS.",
      ],
      keyFeatures: [
        "HTML is fault-tolerant: unknown tags are skipped, not errors.",
        "<noscript>: content shown when JavaScript is disabled.",
        "CSS @supports: apply styles only when a property is supported.",
        "Feature detection over browser detection.",
        "Native HTML controls degrade better than JS-heavy custom ones.",
        "Semantic HTML first: content works before styling.",
        "loading='lazy' is ignored by old browsers — not an error.",
        "type='module' scripts: ignored by non-supporting browsers.",
      ],
      examples: [
        {
          title: "noscript fallback",
          code: `<head>\n  <noscript>\n    <style>.js-only { display: none; }</style>\n  </noscript>\n</head>\n\n<body>\n  <!-- Enhanced JS version -->\n  <div class="js-only" id="interactive-chart"></div>\n\n  <!-- Fallback for no-JS users -->\n  <noscript>\n    <table>\n      <caption>Monthly Sales Data</caption>\n      <thead><tr><th>Month</th><th>Sales</th></tr></thead>\n      <tbody>\n        <tr><td>January</td><td>$10,000</td></tr>\n        <tr><td>February</td><td>$15,000</td></tr>\n      </tbody>\n    </table>\n  </noscript>\n</body>`,
          body: "<noscript> provides a fallback that only shows when JS is disabled. The table replaces the interactive chart.",
        },
        {
          title: "Feature detection patterns",
          code: `<!-- input type fallback: unknown types show as text -->\n<input type="date">\n<!-- If browser doesn't support type=date, shows a text input. No error. -->\n\n<!-- picture/source with img fallback -->\n<picture>\n  <source type="image/avif" srcset="image.avif">\n  <source type="image/webp" srcset="image.webp">\n  <img src="image.jpg" alt="Fallback JPEG">\n  <!-- Oldest browsers only see the img tag -->\n</picture>\n\n<!-- video with fallback -->\n<video controls>\n  <source src="video.webm" type="video/webm">\n  <source src="video.mp4" type="video/mp4">\n  <p>Your browser can't play video. <a href="video.mp4">Download it</a>.</p>\n</video>`,
          body: "HTML's fallback model means progressive enhancement is often free — browsers skip what they don't understand.",
        },
        {
          title: "module/nomodule for JS",
          code: `<!-- Modern browsers: use ES modules -->\n<script type="module" src="app-modern.js"></script>\n\n<!-- Legacy browsers: use bundled fallback\n     (modern browsers ignore nomodule) -->\n<script nomodule src="app-legacy.js"></script>\n\n<!-- Result:\n  Modern browser: loads app-modern.js only\n  IE11/old Edge:  loads app-legacy.js only\n  Both get working JS with zero duplication\n-->`,
          body: "module/nomodule is the cleanest way to serve modern JS to modern browsers and a polyfilled bundle to old ones.",
        },
      ],
      tip: "Build mobile-first, then enhance. A page that works on a 2G connection and old Android will work everywhere else too.",
    },

    {
      no: 21,
      name: "HTML Email Fundamentals",
      difficulty: "Expert",
      duration: "12 min",
      xp: 160,
      summary: "Understand the unique constraints of HTML email and how to build emails that render consistently.",
      body: `HTML email is its own world with brutal constraints. Email clients (Gmail, Outlook, Apple Mail) each have different rendering engines — Outlook still uses Word's renderer. Most CSS properties don't work. Many email clients block JavaScript entirely. Tables are still necessary for layout in email (unlike web pages). Inline styles are required for most properties. This chapter covers the essential techniques for building reliable HTML emails.`,
      uses: [
        "Transactional emails: order confirmations, receipts, password resets.",
        "Marketing newsletters: promotional campaigns, product updates.",
        "Onboarding email sequences.",
        "System notifications from apps.",
      ],
      keyFeatures: [
        "Tables for layout: still required for Outlook compatibility.",
        "Inline styles: most email clients strip <style> blocks.",
        "Max-width: 600px — standard email width.",
        "Use VML for rounded corners and background images in Outlook.",
        "Bulletproof buttons: table-based CTAs that work everywhere.",
        "alt text on all images: many clients block images by default.",
        "Avoid: JavaScript, CSS position, flexbox, grid, most animations.",
        "Test with Litmus or Email on Acid across 90+ clients.",
      ],
      examples: [
        {
          title: "Email base structure",
          code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n  <title>Email Subject</title>\n  <!--[if mso]>\n  <noscript><xml><o:OfficeDocumentSettings>\n    <o:PixelsPerInch>96</o:PixelsPerInch>\n  </o:OfficeDocumentSettings></xml></noscript>\n  <![endif]-->\n</head>\n<body style="margin:0;padding:0;background:#f9fafb;">\n  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">\n    <tr>\n      <td align="center">\n        <!-- Email wrapper: max 600px -->\n        <table role="presentation" width="600" cellpadding="0" cellspacing="0"\n               style="max-width:600px;width:100%;">\n          <tr>\n            <td style="padding:24px;background:#ffffff;">\n              <h1 style="margin:0;font-family:Arial,sans-serif;font-size:24px;color:#111827;">\n                Hello from Codify!\n              </h1>\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>`,
          body: "role='presentation' on layout tables removes them from accessibility tree. cellpadding=0 cellspacing=0 remove unwanted gaps.",
        },
        {
          title: "Bulletproof CTA button",
          code: `<!-- Table-based button that works in ALL email clients -->\n<table role="presentation" cellpadding="0" cellspacing="0">\n  <tr>\n    <td align="center"\n        style="border-radius:6px;background:#eab308;">\n      <!--[if mso]>\n      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"\n        arcsize="10%"\n        strokecolor="#eab308"\n        fillcolor="#eab308">\n        <v:textbox inset="0,0,0,0">\n      <![endif]-->\n      <a href="https://codify.app/start"\n         target="_blank"\n         style="display:inline-block;padding:12px 28px;\n                color:#111827;text-decoration:none;\n                font-family:Arial,sans-serif;font-weight:bold;\n                font-size:16px;border-radius:6px;">\n        Start Learning Free\n      </a>\n      <!--[if mso]></v:textbox></v:roundrect><![endif]-->\n    </td>\n  </tr>\n</table>`,
          body: "VML conditional comments make rounded buttons work in Outlook. The <a> tag inside is the actual button for other clients.",
        },
        {
          title: "Responsive email media query",
          code: `<head>\n  <style>\n    /* Works in clients that support <style> blocks */\n    @media only screen and (max-width: 600px) {\n      .wrapper { width: 100% !important; }\n      .stack   { display: block !important; width: 100% !important; }\n      .hide    { display: none !important; }\n      .center  { text-align: center !important; }\n      h1       { font-size: 22px !important; }\n    }\n  </style>\n</head>`,
          body: "Gmail supports media queries in <style> in the <head>. Outlook doesn't — it needs table-based responsive layouts instead.",
        },
      ],
      tip: "Always test HTML email in real clients, not just the browser. Litmus (paid) or Mail Tester (free) catches Outlook-specific bugs before they reach users.",
    },

    {
      no: 22,
      name: "HTML — The Complete Review & Project",
      difficulty: "Expert",
      duration: "20 min",
      xp: 200,
      summary: "Consolidate everything learned by reviewing key concepts and building a complete HTML document from scratch.",
      body: `This final chapter reviews the full HTML learning journey and outlines how to build a complete, production-quality HTML document. A well-crafted HTML file is semantic, accessible, performant, SEO-optimised, and secure. The checklist below covers every topic from the course. The project exercise builds a complete course landing page applying all concepts.`,
      uses: [
        "Revision of all 21 chapters of core HTML knowledge.",
        "Production checklist before shipping any HTML page.",
        "Portfolio project: demonstrating full HTML mastery.",
      ],
      keyFeatures: [
        "Structure: DOCTYPE, html[lang], head, body.",
        "Head: charset, viewport, title, description, canonical, OG.",
        "Semantic: header, nav, main, article, section, aside, footer.",
        "Accessibility: labels, alt, ARIA, keyboard nav, colour contrast.",
        "Performance: defer scripts, lazy images, explicit dimensions.",
        "Security: textContent over innerHTML, CSP, SRI on CDN.",
        "SEO: heading hierarchy, structured data, hreflang.",
        "Forms: label/input pairing, validation, novalidate + JS.",
      ],
      examples: [
        {
          title: "Production HTML checklist",
          code: `<!--\n  PRODUCTION HTML CHECKLIST\n  ========================\n\n  HEAD\n  [ ] <!DOCTYPE html>\n  [ ] <html lang="en">\n  [ ] <meta charset="UTF-8">\n  [ ] <meta name="viewport" ...>\n  [ ] <title> — under 60 chars, unique per page\n  [ ] <meta name="description"> — 150-160 chars\n  [ ] <link rel="canonical">\n  [ ] Favicon (SVG preferred)\n  [ ] Open Graph tags\n  [ ] Scripts use defer or type=module\n  [ ] Critical CSS inlined\n\n  BODY\n  [ ] One <h1> per page\n  [ ] Heading hierarchy: h1→h2→h3 (no skips)\n  [ ] <main>, <nav>, <header>, <footer> used\n  [ ] All images have alt text\n  [ ] All form inputs have associated <label>\n  [ ] All interactive elements keyboard-focusable\n  [ ] Colour contrast ≥ 4.5:1 for normal text\n  [ ] No inline event handlers (onclick="...")\n  [ ] textContent used (not innerHTML) for user data\n\n  PERFORMANCE\n  [ ] Images have width + height attributes\n  [ ] Images use loading="lazy" (except above fold)\n  [ ] Fonts use font-display: swap\n  [ ] No render-blocking scripts\n-->`,
          body: "Run through this checklist before every launch. Each item prevents a real, common bug.",
        },
        {
          title: "Complete course landing page (skeleton)",
          code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>HTML Course — Learn for Free | Codify</title>\n  <meta name="description" content="Master HTML in 22 chapters. Free and beginner-friendly.">\n  <link rel="canonical" href="https://codify.app/courses/html">\n  <meta property="og:title" content="HTML Course | Codify">\n  <meta property="og:image" content="https://codify.app/og/html.png">\n  <link rel="icon" href="/icon.svg" type="image/svg+xml">\n  <link rel="stylesheet" href="styles.css">\n  <script type="module" defer src="app.js"></script>\n</head>\n<body>\n  <a href="#main" class="skip-link">Skip to content</a>\n\n  <header>\n    <a href="/" aria-label="Codify home"><img src="logo.svg" alt="Codify" width="120" height="40"></a>\n    <nav aria-label="Main navigation">\n      <ul>\n        <li><a href="/courses" aria-current="page">Courses</a></li>\n        <li><a href="/about">About</a></li>\n      </ul>\n    </nav>\n  </header>\n\n  <main id="main">\n    <section aria-labelledby="hero-heading">\n      <h1 id="hero-heading">Learn HTML for Free</h1>\n      <p>22 bite-sized chapters. Beginner to Expert.</p>\n      <a href="#start" class="btn-primary">Start Learning</a>\n    </section>\n\n    <section aria-labelledby="chapters-heading">\n      <h2 id="chapters-heading">Course Chapters</h2>\n      <ol id="chapter-list">\n        <!-- Dynamically populated by JS -->\n      </ol>\n    </section>\n  </main>\n\n  <footer>\n    <p>&copy; <time datetime="2024">2024</time> Codify.</p>\n  </footer>\n</body>\n</html>`,
          body: "This skeleton applies every concept from the course: skip link, semantic structure, accessible nav, deferred scripts, and complete head metadata.",
        },
        {
          title: "Structured data for the landing page",
          code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Course",\n  "name": "Complete HTML Course",\n  "description": "Master HTML in 22 chapters, from beginner to expert.",\n  "url": "https://codify.app/courses/html",\n  "provider": { "@type": "Organization", "name": "Codify" },\n  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },\n  "hasCourseInstance": {\n    "@type": "CourseInstance",\n    "courseMode": "online",\n    "inLanguage": "en",\n    "instructor": {\n      "@type": "Person",\n      "name": "Codify Team"\n    }\n  }\n}\n</script>`,
          body: "Courses with free offers and structured data can appear as rich results in Google Education search.",
        },
      ],
      tip: "The best HTML is the simplest HTML that does the job. Every unnecessary tag, attribute, and wrapper is a bug waiting to happen.",
    },

  ],
};


// ─── data/cssCourse.js ────────────────────────────────────────────────────────

export const cssCourse = {
  language: "CSS",
  accentColor: "#663399",
  accentLight: "#a855f7",
  totalChapters: 24,
  chapters: [

    // ── BEGINNER (Ch 1–7) ──────────────────────────────────────────────────────

    {
      no: 1,
      name: "Introduction to CSS",
      difficulty: "Beginner",
      duration: "10 min",
      xp: 100,
      summary: "Discover what CSS is, how it connects to HTML, and the three ways to write it.",
      body: `CSS (Cascading Style Sheets) is the language that controls the visual presentation of HTML documents. While HTML defines structure and content, CSS defines colour, layout, typography, spacing, animations, and responsiveness. Created by Håkon Wium Lie in 1994, CSS has evolved from simple text styling into a powerful layout and animation engine. The "Cascading" in CSS refers to how multiple style rules combine and override each other following a defined priority order.`,
      uses: [
        "Styling text: fonts, colours, sizes, spacing.",
        "Page layout: positioning, flexbox, grid.",
        "Responsive design: adapting layouts for any screen size.",
        "Animations and transitions: hover effects, loading spinners.",
        "Theming: dark mode, brand consistency across pages.",
      ],
      keyFeatures: [
        "Three ways to add CSS: inline, internal <style>, external .css file.",
        "Selector targets an HTML element; declaration sets a property:value.",
        "Cascade: when rules conflict, specificity and order determine the winner.",
        "Inheritance: some properties (font, color) inherit from parent elements.",
        "CSS is declarative — you describe what you want, not how to calculate it.",
        "Browser DevTools: inspect and live-edit CSS instantly.",
      ],
      examples: [
        {
          title: "Three ways to add CSS",
          code: `<!-- 1. Inline style — highest specificity, avoid for maintainability -->\n<p style="color: red; font-size: 18px;">Inline styled paragraph.</p>\n\n<!-- 2. Internal style block — good for single pages -->\n<head>\n  <style>\n    h1 { color: #663399; font-family: sans-serif; }\n    p  { line-height: 1.6; }\n  </style>\n</head>\n\n<!-- 3. External stylesheet — best practice for real projects -->\n<head>\n  <link rel="stylesheet" href="styles.css">\n</head>`,
          body: "External stylesheets are the standard. They separate concerns, are cacheable, and apply to multiple pages.",
        },
        {
          title: "CSS rule anatomy",
          code: `/* selector { property: value; } */\n\nh1 {\n  color: #663399;     /* text colour */\n  font-size: 2rem;    /* 2x root font size */\n  font-weight: 700;   /* bold */\n  margin-bottom: 1rem;\n}\n\n/* Multiple selectors, one rule */\nh1, h2, h3 {\n  font-family: 'Inter', sans-serif;\n  line-height: 1.2;\n}\n\n/* Descendant selector */\narticle p {\n  color: #374151;\n  line-height: 1.7;\n}`,
          body: "Curly braces wrap declarations. Each declaration is property: value followed by a semicolon.",
        },
        {
          title: "CSS comments and formatting",
          code: `/* ── Section heading ───── */\n\n/* Single line comment */\n\n/*\n  Multi-line comment.\n  Useful for documenting sections.\n*/\n\n/* Best practice: group related rules */\n/* Typography */\nbody {\n  font-family: system-ui, sans-serif;\n  font-size: 16px;\n  line-height: 1.5;\n}\n\n/* Colours */\n:root {\n  --color-primary: #663399;\n  --color-text: #111827;\n}`,
          body: "CSS comments use /* */. Organise CSS into logical sections with comment headings for maintainability.",
        },
      ],
      tip: "Always use an external stylesheet for real projects. Inline styles create specificity nightmares and can't be reused.",
    },

    {
      no: 2,
      name: "Selectors & Specificity",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 120,
      summary: "Target exactly the right elements with CSS selectors and understand why some rules override others.",
      body: `Selectors are patterns that match HTML elements. CSS has a rich selector system: type, class, ID, attribute, pseudo-class, and pseudo-element selectors — plus combinators that express relationships. Specificity is the algorithm browsers use to decide which rule wins when multiple rules target the same element. Understanding specificity ends most CSS debugging sessions.`,
      uses: [
        "Targeting specific elements without adding unnecessary classes.",
        "Styling form states: :hover, :focus, :checked.",
        "First/last child patterns: alternating table rows, last item without margin.",
        "Attribute selectors: styling external links, inputs by type.",
      ],
      keyFeatures: [
        "Type selector: p — specificity (0,0,1).",
        "Class selector: .card — specificity (0,1,0).",
        "ID selector: #header — specificity (1,0,0). Avoid for styling.",
        "Specificity order: inline > ID > class/attr/pseudo-class > type.",
        "!important: overrides everything — use sparingly.",
        "Descendant (space), child (>), adjacent sibling (+), general sibling (~).",
        ":is(), :where(), :not(): logical pseudo-classes.",
        ":nth-child(n): pattern-based selection.",
      ],
      examples: [
        {
          title: "Selector types",
          code: `/* Type */\np { color: #374151; }\n\n/* Class — most used */\n.btn { padding: 8px 16px; border-radius: 6px; }\n\n/* Multiple classes */\n.btn.btn-primary { background: #663399; color: white; }\n\n/* ID (avoid for styling) */\n#hero { min-height: 100vh; }\n\n/* Attribute */\na[target="_blank"]::after { content: " ↗"; } /* marks external links */\ninput[type="email"]       { letter-spacing: 0.02em; }\n\n/* Pseudo-class */\nbtn:hover  { background: #7c3aed; }\nbtn:focus  { outline: 2px solid #663399; outline-offset: 2px; }\nbtn:active { transform: translateY(1px); }`,
          body: "Classes are the go-to for styling. IDs have high specificity making overrides difficult.",
        },
        {
          title: "Combinators",
          code: `/* Descendant: any p inside .article */\n.article p { line-height: 1.7; }\n\n/* Child: only direct li children of .nav */\n.nav > li { display: inline-block; }\n\n/* Adjacent sibling: h2 immediately followed by p */\nh2 + p { font-size: 1.1rem; color: #6b7280; }\n\n/* General sibling: all p after h2 in same parent */\nh2 ~ p { margin-left: 1rem; }\n\n/* :nth-child — zebra stripe table rows */\ntr:nth-child(even) { background: #f9fafb; }\ntr:nth-child(odd)  { background: #ffffff; }\n\n/* Last item — remove bottom margin */\n.list-item:last-child { margin-bottom: 0; }`,
          body: "Combinators express DOM relationships. :last-child removing margin is a classic pattern to avoid bottom spacing leaks.",
        },
        {
          title: "Specificity calculation",
          code: `/*\n  Specificity notation: (ID, Class, Type)\n\n  p               → (0, 0, 1)  lowest\n  .card           → (0, 1, 0)\n  p.card          → (0, 1, 1)\n  .nav .link      → (0, 2, 0)\n  #header         → (1, 0, 0)\n  #header .nav p  → (1, 1, 1)  higher\n  style=""        → inline — always wins (except !important)\n*/\n\n/* These both target the same <p class="text"> */\np.text { color: blue; }  /* (0,1,1) */\n.text  { color: red; }   /* (0,1,0) */\n/* blue wins — p.text has higher specificity */\n\n/* :where() has ZERO specificity — useful for base styles */\n:where(h1, h2, h3) { margin-top: 0; }`,
          body: ":where() is like :is() but adds zero specificity — perfect for reset/base styles that are easily overridden.",
        },
      ],
      tip: "Keep specificity low. Prefer classes over IDs. The more complex the selector, the harder it is to override — a maintenance nightmare.",
    },

    {
      no: 3,
      name: "Colours & Backgrounds",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 120,
      summary: "Apply colours with confidence using modern CSS colour formats, gradients, and background properties.",
      body: `CSS provides multiple colour formats: named colours (red), hex (#ff0000), RGB/RGBA, HSL/HSLA, and the modern oklch and color-mix(). Each has strengths — hex for design tokens, HSL for programmatic variations, oklch for perceptual uniformity. Backgrounds can be colours, images, gradients, or multiple stacked layers. CSS Custom Properties (variables) are the modern way to manage a colour system.`,
      uses: [
        "Brand colour consistency across components.",
        "Dark mode themes using CSS variables.",
        "Hero sections with gradient backgrounds.",
        "Glassmorphism and frosted effects.",
        "Overlays and semi-transparent backgrounds.",
      ],
      keyFeatures: [
        "hex: #rrggbb or #rgb shorthand — most common design format.",
        "rgb(r, g, b) / rgba(r, g, b, a) — alpha for opacity.",
        "hsl(hue, saturation%, lightness%) — intuitive for colour variations.",
        "oklch(): perceptually uniform — great for design systems.",
        "currentColor: inherits the text color property.",
        "background-image: url(), linear-gradient(), radial-gradient().",
        "background-size: cover | contain | px/% values.",
        "multiple backgrounds: stack comma-separated layers.",
      ],
      examples: [
        {
          title: "Colour formats",
          code: `/* Named colour */\np { color: tomato; }\n\n/* Hex (6 digit and 4 digit with alpha) */\nh1 { color: #663399; }\n.faded { color: #6633997a; } /* 7a = 48% opacity */\n\n/* RGB and RGBA */\n.overlay { background: rgba(0, 0, 0, 0.5); }\n\n/* HSL — great for variations */\n.primary     { background: hsl(270, 60%, 40%); }\n.primary-light { background: hsl(270, 60%, 70%); }  /* same hue, lighter */\n.primary-dark  { background: hsl(270, 60%, 20%); }  /* same hue, darker */\n\n/* Modern oklch */\n.vivid { color: oklch(60% 0.2 270); }`,
          body: "HSL makes colour variations trivial — just change the L value. oklch is even more perceptually uniform.",
        },
        {
          title: "Gradients",
          code: `/* Linear gradient */\n.hero {\n  background: linear-gradient(135deg, #663399, #a855f7);\n}\n\n/* Multi-stop gradient */\n.rainbow {\n  background: linear-gradient(\n    to right,\n    #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6\n  );\n}\n\n/* Radial gradient */\n.spotlight {\n  background: radial-gradient(circle at 50% 0%, #a855f720 0%, transparent 60%);\n}\n\n/* Conic gradient (pie charts, spinners) */\n.pie {\n  background: conic-gradient(\n    #663399 0% 40%,\n    #a855f7 40% 70%,\n    #e9d5ff 70% 100%\n  );\n  border-radius: 50%;\n}`,
          body: "conic-gradient is perfect for pie charts and loading spinners. Radial gradients with transparency create glow effects.",
        },
        {
          title: "Background properties",
          code: `.hero {\n  background-image: url('hero.webp');\n  background-size: cover;        /* fill the container */\n  background-position: center;   /* centre the image */\n  background-repeat: no-repeat;  /* don't tile */\n  background-attachment: fixed;  /* parallax effect */\n}\n\n/* Shorthand */\n.hero {\n  background: url('hero.webp') center/cover no-repeat;\n}\n\n/* Multiple backgrounds — overlay on image */\n.card {\n  background:\n    linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),\n    url('card-bg.jpg') center/cover;\n}`,
          body: "Multiple background layers stack front-to-back. The gradient overlay darkens the image for text legibility.",
        },
      ],
      tip: "Define your colour palette as CSS custom properties in :root. Changing one variable updates every usage across the site.",
    },

    {
      no: 4,
      name: "Typography & Fonts",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 120,
      summary: "Control fonts, sizing, spacing, and reading experience with CSS typography properties.",
      body: `Typography is one of the most impactful design decisions on a web page. CSS provides complete control over font family, size, weight, line height, letter spacing, text alignment, and decoration. Loading custom fonts via @font-face or Google Fonts expands beyond system fonts. The clamp() function enables fluid typography that scales smoothly between screen sizes.`,
      uses: [
        "Brand typography: consistent typefaces across a product.",
        "Reading experience: comfortable line length and line height for articles.",
        "Visual hierarchy: size contrast between headings and body text.",
        "Fluid typography: text that scales with viewport without breakpoints.",
      ],
      keyFeatures: [
        "font-family: specify font stack with fallbacks.",
        "font-size: rem preferred (relative to root, respects user preferences).",
        "font-weight: 100–900 or keywords (normal=400, bold=700).",
        "line-height: unitless value (1.5) recommended.",
        "letter-spacing: spacing between characters.",
        "text-transform: uppercase, lowercase, capitalize.",
        "@font-face: load custom fonts.",
        "clamp(min, preferred, max): fluid sizing.",
        "font-display: swap — show fallback while custom font loads.",
      ],
      examples: [
        {
          title: "Font stack and loading",
          code: `/* System font stack — no download, fast, native-looking */\nbody {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont,\n               'Segoe UI', Roboto, sans-serif;\n}\n\n/* Google Fonts — add <link> in HTML head first */\nbody {\n  font-family: 'Inter', system-ui, sans-serif;\n}\n\n/* @font-face — self-hosted custom font */\n@font-face {\n  font-family: 'Codify';\n  src:\n    url('/fonts/codify.woff2') format('woff2'),\n    url('/fonts/codify.woff')  format('woff');\n  font-weight: 400 700;   /* variable font: range */\n  font-style: normal;\n  font-display: swap;     /* prevents invisible text */\n}`,
          body: "Always list woff2 first — it's the modern, smaller format. font-display: swap prevents FOIT (flash of invisible text).",
        },
        {
          title: "Typography scale",
          code: `/* Type scale with CSS variables */\n:root {\n  --text-xs:   0.75rem;  /*  12px */\n  --text-sm:   0.875rem; /*  14px */\n  --text-base: 1rem;     /*  16px */\n  --text-lg:   1.125rem; /*  18px */\n  --text-xl:   1.25rem;  /*  20px */\n  --text-2xl:  1.5rem;   /*  24px */\n  --text-4xl:  2.25rem;  /*  36px */\n  --text-6xl:  3.75rem;  /*  60px */\n}\n\nbody { font-size: var(--text-base); line-height: 1.6; }\nh1   { font-size: var(--text-4xl);  line-height: 1.2; font-weight: 800; }\nh2   { font-size: var(--text-2xl);  line-height: 1.3; font-weight: 700; }\nsmall{ font-size: var(--text-sm); }`,
          body: "A type scale creates visual hierarchy. Define sizes as variables so changing the base (user zoom) scales everything.",
        },
        {
          title: "Fluid typography with clamp()",
          code: `/*\n  clamp(minimum, preferred, maximum)\n  preferred uses viewport units for fluid scaling\n*/\n\nh1 {\n  /* 1.75rem on small screens, scales to 3.5rem on wide */\n  font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);\n}\n\np {\n  font-size: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);\n  line-height: 1.7;\n  max-width: 65ch; /* optimal line length for reading */\n}\n\n/* Optical sizing for large headings */\n.display {\n  font-size: clamp(2.5rem, 6vw, 5rem);\n  letter-spacing: -0.02em; /* tighten at large sizes */\n  font-weight: 900;\n}`,
          body: "65ch is the optimal line length for readability (65 characters wide). clamp() eliminates most breakpoint-based font overrides.",
        },
      ],
      tip: "Set line-height without units (1.5, not 1.5rem). Unitless values scale with the element's font-size; rem values don't.",
    },

    {
      no: 5,
      name: "The Box Model",
      difficulty: "Beginner",
      duration: "14 min",
      xp: 130,
      summary: "Understand how every HTML element occupies space and how to control its size, padding, margin, and border.",
      body: `Every HTML element is a rectangular box. The CSS box model describes how the total size of this box is calculated: content → padding → border → margin. By default (content-box), width and height apply only to the content area — padding and border add to the total size. box-sizing: border-box makes width include padding and border, which is more intuitive and is used by virtually every modern project.`,
      uses: [
        "Controlling element sizing precisely.",
        "Creating consistent spacing between components.",
        "Understanding why elements are wider/taller than expected.",
        "Building card layouts with padding and borders.",
      ],
      keyFeatures: [
        "content: the actual text/image area.",
        "padding: space between content and border — transparent background shows through.",
        "border: line around the padding box.",
        "margin: space outside the border — always transparent.",
        "box-sizing: border-box — width includes padding and border.",
        "Margin collapse: vertical margins between siblings collapse to the larger value.",
        "outline: like border but doesn't affect layout — used for focus.",
        "overflow: visible | hidden | scroll | auto — clip or scroll overflow.",
      ],
      examples: [
        {
          title: "box-sizing: border-box",
          code: `/* Global reset — use this in every project */\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\n/* Without border-box: total width = 200 + 20+20 + 2+2 = 244px */\n.content-box {\n  box-sizing: content-box; /* default — confusing */\n  width: 200px;\n  padding: 20px;\n  border: 2px solid black;\n  /* total: 244px wide */\n}\n\n/* With border-box: total width = exactly 200px */\n.border-box {\n  box-sizing: border-box; /* intuitive */\n  width: 200px;\n  padding: 20px;\n  border: 2px solid black;\n  /* total: 200px wide — content shrinks to fit */\n}`,
          body: "border-box is so universally preferred that it's often called the 'universal box-sizing fix'. Add it to every project.",
        },
        {
          title: "Padding and margin shorthand",
          code: `/* All four sides */\n.card { padding: 16px; }\n\n/* Vertical | Horizontal */\n.card { padding: 16px 24px; }\n\n/* Top | Horizontal | Bottom */\n.card { padding: 8px 24px 16px; }\n\n/* Top | Right | Bottom | Left (clockwise) */\n.card { padding: 8px 16px 12px 20px; }\n\n/* Individual sides */\n.card {\n  padding-top: 8px;\n  padding-inline: 24px;    /* modern: left + right */\n  padding-block: 16px;     /* modern: top + bottom */\n}\n\n/* auto margin: centre a block element */\n.container {\n  max-width: 1200px;\n  margin-inline: auto;  /* centre horizontally */\n}`,
          body: "margin: 0 auto (or margin-inline: auto) centres a block element. It only works when the element has an explicit width.",
        },
        {
          title: "Margin collapse explained",
          code: `/*\n  When two vertical margins touch, they collapse into\n  the larger of the two. This is intentional behaviour.\n*/\n\n.box-a { margin-bottom: 32px; }\n.box-b { margin-top:    16px; }\n/* Gap between them: 32px (not 48px) */\n\n/* FIX 1: Use only one margin direction */\n.element + .element { margin-top: 24px; } /* consistent lobotomised owl */\n\n/* FIX 2: Use gap in flex/grid containers instead */\n.stack {\n  display: flex;\n  flex-direction: column;\n  gap: 24px; /* gap NEVER collapses */\n}\n\n/* FIX 3: padding or border on parent prevents collapse */`,
          body: "Margin collapse only happens vertically and only between siblings or parent/first-child. Gap in flex/grid never collapses.",
        },
      ],
      tip: "Always start a project with box-sizing: border-box on *. It prevents the most common 'why is this wider than I set?' confusion.",
    },

    {
      no: 6,
      name: "Display, Position & Z-index",
      difficulty: "Beginner",
      duration: "16 min",
      xp: 130,
      summary: "Control where elements appear and how they flow on the page with display and position properties.",
      body: `The display property determines how an element participates in the layout flow — block (full width, new line), inline (flows with text), inline-block (inline flow with block sizing), or modern values like flex and grid. The position property removes elements from the normal flow: relative shifts them from their natural position, absolute positions relative to the nearest positioned ancestor, fixed is viewport-relative, and sticky is a hybrid.`,
      uses: [
        "Sticky navigation that stays at the top while scrolling.",
        "Dropdown menus using absolute positioning.",
        "Modal overlays using fixed positioning.",
        "Centering elements with absolute + transform.",
        "Z-index layering: tooltips above cards above page.",
      ],
      keyFeatures: [
        "display: block, inline, inline-block, none, flex, grid.",
        "position: static (default), relative, absolute, fixed, sticky.",
        "Positioned elements: relative, absolute, fixed, sticky.",
        "Absolute: positions relative to nearest positioned (non-static) ancestor.",
        "Fixed: relative to viewport — stays on screen while scrolling.",
        "Sticky: like relative until scroll threshold, then fixed.",
        "z-index: only works on positioned elements (non-static).",
        "Stacking context: z-index is local to its stacking context.",
      ],
      examples: [
        {
          title: "Position patterns",
          code: `/* Sticky header */\nheader {\n  position: sticky;\n  top: 0;        /* sticks when it reaches the top */\n  z-index: 100;\n  background: white;\n}\n\n/* Badge overlaid on a card */\n.card { position: relative; }  /* establishes containing block */\n\n.badge {\n  position: absolute;\n  top: -8px;\n  right: -8px;\n  background: #ef4444;\n  border-radius: 999px;\n}\n\n/* Modal overlay */\n.overlay {\n  position: fixed;\n  inset: 0;    /* shorthand for top/right/bottom/left: 0 */\n  background: rgba(0, 0, 0, 0.6);\n  z-index: 999;\n}`,
          body: "inset: 0 is shorthand for all four offset properties at once. Relative on the parent is required for absolute children.",
        },
        {
          title: "Centering with absolute + transform",
          code: `/* Classic: absolute centre in container */\n.container {\n  position: relative;\n  width: 400px;\n  height: 300px;\n}\n\n.centered {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  /* translate moves it back by half its own size */\n}\n\n/* Modern: use flexbox instead */\n.container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n/* Or CSS grid */\n.container {\n  display: grid;\n  place-items: center;\n}`,
          body: "For new code, grid: place-items: center is the cleanest centering solution. The absolute+transform trick is useful for overlays.",
        },
        {
          title: "Z-index and stacking context",
          code: `/*\n  Z-index only works on positioned elements.\n  Each new stacking context resets z-index numbering.\n*/\n\n.modal       { position: fixed;    z-index: 1000; }\n.tooltip     { position: absolute; z-index: 200; }\n.dropdown    { position: absolute; z-index: 100; }\n.sticky-nav  { position: sticky;   z-index: 50; }\n\n/*\n  WARNING: transform, opacity < 1, filter, will-change\n  ALL create new stacking contexts!\n  A z-index: 9999 inside one of these can still be\n  below z-index: 1 outside of it.\n*/\n.parent {\n  transform: translateZ(0); /* creates stacking context */\n  /* child z-index is now relative to .parent, not page */\n}`,
          body: "The most common z-index bug: a parent with transform creates a new stacking context, isolating child z-indexes.",
        },
      ],
      tip: "Use a z-index scale (10, 20, 50, 100, 200, 1000) for different layers. Arbitrary values like 9999 are a sign of confusion.",
    },

    {
      no: 7,
      name: "CSS Custom Properties (Variables)",
      difficulty: "Beginner",
      duration: "12 min",
      xp: 120,
      summary: "Create maintainable design systems using CSS variables that update dynamically at runtime.",
      body: `CSS Custom Properties (often called CSS variables) are defined with a -- prefix and accessed with var(). Unlike Sass variables (compile-time), CSS variables are live in the browser — they can be updated with JavaScript, respond to media queries, and cascade like any CSS property. They're the foundation of modern design systems, theming, and dark mode.`,
      uses: [
        "Design tokens: colours, spacing, typography in one place.",
        "Dark mode: swap variable values with a single class.",
        "Dynamic theming: change theme at runtime via JavaScript.",
        "Component variants: override variables per-component.",
        "Responsive spacing: different variable values at breakpoints.",
      ],
      keyFeatures: [
        "--variable-name: value — define on :root for global scope.",
        "var(--name, fallback) — use with optional fallback value.",
        "Variables cascade: override on a child selector.",
        "Variables are live — JS can read/write with getPropertyValue/setProperty.",
        "Variables do NOT work inside media query values directly.",
        "env() — access browser environment variables (safe area insets).",
        "color-mix(in oklch, var(--primary) 50%, white) — mix colours with variables.",
      ],
      examples: [
        {
          title: "Design token system",
          code: `/* Global design tokens */\n:root {\n  /* Colours */\n  --color-primary:    #663399;\n  --color-primary-hover: #7c3aed;\n  --color-bg:         #ffffff;\n  --color-text:       #111827;\n  --color-text-muted: #6b7280;\n  --color-border:     #e5e7eb;\n\n  /* Spacing */\n  --space-1: 0.25rem;\n  --space-2: 0.5rem;\n  --space-4: 1rem;\n  --space-8: 2rem;\n\n  /* Typography */\n  --font-sans: 'Inter', system-ui, sans-serif;\n  --font-size-base: 1rem;\n\n  /* Borders */\n  --radius-sm: 4px;\n  --radius-md: 8px;\n  --radius-lg: 16px;\n  --radius-full: 9999px;\n\n  /* Shadows */\n  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);\n}\n\n.btn {\n  background: var(--color-primary);\n  padding: var(--space-2) var(--space-4);\n  border-radius: var(--radius-md);\n  font-family: var(--font-sans);\n}`,
          body: "Defining all tokens in :root means updating one value changes every usage across the stylesheet.",
        },
        {
          title: "Dark mode with variables",
          code: `/* Light theme (default) */\n:root {\n  --bg:          #ffffff;\n  --text:        #111827;\n  --card-bg:     #f9fafb;\n  --border:      #e5e7eb;\n}\n\n/* Dark theme */\n[data-theme="dark"],\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg:      #111827;\n    --text:    #f9fafb;\n    --card-bg: #1f2937;\n    --border:  #374151;\n  }\n}\n\n/* Components just use variables — no duplication */\nbody { background: var(--bg); color: var(--text); }\n.card { background: var(--card-bg); border: 1px solid var(--border); }`,
          body: "CSS variables make dark mode trivial. Change variable values in the dark theme — all components update automatically.",
        },
        {
          title: "JavaScript and CSS variables",
          code: `/* CSS */\n:root {\n  --hue: 270;\n  --primary: hsl(var(--hue), 60%, 45%);\n}\n\n/* JavaScript — update theme at runtime */\nconst root = document.documentElement;\n\n// Read a variable\nconst hue = getComputedStyle(root).getPropertyValue('--hue');\n\n// Write a variable — instantly updates all var(--hue) usages\nroot.style.setProperty('--hue', '200'); // now teal/blue\n\n// Theme switcher\ndocument.querySelector('#hue-slider').addEventListener('input', (e) => {\n  root.style.setProperty('--hue', e.target.value);\n});`,
          body: "CSS variables are live — setProperty instantly repaints everything using that variable. Perfect for live theme editors.",
        },
      ],
      tip: "Name variables by purpose, not value: --color-primary not --color-purple. When you rebrand, you change the value without renaming every property.",
    },

    // ── INTERMEDIATE (Ch 8–15) ─────────────────────────────────────────────────

    {
      no: 8,
      name: "Flexbox Layout",
      difficulty: "Intermediate",
      duration: "18 min",
      xp: 160,
      summary: "Build one-dimensional layouts — rows and columns — effortlessly with CSS Flexbox.",
      body: `Flexbox (Flexible Box Layout) is a one-dimensional layout model for distributing space and aligning items in a row or column. It solved the classic layout challenges: vertical centering, equal-height columns, and space distribution. The parent becomes the flex container (display: flex) and children become flex items. Two axes — main and cross — control alignment, and justify-content/align-items are the core properties.`,
      uses: [
        "Navigation bars: logo left, links right.",
        "Card rows: equal height, even spacing.",
        "Centering anything vertically and horizontally.",
        "Form layouts: label and input side by side.",
        "Footer: push last item to the right.",
      ],
      keyFeatures: [
        "display: flex — activates flexbox on the container.",
        "flex-direction: row (default), column, row-reverse, column-reverse.",
        "justify-content: space distribution along the main axis.",
        "align-items: alignment on the cross axis.",
        "gap: spacing between flex items (preferred over margins).",
        "flex: shorthand for flex-grow, flex-shrink, flex-basis.",
        "flex-wrap: nowrap (default) | wrap | wrap-reverse.",
        "order: change visual order without changing HTML order.",
        "align-self: override align-items for one item.",
      ],
      examples: [
        {
          title: "Navigation bar",
          code: `/* HTML:\n  <nav class=\"navbar\">\n    <a class=\"logo\">Codify</a>\n    <ul class=\"nav-links\">...</ul>\n    <button class=\"cta\">Sign Up</button>\n  </nav>\n*/\n\n.navbar {\n  display: flex;\n  align-items: center;        /* vertical centre */\n  justify-content: space-between; /* logo left, cta right */\n  padding: 0 2rem;\n  height: 64px;\n  gap: 1rem;\n}\n\n.nav-links {\n  display: flex;\n  list-style: none;\n  gap: 1.5rem;\n  margin: 0;\n  padding: 0;\n}\n\n/* Push CTA to far right even in the middle group */\n.cta { margin-left: auto; }`,
          body: "margin-left: auto pushes an item to the far end of the main axis by consuming all available space.",
        },
        {
          title: "Card grid with flex-wrap",
          code: `.card-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.5rem;\n}\n\n.card {\n  flex: 1 1 280px;\n  /* grow: 1, shrink: 1, basis: 280px */\n  /* Cards at least 280px wide, grow equally */\n  background: var(--card-bg);\n  border-radius: var(--radius-lg);\n  padding: 1.5rem;\n}\n\n/* On small screens: 1 column\n   On medium: 2 columns\n   On large: 3–4 columns\n   No media queries needed! */`,
          body: "flex: 1 1 280px creates a responsive grid without media queries. Items wrap when they can't fit at 280px.",
        },
        {
          title: "Flex item sizing",
          code: `.container {\n  display: flex;\n  gap: 1rem;\n  height: 200px;\n}\n\n/* Item that doesn't grow or shrink */\n.sidebar  { flex: 0 0 240px; } /* fixed 240px */\n\n/* Item that fills remaining space */\n.main     { flex: 1; } /* flex: 1 1 0 */\n\n/* Equal columns */\n.col      { flex: 1 1 0; } /* all equal */\n\n/* 2x wider than siblings */\n.featured { flex: 2; }\n\n/* Align one item differently */\n.special  {\n  align-self: flex-end; /* bottom of container */\n}`,
          body: "flex: 0 0 auto is rigid sizing. flex: 1 fills available space. flex: 2 is twice as greedy as flex: 1.",
        },
      ],
      tip: "Memorise: justify-content aligns on the main axis (usually horizontal); align-items aligns on the cross axis (usually vertical).",
    },

    {
      no: 9,
      name: "CSS Grid Layout",
      difficulty: "Intermediate",
      duration: "20 min",
      xp: 170,
      summary: "Build complex two-dimensional layouts — rows AND columns simultaneously — with CSS Grid.",
      body: `CSS Grid is a two-dimensional layout system that places items in both rows and columns simultaneously. It's the most powerful layout tool in CSS. The container defines rows and columns using grid-template-columns/rows and fr (fractional) units. Items are placed automatically or explicitly with grid-column and grid-row. Grid areas give layout regions meaningful names.`,
      uses: [
        "Full page layouts: header, sidebar, main, footer.",
        "Image galleries: masonry, mosaic, overlapping layouts.",
        "Dashboard widgets in a grid.",
        "Magazine-style editorial layouts.",
        "Form grids: labels and inputs aligned.",
      ],
      keyFeatures: [
        "display: grid — activates grid on the container.",
        "grid-template-columns: defines column sizes.",
        "fr unit: fraction of available space.",
        "repeat(3, 1fr): three equal columns.",
        "auto-fill vs auto-fit: automatic column count.",
        "grid-column / grid-row: span multiple cells.",
        "grid-template-areas: named layout regions.",
        "minmax(min, max): min/max column sizing.",
        "gap: row and column gaps.",
      ],
      examples: [
        {
          title: "Basic grid and fr unit",
          code: `/* 3 equal columns */\n.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  /* same as: repeat(3, 1fr) */\n  gap: 1.5rem;\n}\n\n/* 12-column design system grid */\n.layout {\n  display: grid;\n  grid-template-columns: repeat(12, 1fr);\n  gap: 1rem;\n}\n\n.header  { grid-column: 1 / -1; }   /* full width */\n.sidebar { grid-column: 1 / 4; }    /* 3 of 12 cols */\n.main    { grid-column: 4 / -1; }   /* remaining 9 */\n.footer  { grid-column: 1 / -1; }   /* full width */`,
          body: "1 / -1 spans from first to last line (full width). grid-column: 4 / -1 starts at line 4 and goes to the end.",
        },
        {
          title: "Responsive grid with auto-fit",
          code: `/* Automatically creates as many columns as fit */\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}\n\n/*\n  auto-fit: collapses empty tracks — items stretch\n  auto-fill: keeps empty tracks — items don't stretch\n\n  minmax(280px, 1fr):\n    min: card is never narrower than 280px\n    max: grows to fill available space (1fr)\n\n  Result: 1 column on mobile → 2 → 3 → 4\n  No media queries needed!\n*/`,
          body: "This single line creates a fully responsive grid. It's the most powerful line in CSS layout.",
        },
        {
          title: "Named grid areas",
          code: `.page {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-rows: 64px 1fr auto;\n  grid-template-areas:\n    \"header  header\"\n    \"sidebar main  \"\n    \"footer  footer\";\n  min-height: 100vh;\n  gap: 0;\n}\n\nheader  { grid-area: header;  }\n.sidebar{ grid-area: sidebar; }\nmain    { grid-area: main;    }\nfooter  { grid-area: footer;  }\n\n/* Responsive: collapse sidebar on mobile */\n@media (max-width: 768px) {\n  .page {\n    grid-template-columns: 1fr;\n    grid-template-areas:\n      \"header\"\n      \"main\"\n      \"footer\";\n  }\n  .sidebar { display: none; }\n}`,
          body: "Named areas make the layout visual in the CSS. The quoted strings form the visual grid map.",
        },
      ],
      tip: "Use Grid for 2D layouts (rows AND columns). Use Flexbox for 1D (a row OR a column). They work great together — grid for page structure, flex for components inside.",
    },

    {
      no: 10,
      name: "Responsive Design & Media Queries",
      difficulty: "Intermediate",
      duration: "18 min",
      xp: 160,
      summary: "Build layouts that look great on any screen size — from phones to ultrawide monitors.",
      body: `Responsive web design (RWD) adapts layouts and typography to different viewport sizes. Media queries apply CSS conditionally based on screen width, height, orientation, or colour scheme. The mobile-first approach writes base styles for mobile, then progressively enhances for larger screens using min-width breakpoints. Modern CSS features like clamp(), auto-fit/fill, and container queries reduce the need for many explicit breakpoints.`,
      uses: [
        "Mobile-first websites for the 60%+ of users on phones.",
        "Dark mode with prefers-color-scheme.",
        "Reduced motion for users with vestibular disorders.",
        "High-DPI/Retina display targeting.",
        "Print stylesheets.",
      ],
      keyFeatures: [
        "@media (min-width: 768px): mobile-first breakpoint.",
        "@media (max-width: 767px): desktop-first (avoid for new projects).",
        "Mobile-first: base CSS for mobile, min-width for larger.",
        "Common breakpoints: 480px, 768px, 1024px, 1280px, 1536px.",
        "prefers-color-scheme: dark — system dark mode.",
        "prefers-reduced-motion: reduce — accessibility.",
        "@media (min-resolution: 2dppx) — Retina/HiDPI.",
        "@container (min-width: 400px) — container queries (new!).",
      ],
      examples: [
        {
          title: "Mobile-first media queries",
          code: `/* Base: mobile styles (all screens) */\n.card {\n  padding: 1rem;\n  font-size: 0.9rem;\n}\n\n.grid {\n  display: grid;\n  grid-template-columns: 1fr; /* 1 column */\n  gap: 1rem;\n}\n\n/* Tablet and up */\n@media (min-width: 768px) {\n  .card { padding: 1.5rem; font-size: 1rem; }\n  .grid { grid-template-columns: repeat(2, 1fr); }\n}\n\n/* Desktop and up */\n@media (min-width: 1024px) {\n  .grid { grid-template-columns: repeat(3, 1fr); gap: 2rem; }\n}\n\n/* Wide desktop */\n@media (min-width: 1280px) {\n  .grid { grid-template-columns: repeat(4, 1fr); }\n}`,
          body: "Mobile-first means no CSS is wasted on small screens. Enhancements are additive as the screen grows.",
        },
        {
          title: "prefers-color-scheme and reduced-motion",
          code: `/* Dark mode */\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg:   #111827;\n    --text: #f9fafb;\n  }\n}\n\n/* Reduced motion — critical for accessibility */\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration:       0.01ms !important;\n    animation-iteration-count: 1     !important;\n    transition-duration:       0.01ms !important;\n    scroll-behavior:           auto  !important;\n  }\n}\n\n/* High DPI images */\n@media (min-resolution: 2dppx) {\n  .logo { background-image: url('logo@2x.png'); }\n}`,
          body: "prefers-reduced-motion is a user accessibility preference. Ignoring it can cause nausea/vertigo for users with vestibular disorders.",
        },
        {
          title: "Container queries (modern)",
          code: `/* Container queries: style based on parent size,\n   not viewport size. Game-changing for components. */\n\n.card-wrapper {\n  container-type: inline-size;\n  container-name: card;\n}\n\n/* Styles based on the card-wrapper's width */\n@container card (min-width: 400px) {\n  .card {\n    display: flex;\n    flex-direction: row;\n    gap: 1rem;\n  }\n  .card-img { width: 200px; flex-shrink: 0; }\n}\n\n/* Same component, vertical on narrow, horizontal on wide\n   regardless of the viewport size */`,
          body: "Container queries let components adapt to their container, not the viewport — perfect for reusable components in variable contexts.",
        },
      ],
      tip: "Fluid layouts with clamp(), auto-fit, and min() often eliminate the need for breakpoints entirely. Only add explicit breakpoints when fluid approaches fail.",
    },

    {
      no: 11,
      name: "Transitions & Animations",
      difficulty: "Intermediate",
      duration: "16 min",
      xp: 160,
      summary: "Add life to your interfaces with smooth transitions and expressive keyframe animations.",
      body: `CSS transitions animate between two states smoothly. CSS animations use @keyframes to define complex multi-step sequences. Both use GPU-accelerated properties (transform, opacity) for buttery smooth 60fps animation. Easing functions (ease-in-out, cubic-bezier) control the feel of movement. Always respect prefers-reduced-motion — not all users can tolerate motion.`,
      uses: [
        "Hover effects: buttons, cards, menu items.",
        "Loading spinners and skeleton screens.",
        "Modal and dropdown enter/exit animations.",
        "Progress bars and data visualisations.",
        "Scroll-based animations and parallax.",
      ],
      keyFeatures: [
        "transition: property duration easing delay.",
        "Only animatable properties: numeric values and colours.",
        "transform: translate, rotate, scale, skew — GPU accelerated.",
        "@keyframes name { from {} to {} } or percentage stops.",
        "animation: name duration easing delay count direction fill-mode.",
        "animation-fill-mode: forwards — keeps final state.",
        "will-change: transform — hint to browser to prepare composite layer.",
        "Prefer transform + opacity — they don't trigger layout/paint.",
      ],
      examples: [
        {
          title: "Transitions on hover",
          code: `/* Button hover transition */\n.btn {\n  background: var(--color-primary);\n  color: white;\n  padding: 0.75rem 1.5rem;\n  border-radius: 8px;\n  transition: background 200ms ease, transform 150ms ease, box-shadow 200ms ease;\n}\n\n.btn:hover {\n  background: var(--color-primary-hover);\n  transform: translateY(-2px);\n  box-shadow: 0 8px 20px rgba(102, 51, 153, 0.4);\n}\n\n.btn:active {\n  transform: translateY(0);\n  box-shadow: none;\n}\n\n/* Card flip with transition */\n.card { transition: transform 400ms ease; transform-style: preserve-3d; }\n.card:hover { transform: rotateY(180deg); }`,
          body: "List only the properties you want to animate in transition — not 'all'. 'all' is slow and causes unexpected transitions.",
        },
        {
          title: "@keyframes animation",
          code: `/* Spinner */\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to   { transform: rotate(360deg); }\n}\n\n.spinner {\n  width: 32px; height: 32px;\n  border: 3px solid #e5e7eb;\n  border-top-color: #663399;\n  border-radius: 50%;\n  animation: spin 800ms linear infinite;\n}\n\n/* Pulse glow */\n@keyframes pulse {\n  0%, 100% { box-shadow: 0 0 0 0 rgba(102,51,153,0.4); }\n  50%       { box-shadow: 0 0 0 12px rgba(102,51,153,0); }\n}\n\n.live-badge {\n  background: #663399;\n  animation: pulse 2s ease infinite;\n}\n\n/* Skeleton loading */\n@keyframes shimmer {\n  from { background-position: -200% 0; }\n  to   { background-position:  200% 0; }\n}\n\n.skeleton {\n  background: linear-gradient(90deg,\n    #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%\n  );\n  background-size: 200% 100%;\n  animation: shimmer 1.5s ease infinite;\n}`,
          body: "The shimmer skeleton uses a moving gradient background — a common loading state pattern used by Facebook, LinkedIn, etc.",
        },
        {
          title: "CSS-only accordion animation",
          code: `/* Animate max-height for expand/collapse (no JS needed) */\n.accordion-content {\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 300ms ease-out, padding 300ms ease-out;\n}\n\n.accordion-input:checked + label + .accordion-content {\n  max-height: 500px; /* larger than content */\n  padding: 1rem;\n}\n\n/* Rotate arrow icon */\n.accordion-label::after {\n  content: '›';\n  display: inline-block;\n  transition: transform 300ms ease;\n}\n\n.accordion-input:checked + .accordion-label::after {\n  transform: rotate(90deg);\n}`,
          body: "max-height: 0 to max-height: 500px is a trick for animating height (height: auto cannot be transitioned directly).",
        },
      ],
      tip: "Only animate transform and opacity for 60fps performance. Animating width, height, top, left triggers expensive layout recalculations.",
    },

    {
      no: 12,
      name: "Pseudo-classes & Pseudo-elements",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 150,
      summary: "Style elements based on their state and create virtual elements for decorative content.",
      body: `Pseudo-classes select elements based on their state or position (:hover, :focus, :nth-child, :not, :has). Pseudo-elements create virtual sub-elements that aren't in the HTML (:before, :after, ::selection, ::placeholder, ::first-line). Together they dramatically reduce the need for extra HTML markup and JavaScript for visual effects. The :has() pseudo-class (the 'parent selector') is a game-changer for logic in CSS.`,
      uses: [
        "Styling form validation states: :valid, :invalid, :user-invalid.",
        "Decorative elements without HTML markup (::before, ::after).",
        "Custom list bullets and counters.",
        "Styling placeholder text in inputs.",
        "Selecting elements based on their children with :has().",
      ],
      keyFeatures: [
        ":hover, :focus, :active — interactive states.",
        ":visited — link visited state.",
        ":checked, :disabled, :read-only — form states.",
        ":nth-child(n), :nth-of-type(n) — positional selection.",
        ":not(selector) — negate a selector.",
        ":has(selector) — parent/relational selector (CSS4).",
        "::before, ::after — generated content; requires content: property.",
        "::selection, ::placeholder, ::first-letter, ::first-line.",
      ],
      examples: [
        {
          title: "::before and ::after for decorative effects",
          code: `/* Underline effect on links */\n.nav-link {\n  position: relative;\n  text-decoration: none;\n}\n\n.nav-link::after {\n  content: '';\n  position: absolute;\n  bottom: -2px;\n  left: 0;\n  width: 0;      /* starts invisible */\n  height: 2px;\n  background: var(--color-primary);\n  transition: width 250ms ease;\n}\n\n.nav-link:hover::after { width: 100%; } /* expands on hover */\n\n/* Quotation marks on blockquote */\nblockquote::before {\n  content: '\\201C'; /* Unicode left double quote */\n  font-size: 4rem;\n  color: var(--color-primary);\n  line-height: 0;\n  vertical-align: -0.4em;\n}`,
          body: "::after with content: '' is the most common pattern — an empty pseudo-element used purely for visual effects.",
        },
        {
          title: ":has() parent selector",
          code: `/* Style a card differently when it contains an image */\n.card:has(img) {\n  padding: 0;\n  overflow: hidden;\n}\n\n/* Label turns green when input is valid */\n.field:has(input:valid) label {\n  color: #22c55e;\n}\n\n/* Navigation: if it has an open dropdown, dim the rest */\n.nav:has(.dropdown:hover) .nav-item:not(:hover) {\n  opacity: 0.5;\n}\n\n/* Dark mode icon: ☀️ when body has dark class */\n.theme-btn::before {\n  content: '🌙';\n}\nbody.dark .theme-btn::before {\n  content: '☀️';\n}`,
          body: ":has() is called the 'parent selector' because it lets a parent react to its children — something impossible before CSS4.",
        },
        {
          title: "Custom counters",
          code: `/* Automatically numbered sections */\narticle {\n  counter-reset: section-counter;\n}\n\nh2::before {\n  counter-increment: section-counter;\n  content: counter(section-counter) '. ';\n  color: var(--color-primary);\n  font-weight: bold;\n}\n\n/* Custom list styling */\nol.steps {\n  list-style: none;\n  counter-reset: step;\n  padding: 0;\n}\n\nol.steps li {\n  counter-increment: step;\n  padding-left: 3rem;\n  position: relative;\n}\n\nol.steps li::before {\n  content: counter(step);\n  position: absolute;\n  left: 0;\n  width: 2rem;\n  height: 2rem;\n  background: var(--color-primary);\n  color: white;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}`,
          body: "CSS counters are a pure CSS way to number anything — no JavaScript needed. counter-reset initialises, counter-increment increments.",
        },
      ],
      tip: ":has() is now supported in all modern browsers and is one of the most powerful additions to CSS. Learn it — it replaces many JS DOM checks.",
    },

    {
      no: 13,
      name: "CSS Transforms & 3D Effects",
      difficulty: "Intermediate",
      duration: "14 min",
      xp: 150,
      summary: "Move, rotate, scale, and skew elements with transforms — without affecting page layout.",
      body: `CSS transforms apply visual transformations to elements without affecting the document flow. Other elements don't move when a transformed element changes. 2D transforms (translate, rotate, scale, skew) handle most UI needs. 3D transforms add depth (rotateX/Y, perspective). Transforms are GPU-accelerated and are the most performant way to animate elements.`,
      uses: [
        "Hover effects: lift, scale, rotate.",
        "Card flip effects for flashcards, product demos.",
        "3D depth effects for hero sections.",
        "Centering with translate(-50%, -50%).",
        "Performance-optimised animations.",
      ],
      keyFeatures: [
        "translate(x, y) / translateX/Y/Z — move element.",
        "rotate(angle) / rotateX/Y/Z — rotate in 2D/3D.",
        "scale(x, y) — resize.",
        "skew(x, y) — shear/skew.",
        "transform-origin: changes the pivot point.",
        "perspective: depth of 3D transforms on parent.",
        "transform-style: preserve-3d — enable 3D for children.",
        "backface-visibility: hidden — hide back of 3D flipped element.",
        "Individual transforms (modern): translate, rotate, scale as separate properties.",
      ],
      examples: [
        {
          title: "Common 2D transforms",
          code: `/* Translate: move without affecting layout */\n.tooltip {\n  transform: translateY(-8px);\n  /* Visually moves up but doesn't push other elements */\n}\n\n/* Scale: grow on hover */\n.card:hover {\n  transform: scale(1.03);\n}\n\n/* Rotate */\n.icon:hover     { transform: rotate(180deg); }\n.diamond        { transform: rotate(45deg); }\n\n/* Combining transforms */\n.card:hover {\n  transform: translateY(-4px) scale(1.02);\n}\n\n/* transform-origin: scale from bottom instead of centre */\n.grow-from-bottom {\n  transform-origin: bottom center;\n  transform: scaleY(1.5);\n}`,
          body: "Combining multiple transforms in one transform property applies them right-to-left. Order matters with rotation + translation.",
        },
        {
          title: "3D card flip",
          code: `/* HTML:\n  <div class=\"card-scene\">\n    <div class=\"card\">\n      <div class=\"card-face card-front\">Front</div>\n      <div class=\"card-face card-back\">Back</div>\n    </div>\n  </div>\n*/\n\n.card-scene {\n  perspective: 1000px;\n  width: 300px;\n  height: 200px;\n}\n\n.card {\n  width: 100%; height: 100%;\n  transform-style: preserve-3d;\n  transition: transform 600ms ease;\n  position: relative;\n}\n\n.card-scene:hover .card {\n  transform: rotateY(180deg);\n}\n\n.card-face {\n  position: absolute;\n  inset: 0;\n  backface-visibility: hidden;\n  border-radius: 12px;\n}\n\n.card-back {\n  transform: rotateY(180deg);\n  background: #663399;\n  color: white;\n}`,
          body: "perspective on the parent creates the 3D depth. backface-visibility: hidden hides the back of each face when flipped.",
        },
        {
          title: "Modern individual transforms",
          code: `/* Old way: order matters, hard to override one */\n.element {\n  transform: translateX(10px) rotate(45deg) scale(1.2);\n}\n\n/* Modern (Chromium 104+, Firefox 72+): independent properties */\n.element {\n  translate: 10px 0;\n  rotate: 45deg;\n  scale: 1.2;\n}\n\n/* Big advantage: can transition independently */\n.card {\n  translate: 0 0;\n  scale: 1;\n  transition: translate 200ms ease, scale 300ms ease;\n}\n\n.card:hover {\n  translate: 0 -8px;  /* lifts\n  scale: 1.05;         /* grows — different timing */\n}`,
          body: "Individual transform properties allow independent transitions — impossible with the combined transform property.",
        },
      ],
      tip: "Translate elements with transform: translateX/Y, not top/left. Top/left triggers layout recalculation; transform only triggers compositing.",
    },

    {
      no: 14,
      name: "CSS Filters & Blend Modes",
      difficulty: "Intermediate",
      duration: "12 min",
      xp: 150,
      summary: "Apply image-style effects to any element — blur, brightness, contrast, greyscale, and Photoshop-like blending.",
      body: `CSS filters apply graphical effects like blur, brightness, contrast, greyscale, and drop-shadow to elements. They work on any element, not just images. Backdrop-filter applies filter effects to the area behind an element (glassmorphism). Mix-blend-mode and background-blend-mode apply Photoshop-style blending modes between layers, enabling creative visual effects directly in CSS.`,
      uses: [
        "Image hover effects: greyscale to colour transition.",
        "Glassmorphism: frosted glass UI elements.",
        "Dimming/highlighting content.",
        "Duotone effects on images.",
        "Drop shadows that follow element shape.",
      ],
      keyFeatures: [
        "filter: blur(), brightness(), contrast(), grayscale(), saturate(), sepia(), hue-rotate().",
        "filter: drop-shadow(x y blur colour) — follows alpha, unlike box-shadow.",
        "backdrop-filter: same functions, applied to background behind element.",
        "mix-blend-mode: normal, multiply, screen, overlay, difference, luminosity.",
        "background-blend-mode: blends background layers together.",
        "CSS masks: clip content to arbitrary shapes.",
      ],
      examples: [
        {
          title: "Filter effects on images",
          code: `/* Default: greyscale, hover: full colour */\n.photo {\n  filter: grayscale(100%) brightness(0.9);\n  transition: filter 400ms ease;\n}\n\n.photo:hover {\n  filter: grayscale(0%) brightness(1);\n}\n\n/* Drop shadow follows image shape (transparent areas) */\n.icon {\n  filter: drop-shadow(0 4px 8px rgba(102, 51, 153, 0.4));\n}\n\n/* Blur a background element */\n.loading {\n  filter: blur(4px) brightness(0.8);\n  pointer-events: none;\n}`,
          body: "drop-shadow in filter follows the element's shape including transparency — box-shadow is always rectangular.",
        },
        {
          title: "Glassmorphism with backdrop-filter",
          code: `/* Glassmorphism card */\n.glass-card {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(12px) saturate(180%);\n  -webkit-backdrop-filter: blur(12px) saturate(180%);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 16px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);\n  padding: 2rem;\n  color: white;\n}\n\n/* Navigation glassmorphism */\n.nav-glass {\n  position: sticky;\n  top: 0;\n  background: rgba(17, 24, 39, 0.8);\n  backdrop-filter: blur(8px);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n}`,
          body: "backdrop-filter needs a semi-transparent background to show the blur effect. -webkit- prefix still needed for Safari.",
        },
        {
          title: "Blend modes",
          code: `/* Duotone image effect */\n.duotone {\n  position: relative;\n}\n\n.duotone img {\n  filter: grayscale(100%);\n}\n\n.duotone::after {\n  content: '';\n  position: absolute;\n  inset: 0;\n  background: linear-gradient(135deg, #663399, #a855f7);\n  mix-blend-mode: multiply;\n}\n\n/* Screen blend mode: white areas show through */\n.logo-overlay {\n  mix-blend-mode: screen;\n  /* White logo on dark background appears correctly */\n}`,
          body: "multiply blend darkens; screen blend lightens. Duotone uses grayscale + multiply overlay to map two colours.",
        },
      ],
      tip: "backdrop-filter is GPU-intensive. Use it sparingly — applying it to many elements (every list item) will degrade performance significantly.",
    },

    {
      no: 15,
      name: "CSS Architecture — BEM & Organisation",
      difficulty: "Intermediate",
      duration: "12 min",
      xp: 150,
      summary: "Write scalable, maintainable CSS by following naming conventions and file organisation strategies.",
      body: `As CSS grows, it becomes hard to understand what each class does and whether it's safe to change. CSS architecture provides conventions to avoid specificity wars, unintentional side effects, and naming collisions. BEM (Block Element Modifier) is the most widely used naming methodology. Modern alternatives include utility-first (Tailwind) and CSS Modules. Good organisation with clear section comments is universally beneficial.`,
      uses: [
        "Team projects where multiple developers write CSS.",
        "Large codebases where CSS must be maintainable long-term.",
        "Component libraries and design systems.",
        "Any project where you've ever been afraid to edit CSS.",
      ],
      keyFeatures: [
        "BEM: Block__Element--Modifier naming convention.",
        "Block: standalone component (.card, .btn).",
        "Element: part of block (.card__title, .card__image).",
        "Modifier: variation or state (.btn--primary, .card--featured).",
        "SMACSS: Base, Layout, Module, State, Theme layers.",
        "CSS Modules: locally scoped class names (used in React).",
        "Utility-first: single-purpose classes (Tailwind approach).",
        "Logical file structure: one file per component.",
      ],
      examples: [
        {
          title: "BEM naming convention",
          code: `/* BLOCK: .card */\n.card {\n  background: var(--card-bg);\n  border-radius: 12px;\n  padding: 1.5rem;\n  box-shadow: var(--shadow-md);\n}\n\n/* ELEMENT: .card__* */\n.card__image   { width: 100%; border-radius: 8px 8px 0 0; }\n.card__body    { padding: 1rem; }\n.card__title   { font-size: 1.25rem; font-weight: 700; }\n.card__excerpt { color: var(--text-muted); font-size: 0.9rem; }\n.card__footer  { border-top: 1px solid var(--border); padding-top: 1rem; }\n\n/* MODIFIER: .card--* */\n.card--featured {\n  border: 2px solid var(--color-primary);\n}\n\n.card--horizontal {\n  display: flex;\n  flex-direction: row;\n}\n\n/* State (SMACSS) */\n.card.is-loading {\n  pointer-events: none;\n  opacity: 0.6;\n}`,
          body: "BEM makes the relationship between selectors clear at a glance. .card__title is definitely part of .card, not a standalone element.",
        },
        {
          title: "CSS file organisation",
          code: `/* ── styles/\n│   ├── base/\n│   │   ├── _reset.css        (box-sizing, margin removal)\n│   │   ├── _variables.css    (CSS custom properties)\n│   │   └── _typography.css   (base font styles)\n│   ├── components/\n│   │   ├── _button.css\n│   │   ├── _card.css\n│   │   ├── _modal.css\n│   │   └── _navbar.css\n│   ├── layout/\n│   │   ├── _grid.css\n│   │   └── _sidebar.css\n│   ├── pages/\n│   │   ├── _home.css\n│   │   └── _course.css\n│   └── main.css              (imports all partials)\n*/\n\n/* main.css */\n@import './base/reset.css';\n@import './base/variables.css';\n@import './base/typography.css';\n@import './components/button.css';\n@import './components/card.css';`,
          body: "One file per component with consistent naming. The main.css is the entry point that imports everything. Easily find and change any style.",
        },
        {
          title: "Utility classes alongside components",
          code: `/* Utility classes for common one-offs */\n.sr-only {\n  position: absolute;\n  width: 1px; height: 1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n} /* Visually hidden but accessible */\n\n.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.visually-hidden { visibility: hidden; }  /* hides but keeps space */\n.hidden          { display: none; }       /* removes from flow */\n\n/* Spacing utilities */\n.mt-auto  { margin-top: auto; }\n.mx-auto  { margin-inline: auto; }\n.gap-2    { gap: 0.5rem; }\n.text-center { text-align: center; }`,
          body: "A small set of utility classes for patterns too simple to deserve a component. sr-only is indispensable for accessibility.",
        },
      ],
      tip: "BEM looks verbose, but the clarity is worth it. When you read .card__title you instantly know it belongs to a card. Flat class names like .title are ambiguous.",
    },

    // ── ADVANCED (Ch 16–21) ────────────────────────────────────────────────────

    {
      no: 16,
      name: "CSS Grid — Advanced Patterns",
      difficulty: "Advanced",
      duration: "16 min",
      xp: 170,
      summary: "Master advanced grid techniques: subgrid, dense packing, masonry, and overlapping layouts.",
      body: `Beyond the basics, CSS Grid enables truly sophisticated layout patterns. Subgrid allows child elements to participate in the parent's grid tracks. Dense packing with auto-placement fills gaps automatically. Grid with negative placement creates overlapping effects without absolute positioning. These advanced features handle complex editorial and dashboard layouts that would otherwise require complex JavaScript.`,
      uses: [
        "Photo gallery with masonry-like layout.",
        "Dashboard with widgets of varying sizes.",
        "Editorial layouts with overlapping elements.",
        "Form layouts with perfectly aligned labels and inputs.",
        "Subgrid for consistent card content alignment.",
      ],
      keyFeatures: [
        "subgrid: child participates in parent grid tracks.",
        "grid-auto-flow: dense — fill gaps with later items.",
        "Negative line numbers: -1 = last track.",
        "Named lines: [content-start] 1fr [content-end].",
        "auto vs fr: auto sizes to content; fr shares remaining space.",
        "grid-auto-rows/columns: implicit track sizing.",
        "order property: reorder without changing HTML.",
        "Overlapping: place multiple items in the same grid cell.",
      ],
      examples: [
        {
          title: "Subgrid for card alignment",
          code: `/* Problem: card titles vary in length, pushing body down */\n\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 2rem;\n}\n\n.card {\n  display: grid;\n  grid-template-rows: subgrid; /* inherit parent row tracks */\n  grid-row: span 4; /* occupies 4 tracks: image, title, body, footer */\n}\n\n/* Now all cards have aligned title, body, and footer rows\n   regardless of content length */\n.card__image  { align-self: start; }\n.card__title  { align-self: start; }\n.card__body   { align-self: start; }\n.card__footer { align-self: end; margin-top: auto; }`,
          body: "Subgrid is the solution to the classic 'misaligned card content' problem. Cards share the parent's row tracks.",
        },
        {
          title: "Dense auto-placement for galleries",
          code: `.gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  grid-auto-rows: 180px;\n  grid-auto-flow: dense; /* fill gaps with smaller items */\n  gap: 0.75rem;\n}\n\n/* Featured items span multiple cells */\n.gallery-item--wide  { grid-column: span 2; }\n.gallery-item--tall  { grid-row:    span 2; }\n.gallery-item--large { grid-column: span 2; grid-row: span 2; }\n\n/*\n  Without dense: gaps appear where wide/tall items don't fit\n  With dense: browser backfills gaps with later items\n  (visual order differs from DOM order — avoid for interactive content)\n*/`,
          body: "grid-auto-flow: dense creates compact layouts. Warning: it changes visual order which can confuse keyboard navigation.",
        },
        {
          title: "Overlapping layout without absolute positioning",
          code: `/* Hero with overlapping text over image */\n.hero {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-template-rows: 400px;\n}\n\n.hero-image {\n  grid-column: 1 / -1; /* full width */\n  grid-row: 1;\n}\n\n.hero-text {\n  grid-column: 1 / 2; /* left half */\n  grid-row: 1;         /* same row as image! */\n  /* Text overlaps the image without position: absolute */\n  z-index: 1;\n  align-self: center;\n  padding: 2rem;\n  background: rgba(0,0,0,0.5);\n}`,
          body: "Placing two items in the same grid cell creates overlap. This is cleaner than absolute positioning for layout-level overlaps.",
        },
      ],
      tip: "Subgrid is finally supported in all major browsers (Firefox first, Chrome 117+). Use it for any grid with content that needs row-alignment across cards.",
    },

    {
      no: 17,
      name: "CSS Scroll Behaviour & Scroll-driven Animations",
      difficulty: "Advanced",
      duration: "14 min",
      xp: 170,
      summary: "Control scroll behaviour and create scroll-linked animations with no JavaScript required.",
      body: `CSS provides native scroll control: scroll-snap for paginated scroll experiences, scroll-behavior: smooth for anchor jumps, and the new Scroll-driven Animations API that links animation progress directly to scroll position. These replace complex JavaScript scroll listeners with declarative CSS, dramatically improving performance and reducing code.`,
      uses: [
        "Horizontal card carousels that snap to each card.",
        "Full-page scroll sections (scroll-snap).",
        "Progress bar that fills as the user scrolls.",
        "Fade-in on scroll without Intersection Observer JS.",
        "Parallax effects with scroll-timeline.",
      ],
      keyFeatures: [
        "scroll-behavior: smooth — smooth jump to anchor links.",
        "scroll-snap-type: x|y mandatory|proximity.",
        "scroll-snap-align: start|center|end on snap children.",
        "overscroll-behavior: contain — stop scroll chaining.",
        "@scroll-timeline (new): link animation to scroll position.",
        "animation-timeline: scroll() — scroll-driven animations.",
        "view() timeline: animate as element enters/leaves viewport.",
        "scrollbar-gutter: stable — prevent layout shift on scrollbar appear.",
      ],
      examples: [
        {
          title: "Scroll snap carousel",
          code: `/* Horizontal scroll carousel with snap */\n.carousel {\n  display: flex;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  scroll-behavior: smooth;\n  gap: 1rem;\n  padding: 1rem;\n  /* Hide scrollbar visually but keep functionality */\n  scrollbar-width: none;\n}\n\n.carousel::-webkit-scrollbar { display: none; }\n\n.slide {\n  scroll-snap-align: start;\n  flex: 0 0 80vw;   /* each slide is 80% viewport width */\n  max-width: 400px;\n  height: 300px;\n  border-radius: 16px;\n  background: var(--card-bg);\n}`,
          body: "scroll-snap-type: x mandatory snaps to each slide on scroll. mandatory means it always snaps; proximity only if close.",
        },
        {
          title: "Scroll-driven progress bar (no JS!)",
          code: `/* Reading progress bar at top of article */\n\n@keyframes grow-progress {\n  from { transform: scaleX(0); }\n  to   { transform: scaleX(1); }\n}\n\n.progress-bar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 3px;\n  background: var(--color-primary);\n  transform-origin: left;\n\n  /* Link animation to scroll position */\n  animation: grow-progress linear;\n  animation-timeline: scroll(root);\n}\n\n/* No JavaScript needed! The animation progress\n   is directly tied to how far the user has scrolled */`,
          body: "animation-timeline: scroll() drives the animation with the scroll position. 0% scroll = 0% animation; 100% scroll = 100% animation.",
        },
        {
          title: "Fade-in on scroll with view timeline",
          code: `/* Items fade in as they enter the viewport */\n\n@keyframes fade-in-up {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n.animate-on-scroll {\n  animation: fade-in-up linear both;\n  animation-timeline: view();\n  animation-range: entry 0% entry 100%;\n  /* Plays during the entry phase (entering viewport) */\n}\n\n/* Respect reduced motion */\n@media (prefers-reduced-motion: reduce) {\n  .animate-on-scroll {\n    animation: none;\n    opacity: 1;\n  }\n}`,
          body: "view() creates a timeline based on the element's entry/exit from the viewport. Replaces IntersectionObserver for simple reveal animations.",
        },
      ],
      tip: "Always pair scroll-driven animations with @media (prefers-reduced-motion: reduce). They're impressive but can cause discomfort for sensitive users.",
    },

    {
      no: 18,
      name: "CSS Logical Properties",
      difficulty: "Advanced",
      duration: "12 min",
      xp: 160,
      summary: "Write truly international CSS that works correctly for both left-to-right and right-to-left writing modes.",
      body: `CSS Logical Properties replace physical directions (top, right, bottom, left) with logical equivalents that respond to the writing mode and text direction. Instead of margin-left, use margin-inline-start — it means 'start of the inline axis' which is left in LTR and right in RTL. This makes CSS automatically correct for Arabic, Hebrew, and vertical writing systems without any language-specific overrides.`,
      uses: [
        "Internationalised apps supporting Arabic and Hebrew.",
        "Building components that work in any writing mode.",
        "Vertical writing modes for Chinese/Japanese UI.",
        "Reducing duplicate CSS for LTR/RTL layouts.",
      ],
      keyFeatures: [
        "inline: horizontal axis in LTR (left-right).",
        "block: vertical axis in LTR (top-bottom).",
        "-start / -end: replace left/right and top/bottom.",
        "margin-inline: replaces margin-left + margin-right.",
        "padding-block: replaces padding-top + padding-bottom.",
        "inset-inline-start: replaces left in position.",
        "border-start-start-radius: replaces border-top-left-radius.",
        "writing-mode: horizontal-tb | vertical-rl | vertical-lr.",
      ],
      examples: [
        {
          title: "Physical vs logical properties",
          code: `/* Physical — breaks in RTL */\n.card {\n  margin-left:  1rem;   /* always left */\n  padding-top:  1rem;\n  padding-right: 1.5rem;\n  border-left: 3px solid var(--color-primary);\n}\n\n/* Logical — works in any direction */\n.card {\n  margin-inline-start: 1rem;  /* start = left in LTR, right in RTL */\n  padding-block-start: 1rem;  /* start = top in horizontal writing */\n  padding-inline-end:  1.5rem;\n  border-inline-start: 3px solid var(--color-primary);\n}\n\n/* Shorthand logical properties */\n.element {\n  margin-inline: auto;    /* replaces margin-left + margin-right */\n  padding-block: 1rem;    /* replaces padding-top + padding-bottom */\n  inset-inline:  0;       /* replaces left: 0; right: 0; */\n}`,
          body: "In an RTL page (dir='rtl'), margin-inline-start automatically becomes margin-right. Physical margin-left would not flip.",
        },
        {
          title: "Writing mode for vertical text",
          code: `/* Vertical tab labels */\n.tab-vertical {\n  writing-mode: vertical-rl;\n  text-orientation: mixed;\n  transform: rotate(180deg); /* flip to read upward */\n  padding: 1rem 0.5rem;\n}\n\n/* Sidebar counter badge */\n.badge-vertical {\n  writing-mode: vertical-lr;\n}\n\n/* The logical properties now mean:\n   inline = vertical axis\n   block  = horizontal axis\n   So padding-block adds space on the sides (visually) */\n.tag {\n  writing-mode: vertical-rl;\n  padding-block: 0.5rem;  /* horizontal padding (visually) */\n  padding-inline: 0.25rem; /* vertical padding (visually) */\n}`,
          body: "writing-mode changes the meaning of inline and block. Logical properties adapt automatically; physical properties don't.",
        },
        {
          title: "RTL layout without overrides",
          code: `/* Component using only logical properties */\n.comment {\n  display: flex;\n  gap: 1rem;\n  padding-inline: 1.5rem;\n  padding-block: 1rem;\n  border-inline-start: 3px solid var(--color-primary);\n  border-start-start-radius: 8px;\n  border-end-start-radius: 8px;\n}\n\n.comment__avatar {\n  margin-inline-end: 0; /* gap handles spacing */\n  flex-shrink: 0;\n}\n\n/*\n  In LTR: border on left, avatar on left, text on right\n  In RTL: border on right, avatar on right, text on left\n  ZERO additional CSS needed!\n*/`,
          body: "A fully logical component works in LTR and RTL with identical CSS. No [dir='rtl'] overrides needed.",
        },
      ],
      tip: "Start using logical properties for new components now. Browser support is excellent. margin-inline: auto still works for centering in all browsers.",
    },

    {
      no: 19,
      name: "@layer & Cascade Layers",
      difficulty: "Advanced",
      duration: "12 min",
      xp: 160,
      summary: "Manage CSS specificity at scale with cascade layers — a modern replacement for specificity hacks.",
      body: `CSS Cascade Layers (@layer) allow you to define explicit specificity tiers. Rules in a higher layer always beat rules in a lower layer, regardless of individual selector specificity. This solves the problem of third-party CSS fighting with your styles, makes !important rare, and gives large teams predictable override patterns. It's one of the most important CSS features in years.`,
      uses: [
        "Isolating third-party styles from custom styles.",
        "Design system: base layer never overrides component layer.",
        "Framework integration: Tailwind base below components.",
        "Team projects with clear override conventions.",
      ],
      keyFeatures: [
        "@layer name { rules }: define a named layer.",
        "Layer order declaration: @layer reset, base, components, utilities.",
        "Later layers win over earlier layers.",
        "Unlayered styles always beat layered styles.",
        "Nested layers: @layer framework.reset { }.",
        "@import url('...') layer(base): import a file into a layer.",
        "Layer specificity is orthogonal to selector specificity.",
      ],
      examples: [
        {
          title: "Defining cascade layers",
          code: `/* Declare layer order first (earlier = lower priority) */\n@layer reset, base, components, utilities;\n\n/* Reset — lowest priority */\n@layer reset {\n  *, *::before, *::after { box-sizing: border-box; margin: 0; }\n}\n\n/* Base — design tokens and defaults */\n@layer base {\n  body { font-family: var(--font-sans); color: var(--text); }\n  a    { color: var(--color-primary); }\n}\n\n/* Components — specific component styles */\n@layer components {\n  .btn { padding: 0.75rem 1.5rem; border-radius: 8px; }\n  /* This .btn rule beats body in @layer base, even with lower specificity */\n}\n\n/* Utilities — single-purpose helpers, highest priority */\n@layer utilities {\n  .hidden { display: none !important; }\n  /* !important inside a layer only beats other !important in lower layers */\n}`,
          body: "Layer order matters more than specificity. A type selector in 'utilities' beats an ID selector in 'reset'.",
        },
        {
          title: "Isolating third-party styles",
          code: `/* Third-party library goes into its own layer */\n@import url('bootstrap.css') layer(bootstrap);\n@import url('reset.css')     layer(reset);\n\n/* Declare your layers after third-party — these win */\n@layer reset, bootstrap, base, components;\n\n/* Your components always override Bootstrap */\n@layer components {\n  .btn { background: var(--color-primary); } /* wins over Bootstrap .btn */\n}`,
          body: "Putting third-party CSS in a lower layer means your styles always win — no more !important battles with Bootstrap.",
        },
        {
          title: "Layers with unlayered styles",
          code: `@layer base, components;\n\n@layer base {\n  p { color: blue; }     /* In 'base' layer */\n}\n\n@layer components {\n  p { color: green; }    /* In 'components' layer — wins over base */\n}\n\n/* Unlayered — no @layer wrapper — always wins! */\np { color: red; } /* This wins over BOTH layers, even type selector */\n\n/*\n  Priority (lowest to highest):\n  @layer base → @layer components → unlayered styles → inline\n*/`,
          body: "Unlayered styles are always above all layers. This preserves backward compatibility — existing CSS without layers still works.",
        },
      ],
      tip: "Use cascade layers in new projects from day one. The order declaration (@layer reset, base, components, utilities) at the top makes your entire CSS architecture visible in one line.",
    },

    {
      no: 20,
      name: "CSS Nesting",
      difficulty: "Advanced",
      duration: "12 min",
      xp: 160,
      summary: "Write cleaner, more organised CSS with native nesting — no preprocessor required.",
      body: `CSS Nesting (now natively supported in all modern browsers) brings Sass-like nesting to plain CSS. Rules can be nested inside other rules, reducing repetition and keeping related styles together. The & selector references the parent. Combined with @layer and custom properties, native CSS nesting makes preprocessors like Sass optional for most projects.`,
      uses: [
        "Keeping component styles together without repeating the selector.",
        "Media queries inline with the element they affect.",
        "State variants (:hover, :focus) next to base styles.",
        "Pseudo-elements alongside the element they modify.",
      ],
      keyFeatures: [
        "Nest child rules inside parent rules.",
        "& refers to the parent selector.",
        "&:hover, &::before — pseudo-classes and pseudo-elements.",
        "& .child — descendant nesting.",
        "&.modifier — modifier class (no space — same element).",
        "Media queries can be nested too (@media inside a rule).",
        "Nesting is processed at parse time — no runtime cost.",
        "Supported in Chrome 112+, Safari 16.5+, Firefox 117+.",
      ],
      examples: [
        {
          title: "Basic nesting",
          code: `/* Without nesting */\n.card { border-radius: 12px; padding: 1.5rem; }\n.card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); }\n.card__title { font-size: 1.25rem; font-weight: 700; }\n.card__body { color: var(--text-muted); }\n\n/* With native CSS nesting */\n.card {\n  border-radius: 12px;\n  padding: 1.5rem;\n\n  &:hover {\n    box-shadow: 0 8px 24px rgba(0,0,0,0.1);\n  }\n\n  .card__title { /* descendant (implicit &) */\n    font-size: 1.25rem;\n    font-weight: 700;\n  }\n\n  .card__body {\n    color: var(--text-muted);\n  }\n}`,
          body: "Nesting keeps related styles together. All card styles are in one block — easy to find and edit.",
        },
        {
          title: "Nesting media queries",
          code: `/* Responsive styles co-located with the component */\n.hero {\n  padding: 3rem 1rem;\n  font-size: 1.5rem;\n\n  /* No need to repeat .hero at the end of the file */\n  @media (min-width: 768px) {\n    padding: 6rem 2rem;\n    font-size: 2.5rem;\n  }\n\n  @media (min-width: 1024px) {\n    padding: 8rem 4rem;\n    font-size: 3.5rem;\n  }\n\n  &__title {\n    line-height: 1.1;\n    font-weight: 900;\n\n    @media (prefers-color-scheme: dark) {\n      color: #f9fafb;\n    }\n  }\n}`,
          body: "Nesting media queries inside components is arguably the biggest benefit — responsive styles live with the component, not at the end of the file.",
        },
        {
          title: "& for modifiers and states",
          code: `.btn {\n  background: var(--color-primary);\n  color: white;\n  padding: 0.75rem 1.5rem;\n  border-radius: 8px;\n  transition: background 200ms;\n\n  /* Hover state */\n  &:hover { background: var(--color-primary-hover); }\n\n  /* Focus for keyboard nav */\n  &:focus-visible {\n    outline: 2px solid var(--color-primary);\n    outline-offset: 2px;\n  }\n\n  /* Modifier: same element with extra class */\n  &--secondary {\n    background: transparent;\n    color: var(--color-primary);\n    border: 2px solid currentColor;\n  }\n\n  /* Disabled state */\n  &:disabled, &[aria-disabled=\"true\"] {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n}`,
          body: "&--secondary (no space) means .btn.btn--secondary — the same element with both classes. A space would mean a descendant.",
        },
      ],
      tip: "Limit nesting to 2–3 levels deep. Deep nesting creates high specificity that's hard to override — the same issue as deeply nested Sass.",
    },

    // ── EXPERT (Ch 21–24) ─────────────────────────────────────────────────────

    {
      no: 21,
      name: "CSS Shapes, Clip-Path & Masking",
      difficulty: "Expert",
      duration: "14 min",
      xp: 180,
      summary: "Create non-rectangular layouts and complex visual shapes with clip-path, masks, and CSS Shapes.",
      body: `CSS clip-path clips elements to geometric shapes, hiding everything outside the path. CSS Masks control element visibility using an image or gradient as an alpha mask. CSS Shapes (shape-outside) let text flow around custom shapes, not just rectangular boxes. Together these enable complex, design-forward layouts that were previously only possible with images or complex SVG.`,
      uses: [
        "Profile photos in circle, hexagon, or custom shape.",
        "Diagonal section transitions between page blocks.",
        "Text wrapping around an irregular photo shape.",
        "Reveal animations (clip-path animate).",
        "Content masking with gradient fades.",
      ],
      keyFeatures: [
        "clip-path: inset(), circle(), ellipse(), polygon().",
        "clip-path: path() — any SVG path.",
        "clip-path is animatable — great for reveal effects.",
        "mask-image: gradient fades, image masks.",
        "mask-size, mask-position, mask-repeat — same as background.",
        "shape-outside: float wraps text around custom shapes.",
        "shape-outside: url() — wrap around image content.",
        "CSS Shapes require a float for shape-outside to take effect.",
      ],
      examples: [
        {
          title: "clip-path shapes",
          code: `/* Circle clip */\n.avatar {\n  clip-path: circle(50%);\n  width: 80px;\n  height: 80px;\n}\n\n/* Hexagon */\n.hex {\n  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);\n}\n\n/* Diagonal cut at bottom */\n.section {\n  clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);\n  padding-bottom: 10%;\n}\n\n/* Animated reveal on load */\n.reveal {\n  clip-path: inset(0 100% 0 0);\n  transition: clip-path 600ms ease;\n}\n\n.reveal.visible {\n  clip-path: inset(0 0% 0 0);\n}`,
          body: "clip-path: inset(0 100% 0 0) hides element from right side. Animating to inset(0 0% 0 0) reveals it — a clean wipe effect.",
        },
        {
          title: "Gradient mask for fade effects",
          code: `/* Fade text out at bottom */\n.fade-out {\n  mask-image: linear-gradient(\n    to bottom,\n    black 60%,    /* fully visible */\n    transparent 100%  /* fully invisible */\n  );\n}\n\n/* Circular fade-out (vignette) */\n.vignette {\n  mask-image: radial-gradient(\n    ellipse at center,\n    black 50%,\n    transparent 80%\n  );\n}\n\n/* Text fill with image (background-clip trick) */\n.gradient-text {\n  background: linear-gradient(135deg, #663399, #a855f7);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}`,
          body: "mask-image uses luminance — black = fully visible, white = fully transparent (inverted). background-clip: text fills text with a gradient.",
        },
        {
          title: "CSS Shapes for editorial layout",
          code: `/* Text flows around a circular image */\n.editorial-img {\n  float: left;\n  width: 250px;\n  height: 250px;\n  shape-outside: circle(50%);\n  clip-path: circle(50%);\n  margin-inline-end: 1.5rem;\n  margin-block-end: 1rem;\n}\n\n/* Text flows around actual content of image (requires cors) */\n.product-img {\n  float: right;\n  width: 300px;\n  shape-outside: url('product.png');\n  shape-image-threshold: 0.5; /* alpha threshold */\n  margin: 0 0 1rem 2rem;\n}\n\n/* Polygon wrap */\n.quote-img {\n  float: left;\n  shape-outside: polygon(0 0, 100% 0, 80% 100%, 0 100%);\n  width: 200px;\n}`,
          body: "shape-outside + clip-path together create truly non-rectangular elements where both the visual shape AND the text wrap match.",
        },
      ],
      tip: "Use bennettfeely.com/clippy for a visual clip-path generator. Copy the polygon() directly into your CSS.",
    },

    {
      no: 22,
      name: "CSS Variables — Advanced Patterns",
      difficulty: "Expert",
      duration: "14 min",
      xp: 180,
      summary: "Unlock the full power of CSS custom properties for dynamic theming, component APIs, and calculated values.",
      body: `Beyond basic design tokens, CSS custom properties enable powerful patterns: component-scoped configuration APIs where a variable becomes a component's API, calculated values using calc() and registered properties (@property), environment variables (env()), and per-instance overrides. Registered properties (@property) enable typed variables that can be animated and have fallback values.`,
      uses: [
        "Component APIs: configure a card's accent colour per instance.",
        "Animating CSS variables with @property.",
        "Calculated spacing systems with calc().",
        "Component themeing: a single component with multiple themes.",
        "Responsive values without media queries.",
      ],
      keyFeatures: [
        "@property: register a CSS custom property with type and initial value.",
        "Registered properties can be animated (unlike regular variables).",
        "syntax: '<color>' | '<length>' | '<number>' | '<integer>'.",
        "inherits: whether the property inherits or not.",
        "initial-value: the default when undefined.",
        "calc() with variables: calc(var(--spacing) * 2).",
        "Component API: --component-color sets per instance.",
        "env(): access browser/OS environment values (safe-area-inset-*).",
      ],
      examples: [
        {
          title: "Component configuration API",
          code: `/* Button component with variable API */\n.btn {\n  /* Default values (component API) */\n  --btn-bg:         var(--color-primary);\n  --btn-color:      white;\n  --btn-radius:     8px;\n  --btn-padding-x:  1.5rem;\n  --btn-padding-y:  0.75rem;\n\n  background:    var(--btn-bg);\n  color:         var(--btn-color);\n  border-radius: var(--btn-radius);\n  padding:       var(--btn-padding-y) var(--btn-padding-x);\n}\n\n/* Override per instance in HTML:\n   <button class=\"btn\" style=\"--btn-bg: #ef4444;\">Delete</button>\n*/\n\n/* Override per variant */\n.btn-pill   { --btn-radius: 9999px; }\n.btn-square { --btn-radius: 0; }\n.btn-lg     { --btn-padding-x: 2rem; --btn-padding-y: 1rem; }`,
          body: "Variables as component APIs let users configure components via inline style overrides without specificity issues.",
        },
        {
          title: "@property for animated variables",
          code: `/* Register a typed custom property (animatable!) */\n@property --gradient-angle {\n  syntax: '<angle>';\n  initial-value: 0deg;\n  inherits: false;\n}\n\n.btn-gradient {\n  background: linear-gradient(var(--gradient-angle), #663399, #a855f7);\n  animation: rotate-gradient 3s linear infinite;\n  transition: --gradient-angle 500ms ease; /* can now transition! */\n}\n\n@keyframes rotate-gradient {\n  to { --gradient-angle: 360deg; }\n}\n\n/* Without @property, CSS can't interpolate between angle values\n   and the animation just jumps — no smooth rotation */`,
          body: "@property tells the browser the variable is an <angle> so it can interpolate between values. Normal variables are just strings.",
        },
        {
          title: "Safe area insets for mobile notches",
          code: `/* env() — access device safe area insets */\n\n/* iPhone notch and home indicator */\nbody {\n  padding-top:    env(safe-area-inset-top);\n  padding-bottom: env(safe-area-inset-bottom);\n  padding-left:   env(safe-area-inset-left);\n  padding-right:  env(safe-area-inset-right);\n}\n\n/* Shorthand with fallback */\n.fixed-bottom {\n  bottom: max(1rem, env(safe-area-inset-bottom));\n}\n\n/* Required in HTML: */\n<!-- <meta name=\"viewport\" content=\"width=device-width,\n     initial-scale=1, viewport-fit=cover\"> -->\n/* viewport-fit=cover + env() = full bleed content */`,
          body: "Without env() safe area insets, iPhone notch areas and home indicator overlap your fixed UI elements.",
        },
      ],
      tip: "@property is a game-changer for animation. If you want to animate a CSS variable (gradient angle, custom counter), register it with @property first.",
    },

    {
      no: 23,
      name: "CSS Performance & Rendering",
      difficulty: "Expert",
      duration: "14 min",
      xp: 190,
      summary: "Understand how the browser renders CSS and optimise for smooth 60fps experiences.",
      body: `CSS performance is about understanding the browser's rendering pipeline: Style (calculate styles) → Layout (calculate positions) → Paint (draw pixels) → Composite (layer assembly). Changing certain CSS properties triggers expensive layout or paint; others only trigger compositing (cheap). Understanding this pipeline determines what you can animate at 60fps. The contain property and content-visibility bring major rendering optimisations.`,
      uses: [
        "60fps animations without jank.",
        "Fast-rendering long lists with content-visibility.",
        "Preventing costly paint operations on scroll.",
        "Reducing style recalculation on large DOMs.",
      ],
      keyFeatures: [
        "Layout properties: width, height, top, margin — most expensive.",
        "Paint properties: background, color, box-shadow — moderate.",
        "Composite properties: transform, opacity — cheapest.",
        "will-change: transform — promotes to compositor layer.",
        "contain: layout | paint | size | style — isolate rendering.",
        "content-visibility: auto — skip rendering off-screen content.",
        "contain-intrinsic-size: estimated size for content-visibility.",
        "Avoid large paint areas: don't animate box-shadow on many elements.",
      ],
      examples: [
        {
          title: "Compositing vs layout properties",
          code: `/* SLOW: changes layout, forces full recalculation */\n@keyframes move-layout {\n  from { left: 0;   top: 0;   }\n  to   { left: 200px; top: 100px; }\n}\n\n/* FAST: only triggers compositing (GPU only) */\n@keyframes move-composite {\n  from { transform: translate(0, 0);       }\n  to   { transform: translate(200px, 100px); }\n}\n\n/* SLOW: animating box-shadow triggers repaint */\n.card:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.3); }\n\n/* FAST: use a pseudo-element with opacity instead */\n.card::after {\n  content: '';\n  box-shadow: 0 20px 40px rgba(0,0,0,0.3); /* pre-painted */\n  opacity: 0;\n  transition: opacity 300ms ease; /* only compositor! */\n}\n.card:hover::after { opacity: 1; }`,
          body: "The pseudo-element trick pre-paints the shadow once, then only animates opacity (compositor-only). No repaint on hover.",
        },
        {
          title: "content-visibility for long pages",
          code: `/* Skip rendering off-screen sections — massive performance win */\n.article-section {\n  content-visibility: auto;\n  contain-intrinsic-size: 0 800px; /* estimated height */\n  /* Browser skips layout+paint for sections off screen.\n     When user scrolls near, it renders just-in-time. */\n}\n\n/* contain: paint — section's children don't affect outside */\n.card-widget {\n  contain: paint;\n  /* Browser skips checking if overflow escapes this element */\n}\n\n/* contain: layout — layout is isolated */\n.modal-content {\n  contain: layout;\n  /* Children's layout doesn't affect the rest of the page */\n}`,
          body: "content-visibility: auto can reduce initial render time by 5–7x on content-heavy pages by skipping off-screen rendering.",
        },
        {
          title: "Reducing selector complexity",
          code: `/* SLOW: complex descendant selectors */\n.page .sidebar .nav ul > li:nth-child(odd) a:hover { color: blue; }\n\n/* FAST: single class */\n.nav-link:hover { color: blue; }\n\n/* Avoid universal selector on large DOMs */\n/* SLOW: */ * { color: inherit; }\n/* FAST: */ body { color: var(--text); }\n\n/* will-change: use sparingly — only before animation starts */\n.element-about-to-animate {\n  /* Add just before animation: */\n  will-change: transform;\n}\n/* Remove after animation: element.style.willChange = 'auto'; */\n/* Overusing will-change wastes memory by creating too many layers */`,
          body: "will-change should be added just before an animation and removed after. Permanent will-change on many elements exhausts GPU memory.",
        },
      ],
      tip: "Open DevTools → Performance → record scroll. See 'Paint' events flashing? Those are your targets. Move animations to transform/opacity.",
    },

    {
      no: 24,
      name: "CSS — The Complete Review & Modern Checklist",
      difficulty: "Expert",
      duration: "18 min",
      xp: 200,
      summary: "Consolidate 23 chapters of CSS knowledge with a production checklist and future-forward practices.",
      body: `This final chapter reviews the complete CSS journey and looks at the state of modern CSS. The landscape has changed dramatically — features that required preprocessors (nesting, variables) or JavaScript (scroll-driven animations, container queries) are now native CSS. The checklist below ensures every production CSS codebase follows modern best practices.`,
      uses: [
        "Final review of all CSS concepts.",
        "Pre-launch CSS quality checklist.",
        "Reference for modern CSS features to adopt.",
      ],
      keyFeatures: [
        "Custom properties + @property for design systems.",
        "Logical properties for global-ready CSS.",
        "Cascade layers for specificity management.",
        "Nesting for component organisation.",
        "Container queries for context-aware components.",
        "Scroll-driven animations for performance.",
        "content-visibility for render performance.",
        "prefers-reduced-motion for accessibility.",
      ],
      examples: [
        {
          title: "Modern CSS starter template",
          code: `/* ── styles/main.css ── */\n\n/* Layer declaration — defines priority order */\n@layer reset, tokens, base, components, utilities;\n\n/* Reset */\n@layer reset {\n  *, *::before, *::after { box-sizing: border-box; }\n  * { margin: 0; }\n  img, video { max-width: 100%; display: block; }\n  input, button, textarea { font: inherit; }\n}\n\n/* Design tokens */\n@layer tokens {\n  :root {\n    --color-primary: #663399;\n    --font-sans: system-ui, sans-serif;\n    --space-4: 1rem;\n    --radius-md: 8px;\n  }\n  @media (prefers-color-scheme: dark) {\n    :root { --bg: #111827; --text: #f9fafb; }\n  }\n}\n\n/* Base */\n@layer base {\n  body {\n    font-family: var(--font-sans);\n    background: var(--bg, #fff);\n    color: var(--text, #111);\n    line-height: 1.6;\n  }\n}`,
          body: "This starter uses every modern technique: layers, tokens, nesting-ready structure, and built-in dark mode support.",
        },
        {
          title: "Production CSS checklist",
          code: `/*\n  PRODUCTION CSS CHECKLIST\n  ========================\n\n  FOUNDATION\n  [ ] box-sizing: border-box on * reset\n  [ ] CSS custom properties for design tokens\n  [ ] @layer order declared at top\n  [ ] font-display: swap on @font-face\n\n  LAYOUT\n  [ ] No table-based layouts\n  [ ] Flexbox/Grid for all layouts\n  [ ] Fluid sizing with clamp() for headings\n  [ ] Responsive without max-width breakpoints where possible\n\n  ACCESSIBILITY\n  [ ] :focus-visible styles on all interactive elements\n  [ ] Color contrast ≥ 4.5:1 checked\n  [ ] @media (prefers-reduced-motion) disables animations\n  [ ] .sr-only class available for accessible-only text\n\n  PERFORMANCE\n  [ ] Animations use only transform and opacity\n  [ ] will-change removed after animation\n  [ ] content-visibility on long repeated sections\n  [ ] No universal (*) selectors in hot paths\n\n  MAINTAINABILITY\n  [ ] BEM or consistent naming convention\n  [ ] No magic numbers — use variables\n  [ ] No !important except in utilities layer\n  [ ] Logical properties for inline/block dimensions\n*/`,
          body: "Run this checklist before every launch. Each item prevents a real, reproducible bug or performance issue.",
        },
        {
          title: "CSS features to adopt right now",
          code: `/* 1. Container queries — components adapt to context */\n.card-wrapper { container-type: inline-size; }\n@container (min-width: 400px) { .card { flex-direction: row; } }\n\n/* 2. :has() — parent selector */\n.form:has(:invalid) .submit-btn { opacity: 0.5; }\n\n/* 3. Scroll-driven animations */\n.progress { animation-timeline: scroll(root); }\n\n/* 4. CSS nesting */\n.btn { &:hover { background: var(--hover); } }\n\n/* 5. @layer */\n@layer reset, base, components;\n\n/* 6. Logical properties */\n.el { margin-inline: auto; padding-block: 1rem; }\n\n/* 7. @property for animated variables */\n@property --hue { syntax: '<number>'; initial-value: 270; inherits: false; }`,
          body: "All six features are supported in Chrome, Firefox, and Safari as of 2024. No polyfills needed for most users.",
        },
      ],
      tip: "CSS has never been more powerful. Native nesting, container queries, scroll animations, and cascade layers mean you need Sass less than ever. Learn the platform.",
    },

  ],
};

export const dsaCourse = {
  language: "DSA",
  accentColor: "#8B5CF6",
  accentLight: "#A78BFA",
  totalChapters: 24,
  chapters: [
    {
      no: 1,
      name: "Arrays: The Foundation",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "What is an Array?",
          subtitle: "Contiguous memory & indexing",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "Arrays in Memory",
              body: "An array stores elements in contiguous memory locations, giving O(1) access by index. This makes reading any element instant, but inserting or deleting in the middle requires shifting elements.",
              code: `// Creating arrays in JavaScript
const nums = [10, 20, 30, 40, 50];

// O(1) access by index
console.log(nums[0]); // 10
console.log(nums[3]); // 40

// Length property
console.log(nums.length); // 5`,
              codeNote: "Array indexing starts at 0 in JavaScript.",
            },
          ],
        },
        {
          id: 2,
          title: "Common Array Operations",
          subtitle: "Push, pop, shift, splice",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Mutating an Array",
              body: "JavaScript arrays are dynamic. push/pop operate at the end in O(1), while shift/unshift operate at the front in O(n) because every element must be re-indexed.",
              code: `const arr = [1, 2, 3];

arr.push(4);       // [1, 2, 3, 4]  — O(1)
arr.pop();         // [1, 2, 3]     — O(1)

arr.unshift(0);    // [0, 1, 2, 3]  — O(n)
arr.shift();       // [1, 2, 3]     — O(n)

// Remove 1 element at index 1
arr.splice(1, 1);  // [1, 3]        — O(n)`,
              codeNote: "Prefer push/pop over shift/unshift for performance.",
            },
          ],
        },
        {
          id: 3,
          title: "Iterating & Patterns",
          subtitle: "Loops, map, filter, reduce",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Traversal Techniques",
              body: "You can iterate with for-loops for index control, or use higher-order methods like map, filter, and reduce for cleaner functional code. Choosing the right tool depends on whether you need the index.",
              code: `const nums = [1, 2, 3, 4, 5];

// Classic for-loop
for (let i = 0; i < nums.length; i++) {
  console.log(nums[i]);
}

// Functional methods
const doubled = nums.map(n => n * 2);       // [2,4,6,8,10]
const evens   = nums.filter(n => n % 2 === 0); // [2,4]
const sum     = nums.reduce((a, b) => a + b, 0); // 15`,
              codeNote: "reduce is extremely versatile — it can replicate map and filter.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the time complexity of accessing an element by index in an array?",
              code: null,
              options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
              correct: 0,
              body: "Arrays use contiguous memory, so the address is calculated directly from the base address + offset, giving constant time access.",
            },
            {
              id: "c2",
              question: "Which array method adds an element to the END and runs in O(1)?",
              code: null,
              options: ["unshift()", "push()", "splice()", "shift()"],
              correct: 1,
              body: "push() appends to the end without shifting elements, making it O(1) amortized.",
            },
            {
              id: "c3",
              question: "What does [1,2,3].reduce((a, b) => a + b, 0) return?",
              code: null,
              options: ["[1,2,3]", "3", "6", "undefined"],
              correct: 2,
              body: "reduce accumulates: 0+1=1, 1+2=3, 3+3=6. The initial value is 0.",
            },
          ],
        },
      ],
    },
    {
      no: 2,
      name: "Strings",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "String Basics",
          subtitle: "Immutability & character access",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "Strings are Immutable",
              body: "In JavaScript, strings cannot be changed in place. Every operation that appears to modify a string actually creates a new one. You can access individual characters by index just like arrays.",
              code: `const s = "hello";

// Character access — O(1)
console.log(s[0]);       // "h"
console.log(s.charAt(4)); // "o"

// Strings are immutable
s[0] = "H"; // silently fails
console.log(s); // still "hello"

// Create a new string instead
const upper = s[0].toUpperCase() + s.slice(1);
console.log(upper); // "Hello"`,
              codeNote: "Always remember: string methods return NEW strings.",
            },
          ],
        },
        {
          id: 2,
          title: "Common String Methods",
          subtitle: "split, join, slice, includes",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Essential Manipulation",
              body: "split converts a string to an array, join reverses it, and slice extracts substrings. These three methods solve the majority of string manipulation problems in interviews.",
              code: `const str = "data structures and algorithms";

// Split into words
const words = str.split(" ");
// ["data", "structures", "and", "algorithms"]

// Join back
const joined = words.join("-");
// "data-structures-and-algorithms"

// Slice (start, end) — end is exclusive
console.log(str.slice(0, 4));  // "data"
console.log(str.slice(-10));   // "algorithms"

// Search
console.log(str.includes("and")); // true
console.log(str.indexOf("and"));  // 16`,
              codeNote: "slice with negative indices counts from the end.",
            },
          ],
        },
        {
          id: 3,
          title: "Interview Patterns",
          subtitle: "Reverse, anagram, palindrome",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Classic String Problems",
              body: "Reversing a string, checking for palindromes, and detecting anagrams are the top three beginner string problems. All can be solved by converting to an array or using character frequency counts.",
              code: `// Reverse a string
function reverse(s) {
  return s.split("").reverse().join("");
}
console.log(reverse("hello")); // "olleh"

// Check palindrome
function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === reverse(cleaned);
}
console.log(isPalindrome("racecar")); // true

// Check anagram
function isAnagram(a, b) {
  const sort = s => s.toLowerCase().split("").sort().join("");
  return sort(a) === sort(b);
}
console.log(isAnagram("listen", "silent")); // true`,
              codeNote: "Sorting-based anagram check is O(n log n); frequency map is O(n).",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What happens when you do str[0] = 'X' on a JavaScript string?",
              code: null,
              options: ["The string changes", "It throws an error", "Nothing — strings are immutable", "It changes only in strict mode"],
              correct: 2,
              body: "Strings are immutable in JavaScript. Assigning to an index silently fails (or throws in strict mode).",
            },
            {
              id: "c2",
              question: "What does 'hello'.split('').reverse().join('') return?",
              code: null,
              options: ["'hello'", "'olleh'", "['o','l','l','e','h']", "undefined"],
              correct: 1,
              body: "split('') creates ['h','e','l','l','o'], reverse() flips it, and join('') produces 'olleh'.",
            },
            {
              id: "c3",
              question: "Two strings are anagrams if they have:",
              code: null,
              options: ["The same length", "The same first character", "The same character frequencies", "The same substring"],
              correct: 2,
              body: "Anagrams are rearrangements of the same letters, so they must have identical character frequency counts.",
            },
          ],
        },
      ],
    },
    {
      no: 3,
      name: "Linked Lists",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "What is a Linked List?",
          subtitle: "Nodes and pointers",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "Nodes Connected by Pointers",
              body: "A linked list is a chain of nodes where each node holds a value and a reference (pointer) to the next node. Unlike arrays, elements are not stored contiguously, so there is no O(1) index access.",
              code: `// Define a Node
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Build a list: 1 -> 2 -> 3
const head = new ListNode(1);
head.next = new ListNode(2);
head.next.next = new ListNode(3);

// Traverse
let current = head;
while (current) {
  console.log(current.val); // 1, 2, 3
  current = current.next;
}`,
              codeNote: "Always check for null before accessing .next.",
            },
          ],
        },
        {
          id: 2,
          title: "Insertion & Deletion",
          subtitle: "Add and remove nodes",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Modifying the List",
              body: "Inserting at the head is O(1) — just point the new node to the old head. Deleting a node requires updating the previous node's pointer to skip over the target node.",
              code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Insert at head — O(1)
function insertAtHead(head, val) {
  return new ListNode(val, head);
}

// Delete a node by value — O(n)
function deleteNode(head, val) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  let curr = head;
  while (curr) {
    if (curr.val === val) {
      prev.next = curr.next;
      break;
    }
    prev = curr;
    curr = curr.next;
  }
  return dummy.next;
}`,
              codeNote: "A dummy head node simplifies edge cases when deleting the first node.",
            },
          ],
        },
        {
          id: 3,
          title: "Reversing a Linked List",
          subtitle: "The classic interview question",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Iterative Reversal",
              body: "Reversing a linked list is one of the most asked interview questions. Use three pointers: prev, curr, and next. At each step, flip the current node's pointer to point backward.",
              code: `function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next; // save next
    curr.next = prev;       // reverse pointer
    prev = curr;            // advance prev
    curr = next;            // advance curr
  }
  return prev; // new head
}

// Example: 1->2->3 becomes 3->2->1`,
              codeNote: "This runs in O(n) time and O(1) space.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the time complexity of accessing the nth element in a singly linked list?",
              code: null,
              options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
              correct: 1,
              body: "You must traverse from the head node-by-node, so access is O(n) — unlike arrays which offer O(1) index access.",
            },
            {
              id: "c2",
              question: "What is the time complexity of inserting at the HEAD of a linked list?",
              code: null,
              options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
              correct: 1,
              body: "You simply create a new node and point it to the current head — no traversal needed.",
            },
            {
              id: "c3",
              question: "When reversing a linked list iteratively, how many pointers do you need?",
              code: null,
              options: ["1", "2", "3", "4"],
              correct: 2,
              body: "You need three pointers: prev (starts null), curr (starts at head), and next (temporary to save curr.next before overwriting).",
            },
          ],
        },
      ],
    },
    {
      no: 4,
      name: "Stacks",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "What is a Stack?",
          subtitle: "LIFO — Last In, First Out",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "The LIFO Principle",
              body: "A stack is a collection where the last element added is the first one removed. Think of a stack of plates — you always take from the top. JavaScript arrays can act as stacks using push and pop.",
              code: `// Stack using a JavaScript array
const stack = [];

stack.push(10);  // [10]
stack.push(20);  // [10, 20]
stack.push(30);  // [10, 20, 30]

console.log(stack.pop());  // 30 (last in, first out)
console.log(stack.pop());  // 20

// Peek at the top without removing
console.log(stack[stack.length - 1]); // 10

console.log(stack.length === 0); // false (not empty)`,
              codeNote: "push() and pop() both run in O(1) time.",
            },
          ],
        },
        {
          id: 2,
          title: "Implementing a Stack Class",
          subtitle: "Encapsulate stack behavior",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Class-Based Stack",
              body: "Wrapping an array in a class gives you a clean interface with push, pop, peek, and isEmpty methods. This prevents accidental use of non-stack operations like shift or index access.",
              code: `class Stack {
  constructor() {
    this.items = [];
  }
  push(val) {
    this.items.push(val);
  }
  pop() {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }
  peek() {
    return this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  size() {
    return this.items.length;
  }
}

const s = new Stack();
s.push(5);
s.push(10);
console.log(s.peek()); // 10
console.log(s.pop());  // 10`,
              codeNote: "All operations are O(1).",
            },
          ],
        },
        {
          id: 3,
          title: "Valid Parentheses",
          subtitle: "Classic stack use case",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Bracket Matching",
              body: "The valid parentheses problem is the most famous stack question. Push every opening bracket, and when you see a closing bracket, pop and check it matches. If the stack is empty at the end, the string is valid.",
              code: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}

console.log(isValid("({[]})")); // true
console.log(isValid("(]"));     // false
console.log(isValid(""));       // true`,
              codeNote: "This runs in O(n) time and O(n) space.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does LIFO stand for?",
              code: null,
              options: ["Last In First Out", "Least In First Out", "Last Index For Output", "Linear In-order First Out"],
              correct: 0,
              body: "LIFO means Last In, First Out — the most recently added element is removed first.",
            },
            {
              id: "c2",
              question: "Which two array methods simulate a stack in JavaScript?",
              code: null,
              options: ["shift() and unshift()", "push() and pop()", "splice() and slice()", "map() and filter()"],
              correct: 1,
              body: "push() adds to the top (end) and pop() removes from the top — both in O(1).",
            },
            {
              id: "c3",
              question: "In the valid parentheses problem, what do you push onto the stack?",
              code: null,
              options: ["Closing brackets", "Opening brackets", "All characters", "The index of each bracket"],
              correct: 1,
              body: "You push opening brackets and pop when you encounter a closing bracket to check for a match.",
            },
          ],
        },
      ],
    },
    {
      no: 5,
      name: "Queues",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "What is a Queue?",
          subtitle: "FIFO — First In, First Out",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "The FIFO Principle",
              body: "A queue processes elements in the order they arrive — first in, first out, like a line at a store. Elements are added at the back (enqueue) and removed from the front (dequeue).",
              code: `// Simple queue with an array
const queue = [];

queue.push("A");  // enqueue
queue.push("B");
queue.push("C");

console.log(queue.shift()); // "A" — dequeue (first in)
console.log(queue.shift()); // "B"
console.log(queue);         // ["C"]`,
              codeNote: "shift() is O(n) on arrays — for performance, use a linked list or index-based queue.",
            },
          ],
        },
        {
          id: 2,
          title: "Efficient Queue Implementation",
          subtitle: "Avoid O(n) dequeue with indices",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Index-Based Queue",
              body: "Using shift() on a regular array is O(n). A more efficient approach uses a head pointer and an object or array, giving O(1) enqueue and dequeue. This is critical for performance-sensitive code.",
              code: `class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }
  enqueue(val) {
    this.items[this.tail] = val;
    this.tail++;
  }
  dequeue() {
    if (this.isEmpty()) return undefined;
    const val = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return val;
  }
  peek() {
    return this.items[this.head];
  }
  isEmpty() {
    return this.tail === this.head;
  }
  size() {
    return this.tail - this.head;
  }
}

const q = new Queue();
q.enqueue(1);
q.enqueue(2);
console.log(q.dequeue()); // 1
console.log(q.peek());    // 2`,
              codeNote: "All operations are O(1) — no element shifting needed.",
            },
          ],
        },
        {
          id: 3,
          title: "Queue Use Cases",
          subtitle: "BFS, task scheduling, buffers",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Where Queues Shine",
              body: "Queues power Breadth-First Search (BFS), task scheduling, print spoolers, and message buffers. In BFS, you enqueue neighbors and dequeue the next node to visit level by level.",
              code: `// BFS on a simple graph using a queue
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const node = queue.shift();
    console.log("Visited:", node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}

const graph = { A: ["B","C"], B: ["D"], C: ["D"], D: [] };
bfs(graph, "A"); // A, B, C, D`,
              codeNote: "BFS guarantees shortest-path in unweighted graphs.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does FIFO stand for?",
              code: null,
              options: ["First In First Out", "Fast In Fast Out", "First Index First Output", "Final In Final Out"],
              correct: 0,
              body: "FIFO means First In, First Out — the element that was added first is removed first, like a real-world line.",
            },
            {
              id: "c2",
              question: "Why is array.shift() a poor choice for a high-performance queue?",
              code: null,
              options: ["It returns undefined", "It is O(n) because it re-indexes all elements", "It only works on strings", "It mutates the original array"],
              correct: 1,
              body: "shift() removes the first element and must shift every remaining element left, making it O(n).",
            },
            {
              id: "c3",
              question: "Which algorithm relies heavily on a queue?",
              code: null,
              options: ["Depth-First Search", "Binary Search", "Breadth-First Search", "Quick Sort"],
              correct: 2,
              body: "BFS uses a queue to explore nodes level by level, processing the earliest-discovered node first.",
            },
          ],
        },
      ],
    },
    {
      no: 6,
      name: "Hash Maps",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "What is a Hash Map?",
          subtitle: "Key-value pairs & O(1) lookup",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "Key-Value Storage",
              body: "A hash map (or hash table) stores data as key-value pairs and provides O(1) average-time lookup, insertion, and deletion. In JavaScript, both plain objects and the Map class serve this purpose.",
              code: `// Using a Map
const map = new Map();
map.set("name", "Alice");
map.set("age", 25);

console.log(map.get("name")); // "Alice"
console.log(map.has("age"));  // true
console.log(map.size);        // 2

map.delete("age");
console.log(map.size);        // 1

// Using a plain object
const obj = {};
obj["color"] = "blue";
console.log(obj["color"]); // "blue"`,
              codeNote: "Map preserves insertion order and allows any type as a key.",
            },
          ],
        },
        {
          id: 2,
          title: "Collisions & Counting",
          subtitle: "Hash collisions & frequency maps",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Handling Collisions & Counting Patterns",
              body: "Hash collisions occur when two keys map to the same bucket — resolved by chaining or open addressing. The most common interview pattern is building a frequency map to count occurrences of elements.",
              code: `// Frequency counter pattern
function charFrequency(str) {
  const freq = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}
console.log(charFrequency("banana"));
// { b: 1, a: 3, n: 2 }

// Find the first non-repeating character
function firstUnique(s) {
  const freq = charFrequency(s);
  for (const ch of s) {
    if (freq[ch] === 1) return ch;
  }
  return null;
}
console.log(firstUnique("aabbc")); // "c"`,
              codeNote: "The frequency counter pattern solves countless interview problems.",
            },
          ],
        },
        {
          id: 3,
          title: "Two Sum with a Hash Map",
          subtitle: "The classic O(n) solution",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Two Sum in One Pass",
              body: "The Two Sum problem asks you to find two numbers that add up to a target. A hash map lets you check if the complement (target - current) exists in O(1), reducing the brute-force O(n²) to O(n).",
              code: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
// [0, 1] — because 2 + 7 = 9`,
              codeNote: "Store value→index; look up the complement each iteration.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the average time complexity of a hash map lookup?",
              code: null,
              options: ["O(n)", "O(1)", "O(log n)", "O(n²)"],
              correct: 1,
              body: "Hash maps compute the bucket from the key's hash in constant time, giving O(1) average lookup.",
            },
            {
              id: "c2",
              question: "What is a hash collision?",
              code: null,
              options: ["Two values that are equal", "Two keys that map to the same bucket", "A missing key error", "A stack overflow in the hash function"],
              correct: 1,
              body: "A collision happens when different keys produce the same hash bucket index. It's resolved by chaining or probing.",
            },
            {
              id: "c3",
              question: "How does the hash map improve Two Sum from O(n²) to O(n)?",
              code: null,
              options: ["By sorting the array first", "By using two nested loops", "By checking for the complement in O(1) per element", "By using binary search"],
              correct: 2,
              body: "Instead of checking every pair, you store seen values and check if target - current exists in the map in O(1).",
            },
          ],
        },
      ],
    },
    {
      no: 7,
      name: "Two Pointers",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "The Two Pointer Technique",
          subtitle: "Shrink the search space",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What Are Two Pointers?",
              body: "Two pointers is a technique where you use two indices that move toward each other (or in the same direction) to solve problems in O(n) instead of O(n²). It works best on sorted arrays or sequences.",
              code: `// Two Sum on a SORTED array using two pointers
function twoSumSorted(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [];
}

console.log(twoSumSorted([1, 3, 5, 7, 11], 12));
// [0, 4] — because 1 + 11 = 12`,
              codeNote: "Two pointers on sorted data avoids the need for a hash map.",
            },
          ],
        },
        {
          id: 2,
          title: "Palindrome Check",
          subtitle: "Compare from both ends",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Palindrome with Two Pointers",
              body: "Place one pointer at the start and one at the end. Move them inward, comparing characters. If all pairs match, the string is a palindrome. Skip non-alphanumeric characters for real interview questions.",
              code: `function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("A man, a plan, a canal: Panama"));
// true

console.log(isPalindrome("hello"));
// false`,
              codeNote: "Runs in O(n) time and O(1) space (ignoring the cleaned string).",
            },
          ],
        },
        {
          id: 3,
          title: "Remove Duplicates In-Place",
          subtitle: "Fast and slow pointers",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Slow & Fast Pointer Variant",
              body: "A slow pointer tracks the position to write, while a fast pointer scans ahead. When the fast pointer finds a new value, write it at the slow pointer's position. This removes duplicates in-place in O(n).",
              code: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  let slow = 0;

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1; // length of unique portion
}

const arr = [1, 1, 2, 2, 3, 4, 4];
const len = removeDuplicates(arr);
console.log(arr.slice(0, len)); // [1, 2, 3, 4]`,
              codeNote: "The slow pointer only advances when a new unique value is found.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the main advantage of the two-pointer technique?",
              code: null,
              options: ["It uses less memory", "It reduces O(n²) to O(n)", "It sorts the array", "It works on unsorted data"],
              correct: 1,
              body: "By moving two pointers strategically, you eliminate the need for a nested loop, reducing time from O(n²) to O(n).",
            },
            {
              id: "c2",
              question: "For the two-pointer 'two sum' approach, the array must be:",
              code: null,
              options: ["Empty", "Sorted", "Contain only positive numbers", "Of even length"],
              correct: 1,
              body: "The shrinking window logic (move left if sum is too small, move right if too large) only works when the array is sorted.",
            },
            {
              id: "c3",
              question: "In the remove-duplicates problem, what does the slow pointer represent?",
              code: null,
              options: ["The current maximum", "The last position of a unique element", "The middle of the array", "The count of duplicates"],
              correct: 1,
              body: "The slow pointer marks where the next unique value should be placed, building the de-duplicated portion in-place.",
            },
          ],
        },
      ],
    },
    {
      no: 8,
      name: "Sliding Window",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Fixed-Size Window",
          subtitle: "Max sum subarray of size k",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What is Sliding Window?",
              body: "The sliding window technique maintains a window of elements as you iterate, adding one element to the right and removing one from the left. For fixed-size windows, this turns an O(n×k) brute-force into O(n).",
              code: `// Maximum sum of a subarray of size k
function maxSubarraySum(arr, k) {
  if (arr.length < k) return null;

  let windowSum = 0;
  // Build the first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;

  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // add right, remove left
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

console.log(maxSubarraySum([2, 1, 5, 1, 3, 2], 3)); // 9 (5+1+3)`,
              codeNote: "Add the new element, subtract the outgoing one — O(n) total.",
            },
          ],
        },
        {
          id: 2,
          title: "Variable-Size Window",
          subtitle: "Expand and shrink dynamically",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Dynamic Window Size",
              body: "When the window size isn't fixed, expand the right pointer to grow the window and shrink the left pointer when a condition is violated. This pattern solves problems like smallest subarray with a given sum.",
              code: `// Smallest subarray with sum >= target
function minSubarrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return minLen === Infinity ? 0 : minLen;
}

console.log(minSubarrayLen(7, [2, 3, 1, 2, 4, 3])); // 2 (4+3)`,
              codeNote: "The left pointer only moves forward, so total work is still O(n).",
            },
          ],
        },
        {
          id: 3,
          title: "Longest Substring Without Repeats",
          subtitle: "Window + hash set",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Combining Window with a Set",
              body: "To find the longest substring without repeating characters, expand the window right, and if a duplicate is found, shrink from the left until the duplicate is removed. A Set tracks the current window's characters.",
              code: `function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3 ("abc")
console.log(lengthOfLongestSubstring("bbbbb"));    // 1 ("b")
console.log(lengthOfLongestSubstring("pwwkew"));   // 3 ("wke")`,
              codeNote: "Each character is added and removed from the set at most once — O(n).",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does the sliding window technique avoid that a brute-force approach does?",
              code: null,
              options: ["Using extra memory", "Recomputing the entire window from scratch each time", "Sorting the array", "Using recursion"],
              correct: 1,
              body: "Instead of recalculating the sum (or state) of the whole window, you incrementally add/remove one element — saving O(k) work per slide.",
            },
            {
              id: "c2",
              question: "In a variable-size sliding window, when do you shrink the window?",
              code: null,
              options: ["Every iteration", "When the window is empty", "When a condition is violated or exceeded", "Only at the end"],
              correct: 2,
              body: "You shrink from the left when the current window violates the problem's constraint (e.g., sum exceeds target, or a duplicate appears).",
            },
            {
              id: "c3",
              question: "What data structure helps track characters in the 'longest substring without repeats' problem?",
              code: null,
              options: ["Stack", "Queue", "Set", "Linked List"],
              correct: 2,
              body: "A Set provides O(1) has/add/delete, making it ideal for tracking which characters are currently in the window.",
            },
          ],
        },
      ],
    },
    {
      no: 9,
      name: "Binary Search",
      difficulty: "Intermediate",
      duration: "14 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Binary Search Concept",
          subtitle: "Divide and conquer on sorted data",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What is Binary Search?",
              body: "Binary search is an efficient algorithm that finds a target in a sorted array by repeatedly halving the search space. It runs in O(log n) time, making it far faster than linear search for large datasets.",
              code: `// Binary search on a sorted array
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1; // not found
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7)); // 3`,
              codeNote: "The key invariant: the target always lies within [left, right].",
            },
            {
              heading: "Why Sorted Order Matters",
              body: "Binary search only works on sorted arrays because the comparison at the midpoint tells us which half to discard. If the array is unsorted, the midpoint comparison gives no useful information about where the target might be.",
              code: `// This will NOT work correctly
const unsorted = [5, 2, 8, 1, 9];
// binarySearch(unsorted, 8) → might return -1 (wrong!)

// Always sort first, or use a structure that maintains order
const sorted = [1, 2, 5, 8, 9];
console.log(binarySearch(sorted, 8)); // 3 ✓`,
              codeNote: "Sort the array first if it isn't already sorted.",
            },
          ],
        },
        {
          id: 2,
          title: "Sorted Array Search",
          subtitle: "Implementing and tracing binary search",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Tracing Through an Example",
              body: "Let's trace binary search step by step on a sorted array. Each iteration cuts the search space in half, so even an array of 1 million elements takes at most 20 comparisons.",
              code: `// Trace: find 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
// Step 1: left=0, right=9, mid=4 → arr[4]=16 < 23 → left=5
// Step 2: left=5, right=9, mid=7 → arr[7]=56 > 23 → right=6
// Step 3: left=5, right=6, mid=5 → arr[5]=23 === 23 → found at index 5

const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log(binarySearch(arr, 23)); // 5`,
              codeNote: "Only 3 steps to find the element in a 10-element array.",
            },
            {
              heading: "Iterative vs Recursive",
              body: "Binary search can be written iteratively with a while loop or recursively. The iterative version avoids call stack overhead and is generally preferred in practice.",
              code: `// Recursive binary search
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;
  const mid = Math.floor((left + right) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) {
    return binarySearchRecursive(arr, target, mid + 1, right);
  }
  return binarySearchRecursive(arr, target, left, mid - 1);
}

console.log(binarySearchRecursive([1, 3, 5, 7, 9], 5)); // 2`,
              codeNote: "Recursive version uses O(log n) stack space.",
            },
          ],
        },
        {
          id: 3,
          title: "Edge Cases & Variations",
          subtitle: "Boundaries, duplicates, and lower/upper bound",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Finding Lower and Upper Bounds",
              body: "When duplicates exist, you may need the first or last occurrence. Lower bound finds the first index where arr[i] >= target, and upper bound finds the first index where arr[i] > target.",
              code: `// Find the first occurrence (lower bound)
function lowerBound(arr, target) {
  let left = 0, right = arr.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
  }
  return left;
}

const arr = [1, 2, 2, 2, 3, 4];
console.log(lowerBound(arr, 2)); // 1 (first occurrence of 2)`,
              codeNote: "Note: right starts at arr.length, not arr.length - 1.",
            },
            {
              heading: "Binary Search on Answer Space",
              body: "Binary search isn't limited to arrays — you can search any monotonic function. If you can frame a problem as 'find the smallest x where condition(x) is true', binary search applies.",
              code: `// Find the integer square root of n
function intSqrt(n) {
  let left = 0, right = n;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (mid * mid <= n) left = mid + 1;
    else right = mid - 1;
  }
  return right; // largest mid where mid*mid <= n
}

console.log(intSqrt(26)); // 5 (5*5=25 ≤ 26)`,
              codeNote: "Searching the answer space — not an array, but a range of values.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the time complexity of binary search?",
              code: null,
              options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
              correct: 1,
              body: "Binary search halves the search space each step, giving O(log n) time complexity.",
            },
            {
              id: "c2",
              question: "What happens if you run binary search on an unsorted array?",
              code: null,
              options: ["It works but slower", "It may return incorrect results", "It throws an error", "It sorts the array first"],
              correct: 1,
              body: "Binary search relies on sorted order to decide which half to discard. On unsorted data it may skip the target entirely.",
            },
            {
              id: "c3",
              question: "In a standard binary search, when left > right, what does that mean?",
              code: null,
              options: ["Target is at index 0", "The array is empty", "Target was not found", "Target is at the last index"],
              correct: 2,
              body: "When left exceeds right, the search space is empty, meaning the target does not exist in the array.",
            },
          ],
        },
      ],
    },
    {
      no: 10,
      name: "Recursion",
      difficulty: "Intermediate",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Understanding Recursion",
          subtitle: "Functions that call themselves",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What is Recursion?",
              body: "Recursion is when a function calls itself to solve a smaller instance of the same problem. Every recursive function needs a base case to stop the recursion and a recursive case that moves toward it.",
              code: `// A simple recursive countdown
function countdown(n) {
  if (n <= 0) {        // base case
    console.log("Done!");
    return;
  }
  console.log(n);
  countdown(n - 1);   // recursive case
}

countdown(5); // 5, 4, 3, 2, 1, Done!`,
              codeNote: "Without the base case, the function would call itself forever.",
            },
            {
              heading: "Base Case is Critical",
              body: "The base case is the condition that stops recursion. Without it, you get infinite recursion which crashes with a stack overflow error. Always define your base case first when writing recursive functions.",
              code: `// Classic example: factorial
function factorial(n) {
  if (n <= 1) return 1;       // base case
  return n * factorial(n - 1); // recursive case
}

console.log(factorial(5)); // 120 (5 * 4 * 3 * 2 * 1)
console.log(factorial(0)); // 1`,
              codeNote: "factorial(5) = 5 × factorial(4) = 5 × 4 × 3 × 2 × 1 = 120.",
            },
          ],
        },
        {
          id: 2,
          title: "The Call Stack",
          subtitle: "How recursion executes under the hood",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Visualizing the Call Stack",
              body: "Each recursive call adds a new frame to the call stack. When the base case is reached, frames are popped off one by one, returning results back up the chain.",
              code: `// Trace factorial(4):
// CALL STACK (growing):
//   factorial(4) → waits for factorial(3)
//     factorial(3) → waits for factorial(2)
//       factorial(2) → waits for factorial(1)
//         factorial(1) → returns 1  (base case)
//       factorial(2) → returns 2 * 1 = 2
//     factorial(3) → returns 3 * 2 = 6
//   factorial(4) → returns 4 * 6 = 24

console.log(factorial(4)); // 24`,
              codeNote: "Each indentation level represents a frame on the call stack.",
            },
            {
              heading: "Stack Overflow Danger",
              body: "Every recursive call uses stack memory. Too deep a recursion (typically >10,000 calls) causes a stack overflow. JavaScript has a limited call stack, so be mindful of recursion depth.",
              code: `// This will crash — no base case!
function infinite(n) {
  return infinite(n + 1); // never stops
}
// infinite(1); // RangeError: Maximum call stack size exceeded

// Safe recursion with proper depth
function sum(n) {
  if (n <= 0) return 0;
  return n + sum(n - 1);
}
console.log(sum(100)); // 5050`,
              codeNote: "JavaScript's call stack limit is typically around 10,000–15,000 frames.",
            },
          ],
        },
        {
          id: 3,
          title: "Recursive Patterns",
          subtitle: "Common patterns and thinking recursively",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Fibonacci and Multiple Recursive Calls",
              body: "Some problems make multiple recursive calls per invocation, creating a tree of calls. Fibonacci is the classic example — each call branches into two. This naive approach is O(2^n) and can be optimized with memoization.",
              code: `// Naive Fibonacci — O(2^n)
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Optimized with memoization — O(n)
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

console.log(fibMemo(40)); // 102334155 (instant)`,
              codeNote: "Memoization caches results to avoid redundant calculations.",
            },
            {
              heading: "Recursion on Arrays and Strings",
              body: "Many array and string problems can be solved recursively by processing one element and recursing on the rest. This 'divide and conquer' mindset is fundamental to algorithms like merge sort.",
              code: `// Reverse a string recursively
function reverseStr(s) {
  if (s.length <= 1) return s;
  return reverseStr(s.slice(1)) + s[0];
}
console.log(reverseStr("hello")); // "olleh"

// Sum an array recursively
function arrSum(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + arrSum(arr.slice(1));
}
console.log(arrSum([1, 2, 3, 4])); // 10`,
              codeNote: "Process the first element, recurse on the rest.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What happens if a recursive function has no base case?",
              code: null,
              options: ["It returns undefined", "It runs forever until stack overflow", "It returns 0", "It automatically stops after 100 calls"],
              correct: 1,
              body: "Without a base case, the function calls itself indefinitely until the call stack overflows and throws a RangeError.",
            },
            {
              id: "c2",
              question: "What is the time complexity of naive recursive Fibonacci?",
              code: null,
              options: ["O(n)", "O(n²)", "O(2^n)", "O(log n)"],
              correct: 2,
              body: "Each call branches into two more calls, creating an exponential tree of size O(2^n).",
            },
            {
              id: "c3",
              question: "How does memoization improve recursive Fibonacci?",
              code: null,
              options: ["It removes the base case", "It caches previously computed results", "It converts recursion to a loop", "It reduces space to O(1)"],
              correct: 1,
              body: "Memoization stores results of subproblems so each Fibonacci number is computed only once, reducing time from O(2^n) to O(n).",
            },
          ],
        },
      ],
    },
    {
      no: 11,
      name: "Sorting Algorithms",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Bubble Sort",
          subtitle: "The simplest sorting algorithm",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "How Bubble Sort Works",
              body: "Bubble sort repeatedly steps through the array, comparing adjacent elements and swapping them if they are in the wrong order. The largest unsorted element 'bubbles' to the end each pass. It runs in O(n²) time.",
              code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // swap
      }
    }
  }
  return arr;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]`,
              codeNote: "Each pass guarantees the next largest element is in place.",
            },
            {
              heading: "Optimized Bubble Sort",
              body: "If no swaps occur during a pass, the array is already sorted. We can add an early exit flag to skip unnecessary passes, improving best-case performance to O(n).",
              code: `function bubbleSortOptimized(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // array is sorted
  }
  return arr;
}

console.log(bubbleSortOptimized([1, 2, 3, 4, 5])); // exits after 1 pass`,
              codeNote: "The swapped flag lets us exit early if the array is already sorted.",
            },
          ],
        },
        {
          id: 2,
          title: "Selection Sort",
          subtitle: "Find the minimum and place it",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "How Selection Sort Works",
              body: "Selection sort divides the array into sorted and unsorted portions. In each pass, it finds the minimum element from the unsorted portion and swaps it into position. It always runs in O(n²) time regardless of input.",
              code: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}

console.log(selectionSort([29, 10, 14, 37, 13]));
// [10, 13, 14, 29, 37]`,
              codeNote: "Selection sort makes at most n-1 swaps, fewer than bubble sort.",
            },
            {
              heading: "Selection Sort Characteristics",
              body: "Selection sort performs fewer swaps than bubble sort (at most n-1) but always does O(n²) comparisons. It's not stable — equal elements might change their relative order after sorting.",
              code: `// Comparison of sorting characteristics:
// Bubble Sort:  O(n²) avg, O(n) best (optimized), stable
// Selection Sort: O(n²) always, not stable, fewer swaps

// Selection sort doesn't benefit from partially sorted input
const nearlySorted = [1, 2, 3, 5, 4];
// Bubble sort (optimized): ~1 pass
// Selection sort: still does all n-1 passes
console.log(selectionSort([...nearlySorted])); // [1, 2, 3, 4, 5]`,
              codeNote: "Selection sort always does O(n²) comparisons regardless of input order.",
            },
          ],
        },
        {
          id: 3,
          title: "Merge Sort Concepts",
          subtitle: "Divide, conquer, and merge",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Divide and Conquer with Merge Sort",
              body: "Merge sort splits the array in half recursively until each piece has one element, then merges them back in sorted order. It guarantees O(n log n) time in all cases, making it much faster than O(n²) sorts for large data.",
              code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]`,
              codeNote: "Merge sort is stable and always O(n log n), but uses O(n) extra space.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "Which sorting algorithm always performs O(n²) comparisons, even on sorted input?",
              code: null,
              options: ["Bubble Sort (optimized)", "Merge Sort", "Selection Sort", "Insertion Sort"],
              correct: 2,
              body: "Selection sort always scans the unsorted portion to find the minimum, regardless of whether the input is already sorted.",
            },
            {
              id: "c2",
              question: "What is the time complexity of merge sort?",
              code: null,
              options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
              correct: 2,
              body: "Merge sort divides the array in half (log n levels) and merges at each level (n work), giving O(n log n) in all cases.",
            },
            {
              id: "c3",
              question: "What optimization can make bubble sort exit early?",
              code: null,
              options: ["Using a min heap", "Tracking if any swaps occurred in a pass", "Sorting only the first half", "Using recursion instead of loops"],
              correct: 1,
              body: "If a full pass completes with no swaps, the array is already sorted, so we can stop early.",
            },
          ],
        },
      ],
    },
    {
      no: 12,
      name: "Searching Algorithms",
      difficulty: "Intermediate",
      duration: "14 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Linear Search",
          subtitle: "The brute-force approach",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "How Linear Search Works",
              body: "Linear search checks every element from start to end until it finds the target or exhausts the array. It works on both sorted and unsorted data but runs in O(n) time in the worst case.",
              code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

console.log(linearSearch([4, 2, 7, 1, 9], 7)); // 2
console.log(linearSearch([4, 2, 7, 1, 9], 5)); // -1`,
              codeNote: "Simple and works on any array, but slow for large datasets.",
            },
            {
              heading: "When to Use Linear Search",
              body: "Use linear search when the data is unsorted, the array is small, or you're searching only once. For repeated searches on sorted data, binary search is far more efficient.",
              code: `// Linear search on objects — find by property
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

function findUser(users, name) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].name === name) return users[i];
  }
  return null;
}

console.log(findUser(users, "Bob")); // { id: 2, name: "Bob" }`,
              codeNote: "Linear search is flexible — it can match on any property or condition.",
            },
          ],
        },
        {
          id: 2,
          title: "Binary Search Applications",
          subtitle: "Real-world uses of binary search",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Finding Insertion Position",
              body: "Binary search can find where to insert an element to keep an array sorted. This is the basis for operations like bisect in Python and is used internally by databases for index lookups.",
              code: `// Find the correct insertion index
function searchInsert(arr, target) {
  let left = 0, right = arr.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
  }
  return left;
}

const sorted = [1, 3, 5, 6];
console.log(searchInsert(sorted, 5)); // 2 (already exists)
console.log(searchInsert(sorted, 2)); // 1 (insert between 1 and 3)
console.log(searchInsert(sorted, 7)); // 4 (insert at end)`,
              codeNote: "This is the classic LeetCode 'Search Insert Position' problem.",
            },
            {
              heading: "Finding Peak Element",
              body: "A peak element is greater than its neighbors. Binary search can find a peak in O(log n) by comparing the midpoint to its neighbor and moving toward the higher side.",
              code: `function findPeakElement(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] < arr[mid + 1]) {
      left = mid + 1; // peak is to the right
    } else {
      right = mid;    // peak is at mid or to the left
    }
  }
  return left; // left === right, both point to a peak
}

console.log(findPeakElement([1, 3, 20, 4, 1, 0])); // 2 (value 20)`,
              codeNote: "We always move toward the higher neighbor, guaranteeing we find a peak.",
            },
          ],
        },
        {
          id: 3,
          title: "Search in Rotated Array",
          subtitle: "Binary search on modified sorted data",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Rotated Sorted Array",
              body: "A rotated sorted array is a sorted array that has been shifted. For example [4,5,6,7,0,1,2] was originally [0,1,2,4,5,6,7]. We can still use binary search by determining which half is sorted at each step.",
              code: `function searchRotated(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;

    // Left half is sorted
    if (arr[left] <= arr[mid]) {
      if (target >= arr[left] && target < arr[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    // Right half is sorted
    else {
      if (target > arr[mid] && target <= arr[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}

console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0)); // 4`,
              codeNote: "At least one half is always sorted — use that to decide which half to search.",
            },
            {
              heading: "Finding the Rotation Point",
              body: "You can also use binary search to find the minimum element in a rotated sorted array, which tells you the rotation point. The minimum is where the sorted order breaks.",
              code: `function findMin(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] > arr[right]) {
      left = mid + 1; // min is in right half
    } else {
      right = mid;    // min is at mid or in left half
    }
  }
  return arr[left];
}

console.log(findMin([4, 5, 6, 7, 0, 1, 2])); // 0
console.log(findMin([3, 1, 2])); // 1`,
              codeNote: "Compare mid to right — if mid > right, the rotation point is in the right half.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the time complexity of linear search?",
              code: null,
              options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
              correct: 2,
              body: "Linear search checks each element one by one, so in the worst case it examines all n elements — O(n).",
            },
            {
              id: "c2",
              question: "In a rotated sorted array [4,5,6,7,0,1,2], which half is sorted when mid points to index 3 (value 7)?",
              code: null,
              options: ["Right half only", "Neither half", "Left half [4,5,6,7]", "Both halves"],
              correct: 2,
              body: "Since arr[left]=4 <= arr[mid]=7, the left half [4,5,6,7] is sorted. The rotation break is in the right half.",
            },
            {
              id: "c3",
              question: "Why can binary search find a peak element in O(log n)?",
              code: null,
              options: ["Because the array is sorted", "Because it always moves toward the higher neighbor", "Because peak is always in the middle", "Because it uses recursion"],
              correct: 1,
              body: "By always moving toward the higher neighbor, binary search guarantees it will converge on a peak, eliminating half the array each step.",
            },
          ],
        },
      ],
    },
    {
      no: 13,
      name: "Trees",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Binary Tree Concepts",
          subtitle: "Nodes, edges, and tree structure",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What is a Binary Tree?",
              body: "A binary tree is a hierarchical data structure where each node has at most two children called left and right. The topmost node is called the root, and nodes with no children are called leaves.",
              code: `// Defining a tree node in JavaScript
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// Building a simple tree:
//       1
//      / \\
//     2   3
//    / \\
//   4   5
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);`,
              codeNote: "Each node stores a value and pointers to its left and right children.",
            },
            {
              heading: "Tree Terminology",
              body: "The depth of a node is the number of edges from the root to that node. The height of a tree is the longest path from root to a leaf. A tree with n nodes has exactly n-1 edges.",
              code: `// Tree properties
//       1        ← depth 0 (root), height of tree = 2
//      / \\
//     2   3      ← depth 1
//    / \\
//   4   5        ← depth 2 (leaves)

// Counting nodes and height
function getHeight(node) {
  if (node === null) return -1;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

console.log(getHeight(root)); // 2`,
              codeNote: "Height is defined as edges, so a single node has height 0.",
            },
          ],
        },
        {
          id: 2,
          title: "Inorder & Preorder Traversal",
          subtitle: "Visiting every node systematically",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Inorder Traversal (Left, Root, Right)",
              body: "Inorder traversal visits the left subtree first, then the current node, then the right subtree. For a binary search tree, this visits nodes in ascending sorted order.",
              code: `// Inorder: Left → Root → Right
function inorder(node, result = []) {
  if (node === null) return result;
  inorder(node.left, result);
  result.push(node.val);
  inorder(node.right, result);
  return result;
}

//       1
//      / \\
//     2   3
//    / \\
//   4   5
console.log(inorder(root)); // [4, 2, 5, 1, 3]`,
              codeNote: "Inorder on a BST gives sorted output — a very useful property.",
            },
            {
              heading: "Preorder Traversal (Root, Left, Right)",
              body: "Preorder traversal visits the current node first, then the left subtree, then the right subtree. It's useful for creating a copy of the tree or for serializing tree structures.",
              code: `// Preorder: Root → Left → Right
function preorder(node, result = []) {
  if (node === null) return result;
  result.push(node.val);
  preorder(node.left, result);
  preorder(node.right, result);
  return result;
}

console.log(preorder(root)); // [1, 2, 4, 5, 3]`,
              codeNote: "Preorder visits the root before its children — think 'process first, recurse later.'",
            },
          ],
        },
        {
          id: 3,
          title: "Postorder & Level-Order",
          subtitle: "More traversal patterns",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Postorder Traversal (Left, Right, Root)",
              body: "Postorder traversal visits both children before the current node. It's useful for deletion operations and evaluating expression trees, where you need children processed before the parent.",
              code: `// Postorder: Left → Right → Root
function postorder(node, result = []) {
  if (node === null) return result;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.val);
  return result;
}

console.log(postorder(root)); // [4, 5, 2, 3, 1]`,
              codeNote: "Postorder processes children first — useful for bottom-up operations.",
            },
            {
              heading: "Level-Order Traversal (BFS)",
              body: "Level-order traversal visits nodes level by level from top to bottom, left to right. It uses a queue and is essentially BFS on a tree. This is great for finding the shortest path from root to any node.",
              code: `// Level-order using a queue
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

console.log(levelOrder(root)); // [1, 2, 3, 4, 5]`,
              codeNote: "Level-order is the only traversal that uses a queue instead of recursion.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the inorder traversal of this tree?\n       1\n      / \\\n     2   3\n    / \\\n   4   5",
              code: null,
              options: ["[1, 2, 4, 5, 3]", "[4, 2, 5, 1, 3]", "[4, 5, 2, 3, 1]", "[1, 2, 3, 4, 5]"],
              correct: 1,
              body: "Inorder visits Left, Root, Right: go left to 4, back to 2, right to 5, back to 1, right to 3 → [4, 2, 5, 1, 3].",
            },
            {
              id: "c2",
              question: "Which traversal uses a queue data structure?",
              code: null,
              options: ["Inorder", "Preorder", "Postorder", "Level-order"],
              correct: 3,
              body: "Level-order traversal (BFS) uses a queue to visit nodes level by level from top to bottom.",
            },
            {
              id: "c3",
              question: "What is the height of a tree with only a root node?",
              code: null,
              options: ["-1", "0", "1", "2"],
              correct: 1,
              body: "Height is the longest path (in edges) from root to a leaf. A single node has no edges, so its height is 0.",
            },
          ],
        },
      ],
    },
    {
      no: 14,
      name: "Binary Search Trees",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "BST Property",
          subtitle: "The ordering rule that powers efficient search",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What Makes a BST?",
              body: "A binary search tree (BST) is a binary tree where for every node, all values in the left subtree are smaller and all values in the right subtree are larger. This property enables O(log n) search, insert, and delete on balanced trees.",
              code: `// Valid BST:
//        8
//       / \\
//      3   10
//     / \\    \\
//    1   6   14

// Validate if a tree is a BST
function isValidBST(node, min = -Infinity, max = Infinity) {
  if (node === null) return true;
  if (node.val <= min || node.val >= max) return false;
  return (
    isValidBST(node.left, min, node.val) &&
    isValidBST(node.right, node.val, max)
  );
}`,
              codeNote: "Each node must fit within a valid range based on its ancestors.",
            },
            {
              heading: "Searching in a BST",
              body: "To search in a BST, compare the target with the current node. If smaller, go left; if larger, go right. This halves the search space at each step, just like binary search on an array.",
              code: `function searchBST(node, target) {
  if (node === null) return null;
  if (target === node.val) return node;
  if (target < node.val) return searchBST(node.left, target);
  return searchBST(node.right, target);
}

// Building the BST:
//        8
//       / \\
//      3   10
const bst = new TreeNode(8);
bst.left = new TreeNode(3);
bst.right = new TreeNode(10);
bst.left.left = new TreeNode(1);
bst.left.right = new TreeNode(6);

console.log(searchBST(bst, 6)); // TreeNode { val: 6, ... }
console.log(searchBST(bst, 7)); // null`,
              codeNote: "Average case O(log n), worst case O(n) if the tree is skewed like a linked list.",
            },
          ],
        },
        {
          id: 2,
          title: "BST Insert",
          subtitle: "Adding elements while maintaining order",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Inserting into a BST",
              body: "To insert a value, traverse the tree like a search. When you reach a null position, that's where the new node belongs. The BST property is automatically maintained since we always place the node in the correct subtree.",
              code: `function insertBST(node, val) {
  if (node === null) return new TreeNode(val);
  if (val < node.val) {
    node.left = insertBST(node.left, val);
  } else {
    node.right = insertBST(node.right, val);
  }
  return node;
}

// Insert 5, 2, 8, 1, 4 into an empty BST
let tree = null;
[5, 2, 8, 1, 4].forEach(val => {
  tree = insertBST(tree, val);
});
// Result:    5
//           / \\
//          2   8
//         / \\
//        1   4`,
              codeNote: "Insertion order determines the tree shape. Sorted input creates a skewed tree.",
            },
            {
              heading: "Insertion Order Matters",
              body: "The same set of values can create different tree shapes depending on insertion order. Inserting sorted data creates a degenerate (linked-list-like) tree with O(n) operations. Balanced trees solve this problem.",
              code: `// Inserting [1, 2, 3, 4, 5] gives a skewed tree:
// 1
//  \\
//   2
//    \\
//     3  → O(n) search!
//      \\
//       4
//        \\
//         5

// Inserting [3, 1, 5, 2, 4] gives a balanced tree:
//     3
//    / \\
//   1   5   → O(log n) search!
//    \\ /
//    2 4`,
              codeNote: "Self-balancing BSTs (AVL, Red-Black) fix the skew problem automatically.",
            },
          ],
        },
        {
          id: 3,
          title: "BST Delete",
          subtitle: "Removing nodes while keeping BST property",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Three Cases for Deletion",
              body: "Deleting from a BST has three cases: (1) the node is a leaf — just remove it, (2) the node has one child — replace it with that child, (3) the node has two children — replace it with its inorder successor (smallest value in the right subtree).",
              code: `function deleteBST(node, val) {
  if (node === null) return null;

  if (val < node.val) {
    node.left = deleteBST(node.left, val);
  } else if (val > node.val) {
    node.right = deleteBST(node.right, val);
  } else {
    // Case 1 & 2: no child or one child
    if (node.left === null) return node.right;
    if (node.right === null) return node.left;

    // Case 3: two children — find inorder successor
    let successor = node.right;
    while (successor.left !== null) {
      successor = successor.left;
    }
    node.val = successor.val;
    node.right = deleteBST(node.right, successor.val);
  }
  return node;
}`,
              codeNote: "The inorder successor is the smallest node in the right subtree.",
            },
            {
              heading: "Deletion Example Walkthrough",
              body: "Let's delete node 3 from a BST where 3 has two children. We find the inorder successor (the smallest value in 3's right subtree), copy its value to 3's position, then delete the successor from the right subtree.",
              code: `//  Delete 3 from:      Result:
//       5                  5
//      / \\                / \\
//     3   7     →        4   7
//    / \\                /
//   2   4              2
//
// Step 1: Node 3 has two children
// Step 2: Inorder successor = 4 (smallest in right subtree)
// Step 3: Copy 4 to node 3's position
// Step 4: Delete the original 4 node (leaf, easy)`,
              codeNote: "The inorder successor always has at most one child, simplifying its removal.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "In a BST, which traversal produces sorted output?",
              code: null,
              options: ["Preorder", "Postorder", "Inorder", "Level-order"],
              correct: 2,
              body: "Inorder traversal (Left, Root, Right) of a BST visits nodes in ascending order because left children are always smaller than the root.",
            },
            {
              id: "c2",
              question: "When deleting a BST node with two children, what replaces it?",
              code: null,
              options: ["The left child", "The right child", "The inorder successor", "The parent node"],
              correct: 2,
              body: "The inorder successor (smallest node in the right subtree) replaces the deleted node, maintaining the BST property.",
            },
            {
              id: "c3",
              question: "What tree shape results from inserting sorted data [1,2,3,4,5] into a BST?",
              code: null,
              options: ["Balanced tree", "Complete tree", "Skewed tree (like a linked list)", "Full binary tree"],
              correct: 2,
              body: "Sorted insertions always go to the right, creating a degenerate right-skewed tree where operations degrade to O(n).",
            },
          ],
        },
      ],
    },
    {
      no: 15,
      name: "Heaps",
      difficulty: "Intermediate",
      duration: "16 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Min Heap & Max Heap",
          subtitle: "Complete binary trees with an ordering rule",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What is a Heap?",
              body: "A heap is a complete binary tree stored as an array. In a min heap, every parent is smaller than its children, so the smallest element is always at the root. In a max heap, every parent is larger, so the largest element is at the root.",
              code: `// Min Heap as an array:
// Index: [0,  1,  2,  3,  4,  5]
// Value: [1,  3,  5,  7,  9,  8]
//
// Tree view:
//         1
//        / \\
//       3   5
//      / \\ /
//     7  9 8
//
// Parent of index i: Math.floor((i - 1) / 2)
// Left child of i:  2 * i + 1
// Right child of i: 2 * i + 2

const parent = (i) => Math.floor((i - 1) / 2);
const leftChild = (i) => 2 * i + 1;
const rightChild = (i) => 2 * i + 2;`,
              codeNote: "Heaps use array indices to represent the tree — no pointers needed.",
            },
            {
              heading: "Min Heap vs Max Heap",
              body: "A min heap gives O(1) access to the smallest element, while a max heap gives O(1) access to the largest. Both support O(log n) insert and delete. Choose based on whether you need quick access to the minimum or maximum.",
              code: `// Min Heap: parent <= children (root is smallest)
// [1, 3, 5, 7, 9, 8]
//    1 ≤ 3 ✓, 1 ≤ 5 ✓, 3 ≤ 7 ✓, 3 ≤ 9 ✓, 5 ≤ 8 ✓

// Max Heap: parent >= children (root is largest)
// [9, 7, 8, 3, 5, 1]
//    9 ≥ 7 ✓, 9 ≥ 8 ✓, 7 ≥ 3 ✓, 7 ≥ 5 ✓, 8 ≥ 1 ✓

// Common uses:
// Min heap → find minimum, Dijkstra's algorithm
// Max heap → find maximum, heap sort, scheduling`,
              codeNote: "The heap property only applies between parent and children — siblings have no order.",
            },
          ],
        },
        {
          id: 2,
          title: "Heap Operations",
          subtitle: "Insert, extract, and heapify",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Insert (Bubble Up)",
              body: "To insert into a min heap, add the element at the end of the array, then 'bubble up' by swapping with its parent while the parent is larger. This restores the heap property in O(log n) time.",
              code: `class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  _bubbleUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p] <= this.heap[i]) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }
}

const h = new MinHeap();
[5, 3, 8, 1, 2].forEach(v => h.insert(v));
console.log(h.heap); // [1, 2, 8, 5, 3]`,
              codeNote: "Bubble up swaps the new element upward until the heap property holds.",
            },
            {
              heading: "Extract Min (Bubble Down)",
              body: "To remove the minimum, replace the root with the last element, then 'bubble down' by swapping with the smaller child until the heap property is restored. This also takes O(log n).",
              code: `// Add to MinHeap class:
extractMin() {
  if (this.heap.length === 0) return null;
  const min = this.heap[0];
  const last = this.heap.pop();
  if (this.heap.length > 0) {
    this.heap[0] = last;
    this._bubbleDown(0);
  }
  return min;
}

_bubbleDown(i) {
  const n = this.heap.length;
  while (true) {
    let smallest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
    if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
    if (smallest === i) break;
    [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
    i = smallest;
  }
}`,
              codeNote: "Bubble down always swaps with the smaller child to maintain min-heap order.",
            },
          ],
        },
        {
          id: 3,
          title: "Priority Queue",
          subtitle: "Heaps power efficient priority queues",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Priority Queue with a Heap",
              body: "A priority queue serves elements by priority, not insertion order. A min heap is the ideal backing structure — enqueue is insert (O(log n)) and dequeue is extract-min (O(log n)). Arrays would need O(n) for one of these operations.",
              code: `// Priority Queue using our MinHeap
class PriorityQueue {
  constructor() {
    this.heap = new MinHeap();
  }

  enqueue(val, priority) {
    this.heap.insert({ val, priority });
  }

  dequeue() {
    return this.heap.extractMin();
  }

  peek() {
    return this.heap.heap[0] || null;
  }
}

// Usage: task scheduling
const pq = new PriorityQueue();
pq.enqueue("Low priority task", 10);
pq.enqueue("Urgent task", 1);
pq.enqueue("Medium task", 5);
// dequeue() returns urgent task first`,
              codeNote: "Modify the MinHeap comparisons to use .priority for this to work.",
            },
            {
              heading: "Heap Sort",
              body: "Heap sort builds a max heap from the array, then repeatedly extracts the maximum to build the sorted result. It runs in O(n log n) time and sorts in-place with O(1) extra space.",
              code: `function heapSort(arr) {
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; // move max to end
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const l = 2 * i + 1, r = 2 * i + 2;
  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

console.log(heapSort([4, 10, 3, 5, 1])); // [1, 3, 4, 5, 10]`,
              codeNote: "Heap sort is O(n log n) with O(1) extra space — better space than merge sort.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "In a min heap, where is the smallest element?",
              code: null,
              options: ["Last element", "A random leaf", "The root (index 0)", "The deepest left node"],
              correct: 2,
              body: "In a min heap, every parent is smaller than its children, so the minimum value is always at the root (index 0 in the array).",
            },
            {
              id: "c2",
              question: "What is the time complexity of inserting into a heap?",
              code: null,
              options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
              correct: 1,
              body: "Insertion adds the element at the end and bubbles it up. The maximum number of swaps is the tree height, which is O(log n).",
            },
            {
              id: "c3",
              question: "For an element at index i in a heap array, what is the index of its left child?",
              code: null,
              options: ["i + 1", "2 * i", "2 * i + 1", "i / 2"],
              correct: 2,
              body: "In a zero-indexed heap array, the left child of index i is at 2*i + 1 and the right child is at 2*i + 2.",
            },
          ],
        },
      ],
    },
    {
      no: 16,
      name: "Graphs Intro",
      difficulty: "Intermediate",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Graph Terminology",
          subtitle: "Vertices, edges, and graph types",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What is a Graph?",
              body: "A graph is a collection of vertices (nodes) connected by edges. Unlike trees, graphs can have cycles, multiple paths between nodes, and no hierarchy. They model relationships like social networks, maps, and dependencies.",
              code: `// Graph terminology:
// Vertex (node): A point in the graph (e.g., a city)
// Edge: A connection between two vertices (e.g., a road)
// Directed: Edges have a direction (A → B ≠ B → A)
// Undirected: Edges are bidirectional (A — B)
// Weighted: Edges have costs (distances, times)
// Cycle: A path that starts and ends at the same vertex

// Example: Social network (undirected)
// Alice — Bob — Charlie
//   \\       /
//    Dave ---

// Example: Web links (directed)
// PageA → PageB → PageC
//           ↑       |
//           +-------+`,
              codeNote: "Trees are a special case of graphs — connected, acyclic, and undirected.",
            },
            {
              heading: "Degrees and Connectivity",
              body: "The degree of a vertex is the number of edges connected to it. In directed graphs, we distinguish in-degree (incoming edges) and out-degree (outgoing edges). A graph is connected if there's a path between every pair of vertices.",
              code: `// Degree examples:
//     A --- B --- C
//     |         /
//     D ------
//
// Degree of A: 2 (connected to B and D)
// Degree of B: 2 (connected to A and C)
// Degree of C: 2 (connected to B and D)
// Degree of D: 2 (connected to A and C)

// Directed graph degrees:
// A → B → C
// ↑       |
// +-------+
//
// A: in-degree 1 (from C), out-degree 1 (to B)
// B: in-degree 1 (from A), out-degree 1 (to C)
// C: in-degree 1 (from B), out-degree 1 (to A)`,
              codeNote: "Sum of all degrees = 2 × number of edges (each edge contributes to two vertices).",
            },
          ],
        },
        {
          id: 2,
          title: "Adjacency List",
          subtitle: "The most common graph representation",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Representing Graphs with Adjacency Lists",
              body: "An adjacency list stores each vertex as a key, with its value being an array of neighbors. This is memory-efficient for sparse graphs and makes it easy to iterate over a node's neighbors.",
              code: `// Undirected graph adjacency list
//   0 --- 1
//   |     |
//   3 --- 2

const graph = {
  0: [1, 3],
  1: [0, 2],
  2: [1, 3],
  3: [0, 2],
};

// Using Map for flexibility
const graphMap = new Map();
graphMap.set("Alice", ["Bob", "Dave"]);
graphMap.set("Bob", ["Alice", "Charlie"]);
graphMap.set("Charlie", ["Bob"]);
graphMap.set("Dave", ["Alice"]);

console.log(graphMap.get("Alice")); // ["Bob", "Dave"]`,
              codeNote: "Space complexity: O(V + E) where V = vertices, E = edges.",
            },
            {
              heading: "Building a Graph from Edges",
              body: "Often you'll receive edges as pairs and need to build the adjacency list. For undirected graphs, add the edge in both directions. For directed graphs, add it only in the given direction.",
              code: `// Build adjacency list from edge list
function buildGraph(edges, directed = false) {
  const graph = {};
  for (const [u, v] of edges) {
    if (!graph[u]) graph[u] = [];
    if (!graph[v]) graph[v] = [];
    graph[u].push(v);
    if (!directed) graph[v].push(u);
  }
  return graph;
}

const edges = [[0, 1], [0, 3], [1, 2], [2, 3]];
console.log(buildGraph(edges));
// { 0: [1, 3], 1: [0, 2], 2: [1, 3], 3: [0, 2] }

const directed = [[0, 1], [1, 2], [2, 0]];
console.log(buildGraph(directed, true));
// { 0: [1], 1: [2], 2: [0] }`,
              codeNote: "For undirected graphs, each edge is stored twice — once per vertex.",
            },
          ],
        },
        {
          id: 3,
          title: "Adjacency Matrix",
          subtitle: "Grid-based graph representation",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Adjacency Matrix Representation",
              body: "An adjacency matrix is a 2D array where matrix[i][j] = 1 means there's an edge from vertex i to j. It uses O(V²) space, which is efficient for dense graphs but wasteful for sparse ones. Checking if an edge exists is O(1).",
              code: `// Adjacency matrix for:
//   0 --- 1
//   |     |
//   3 --- 2

const matrix = [
  //0  1  2  3
  [0, 1, 0, 1], // vertex 0
  [1, 0, 1, 0], // vertex 1
  [0, 1, 0, 1], // vertex 2
  [1, 0, 1, 0], // vertex 3
];

// Check if edge exists: O(1)
console.log(matrix[0][1]); // 1 (edge 0-1 exists)
console.log(matrix[0][2]); // 0 (no edge 0-2)

// Get all neighbors of vertex 1
const neighbors = matrix[1]
  .map((val, idx) => (val === 1 ? idx : -1))
  .filter(idx => idx !== -1);
console.log(neighbors); // [0, 2]`,
              codeNote: "For undirected graphs, the matrix is symmetric: matrix[i][j] === matrix[j][i].",
            },
            {
              heading: "Adjacency List vs Matrix",
              body: "Use adjacency lists for sparse graphs (few edges relative to vertices) and adjacency matrices for dense graphs. Most real-world graphs are sparse, so adjacency lists are the default choice in practice.",
              code: `// Comparison:
//                  Adjacency List    Adjacency Matrix
// Space:           O(V + E)          O(V²)
// Check edge:      O(degree(v))      O(1)
// Get neighbors:   O(degree(v))      O(V)
// Add edge:        O(1)              O(1)
// Add vertex:      O(1)              O(V²) rebuild

// Rule of thumb:
// Sparse graph (E << V²) → Adjacency List ✓
// Dense graph (E ≈ V²)  → Adjacency Matrix ✓
// Need quick edge check → Adjacency Matrix ✓
// Need to iterate neighbors → Adjacency List ✓`,
              codeNote: "Social networks with millions of users but ~hundreds of friends each → adjacency list.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the space complexity of an adjacency list?",
              code: null,
              options: ["O(V)", "O(E)", "O(V + E)", "O(V²)"],
              correct: 2,
              body: "An adjacency list stores each vertex once and each edge once (or twice for undirected), giving O(V + E) space.",
            },
            {
              id: "c2",
              question: "In an undirected graph, if you add edge (A, B), how many entries are added to the adjacency list?",
              code: null,
              options: ["One: A → B", "Two: A → B and B → A", "Three", "Depends on the graph size"],
              correct: 1,
              body: "In an undirected graph, an edge between A and B means A can reach B and B can reach A, so both adjacency lists get an entry.",
            },
            {
              id: "c3",
              question: "When is an adjacency matrix preferred over an adjacency list?",
              code: null,
              options: ["When the graph is sparse", "When the graph is dense", "When nodes have string labels", "When the graph is a tree"],
              correct: 1,
              body: "An adjacency matrix is efficient for dense graphs where most vertex pairs are connected, since the O(V²) space is fully utilized and edge lookups are O(1).",
            },
          ],
        },
      ],
    },
    {
      no: 17,
      name: "BFS (Breadth-First Search)",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Queue-Based Traversal",
          subtitle: "Exploring graphs level by level",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What Is BFS?",
              body: "Breadth-First Search explores a graph layer by layer, visiting all neighbors of the current node before moving deeper. It uses a queue (FIFO) to track which node to visit next.",
              code: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const node = queue.shift();
    console.log(node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
              codeNote: "We mark nodes visited when they enter the queue, not when they are processed, to avoid duplicates.",
            },
            {
              heading: "Level-Order Traversal",
              body: "BFS naturally produces a level-order traversal. By tracking the queue size at each iteration, you can group nodes by their distance from the source.",
              code: `function bfsLevelOrder(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  let level = 0;

  while (queue.length > 0) {
    const size = queue.length;
    const currentLevel = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      currentLevel.push(node);
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    console.log(\`Level \${level}:\`, currentLevel);
    level++;
  }
}`,
              codeNote: "Snapshot queue.length before the inner loop so you process exactly one level per outer iteration.",
            },
          ],
        },
        {
          id: 2,
          title: "Shortest Path (Unweighted)",
          subtitle: "Finding the fewest hops between nodes",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "BFS for Shortest Path",
              body: "In an unweighted graph every edge has cost 1, so BFS guarantees the shortest path. The first time BFS reaches a node, it has found the minimum number of edges from the source.",
              code: `function shortestPath(graph, start, end) {
  const visited = new Set([start]);
  const queue = [[start, [start]]];

  while (queue.length > 0) {
    const [node, path] = queue.shift();
    if (node === end) return path;

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  return null; // no path found
}`,
              codeNote: "We carry the path along in the queue so we can reconstruct it when the destination is found.",
            },
            {
              heading: "Distance Map",
              body: "Instead of tracking full paths, you can store distances in a Map for every reachable node. This is more memory-efficient when you only need hop counts.",
              code: `function bfsDistances(graph, start) {
  const dist = new Map([[start, 0]]);
  const queue = [start];

  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbor of graph[node]) {
      if (!dist.has(neighbor)) {
        dist.set(neighbor, dist.get(node) + 1);
        queue.push(neighbor);
      }
    }
  }
  return dist;
}`,
              codeNote: "dist.has(neighbor) doubles as the visited check, keeping the code concise.",
            },
          ],
        },
        {
          id: 3,
          title: "BFS on Grids",
          subtitle: "Applying BFS to 2D problems",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Grid BFS Pattern",
              body: "Many interview problems model a grid as a graph. Each cell is a node and its 4-directional neighbors are edges. BFS finds the shortest path through a maze or the nearest target.",
              code: `function gridBFS(grid, startRow, startCol) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[startRow, startCol, 0]];
  visited[startRow][startCol] = true;

  while (queue.length > 0) {
    const [r, c, dist] = queue.shift();
    if (grid[r][c] === "goal") return dist;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
          && !visited[nr][nc] && grid[nr][nc] !== "wall") {
        visited[nr][nc] = true;
        queue.push([nr, nc, dist + 1]);
      }
    }
  }
  return -1;
}`,
              codeNote: "Always bounds-check nr/nc before accessing the grid to avoid index-out-of-range errors.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What data structure does BFS use to determine the next node to visit?",
              code: null,
              options: ["Stack", "Queue", "Priority Queue", "Hash Map"],
              correct: 1,
              body: "BFS uses a queue (FIFO) so that nodes are explored in the order they were discovered, ensuring level-by-level traversal.",
            },
            {
              id: "c2",
              question: "Why does BFS guarantee the shortest path in an unweighted graph?",
              code: null,
              options: [
                "It always picks the smallest edge",
                "It visits nodes in order of increasing distance",
                "It uses dynamic programming",
                "It backtracks when it finds a dead end",
              ],
              correct: 1,
              body: "Because every edge has the same cost, processing nodes level by level means the first time a node is reached is via the fewest edges.",
            },
            {
              id: "c3",
              question: "What is the time complexity of BFS on a graph with V vertices and E edges?",
              code: null,
              options: ["O(V)", "O(E)", "O(V + E)", "O(V × E)"],
              correct: 2,
              body: "BFS visits every vertex once and examines every edge once, so the total work is O(V + E).",
            },
          ],
        },
      ],
    },
    {
      no: 18,
      name: "DFS (Depth-First Search)",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Recursive & Iterative DFS",
          subtitle: "Stack-based deep exploration",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "Recursive DFS",
              body: "Depth-First Search dives as deep as possible along each branch before backtracking. The call stack naturally provides the LIFO behavior needed.",
              code: `function dfsRecursive(graph, node, visited = new Set()) {
  visited.add(node);
  console.log(node);

  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfsRecursive(graph, neighbor, visited);
    }
  }
}`,
              codeNote: "Pass the visited set by reference so all recursive calls share it.",
            },
            {
              heading: "Iterative DFS",
              body: "You can avoid potential stack overflow by using an explicit stack. The iterative version processes nodes in a slightly different order than the recursive one, but both are valid DFS traversals.",
              code: `function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];

  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    console.log(node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
}`,
              codeNote: "We check visited after popping because a node may be pushed multiple times before it is processed.",
            },
          ],
        },
        {
          id: 2,
          title: "Cycle Detection",
          subtitle: "Finding loops in directed graphs",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Three-Color Technique",
              body: "To detect cycles in a directed graph, mark each node as WHITE (unvisited), GRAY (in current path), or BLACK (fully processed). A back edge to a GRAY node means a cycle exists.",
              code: `function hasCycle(graph) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};
  for (const node of Object.keys(graph)) color[node] = WHITE;

  function dfs(node) {
    color[node] = GRAY;
    for (const neighbor of graph[node]) {
      if (color[neighbor] === GRAY) return true;  // cycle!
      if (color[neighbor] === WHITE && dfs(neighbor)) return true;
    }
    color[node] = BLACK;
    return false;
  }

  for (const node of Object.keys(graph)) {
    if (color[node] === WHITE && dfs(node)) return true;
  }
  return false;
}`,
              codeNote: "GRAY nodes are ancestors on the current DFS path. A GRAY-to-GRAY edge is a back edge, confirming a cycle.",
            },
            {
              heading: "Topological Sort Overview",
              body: "A topological ordering of a DAG lists every node before all nodes it points to. DFS-based topological sort appends a node to the result after all its descendants are processed, then reverses at the end.",
              code: `function topologicalSort(graph) {
  const visited = new Set();
  const result = [];

  function dfs(node) {
    visited.add(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) dfs(neighbor);
    }
    result.push(node); // post-order
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) dfs(node);
  }
  return result.reverse();
}`,
              codeNote: "This only works on DAGs. If the graph has a cycle, topological ordering is impossible.",
            },
          ],
        },
        {
          id: 3,
          title: "Connected Components",
          subtitle: "Counting islands with DFS",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Counting Components",
              body: "In an undirected graph, each DFS from an unvisited node explores one connected component. The number of times you start a new DFS equals the number of components.",
              code: `function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }

  const visited = new Set();
  let components = 0;

  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      components++;
      // DFS flood-fill
      const stack = [i];
      while (stack.length > 0) {
        const node = stack.pop();
        if (visited.has(node)) continue;
        visited.add(node);
        for (const nb of graph[node]) stack.push(nb);
      }
    }
  }
  return components;
}`,
              codeNote: "This is the same idea behind the classic 'Number of Islands' grid problem.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What data structure does DFS implicitly or explicitly use?",
              code: null,
              options: ["Queue", "Stack", "Priority Queue", "Deque"],
              correct: 1,
              body: "DFS relies on LIFO ordering. The recursive version uses the call stack; the iterative version uses an explicit stack.",
            },
            {
              id: "c2",
              question: "In the three-color cycle detection, what does encountering a GRAY neighbor indicate?",
              code: null,
              options: [
                "The neighbor is fully processed",
                "The neighbor is unvisited",
                "There is a cycle",
                "The graph is a tree",
              ],
              correct: 2,
              body: "A GRAY node is an ancestor in the current DFS path. Reaching it again means we have found a back edge, which proves a cycle exists.",
            },
            {
              id: "c3",
              question: "Topological sort is valid only for which kind of graph?",
              code: null,
              options: [
                "Undirected graphs",
                "Directed Acyclic Graphs (DAGs)",
                "Weighted graphs",
                "Complete graphs",
              ],
              correct: 1,
              body: "A topological ordering requires that every node comes before all nodes it points to, which is only possible when there are no cycles — i.e., a DAG.",
            },
          ],
        },
      ],
    },
    {
      no: 19,
      name: "Dynamic Programming Intro",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Overlapping Subproblems",
          subtitle: "Why DP beats brute force",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "The Core Idea",
              body: "Dynamic programming optimizes problems where the same subproblems are solved repeatedly. Instead of recomputing them, we store results and reuse them. This turns exponential solutions into polynomial ones.",
              code: `// Naive Fibonacci — O(2^n)
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// fib(5) calls fib(3) twice, fib(2) three times, etc.
// The recursion tree explodes exponentially.`,
              codeNote: "Draw the recursion tree for fib(5) — you'll see duplicate subtrees everywhere.",
            },
            {
              heading: "Memoization (Top-Down)",
              body: "Memoization adds a cache to the recursive solution. Before computing a subproblem, check if the answer is already stored. This is the easiest way to convert a recursive solution into a DP one.",
              code: `function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

console.log(fibMemo(50)); // instant, O(n) time`,
              codeNote: "Each subproblem is computed exactly once, bringing the time complexity down to O(n).",
            },
          ],
        },
        {
          id: 2,
          title: "Tabulation (Bottom-Up)",
          subtitle: "Building answers iteratively",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Bottom-Up Fibonacci",
              body: "Tabulation fills a table starting from the base cases and works upward. It avoids recursion overhead entirely and makes the computation order explicit.",
              code: `function fibTab(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`,
              codeNote: "Tabulation is often preferred in interviews because it's easier to analyze space and avoids stack overflow.",
            },
            {
              heading: "Space Optimization",
              body: "When the current state only depends on a fixed number of previous states, you can reduce space from O(n) to O(1) by keeping only the needed variables.",
              code: `function fibOptimized(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`,
              codeNote: "This O(1) space trick applies to many 1D DP problems, not just Fibonacci.",
            },
          ],
        },
        {
          id: 3,
          title: "Climbing Stairs",
          subtitle: "A classic DP warm-up",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Problem & Recurrence",
              body: "You can climb 1 or 2 steps at a time. The number of ways to reach step n is ways(n-1) + ways(n-2), identical to Fibonacci. Recognizing this recurrence is the key DP skill.",
              code: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

console.log(climbStairs(5)); // 8 ways`,
              codeNote: "Many DP problems reduce to Fibonacci-like recurrences once you identify the state transition.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What are the two key properties a problem must have for DP to apply?",
              code: null,
              options: [
                "Greedy choice and sorted input",
                "Overlapping subproblems and optimal substructure",
                "Divide-and-conquer and backtracking",
                "Constant time operations and logarithmic depth",
              ],
              correct: 1,
              body: "DP requires overlapping subproblems (same sub-computations recur) and optimal substructure (optimal solution builds from optimal sub-solutions).",
            },
            {
              id: "c2",
              question: "What is the time complexity of memoized Fibonacci for fib(n)?",
              code: null,
              options: ["O(2^n)", "O(n log n)", "O(n)", "O(n²)"],
              correct: 2,
              body: "Each of the n subproblems is solved exactly once and cached, so the total work is O(n).",
            },
            {
              id: "c3",
              question: "Which DP approach fills a table from base cases upward without recursion?",
              code: null,
              options: ["Memoization", "Tabulation", "Greedy", "Divide and conquer"],
              correct: 1,
              body: "Tabulation (bottom-up DP) iteratively fills a table starting from known base cases, avoiding recursion entirely.",
            },
          ],
        },
      ],
    },
    {
      no: 20,
      name: "DP Patterns",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "0/1 Knapsack",
          subtitle: "Pick or skip each item",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "Problem Setup",
              body: "Given items with weights and values and a knapsack capacity, maximize total value without exceeding the weight limit. Each item can be taken at most once.",
              code: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // skip item i
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      }
    }
  }
  return dp[n][capacity];
}`,
              codeNote: "dp[i][w] = best value using items 1..i with capacity w. We either skip or take item i.",
            },
            {
              heading: "Space-Optimized Knapsack",
              body: "Since each row only depends on the previous row, we can use a single 1D array. Iterate capacity in reverse to avoid using an item twice in the same row.",
              code: `function knapsack1D(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}`,
              codeNote: "Reverse iteration is the key trick — it ensures each item is considered at most once per row.",
            },
          ],
        },
        {
          id: 2,
          title: "Coin Change",
          subtitle: "Minimum coins to make a target",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Unbounded Knapsack Variant",
              body: "Given coin denominations and a target amount, find the minimum number of coins needed. Each coin can be used unlimited times, making this an unbounded knapsack variant.",
              code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 5, 10, 25], 30)); // 2 (25+5)`,
              codeNote: "dp[a] = minimum coins to make amount a. We try every coin and pick the best.",
            },
            {
              heading: "LCS Introduction",
              body: "The Longest Common Subsequence problem finds the longest sequence common to two strings (not necessarily contiguous). It's a foundational 2D DP problem used in diff tools and bioinformatics.",
              code: `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

console.log(lcs("abcde", "ace")); // 3 ("ace")`,
              codeNote: "If characters match, extend the diagonal. Otherwise take the best of skipping one character from either string.",
            },
          ],
        },
        {
          id: 3,
          title: "Recognizing DP Patterns",
          subtitle: "When to reach for DP",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Pattern Recognition Tips",
              body: "DP problems often ask for min/max/count of ways. Look for choices at each step that lead to overlapping subproblems. Common signals: 'minimum cost', 'number of ways', 'is it possible', or a constraint that limits brute-force.",
              code: `// Common DP categories:
// 1. Linear DP      — climb stairs, house robber, max subarray
// 2. Knapsack       — subset sum, coin change, 0/1 knapsack
// 3. String DP      — LCS, edit distance, palindrome
// 4. Grid DP        — unique paths, min path sum
// 5. Interval DP    — matrix chain, burst balloons
// 6. Tree DP        — max path sum, diameter

// Approach:
// 1. Define state (what info do you need?)
// 2. Write recurrence (how does state relate to sub-states?)
// 3. Identify base cases
// 4. Decide top-down (memo) or bottom-up (table)
// 5. Optimize space if possible`,
              codeNote: "Start with brute-force recursion, add memoization, then convert to tabulation if needed.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "In the 0/1 knapsack, why do we iterate capacity in reverse for the 1D optimization?",
              code: null,
              options: [
                "To sort items by weight",
                "To prevent using the same item twice",
                "To maximize profit",
                "To reduce time complexity",
              ],
              correct: 1,
              body: "Iterating in reverse ensures that when we compute dp[w], dp[w - weight[i]] still holds the value from the previous row (without item i), preventing double-counting.",
            },
            {
              id: "c2",
              question: "What does dp[a] represent in the coin change algorithm?",
              code: null,
              options: [
                "The maximum coins for amount a",
                "The minimum coins for amount a",
                "The number of ways to make amount a",
                "Whether amount a is reachable",
              ],
              correct: 1,
              body: "dp[a] stores the fewest coins needed to make exactly amount a. We initialize with Infinity and update whenever a coin yields a better solution.",
            },
            {
              id: "c3",
              question: "In LCS, when s1[i-1] !== s2[j-1], what do we do?",
              code: null,
              options: [
                "dp[i][j] = 0",
                "dp[i][j] = dp[i-1][j-1]",
                "dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
                "dp[i][j] = dp[i-1][j] + dp[i][j-1]",
              ],
              correct: 2,
              body: "When characters don't match, we take the longer subsequence from either skipping a character in s1 or s2: max(dp[i-1][j], dp[i][j-1]).",
            },
          ],
        },
      ],
    },
    {
      no: 21,
      name: "Greedy Algorithms",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Greedy Strategy",
          subtitle: "Locally optimal choices",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What Makes an Algorithm Greedy?",
              body: "A greedy algorithm makes the locally best choice at each step, hoping it leads to a global optimum. It works when the problem has the greedy-choice property and optimal substructure.",
              code: `// Activity Selection Problem
// Given activities with start and end times,
// select the maximum number of non-overlapping activities.

function activitySelection(activities) {
  // Sort by end time (greedy choice: pick earliest finish)
  activities.sort((a, b) => a.end - b.end);

  const selected = [activities[0]];
  let lastEnd = activities[0].end;

  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= lastEnd) {
      selected.push(activities[i]);
      lastEnd = activities[i].end;
    }
  }
  return selected;
}`,
              codeNote: "Sorting by end time is the key greedy insight — it leaves the most room for future activities.",
            },
            {
              heading: "Why Greedy Works Here",
              body: "For activity selection, choosing the activity that finishes earliest never blocks a better solution. This greedy-choice property can be proven by exchange argument: swapping any other choice with the greedy one is never worse.",
              code: `// Example
const activities = [
  { name: "A", start: 0, end: 3 },
  { name: "B", start: 1, end: 4 },
  { name: "C", start: 3, end: 5 },
  { name: "D", start: 4, end: 7 },
  { name: "E", start: 5, end: 9 },
  { name: "F", start: 8, end: 10 },
];

const result = activitySelection(activities);
console.log(result.map(a => a.name)); // ["A","C","F"]`,
              codeNote: "Three non-overlapping activities is the maximum possible — greedy found it in O(n log n).",
            },
          ],
        },
        {
          id: 2,
          title: "Fractional Knapsack",
          subtitle: "Greedy on continuous items",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Fractional vs 0/1 Knapsack",
              body: "Unlike 0/1 knapsack, the fractional variant allows taking fractions of items. This makes greedy optimal: sort by value-per-weight ratio and take as much as possible of the best items first.",
              code: `function fractionalKnapsack(items, capacity) {
  // Sort by value/weight ratio descending
  items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

  let totalValue = 0;
  let remaining = capacity;

  for (const item of items) {
    if (remaining <= 0) break;
    const take = Math.min(item.weight, remaining);
    totalValue += take * (item.value / item.weight);
    remaining -= take;
  }
  return totalValue;
}`,
              codeNote: "Greedy works here because we can take fractions. For 0/1 knapsack (whole items only), DP is needed.",
            },
            {
              heading: "Greedy vs DP",
              body: "Greedy is simpler and faster but only works when locally optimal choices guarantee a global optimum. DP is more general — it explores all sub-choices. If you can't prove the greedy-choice property, use DP.",
              code: `// When to use Greedy vs DP:
//
// GREEDY works when:
//  - Problem has greedy-choice property
//  - Making locally best choice doesn't hurt future
//  - Examples: activity selection, Huffman coding,
//    fractional knapsack, minimum spanning tree
//
// DP is needed when:
//  - Choices affect future options
//  - Need to compare multiple subproblem solutions
//  - Examples: 0/1 knapsack, longest common subsequence,
//    edit distance, matrix chain multiplication`,
              codeNote: "If greedy gives a wrong answer on a small test case, switch to DP.",
            },
          ],
        },
        {
          id: 3,
          title: "Interval Scheduling",
          subtitle: "A common greedy template",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Minimum Meeting Rooms",
              body: "Given a list of meeting intervals, find the minimum number of rooms required. This classic problem uses a greedy approach: sort events by time, track overlaps with a counter or min-heap.",
              code: `function minMeetingRooms(intervals) {
  const events = [];
  for (const [start, end] of intervals) {
    events.push([start, 1]);  // meeting starts
    events.push([end, -1]);   // meeting ends
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  let rooms = 0, maxRooms = 0;
  for (const [, type] of events) {
    rooms += type;
    maxRooms = Math.max(maxRooms, rooms);
  }
  return maxRooms;
}

console.log(minMeetingRooms([[0,30],[5,10],[15,20]])); // 2`,
              codeNote: "Sort by time, break ties by ending before starting, then sweep through events.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "In activity selection, what is the greedy criterion for choosing activities?",
              code: null,
              options: [
                "Pick the longest activity",
                "Pick the activity that starts earliest",
                "Pick the activity that ends earliest",
                "Pick the activity with the highest priority",
              ],
              correct: 2,
              body: "Selecting the activity that finishes earliest leaves the maximum remaining time for other activities, which is provably optimal.",
            },
            {
              id: "c2",
              question: "Why does greedy work for fractional knapsack but NOT for 0/1 knapsack?",
              code: null,
              options: [
                "0/1 knapsack has fewer items",
                "Fractional knapsack allows partial items, so ratio-greedy is optimal",
                "Greedy always works for knapsack variants",
                "0/1 knapsack has no optimal substructure",
              ],
              correct: 1,
              body: "Taking fractions means you can always fill the knapsack perfectly using the best ratio items. With whole items, a greedily chosen large item might block a better combination.",
            },
            {
              id: "c3",
              question: "What is the time complexity of the activity selection algorithm?",
              code: null,
              options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
              correct: 1,
              body: "Sorting takes O(n log n) and the single scan is O(n), so overall it's O(n log n).",
            },
          ],
        },
      ],
    },
    {
      no: 22,
      name: "Backtracking",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Backtracking Framework",
          subtitle: "Explore, choose, undo",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "The Backtracking Template",
              body: "Backtracking builds solutions incrementally, abandoning a path as soon as it violates a constraint. It's a refined brute-force that prunes dead-end branches early.",
              code: `// General backtracking template
function backtrack(state, choices, results) {
  if (isGoal(state)) {
    results.push([...state]);
    return;
  }

  for (const choice of choices) {
    if (!isValid(state, choice)) continue; // prune
    state.push(choice);       // choose
    backtrack(state, choices, results); // explore
    state.pop();              // un-choose (backtrack)
  }
}`,
              codeNote: "The 'un-choose' step is what distinguishes backtracking from plain recursion.",
            },
            {
              heading: "Generating All Subsets",
              body: "A subset problem includes or excludes each element. Backtracking explores both branches at every index, generating all 2^n subsets.",
              code: `function subsets(nums) {
  const result = [];
  function bt(index, current) {
    if (index === nums.length) {
      result.push([...current]);
      return;
    }
    // Include nums[index]
    current.push(nums[index]);
    bt(index + 1, current);
    current.pop();
    // Exclude nums[index]
    bt(index + 1, current);
  }
  bt(0, []);
  return result;
}

console.log(subsets([1, 2, 3]));
// [1,2,3],[1,2],[1,3],[1],[2,3],[2],[3],[]`,
              codeNote: "Each element has two choices (in or out), giving exactly 2^n subsets — no duplicates, no misses.",
            },
          ],
        },
        {
          id: 2,
          title: "Permutations",
          subtitle: "All orderings of elements",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Generating Permutations",
              body: "To generate all permutations, at each position choose any unused element. A boolean array or set tracks which elements are available.",
              code: `function permutations(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);

  function bt(current) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      bt(current);
      current.pop();
      used[i] = false;
    }
  }

  bt([]);
  return result;
}

console.log(permutations([1, 2, 3]).length); // 6`,
              codeNote: "There are n! permutations of n elements. Each backtrack call fixes one position.",
            },
            {
              heading: "N-Queens Overview",
              body: "Place N queens on an N×N board so none attack each other. Backtracking places queens row by row, pruning invalid columns and diagonals immediately.",
              code: `function solveNQueens(n) {
  const results = [];
  const cols = new Set();
  const diag1 = new Set(); // row - col
  const diag2 = new Set(); // row + col

  function bt(row, board) {
    if (row === n) {
      results.push(board.map(r => r.join("")));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      board[row][col] = "Q";
      bt(row + 1, board);
      board[row][col] = ".";
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
    }
  }

  const board = Array.from({ length: n }, () => Array(n).fill("."));
  bt(0, board);
  return results;
}`,
              codeNote: "Sets for columns and both diagonals give O(1) conflict checks, making pruning very efficient.",
            },
          ],
        },
        {
          id: 3,
          title: "Pruning Strategies",
          subtitle: "Cutting branches early",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Effective Pruning",
              body: "Good pruning can reduce exponential search spaces dramatically. Common strategies include sorting input to skip duplicates, constraint propagation, and bounding (checking if a partial solution can still lead to a valid one).",
              code: `// Combination Sum with pruning
// Find all unique combos of candidates that sum to target.
function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b); // sort for pruning
  const result = [];

  function bt(start, remaining, combo) {
    if (remaining === 0) { result.push([...combo]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // prune!
      combo.push(candidates[i]);
      bt(i, remaining - candidates[i], combo);
      combo.pop();
    }
  }

  bt(0, target, []);
  return result;
}`,
              codeNote: "Sorting + breaking when candidate > remaining eliminates huge branches that can never sum to target.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the key step that differentiates backtracking from plain recursion?",
              code: null,
              options: [
                "Using a loop",
                "Undoing the choice after exploring (un-choose)",
                "Sorting the input first",
                "Using memoization",
              ],
              correct: 1,
              body: "Backtracking explicitly undoes each choice after exploring it, restoring state so the next candidate can be tried from a clean slate.",
            },
            {
              id: "c2",
              question: "How many subsets does a set of n elements have?",
              code: null,
              options: ["n", "n!", "2^n", "n^2"],
              correct: 2,
              body: "Each element is either included or excluded, giving 2 choices per element and 2^n total subsets.",
            },
            {
              id: "c3",
              question: "In N-Queens, what constraint sets are used for O(1) conflict checking?",
              code: null,
              options: [
                "Rows and columns only",
                "Columns, row-col diagonal, row+col diagonal",
                "A 2D board check",
                "A single hash set of positions",
              ],
              correct: 1,
              body: "Since we place one queen per row, we only need sets for columns and both diagonals (row-col and row+col) to check all attack directions in O(1).",
            },
          ],
        },
      ],
    },
    {
      no: 23,
      name: "Tries",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Trie Structure",
          subtitle: "Prefix trees for strings",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What Is a Trie?",
              body: "A trie (prefix tree) stores strings character by character in a tree. Each node represents a prefix, and paths from root to marked nodes form complete words. Lookups take O(L) time where L is the word length.",
              code: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }
    node.isEnd = true;
  }
}`,
              codeNote: "Each edge represents a character. The isEnd flag marks nodes where a complete word terminates.",
            },
            {
              heading: "Search & Prefix Check",
              body: "Searching a trie follows edges character by character. If a character is missing, the word doesn't exist. A 'startsWith' check is the same but doesn't require isEnd to be true.",
              code: `// Add to the Trie class:
Trie.prototype.search = function(word) {
  let node = this.root;
  for (const ch of word) {
    if (!node.children[ch]) return false;
    node = node.children[ch];
  }
  return node.isEnd;
};

Trie.prototype.startsWith = function(prefix) {
  let node = this.root;
  for (const ch of prefix) {
    if (!node.children[ch]) return false;
    node = node.children[ch];
  }
  return true; // don't check isEnd
};`,
              codeNote: "search checks for an exact word; startsWith checks for any word beginning with the prefix.",
            },
          ],
        },
        {
          id: 2,
          title: "Autocomplete",
          subtitle: "Real-world trie application",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Collecting All Words with a Prefix",
              body: "To implement autocomplete, navigate to the prefix node, then DFS from there to collect all words. This is extremely fast because you skip irrelevant branches entirely.",
              code: `Trie.prototype.autocomplete = function(prefix) {
  let node = this.root;
  for (const ch of prefix) {
    if (!node.children[ch]) return [];
    node = node.children[ch];
  }

  const results = [];
  function dfs(curr, path) {
    if (curr.isEnd) results.push(prefix + path);
    for (const [ch, child] of Object.entries(curr.children)) {
      dfs(child, path + ch);
    }
  }
  dfs(node, "");
  return results;
};

const trie = new Trie();
["apple","app","ape","april","bat"].forEach(w => trie.insert(w));
console.log(trie.autocomplete("ap"));
// ["app", "apple", "ape", "april"]`,
              codeNote: "Search engines and IDEs use tries (or compressed variants) for instant autocomplete suggestions.",
            },
            {
              heading: "Trie Complexity",
              body: "Insert and search are both O(L) where L is the word length — independent of how many words are stored. Space can be large for many long words, but shared prefixes save significant memory.",
              code: `// Trie Complexity Summary:
//
// Operation     Time     Space
// insert(word)  O(L)     O(L) worst case (new branch)
// search(word)  O(L)     O(1) (just traversal)
// startsWith    O(L)     O(1)
// autocomplete  O(L + K) where K = total chars in results
//
// Space for N words of avg length L:
//   Worst case: O(N × L) — no shared prefixes
//   Best case:  O(L)     — all words share a prefix
//
// Trie vs Hash Set:
//   Hash: O(L) per lookup, no prefix queries
//   Trie: O(L) per lookup, supports prefix queries ✓`,
              codeNote: "Tries trade extra space for prefix-query capability that hash sets can't provide.",
            },
          ],
        },
        {
          id: 3,
          title: "Trie Variations",
          subtitle: "Beyond basic tries",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Word Count & Delete",
              body: "You can augment trie nodes with a count field for frequency tracking or implement deletion by decrementing counts and pruning empty branches. These variants appear in real-world auto-suggest systems.",
              code: `class CountTrieNode {
  constructor() {
    this.children = {};
    this.count = 0; // how many words end here
  }
}

// Insert increments count at the end node
function insertCount(root, word) {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = new CountTrieNode();
    node = node.children[ch];
  }
  node.count++;
}

// Top-K autocomplete can sort by count
// for ranking suggestions by popularity`,
              codeNote: "Adding a count field turns a trie into a frequency map that still supports prefix queries.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the time complexity of inserting a word of length L into a trie?",
              code: null,
              options: ["O(1)", "O(L)", "O(N)", "O(N × L)"],
              correct: 1,
              body: "Insert traverses or creates one node per character, so it takes O(L) time regardless of how many words are already in the trie.",
            },
            {
              id: "c2",
              question: "How does search differ from startsWith in a trie?",
              code: null,
              options: [
                "search is faster",
                "startsWith uses BFS",
                "search requires isEnd to be true; startsWith does not",
                "There is no difference",
              ],
              correct: 2,
              body: "search returns true only if the traversal ends at a node marked isEnd (a complete word). startsWith returns true if the prefix path exists, regardless of isEnd.",
            },
            {
              id: "c3",
              question: "What advantage does a trie have over a hash set for string storage?",
              code: null,
              options: [
                "Faster exact lookups",
                "Less memory usage always",
                "Support for prefix-based queries",
                "Simpler implementation",
              ],
              correct: 2,
              body: "Both have O(L) lookup, but a trie supports prefix queries like autocomplete and startsWith that a hash set cannot do efficiently.",
            },
          ],
        },
      ],
    },
    {
      no: 24,
      name: "Union-Find",
      difficulty: "Advanced",
      duration: "15 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Disjoint Sets",
          subtitle: "Grouping elements efficiently",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "What Is Union-Find?",
              body: "Union-Find (Disjoint Set Union) tracks a collection of non-overlapping sets. It supports two operations: find (which set does an element belong to?) and union (merge two sets). It's ideal for connectivity problems.",
              code: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false; // already connected
    // union by rank
    if (this.rank[rootX] < this.rank[rootY]) this.parent[rootX] = rootY;
    else if (this.rank[rootX] > this.rank[rootY]) this.parent[rootY] = rootX;
    else { this.parent[rootY] = rootX; this.rank[rootX]++; }
    return true;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}`,
              codeNote: "Path compression + union by rank gives nearly O(1) amortized time per operation (inverse Ackermann).",
            },
            {
              heading: "Path Compression Explained",
              body: "Path compression flattens the tree during find by making every node on the path point directly to the root. This keeps trees almost flat, ensuring future finds are nearly constant time.",
              code: `// Without path compression:
// find(4) walks: 4 → 3 → 2 → 1 → 0  (O(n) worst case)

// With path compression:
// find(4) walks: 4 → 3 → 2 → 1 → 0
// then sets:     4 → 0, 3 → 0, 2 → 0, 1 → 0
// next find(4):  4 → 0  (O(1))

// This is the single line that does it:
// this.parent[x] = this.find(this.parent[x]);`,
              codeNote: "One recursive line transforms a tall chain into a flat star rooted at the root node.",
            },
          ],
        },
        {
          id: 2,
          title: "Union by Rank",
          subtitle: "Keeping trees balanced",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Why Rank Matters",
              body: "Without rank, unioning can create long chains (like a linked list). Union by rank always attaches the shorter tree under the taller one, keeping tree height logarithmic even without path compression.",
              code: `// Union by rank example:
// Tree A (rank 2):     Tree B (rank 1):
//       0                    3
//      / \\                   |
//     1   2                  4
//
// union(0, 3):
// rank[0]=2 > rank[3]=1, so 3's root → 0
//       0
//      /|\\
//     1  2  3
//           |
//           4`,
              codeNote: "The smaller tree always goes under the larger one, preventing degenerate chains.",
            },
            {
              heading: "Counting Components",
              body: "Union-Find naturally tracks connected components. Start with n components; each successful union reduces the count by one. This makes it perfect for problems like 'number of islands' or 'friend circles'.",
              code: `class UnionFindCount extends UnionFind {
  constructor(n) {
    super(n);
    this.count = n; // number of components
  }

  union(x, y) {
    const merged = super.union(x, y);
    if (merged) this.count--;
    return merged;
  }

  getCount() {
    return this.count;
  }
}

// Example: 5 nodes, connect some
const uf = new UnionFindCount(5);
uf.union(0, 1);
uf.union(2, 3);
uf.union(1, 3);
console.log(uf.getCount()); // 2 ({0,1,2,3} and {4})`,
              codeNote: "Every successful union decreases the component count by exactly one.",
            },
          ],
        },
        {
          id: 3,
          title: "Classic Applications",
          subtitle: "Where Union-Find shines",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Kruskal's MST & Cycle Detection",
              body: "Union-Find is the backbone of Kruskal's minimum spanning tree algorithm. Sort edges by weight, then add each edge if it connects two different components. If find returns the same root, adding the edge would create a cycle — skip it.",
              code: `function kruskalMST(n, edges) {
  edges.sort((a, b) => a.weight - b.weight);
  const uf = new UnionFind(n);
  const mst = [];

  for (const { u, v, weight } of edges) {
    if (!uf.connected(u, v)) {
      uf.union(u, v);
      mst.push({ u, v, weight });
      if (mst.length === n - 1) break; // MST complete
    }
    // skip edge if u and v are already connected (cycle)
  }
  return mst;
}

// With path compression + union by rank:
// Nearly O(E log E) total (dominated by sorting)`,
              codeNote: "Union-Find makes cycle detection O(α(n)) per edge, where α is the inverse Ackermann function — effectively constant.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What two optimizations make Union-Find nearly O(1) per operation?",
              code: null,
              options: [
                "Sorting and caching",
                "Path compression and union by rank",
                "Memoization and tabulation",
                "BFS and DFS",
              ],
              correct: 1,
              body: "Path compression flattens the tree during find, and union by rank keeps trees balanced during union. Together they achieve O(α(n)) amortized time.",
            },
            {
              id: "c2",
              question: "In Kruskal's algorithm, what happens when union(u, v) finds they share the same root?",
              code: null,
              options: [
                "The edge is added to the MST",
                "The edge is skipped to avoid a cycle",
                "The algorithm terminates",
                "The edge weight is doubled",
              ],
              correct: 1,
              body: "If u and v are already connected (same root), adding the edge would create a cycle in the spanning tree, so it is skipped.",
            },
            {
              id: "c3",
              question: "If you start with n elements and perform k successful unions, how many components remain?",
              code: null,
              options: ["n", "n - k", "k", "n + k"],
              correct: 1,
              body: "Each successful union merges two components into one, reducing the total count by 1. After k unions: n - k components remain.",
            },
          ],
        },
      ],
    },
  ],
};

export const sqlCourse = {
  language: "SQL",
  accentColor: "#F59E0B",
  accentLight: "#FBBF24",
  totalChapters: 15,
  chapters: [
    // ─── Chapter 1: SELECT Basics ───
    {
      no: 1,
      name: "SELECT Basics",
      difficulty: "Beginner",
      duration: "10 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Your First Query",
          subtitle: "Retrieve all rows from a table",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "SELECT * FROM",
              body: "The SELECT statement is the foundation of every SQL query. The asterisk (*) is a wildcard that returns every column in the table.",
              code: `-- Retrieve all columns from the users table\nSELECT * FROM users;`,
              codeNote: "The * wildcard selects every column.",
            },
            {
              heading: "Running the Query",
              body: "When you execute a SELECT query, the database scans the specified table and returns a result set. Each row in the result set represents one record.",
              code: `-- Execute in your SQL client\nSELECT * FROM users;`,
              codeNote: "Result sets contain rows and columns.",
            },
          ],
        },
        {
          id: 2,
          title: "Selecting Specific Columns",
          subtitle: "Choose only the columns you need",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Column Selection",
              body: "Instead of selecting all columns with *, list the specific column names you need. This improves performance and makes your queries more readable.",
              code: `-- Select only name and email\nSELECT name, email FROM users;`,
              codeNote: "Separate column names with commas.",
            },
            {
              heading: "Column Aliases",
              body: "Use the AS keyword to rename columns in your result set. Aliases make output more readable without changing the actual table structure.",
              code: `-- Rename columns in the output\nSELECT name AS full_name, email AS contact_email\nFROM users;`,
              codeNote: "Aliases only affect the result display.",
            },
          ],
        },
        {
          id: 3,
          title: "DISTINCT & Expressions",
          subtitle: "Remove duplicates and compute values",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "DISTINCT Keyword",
              body: "DISTINCT removes duplicate rows from the result set. It's useful when you need to see unique values in a column.",
              code: `-- Get unique cities from the users table\nSELECT DISTINCT city FROM users;`,
              codeNote: "DISTINCT applies to the entire row.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "Which SQL keyword retrieves data from a table?",
              code: null,
              options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
              correct: 1,
              body: "SELECT is the SQL statement used to query and retrieve data from one or more tables.",
            },
            {
              id: "c2",
              question: "What does the * wildcard do in SELECT * FROM users?",
              code: null,
              options: [
                "Deletes all rows",
                "Selects all columns",
                "Counts all rows",
                "Creates a new table",
              ],
              correct: 1,
              body: "The asterisk (*) is a shorthand that tells SQL to return every column in the specified table.",
            },
            {
              id: "c3",
              question: "Which keyword removes duplicate rows from results?",
              code: null,
              options: ["UNIQUE", "DISTINCT", "DIFFERENT", "SINGLE"],
              correct: 1,
              body: "DISTINCT filters out duplicate rows so each row in the result set is unique.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 2: WHERE Clause ───
    {
      no: 2,
      name: "WHERE Clause",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Basic Filtering",
          subtitle: "Filter rows with conditions",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "The WHERE Clause",
              body: "WHERE filters rows based on a condition. Only rows that satisfy the condition are included in the result set.",
              code: `-- Find users in a specific city\nSELECT * FROM users\nWHERE city = 'New York';`,
              codeNote: "String values must be wrapped in single quotes.",
            },
            {
              heading: "Comparison Operators",
              body: "SQL supports =, !=, <, >, <=, and >= for comparisons. These operators work on numbers, strings, and dates.",
              code: `-- Find users older than 25\nSELECT name, age FROM users\nWHERE age > 25;`,
              codeNote: "Numeric values don't need quotes.",
            },
          ],
        },
        {
          id: 2,
          title: "AND, OR & NOT",
          subtitle: "Combine multiple conditions",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "AND Operator",
              body: "AND requires all conditions to be true. Use it when you need rows that satisfy every specified criterion.",
              code: `-- Users older than 25 in New York\nSELECT * FROM users\nWHERE age > 25 AND city = 'New York';`,
              codeNote: "Both conditions must be true for a row to appear.",
            },
            {
              heading: "OR and NOT Operators",
              body: "OR requires at least one condition to be true. NOT negates a condition, returning rows where the condition is false.",
              code: `-- Users in New York OR Los Angeles\nSELECT * FROM users\nWHERE city = 'New York' OR city = 'Los Angeles';\n\n-- Users NOT in New York\nSELECT * FROM users\nWHERE NOT city = 'New York';`,
              codeNote: "Use parentheses to clarify complex logic.",
            },
          ],
        },
        {
          id: 3,
          title: "IN, BETWEEN & LIKE",
          subtitle: "Advanced filtering patterns",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "IN, BETWEEN, and LIKE",
              body: "IN matches against a list of values. BETWEEN filters a range. LIKE performs pattern matching with % (any characters) and _ (single character).",
              code: `-- IN: match a list\nSELECT * FROM users WHERE city IN ('New York', 'Chicago', 'Miami');\n\n-- BETWEEN: match a range\nSELECT * FROM users WHERE age BETWEEN 20 AND 30;\n\n-- LIKE: pattern matching\nSELECT * FROM users WHERE name LIKE 'J%';`,
              codeNote: "% matches zero or more characters; _ matches exactly one.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "Which clause filters rows in a SELECT query?",
              code: null,
              options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"],
              correct: 2,
              body: "The WHERE clause is used to filter rows based on specified conditions before any grouping happens.",
            },
            {
              id: "c2",
              question: "What does the LIKE operator with '%son' match?",
              code: null,
              options: [
                "Names starting with 'son'",
                "Names ending with 'son'",
                "Names containing only 'son'",
                "Names exactly equal to 'son'",
              ],
              correct: 1,
              body: "The % wildcard before 'son' matches any characters followed by 'son', so it finds names ending with 'son'.",
            },
            {
              id: "c3",
              question: "Which operator checks if a value falls within a range?",
              code: null,
              options: ["IN", "LIKE", "BETWEEN", "EXISTS"],
              correct: 2,
              body: "BETWEEN checks if a value is within a specified inclusive range, e.g., BETWEEN 10 AND 20.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 3: ORDER BY & LIMIT ───
    {
      no: 3,
      name: "ORDER BY & LIMIT",
      difficulty: "Beginner",
      duration: "10 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Sorting Results",
          subtitle: "Order rows by column values",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "ORDER BY Clause",
              body: "ORDER BY sorts the result set by one or more columns. By default, sorting is in ascending (ASC) order.",
              code: `-- Sort users by name alphabetically\nSELECT name, age FROM users\nORDER BY name;`,
              codeNote: "ASC is the default sort direction.",
            },
            {
              heading: "Descending Order",
              body: "Add DESC after a column name to sort in descending order. You can mix ASC and DESC across multiple columns.",
              code: `-- Sort by age descending, then name ascending\nSELECT name, age FROM users\nORDER BY age DESC, name ASC;`,
              codeNote: "DESC reverses the default sort order.",
            },
          ],
        },
        {
          id: 2,
          title: "LIMIT & OFFSET",
          subtitle: "Control how many rows are returned",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "LIMIT Clause",
              body: "LIMIT restricts the number of rows returned. It's essential for pagination and preventing large result sets from overwhelming your application.",
              code: `-- Return only the first 10 users\nSELECT * FROM users\nLIMIT 10;`,
              codeNote: "LIMIT is applied after sorting.",
            },
            {
              heading: "OFFSET for Pagination",
              body: "OFFSET skips a specified number of rows before returning results. Combined with LIMIT, it enables pagination through large datasets.",
              code: `-- Skip the first 20 rows, then return 10\nSELECT * FROM users\nORDER BY id\nLIMIT 10 OFFSET 20;`,
              codeNote: "This fetches rows 21-30 (page 3 of 10-per-page).",
            },
          ],
        },
        {
          id: 3,
          title: "Top-N Queries",
          subtitle: "Find the top or bottom records",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Top-N Pattern",
              body: "Combine ORDER BY with LIMIT to find the highest or lowest values. This pattern is used frequently to find top performers, latest entries, or extremes.",
              code: `-- Find the 5 oldest users\nSELECT name, age FROM users\nORDER BY age DESC\nLIMIT 5;`,
              codeNote: "ORDER BY + LIMIT is the classic Top-N pattern.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the default sort order for ORDER BY?",
              code: null,
              options: ["DESC", "ASC", "RANDOM", "NONE"],
              correct: 1,
              body: "ORDER BY sorts in ascending (ASC) order by default. You must explicitly write DESC for descending.",
            },
            {
              id: "c2",
              question: "What does LIMIT 5 OFFSET 10 return?",
              code: null,
              options: [
                "First 5 rows",
                "Rows 6-10",
                "Rows 11-15",
                "Last 5 rows",
              ],
              correct: 2,
              body: "OFFSET 10 skips the first 10 rows, then LIMIT 5 returns the next 5 rows (rows 11-15).",
            },
            {
              id: "c3",
              question: "How do you find the 3 youngest users?",
              code: null,
              options: [
                "SELECT * FROM users LIMIT 3",
                "SELECT * FROM users ORDER BY age ASC LIMIT 3",
                "SELECT * FROM users WHERE age < 3",
                "SELECT TOP 3 FROM users",
              ],
              correct: 1,
              body: "Sort by age ascending to put the youngest first, then LIMIT 3 returns only those three rows.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 4: INSERT, UPDATE, DELETE ───
    {
      no: 4,
      name: "INSERT, UPDATE, DELETE",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Inserting Data",
          subtitle: "Add new rows to a table",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "INSERT INTO",
              body: "INSERT INTO adds new rows to a table. You specify the table name, column list, and the values to insert.",
              code: `-- Insert a new user\nINSERT INTO users (name, email, age, city)\nVALUES ('Alice', 'alice@example.com', 28, 'Chicago');`,
              codeNote: "Column order must match the VALUES order.",
            },
            {
              heading: "Inserting Multiple Rows",
              body: "You can insert several rows in a single statement by separating each value set with a comma. This is more efficient than running multiple INSERT statements.",
              code: `-- Insert multiple users at once\nINSERT INTO users (name, email, age, city)\nVALUES\n  ('Bob', 'bob@example.com', 32, 'Miami'),\n  ('Carol', 'carol@example.com', 24, 'Denver');`,
              codeNote: "Batch inserts are faster than individual ones.",
            },
          ],
        },
        {
          id: 2,
          title: "Updating Data",
          subtitle: "Modify existing rows",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "UPDATE Statement",
              body: "UPDATE modifies existing rows in a table. Always include a WHERE clause to target specific rows, otherwise all rows will be updated.",
              code: `-- Update a user's city\nUPDATE users\nSET city = 'San Francisco'\nWHERE name = 'Alice';`,
              codeNote: "Always use WHERE with UPDATE to avoid changing all rows.",
            },
            {
              heading: "Updating Multiple Columns",
              body: "You can set multiple columns in a single UPDATE statement by separating assignments with commas. The WHERE clause still controls which rows are affected.",
              code: `-- Update age and city together\nUPDATE users\nSET age = 29, city = 'Seattle'\nWHERE name = 'Alice';`,
              codeNote: "Separate multiple SET assignments with commas.",
            },
          ],
        },
        {
          id: 3,
          title: "Deleting Data",
          subtitle: "Remove rows from a table",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "DELETE Statement",
              body: "DELETE removes rows from a table. Like UPDATE, always use a WHERE clause to target specific rows. Without WHERE, all rows will be deleted.",
              code: `-- Delete a specific user\nDELETE FROM users\nWHERE name = 'Bob';\n\n-- DANGER: This deletes ALL rows!\n-- DELETE FROM users;`,
              codeNote: "Never run DELETE without WHERE in production.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What happens if you run UPDATE without a WHERE clause?",
              code: null,
              options: [
                "Nothing happens",
                "Only the first row is updated",
                "All rows in the table are updated",
                "An error is thrown",
              ],
              correct: 2,
              body: "Without a WHERE clause, UPDATE applies the changes to every row in the table, which is usually unintended.",
            },
            {
              id: "c2",
              question: "Which statement adds a new row to a table?",
              code: null,
              options: ["UPDATE", "INSERT INTO", "ALTER TABLE", "CREATE"],
              correct: 1,
              body: "INSERT INTO is the SQL statement for adding new rows with specified values into a table.",
            },
            {
              id: "c3",
              question: "How do you insert multiple rows in one statement?",
              code: null,
              options: [
                "Use multiple INSERT statements",
                "Separate value sets with commas",
                "Use INSERT ALL",
                "Use BULK INSERT only",
              ],
              correct: 1,
              body: "Standard SQL allows comma-separated value sets after VALUES to insert multiple rows in a single INSERT INTO statement.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 5: Aggregate Functions ───
    {
      no: 5,
      name: "Aggregate Functions",
      difficulty: "Beginner",
      duration: "10 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "COUNT & SUM",
          subtitle: "Count rows and sum values",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "COUNT Function",
              body: "COUNT returns the number of rows that match a condition. COUNT(*) counts all rows, while COUNT(column) counts non-NULL values in that column.",
              code: `-- Count all users\nSELECT COUNT(*) AS total_users FROM users;\n\n-- Count users with an email\nSELECT COUNT(email) AS users_with_email FROM users;`,
              codeNote: "COUNT(*) includes NULLs; COUNT(column) does not.",
            },
            {
              heading: "SUM Function",
              body: "SUM adds up all numeric values in a column. It ignores NULL values automatically. Use it on numeric columns like prices, quantities, or scores.",
              code: `-- Total of all order amounts\nSELECT SUM(amount) AS total_revenue\nFROM orders;`,
              codeNote: "SUM only works on numeric columns.",
            },
          ],
        },
        {
          id: 2,
          title: "AVG, MIN & MAX",
          subtitle: "Calculate averages and extremes",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "AVG Function",
              body: "AVG calculates the arithmetic mean of a numeric column. Like SUM, it ignores NULL values when computing the average.",
              code: `-- Average age of all users\nSELECT AVG(age) AS average_age FROM users;`,
              codeNote: "AVG ignores NULLs in its calculation.",
            },
            {
              heading: "MIN and MAX",
              body: "MIN returns the smallest value and MAX returns the largest value in a column. They work on numbers, strings, and dates.",
              code: `-- Youngest and oldest users\nSELECT MIN(age) AS youngest, MAX(age) AS oldest\nFROM users;`,
              codeNote: "MIN/MAX work on any comparable data type.",
            },
          ],
        },
        {
          id: 3,
          title: "Combining Aggregates",
          subtitle: "Use multiple functions in one query",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Multiple Aggregates",
              body: "You can use several aggregate functions in a single SELECT statement. This lets you build summary reports with one query instead of many.",
              code: `-- Complete summary of user ages\nSELECT\n  COUNT(*) AS total,\n  AVG(age) AS avg_age,\n  MIN(age) AS min_age,\n  MAX(age) AS max_age,\n  SUM(age) AS sum_age\nFROM users;`,
              codeNote: "Each aggregate is computed independently.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does COUNT(*) count?",
              code: null,
              options: [
                "Only non-NULL values",
                "All rows including NULLs",
                "Only distinct values",
                "Only numeric values",
              ],
              correct: 1,
              body: "COUNT(*) counts every row in the result set regardless of NULL values in any column.",
            },
            {
              id: "c2",
              question: "Which function returns the average of a numeric column?",
              code: null,
              options: ["MEAN", "AVG", "AVERAGE", "MID"],
              correct: 1,
              body: "AVG is the SQL aggregate function that computes the arithmetic mean of a numeric column.",
            },
            {
              id: "c3",
              question: "How do aggregate functions handle NULL values?",
              code: null,
              options: [
                "They treat NULLs as 0",
                "They ignore NULLs",
                "They throw an error",
                "They include NULLs in calculations",
              ],
              correct: 1,
              body: "Aggregate functions like SUM, AVG, MIN, and MAX skip NULL values. Only COUNT(*) counts rows with NULLs.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 6: GROUP BY & HAVING ───
    {
      no: 6,
      name: "GROUP BY & HAVING",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Grouping Data",
          subtitle: "Group rows by column values",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "GROUP BY Clause",
              body: "GROUP BY divides rows into groups based on column values. Each group is then summarized using an aggregate function like COUNT or SUM.",
              code: `-- Count users per city\nSELECT city, COUNT(*) AS user_count\nFROM users\nGROUP BY city;`,
              codeNote: "Every non-aggregated column in SELECT must appear in GROUP BY.",
            },
            {
              heading: "Grouping with Aggregates",
              body: "GROUP BY is most powerful when combined with aggregate functions. It lets you compute summary statistics for each category in your data.",
              code: `-- Average age per city\nSELECT city, AVG(age) AS avg_age\nFROM users\nGROUP BY city;`,
              codeNote: "Each group produces one row in the result.",
            },
          ],
        },
        {
          id: 2,
          title: "Filtering Groups with HAVING",
          subtitle: "Apply conditions to grouped results",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "HAVING Clause",
              body: "HAVING filters groups after aggregation, while WHERE filters rows before aggregation. Use HAVING when your condition involves an aggregate function.",
              code: `-- Cities with more than 5 users\nSELECT city, COUNT(*) AS user_count\nFROM users\nGROUP BY city\nHAVING COUNT(*) > 5;`,
              codeNote: "HAVING filters after GROUP BY; WHERE filters before.",
            },
            {
              heading: "WHERE vs HAVING",
              body: "Use WHERE to filter individual rows before grouping. Use HAVING to filter groups after aggregation. They can be used together in the same query.",
              code: `-- Cities with more than 3 users older than 25\nSELECT city, COUNT(*) AS user_count\nFROM users\nWHERE age > 25\nGROUP BY city\nHAVING COUNT(*) > 3;`,
              codeNote: "WHERE runs first, then GROUP BY, then HAVING.",
            },
          ],
        },
        {
          id: 3,
          title: "Multiple Grouping Columns",
          subtitle: "Group by more than one column",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Multi-Column GROUP BY",
              body: "You can group by multiple columns to create more specific categories. The result has one row for each unique combination of the grouped columns.",
              code: `-- Count users by city and age bracket\nSELECT city, age, COUNT(*) AS user_count\nFROM users\nGROUP BY city, age\nORDER BY city, age;`,
              codeNote: "Each unique (city, age) pair becomes one group.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What is the difference between WHERE and HAVING?",
              code: null,
              options: [
                "No difference",
                "WHERE filters rows before grouping; HAVING filters groups after",
                "HAVING filters rows; WHERE filters groups",
                "WHERE works only with numbers",
              ],
              correct: 1,
              body: "WHERE filters individual rows before GROUP BY runs. HAVING filters the aggregated groups after GROUP BY produces its results.",
            },
            {
              id: "c2",
              question: "What must every non-aggregated SELECT column appear in?",
              code: null,
              options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
              correct: 2,
              body: "SQL requires all non-aggregated columns in the SELECT list to also appear in the GROUP BY clause to avoid ambiguous results.",
            },
            {
              id: "c3",
              question: "Which query finds cities where the average age is over 30?",
              code: null,
              options: [
                "SELECT city FROM users WHERE AVG(age) > 30",
                "SELECT city, AVG(age) FROM users GROUP BY city HAVING AVG(age) > 30",
                "SELECT city FROM users GROUP BY city WHERE age > 30",
                "SELECT city FROM users HAVING age > 30",
              ],
              correct: 1,
              body: "You need GROUP BY city to create groups, then HAVING AVG(age) > 30 to filter groups. WHERE cannot use aggregate functions.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 7: INNER JOIN ───
    {
      no: 7,
      name: "INNER JOIN",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "Joining Two Tables",
          subtitle: "Combine rows from related tables",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "INNER JOIN Basics",
              body: "INNER JOIN returns only the rows that have matching values in both tables. It combines columns from two tables based on a related column.",
              code: `-- Join users with their orders\nSELECT users.name, orders.amount\nFROM users\nINNER JOIN orders ON users.id = orders.user_id;`,
              codeNote: "Only matching rows from both tables are returned.",
            },
            {
              heading: "The ON Clause",
              body: "The ON clause specifies the condition for matching rows between tables. It typically compares a primary key in one table to a foreign key in another.",
              code: `-- ON specifies how tables relate\nSELECT u.name, o.amount, o.order_date\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;`,
              codeNote: "The ON condition defines the relationship between tables.",
            },
          ],
        },
        {
          id: 2,
          title: "Table Aliases",
          subtitle: "Shorten table references in joins",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "Using Aliases",
              body: "Table aliases are short names you assign to tables in a query. They make join queries shorter and more readable, especially with long table names.",
              code: `-- u and o are aliases for users and orders\nSELECT u.name, u.email, o.amount\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.amount > 100;`,
              codeNote: "Aliases are defined right after the table name.",
            },
            {
              heading: "Qualifying Column Names",
              body: "When two tables share a column name, you must prefix it with the table name or alias to avoid ambiguity. This is required in JOIN queries.",
              code: `-- Both tables have an 'id' column\nSELECT u.id AS user_id, o.id AS order_id, u.name\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;`,
              codeNote: "Always qualify ambiguous column names with table aliases.",
            },
          ],
        },
        {
          id: 3,
          title: "Joining with Conditions",
          subtitle: "Add WHERE to filter joined results",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "Filtering After Join",
              body: "You can add WHERE, ORDER BY, and other clauses after a JOIN. The join happens first, then the filters and sorting are applied to the combined result.",
              code: `-- Find large orders with user details\nSELECT u.name, o.amount, o.order_date\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.amount > 500\nORDER BY o.amount DESC;`,
              codeNote: "JOIN first, then WHERE filters the joined rows.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does INNER JOIN return?",
              code: null,
              options: [
                "All rows from both tables",
                "Only rows with matches in both tables",
                "All rows from the left table",
                "All rows from the right table",
              ],
              correct: 1,
              body: "INNER JOIN returns only the rows where there is a matching value in both the left and right tables based on the ON condition.",
            },
            {
              id: "c2",
              question: "What does the ON clause specify?",
              code: null,
              options: [
                "Which columns to display",
                "How to sort results",
                "The matching condition between tables",
                "Which rows to delete",
              ],
              correct: 2,
              body: "The ON clause defines the relationship between the two tables, specifying which columns should match for rows to be joined.",
            },
            {
              id: "c3",
              question: "Why are table aliases useful in JOINs?",
              code: null,
              options: [
                "They make queries run faster",
                "They create new tables",
                "They shorten references and resolve ambiguity",
                "They are required by SQL standard",
              ],
              correct: 2,
              body: "Aliases provide short names for tables, making queries more readable and resolving ambiguity when both tables share column names.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 8: LEFT & RIGHT JOIN ───
    {
      no: 8,
      name: "LEFT & RIGHT JOIN",
      difficulty: "Beginner",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1,
          title: "LEFT JOIN",
          subtitle: "Keep all rows from the left table",
          xp: 30,
          color: "#3B82F6",
          glow: "rgba(59,130,246,0.35)",
          steps: [
            {
              heading: "LEFT JOIN Basics",
              body: "LEFT JOIN returns all rows from the left table plus matched rows from the right table. If there's no match, the right table columns are filled with NULL.",
              code: `-- All users, even those without orders\nSELECT u.name, o.amount\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id;`,
              codeNote: "Unmatched right-side columns show NULL.",
            },
            {
              heading: "Finding Unmatched Rows",
              body: "A common pattern with LEFT JOIN is to find rows in the left table that have no match in the right table. Simply check for NULL in the right table's column.",
              code: `-- Find users who have never placed an order\nSELECT u.name, u.email\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.id IS NULL;`,
              codeNote: "IS NULL on the join key finds unmatched rows.",
            },
          ],
        },
        {
          id: 2,
          title: "RIGHT JOIN",
          subtitle: "Keep all rows from the right table",
          xp: 30,
          color: "#10B981",
          glow: "rgba(16,185,129,0.35)",
          steps: [
            {
              heading: "RIGHT JOIN Basics",
              body: "RIGHT JOIN is the mirror of LEFT JOIN. It returns all rows from the right table and matched rows from the left table. Unmatched left columns show NULL.",
              code: `-- All orders, even if the user was deleted\nSELECT u.name, o.amount, o.order_date\nFROM users u\nRIGHT JOIN orders o ON u.id = o.user_id;`,
              codeNote: "RIGHT JOIN keeps all right-table rows.",
            },
            {
              heading: "LEFT vs RIGHT JOIN",
              body: "LEFT JOIN and RIGHT JOIN are interchangeable if you swap the table order. Most developers prefer LEFT JOIN for consistency and readability.",
              code: `-- These two queries produce identical results:\n\n-- Using LEFT JOIN\nSELECT u.name, o.amount\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id;\n\n-- Equivalent RIGHT JOIN (tables swapped)\nSELECT u.name, o.amount\nFROM orders o\nRIGHT JOIN users u ON u.id = o.user_id;`,
              codeNote: "Swapping tables + changing join type gives the same result.",
            },
          ],
        },
        {
          id: 3,
          title: "NULL Handling in Joins",
          subtitle: "Work with missing data from outer joins",
          xp: 20,
          color: "#8B5CF6",
          glow: "rgba(139,92,246,0.35)",
          steps: [
            {
              heading: "COALESCE for NULLs",
              body: "COALESCE replaces NULL with a default value. It's especially useful after LEFT or RIGHT JOINs where unmatched rows produce NULLs.",
              code: `-- Replace NULL amounts with 0\nSELECT u.name, COALESCE(o.amount, 0) AS amount\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id;`,
              codeNote: "COALESCE returns the first non-NULL argument.",
            },
          ],
        },
        {
          id: 4,
          title: "Mini Challenge",
          subtitle: "Test your knowledge",
          xp: 40,
          color: "#F59E0B",
          glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            {
              id: "c1",
              question: "What does LEFT JOIN return for unmatched rows?",
              code: null,
              options: [
                "An error",
                "The row is skipped",
                "NULL for right-table columns",
                "Zero for all columns",
              ],
              correct: 2,
              body: "LEFT JOIN includes all left-table rows. When there's no match in the right table, those columns are filled with NULL.",
            },
            {
              id: "c2",
              question: "How do you find users with no orders using LEFT JOIN?",
              code: null,
              options: [
                "WHERE orders.amount = 0",
                "WHERE orders.id IS NULL",
                "WHERE orders.id IS NOT NULL",
                "WHERE users.id NOT IN orders",
              ],
              correct: 1,
              body: "After LEFT JOIN, unmatched right-table rows have NULL. Checking IS NULL on the join key finds left-only rows.",
            },
            {
              id: "c3",
              question: "What does COALESCE(value, 0) return when value is NULL?",
              code: null,
              options: ["NULL", "0", "An error", "Empty string"],
              correct: 1,
              body: "COALESCE returns the first non-NULL argument. When value is NULL, it falls through to 0 and returns that instead.",
            },
          ],
        },
      ],
    },
    // ─── Chapter 9: FULL OUTER JOIN & CROSS JOIN ───
    {
      no: 9,
      name: "FULL OUTER JOIN & CROSS JOIN",
      difficulty: "Intermediate",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1, title: "FULL OUTER JOIN", subtitle: "Combine all rows from both tables", xp: 30, color: "#3B82F6", glow: "rgba(59,130,246,0.35)",
          steps: [
            { heading: "What Is a FULL OUTER JOIN?", body: "A FULL OUTER JOIN returns every row from both tables. Where there is no match, NULLs fill the missing side.", code: `-- FULL OUTER JOIN returns all rows from both tables\nSELECT c.name, o.total\nFROM customers c\nFULL OUTER JOIN orders o ON c.id = o.customer_id;`, codeNote: "Unmatched rows from either side appear with NULLs." },
            { heading: "Finding Unmatched Rows", body: "You can filter for rows that exist in only one table. Check for NULLs on the opposite table's key column.", code: `-- Customers with no orders OR orders with no customer\nSELECT c.name, o.id AS order_id\nFROM customers c\nFULL OUTER JOIN orders o ON c.id = o.customer_id\nWHERE c.id IS NULL OR o.customer_id IS NULL;`, codeNote: "This reveals orphan records on both sides." }
          ]
        },
        {
          id: 2, title: "CROSS JOIN", subtitle: "Generate every combination of rows", xp: 30, color: "#10B981", glow: "rgba(16,185,129,0.35)",
          steps: [
            { heading: "What Is a CROSS JOIN?", body: "A CROSS JOIN produces the Cartesian product of two tables. Every row from the first table is paired with every row from the second.", code: `-- Cartesian product: every size × every color\nSELECT s.size, c.color\nFROM sizes s\nCROSS JOIN colors c;`, codeNote: "If sizes has 3 rows and colors has 4, the result has 12 rows." },
            { heading: "Practical Use Cases", body: "CROSS JOINs are useful for generating combinations like schedules or product variants. Be cautious with large tables since the result set grows multiplicatively.", code: `-- Generate a report skeleton for every employee × every month\nSELECT e.name, m.month_name\nFROM employees e\nCROSS JOIN months m\nORDER BY e.name, m.month_num;`, codeNote: "Great for scaffolding reports or lookup grids." }
          ]
        },
        {
          id: 3, title: "Cartesian Product Pitfalls", subtitle: "Avoid accidental explosions", xp: 20, color: "#8B5CF6", glow: "rgba(139,92,246,0.35)",
          steps: [
            { heading: "Accidental Cartesian Products", body: "Forgetting a JOIN condition can accidentally create a CROSS JOIN. Always verify your ON clause to avoid unexpectedly huge result sets.", code: `-- WRONG: missing ON clause creates a Cartesian product\nSELECT *\nFROM orders, customers;\n\n-- CORRECT: specify the join condition\nSELECT *\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;`, codeNote: "An implicit join without WHERE acts like a CROSS JOIN." }
          ]
        },
        {
          id: 4, title: "Mini Challenge", subtitle: "Test your knowledge", xp: 40, color: "#F59E0B", glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            { id: "c1", question: "What does a FULL OUTER JOIN return?", code: null, options: ["Only matching rows", "All rows from the left table", "All rows from both tables with NULLs for non-matches", "A Cartesian product"], correct: 2, body: "A FULL OUTER JOIN keeps every row from both tables. Non-matching rows get NULLs on the opposite side." },
            { id: "c2", question: "How many rows does a CROSS JOIN of a 5-row table and a 4-row table produce?", code: null, options: ["9", "5", "20", "4"], correct: 2, body: "A CROSS JOIN produces N × M rows. 5 × 4 = 20 rows in the result set." },
            { id: "c3", question: "What commonly causes an accidental Cartesian product?", code: null, options: ["Using GROUP BY", "Forgetting the ON or WHERE clause in a join", "Using too many indexes", "Selecting too many columns"], correct: 1, body: "Omitting the join condition makes the database pair every row with every other row, causing an accidental Cartesian product." }
          ]
        }
      ]
    },
    // ─── Chapter 10: Subqueries ───
    {
      no: 10,
      name: "Subqueries",
      difficulty: "Intermediate",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1, title: "Scalar Subqueries", subtitle: "Return a single value", xp: 30, color: "#3B82F6", glow: "rgba(59,130,246,0.35)",
          steps: [
            { heading: "What Is a Scalar Subquery?", body: "A scalar subquery returns exactly one value. You can use it anywhere a single value is expected, such as in SELECT or WHERE.", code: `-- Scalar subquery: find employees earning above average\nSELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);`, codeNote: "The inner query computes one number; the outer query uses it as a filter." },
            { heading: "Subqueries in SELECT", body: "You can embed a scalar subquery in the SELECT list to compute a value per row. The subquery runs once for each row in context.", code: `-- Show each order with the customer's total order count\nSELECT o.id, o.total,\n  (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_id = o.customer_id) AS cust_orders\nFROM orders o;`, codeNote: "Correlated subqueries in SELECT reference the outer row." }
          ]
        },
        {
          id: 2, title: "IN & EXISTS", subtitle: "Filter with subquery results", xp: 30, color: "#10B981", glow: "rgba(16,185,129,0.35)",
          steps: [
            { heading: "Using IN with a Subquery", body: "IN checks if a value matches any result from a subquery. It is straightforward for filtering against a list of IDs or values.", code: `-- Find customers who have placed at least one order\nSELECT name\nFROM customers\nWHERE id IN (SELECT customer_id FROM orders);`, codeNote: "IN collects all values from the subquery first, then filters." },
            { heading: "Using EXISTS", body: "EXISTS tests whether a correlated subquery returns any rows. It short-circuits as soon as one match is found, making it efficient for large datasets.", code: `-- Same result using EXISTS\nSELECT name\nFROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o WHERE o.customer_id = c.id\n);`, codeNote: "EXISTS is often faster than IN for correlated checks." }
          ]
        },
        {
          id: 3, title: "Correlated Subqueries", subtitle: "Reference the outer query", xp: 20, color: "#8B5CF6", glow: "rgba(139,92,246,0.35)",
          steps: [
            { heading: "How Correlated Subqueries Work", body: "A correlated subquery references columns from the outer query. It re-executes for every row the outer query processes, which can impact performance.", code: `-- Find products priced above their category average\nSELECT p.name, p.price\nFROM products p\nWHERE p.price > (\n  SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p.category_id\n);`, codeNote: "The inner AVG recalculates for each product's category." }
          ]
        },
        {
          id: 4, title: "Mini Challenge", subtitle: "Test your knowledge", xp: 40, color: "#F59E0B", glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            { id: "c1", question: "What does a scalar subquery return?", code: null, options: ["A table", "Multiple rows", "Exactly one value", "A boolean"], correct: 2, body: "A scalar subquery must return exactly one value (one row, one column). It can be used wherever a single value is expected." },
            { id: "c2", question: "When is EXISTS generally preferred over IN?", code: null, options: ["When the subquery returns few rows", "When you need the actual values", "When the subquery is correlated and the table is large", "When you want duplicates"], correct: 2, body: "EXISTS short-circuits on the first match and works well with correlated subqueries on large tables." },
            { id: "c3", question: "What makes a subquery 'correlated'?", code: null, options: ["It uses JOIN", "It references a column from the outer query", "It returns multiple rows", "It uses GROUP BY"], correct: 1, body: "A correlated subquery references the outer query's columns, causing it to re-execute for each outer row." }
          ]
        }
      ]
    },
    // ─── Chapter 11: Common Table Expressions ───
    {
      no: 11,
      name: "Common Table Expressions",
      difficulty: "Intermediate",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1, title: "The WITH Clause", subtitle: "Name your subqueries for clarity", xp: 30, color: "#3B82F6", glow: "rgba(59,130,246,0.35)",
          steps: [
            { heading: "Basic CTE Syntax", body: "A CTE is defined with the WITH keyword and gives a temporary name to a subquery. It makes complex queries more readable by breaking them into logical steps.", code: `-- Basic CTE: calculate department averages first\nWITH dept_avg AS (\n  SELECT department_id, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department_id\n)\nSELECT e.name, e.salary, d.avg_salary\nFROM employees e\nJOIN dept_avg d ON e.department_id = d.department_id;`, codeNote: "The CTE acts like a named temporary result set." },
            { heading: "Chaining Multiple CTEs", body: "You can define several CTEs in a single WITH clause separated by commas. Later CTEs can reference earlier ones, building up logic step by step.", code: `-- Chain two CTEs together\nWITH active_users AS (\n  SELECT id, name FROM users WHERE active = true\n),\nuser_orders AS (\n  SELECT u.name, COUNT(o.id) AS order_count\n  FROM active_users u\n  JOIN orders o ON u.id = o.user_id\n  GROUP BY u.name\n)\nSELECT * FROM user_orders WHERE order_count > 5;`, codeNote: "Each CTE builds on the previous one for clarity." }
          ]
        },
        {
          id: 2, title: "Recursive CTEs", subtitle: "Traverse hierarchical data", xp: 30, color: "#10B981", glow: "rgba(16,185,129,0.35)",
          steps: [
            { heading: "Recursive CTE Basics", body: "A recursive CTE references itself to traverse hierarchical or tree-structured data. It has an anchor member and a recursive member joined by UNION ALL.", code: `-- Recursive CTE: build an org chart\nWITH RECURSIVE org_chart AS (\n  -- Anchor: top-level manager\n  SELECT id, name, manager_id, 1 AS level\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  -- Recursive: find each employee's reports\n  SELECT e.id, e.name, e.manager_id, oc.level + 1\n  FROM employees e\n  JOIN org_chart oc ON e.manager_id = oc.id\n)\nSELECT * FROM org_chart ORDER BY level, name;`, codeNote: "The anchor starts the recursion; UNION ALL appends each level." },
            { heading: "Generating a Number Series", body: "Recursive CTEs can generate sequences without needing a helper table. This is useful for filling date ranges or creating row numbers on the fly.", code: `-- Generate numbers 1 through 10\nWITH RECURSIVE nums AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 10\n)\nSELECT n FROM nums;`, codeNote: "The recursion terminates when the WHERE condition fails." }
          ]
        },
        {
          id: 3, title: "CTE vs Subquery", subtitle: "When to use which approach", xp: 20, color: "#8B5CF6", glow: "rgba(139,92,246,0.35)",
          steps: [
            { heading: "Readability and Reuse", body: "CTEs improve readability by assigning meaningful names to intermediate results. Unlike subqueries, a CTE can be referenced multiple times in the same query without repeating code.", code: `-- CTE referenced twice: compare each sale to the average\nWITH sale_stats AS (\n  SELECT AVG(amount) AS avg_amount FROM sales\n)\nSELECT s.id, s.amount,\n  s.amount - ss.avg_amount AS diff_from_avg\nFROM sales s, sale_stats ss;`, codeNote: "Without a CTE you would need to repeat the AVG subquery." }
          ]
        },
        {
          id: 4, title: "Mini Challenge", subtitle: "Test your knowledge", xp: 40, color: "#F59E0B", glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            { id: "c1", question: "What keyword introduces a CTE?", code: null, options: ["CTE", "WITH", "DEFINE", "TEMP"], correct: 1, body: "The WITH keyword introduces one or more Common Table Expressions before the main SELECT statement." },
            { id: "c2", question: "What are the two parts of a recursive CTE?", code: null, options: ["SELECT and FROM", "Anchor member and recursive member", "HEAD and TAIL", "BASE and STEP"], correct: 1, body: "A recursive CTE has an anchor member (base case) and a recursive member joined by UNION ALL." },
            { id: "c3", question: "What advantage does a CTE have over an inline subquery?", code: null, options: ["It runs faster always", "It can be referenced multiple times in the same query", "It persists across sessions", "It creates a permanent table"], correct: 1, body: "A CTE can be referenced multiple times in the main query without duplicating the subquery logic." }
          ]
        }
      ]
    },
    // ─── Chapter 12: Window Functions ───
    {
      no: 12,
      name: "Window Functions",
      difficulty: "Intermediate",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1, title: "ROW_NUMBER & RANK", subtitle: "Assign rankings to rows", xp: 30, color: "#3B82F6", glow: "rgba(59,130,246,0.35)",
          steps: [
            { heading: "ROW_NUMBER", body: "ROW_NUMBER assigns a unique sequential integer to each row within a partition. Ties get different numbers based on the ORDER BY.", code: `-- Assign a row number to each employee by salary\nSELECT name, department, salary,\n  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn\nFROM employees;`, codeNote: "ROW_NUMBER never produces duplicate numbers within a partition." },
            { heading: "RANK vs DENSE_RANK", body: "RANK leaves gaps after ties while DENSE_RANK does not. For example, two tied first-place rows make the next RANK = 3 but DENSE_RANK = 2.", code: `-- Compare RANK and DENSE_RANK\nSELECT name, score,\n  RANK() OVER (ORDER BY score DESC) AS rank_val,\n  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank_val\nFROM students;`, codeNote: "RANK skips numbers after ties; DENSE_RANK does not." }
          ]
        },
        {
          id: 2, title: "OVER & PARTITION BY", subtitle: "Define the window frame", xp: 30, color: "#10B981", glow: "rgba(16,185,129,0.35)",
          steps: [
            { heading: "The OVER Clause", body: "The OVER clause defines the window for a function. Without PARTITION BY, the window is the entire result set. Adding ORDER BY controls the row ordering.", code: `-- Running total of sales ordered by date\nSELECT sale_date, amount,\n  SUM(amount) OVER (ORDER BY sale_date) AS running_total\nFROM sales;`, codeNote: "SUM with OVER computes a running total without GROUP BY." },
            { heading: "PARTITION BY", body: "PARTITION BY divides rows into groups for the window function. Each partition is processed independently, similar to GROUP BY but without collapsing rows.", code: `-- Running total per department\nSELECT department, sale_date, amount,\n  SUM(amount) OVER (PARTITION BY department ORDER BY sale_date) AS dept_running\nFROM sales;`, codeNote: "Each department gets its own independent running total." }
          ]
        },
        {
          id: 3, title: "LAG & LEAD", subtitle: "Access adjacent rows", xp: 20, color: "#8B5CF6", glow: "rgba(139,92,246,0.35)",
          steps: [
            { heading: "Comparing to Previous or Next Rows", body: "LAG accesses the previous row's value and LEAD accesses the next row's value. These are useful for calculating differences between consecutive rows.", code: `-- Compare each month's revenue to the previous month\nSELECT month, revenue,\n  LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly_revenue;`, codeNote: "LAG(column, 1) is the default; use LAG(column, 2) to go back two rows." }
          ]
        },
        {
          id: 4, title: "Mini Challenge", subtitle: "Test your knowledge", xp: 40, color: "#F59E0B", glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            { id: "c1", question: "What does ROW_NUMBER do with tied values?", code: null, options: ["Assigns the same number", "Leaves gaps", "Assigns different numbers arbitrarily", "Returns NULL"], correct: 2, body: "ROW_NUMBER always assigns unique sequential integers. Tied values receive different numbers based on internal row order." },
            { id: "c2", question: "What is the difference between RANK and DENSE_RANK?", code: null, options: ["RANK is faster", "RANK leaves gaps after ties, DENSE_RANK does not", "DENSE_RANK only works with numbers", "There is no difference"], correct: 1, body: "RANK skips numbers after ties (1, 1, 3) while DENSE_RANK keeps consecutive numbers (1, 1, 2)." },
            { id: "c3", question: "What does PARTITION BY do in a window function?", code: null, options: ["Filters rows", "Divides rows into independent groups for the window", "Sorts the final output", "Limits the result count"], correct: 1, body: "PARTITION BY splits the result set into partitions. The window function is applied independently within each partition." }
          ]
        }
      ]
    },
    // ─── Chapter 13: Indexes & Performance ───
    {
      no: 13,
      name: "Indexes & Performance",
      difficulty: "Intermediate",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1, title: "Creating Indexes", subtitle: "Speed up your queries", xp: 30, color: "#3B82F6", glow: "rgba(59,130,246,0.35)",
          steps: [
            { heading: "CREATE INDEX Basics", body: "An index is a data structure that speeds up lookups on a column. Creating an index on frequently queried columns can dramatically reduce query time.", code: `-- Create an index on the email column\nCREATE INDEX idx_users_email ON users (email);\n\n-- Create a composite index on two columns\nCREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date);`, codeNote: "Composite indexes help queries that filter on multiple columns." },
            { heading: "Unique Indexes", body: "A unique index enforces that no two rows can have the same value in the indexed column. It acts as both a constraint and a performance optimization.", code: `-- Unique index prevents duplicate emails\nCREATE UNIQUE INDEX idx_unique_email ON users (email);\n\n-- Attempting a duplicate insert will fail\nINSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');\nINSERT INTO users (name, email) VALUES ('Bob', 'alice@example.com'); -- Error!`, codeNote: "Unique indexes combine data integrity with fast lookups." }
          ]
        },
        {
          id: 2, title: "Query Plans", subtitle: "Understand how queries execute", xp: 30, color: "#10B981", glow: "rgba(16,185,129,0.35)",
          steps: [
            { heading: "Using EXPLAIN", body: "EXPLAIN shows the execution plan the database will use for a query. It reveals whether indexes are being used or if a full table scan occurs.", code: `-- See the query plan\nEXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';\n\n-- More detail with ANALYZE (actually runs the query)\nEXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;`, codeNote: "Look for 'Seq Scan' (slow) vs 'Index Scan' (fast) in the output." },
            { heading: "Reading Plan Output", body: "Key things to look for are scan type, estimated rows, and cost. An Index Scan means your index is working. A Sequential Scan means the database reads every row.", code: `-- If you see Seq Scan, consider adding an index\n-- Before: Seq Scan on orders (cost=0.00..1520.00)\nCREATE INDEX idx_orders_customer ON orders (customer_id);\n-- After: Index Scan using idx_orders_customer (cost=0.00..8.27)`, codeNote: "Indexes can reduce costs by orders of magnitude on large tables." }
          ]
        },
        {
          id: 3, title: "When to Index", subtitle: "Balance speed and overhead", xp: 20, color: "#8B5CF6", glow: "rgba(139,92,246,0.35)",
          steps: [
            { heading: "Index Trade-offs", body: "Indexes speed up reads but slow down writes because every INSERT, UPDATE, or DELETE must also update the index. Only index columns that are frequently queried or used in WHERE, JOIN, and ORDER BY clauses.", code: `-- Good candidates for indexing:\n-- Columns in WHERE clauses\nSELECT * FROM products WHERE category_id = 5;\n-- Columns in JOIN conditions\nSELECT * FROM orders o JOIN customers c ON o.customer_id = c.id;\n-- Columns in ORDER BY (for large result sets)\nSELECT * FROM logs ORDER BY created_at DESC LIMIT 100;`, codeNote: "Avoid indexing columns with very low cardinality like boolean flags." }
          ]
        },
        {
          id: 4, title: "Mini Challenge", subtitle: "Test your knowledge", xp: 40, color: "#F59E0B", glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            { id: "c1", question: "What does CREATE INDEX do?", code: null, options: ["Creates a new table", "Builds a data structure for faster lookups", "Backs up the database", "Adds a foreign key"], correct: 1, body: "CREATE INDEX builds a data structure (typically a B-tree) that allows the database to find rows faster without scanning the entire table." },
            { id: "c2", question: "What SQL command shows a query's execution plan?", code: null, options: ["SHOW PLAN", "EXPLAIN", "DESCRIBE QUERY", "ANALYZE TABLE"], correct: 1, body: "EXPLAIN displays the execution plan the database engine will use, showing scan types, costs, and whether indexes are utilized." },
            { id: "c3", question: "Why shouldn't you index every column?", code: null, options: ["Indexes take no space", "Indexes slow down INSERT, UPDATE, and DELETE operations", "The database ignores extra indexes", "Indexes only work on primary keys"], correct: 1, body: "Each index must be maintained on every write operation. Too many indexes degrade write performance and consume storage." }
          ]
        }
      ]
    },
    // ─── Chapter 14: Transactions ───
    {
      no: 14,
      name: "Transactions",
      difficulty: "Intermediate",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1, title: "BEGIN & COMMIT", subtitle: "Group operations atomically", xp: 30, color: "#3B82F6", glow: "rgba(59,130,246,0.35)",
          steps: [
            { heading: "Starting a Transaction", body: "BEGIN starts a transaction block. All statements after BEGIN are part of the same atomic unit and are only applied when you issue COMMIT.", code: `-- Transfer funds between accounts atomically\nBEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;`, codeNote: "Both updates succeed together or neither is applied." },
            { heading: "Why Transactions Matter", body: "Without transactions, a failure between two related statements could leave your data in an inconsistent state. Transactions ensure all-or-nothing execution.", code: `-- Without a transaction, a crash here leaves data inconsistent\nUPDATE inventory SET quantity = quantity - 1 WHERE product_id = 10;\n-- If the server crashes before the next line, the order is lost\nINSERT INTO order_items (order_id, product_id) VALUES (50, 10);`, codeNote: "Wrapping both statements in BEGIN/COMMIT prevents partial updates." }
          ]
        },
        {
          id: 2, title: "ROLLBACK", subtitle: "Undo changes on error", xp: 30, color: "#10B981", glow: "rgba(16,185,129,0.35)",
          steps: [
            { heading: "Using ROLLBACK", body: "ROLLBACK discards all changes made since the last BEGIN. Use it when an error occurs and you need to revert to a clean state.", code: `-- Rollback on error\nBEGIN;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\n-- Check: does the sender have enough funds?\n-- If not, undo everything\nROLLBACK;`, codeNote: "ROLLBACK undoes all changes back to the BEGIN statement." },
            { heading: "Savepoints", body: "Savepoints let you roll back part of a transaction without discarding everything. You can set a savepoint and roll back to it while keeping earlier work intact.", code: `BEGIN;\nINSERT INTO orders (customer_id, total) VALUES (1, 200);\nSAVEPOINT before_items;\nINSERT INTO order_items (order_id, product_id) VALUES (100, 999);\n-- Oops, bad product ID — roll back just the item insert\nROLLBACK TO before_items;\nINSERT INTO order_items (order_id, product_id) VALUES (100, 42);\nCOMMIT;`, codeNote: "The order insert is preserved; only the bad item is rolled back." }
          ]
        },
        {
          id: 3, title: "ACID Properties", subtitle: "The four guarantees of transactions", xp: 20, color: "#8B5CF6", glow: "rgba(139,92,246,0.35)",
          steps: [
            { heading: "Understanding ACID", body: "ACID stands for Atomicity, Consistency, Isolation, and Durability. These properties guarantee reliable transaction processing even during system failures.", code: `-- ACID in action:\n-- Atomicity:    Both statements succeed or both fail\n-- Consistency:  Constraints are checked at COMMIT\n-- Isolation:    Other sessions don't see partial changes\n-- Durability:   Once committed, data survives a crash\n\nBEGIN;\nUPDATE accounts SET balance = balance - 50 WHERE id = 1;\nUPDATE accounts SET balance = balance + 50 WHERE id = 2;\nCOMMIT; -- All four guarantees apply`, codeNote: "ACID is the foundation of reliable relational databases." }
          ]
        },
        {
          id: 4, title: "Mini Challenge", subtitle: "Test your knowledge", xp: 40, color: "#F59E0B", glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            { id: "c1", question: "What does BEGIN do in SQL?", code: null, options: ["Starts the database server", "Starts a transaction block", "Creates a new table", "Locks the entire database"], correct: 1, body: "BEGIN marks the start of a transaction. All subsequent statements are grouped until a COMMIT or ROLLBACK." },
            { id: "c2", question: "What does ROLLBACK do?", code: null, options: ["Saves all changes permanently", "Discards all changes since the last BEGIN", "Deletes the table", "Restarts the query"], correct: 1, body: "ROLLBACK undoes all changes made within the current transaction, reverting to the state before BEGIN." },
            { id: "c3", question: "What does the 'A' in ACID stand for?", code: null, options: ["Availability", "Atomicity", "Authentication", "Aggregation"], correct: 1, body: "Atomicity means a transaction is all-or-nothing. Either every statement in the transaction succeeds, or none of them are applied." }
          ]
        }
      ]
    },
    // ─── Chapter 15: Views & Stored Procedures ───
    {
      no: 15,
      name: "Views & Stored Procedures",
      difficulty: "Intermediate",
      duration: "12 min",
      totalXP: 120,
      parts: [
        {
          id: 1, title: "Creating Views", subtitle: "Save reusable queries", xp: 30, color: "#3B82F6", glow: "rgba(59,130,246,0.35)",
          steps: [
            { heading: "CREATE VIEW Basics", body: "A view is a saved SELECT query that acts like a virtual table. You can query it just like a regular table, but it always reflects the latest data.", code: `-- Create a view for active premium users\nCREATE VIEW active_premium_users AS\nSELECT id, name, email\nFROM users\nWHERE active = true AND plan = 'premium';\n\n-- Use the view like a table\nSELECT * FROM active_premium_users;`, codeNote: "Views simplify complex queries and provide a clean interface." },
            { heading: "Updating and Dropping Views", body: "Use CREATE OR REPLACE VIEW to modify an existing view. DROP VIEW removes it entirely. Views don't store data, so dropping one doesn't delete any rows.", code: `-- Update the view definition\nCREATE OR REPLACE VIEW active_premium_users AS\nSELECT id, name, email, created_at\nFROM users\nWHERE active = true AND plan = 'premium';\n\n-- Remove the view\nDROP VIEW IF EXISTS active_premium_users;`, codeNote: "CREATE OR REPLACE avoids needing to DROP first." }
          ]
        },
        {
          id: 2, title: "Stored Procedures", subtitle: "Encapsulate logic in the database", xp: 30, color: "#10B981", glow: "rgba(16,185,129,0.35)",
          steps: [
            { heading: "What Are Stored Procedures?", body: "A stored procedure is a block of SQL saved in the database that you can call by name. It can accept parameters, execute multiple statements, and contain control flow.", code: `-- Create a stored procedure to deactivate old users\nCREATE PROCEDURE deactivate_old_users(cutoff_days INT)\nLANGUAGE SQL\nAS $$\n  UPDATE users\n  SET active = false\n  WHERE last_login < NOW() - INTERVAL '1 day' * cutoff_days;\n$$;\n\n-- Call the procedure\nCALL deactivate_old_users(90);`, codeNote: "CALL executes the procedure with the given arguments." },
            { heading: "Procedures vs Functions", body: "Stored procedures use CALL and can perform actions like INSERT or UPDATE. Functions return a value and can be used inside SELECT statements. Choose based on your use case.", code: `-- Create a function that returns a value\nCREATE FUNCTION get_user_count()\nRETURNS INT\nLANGUAGE SQL\nAS $$\n  SELECT COUNT(*) FROM users WHERE active = true;\n$$;\n\n-- Use in a SELECT\nSELECT get_user_count() AS total_active;`, codeNote: "Functions return values; procedures perform actions." }
          ]
        },
        {
          id: 3, title: "Benefits of Views & Procedures", subtitle: "Security, reuse, and abstraction", xp: 20, color: "#8B5CF6", glow: "rgba(139,92,246,0.35)",
          steps: [
            { heading: "Why Use Views and Stored Procedures?", body: "Views hide complex joins from application code and can restrict which columns users see. Stored procedures centralize business logic in the database and reduce round trips between app and server.", code: `-- View for restricted access: analysts see aggregates, not raw data\nCREATE VIEW sales_summary AS\nSELECT department, SUM(amount) AS total, COUNT(*) AS num_sales\nFROM sales\nGROUP BY department;\n\n-- Grant access to the view, not the underlying table\nGRANT SELECT ON sales_summary TO analyst_role;`, codeNote: "Views provide a security layer by exposing only what's needed." }
          ]
        },
        {
          id: 4, title: "Mini Challenge", subtitle: "Test your knowledge", xp: 40, color: "#F59E0B", glow: "rgba(245,158,11,0.4)",
          isChallengepart: true,
          challenges: [
            { id: "c1", question: "What does a SQL view store?", code: null, options: ["A copy of the data", "The query definition only", "Indexes on the table", "Backup of the table"], correct: 1, body: "A view stores the query definition, not the data itself. Each time you query a view, it executes the underlying SELECT." },
            { id: "c2", question: "How do you execute a stored procedure?", code: null, options: ["SELECT procedure_name()", "RUN procedure_name", "CALL procedure_name()", "EXEC procedure_name"], correct: 2, body: "The CALL statement is the standard way to execute a stored procedure with its arguments." },
            { id: "c3", question: "What is a key difference between a stored procedure and a function?", code: null, options: ["Procedures are faster", "Functions return a value and can be used in SELECT", "Procedures cannot accept parameters", "Functions cannot query tables"], correct: 1, body: "Functions return a value and can be embedded in SELECT statements. Procedures perform actions and are invoked with CALL." }
          ]
        }
      ]
    },
  ],
};

//End of line.......