
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseCatalog } from "../data/courseCatalog.jsx";

function SkillBadgeIcon({ size = 80, label = "AI", bg = "#0ea5e9", fg = "#ffffff" }) {
  const textSize = label.length >= 4 ? "text-xs" : "text-sm";
  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg, color: fg }}
      className="rounded-2xl flex items-center justify-center font-black tracking-wide shadow-lg"
    >
      <span className={textSize}>{label}</span>
    </div>
  );
}

function HtmlIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#E65100" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z" />
      <path fill="#FF6D00" d="M24 8L24 39.9 35.2 36.7 37.7 8z" />
      <path fill="#FFF" d="M24,25v-4h8.6l-0.7,11.5L24,35.1v-4.2l4.1-1.4l0.3-4.5H24z M32.9,17l0.3-4H24v4H32.9z" />
      <path fill="#EEE" d="M24,30.9v4.2l-7.9-2.6L15.7,27h4l0.2,2.5L24,30.9z M19.1,17H24v-4h-9.1l0.7,12H24v-4h-4.6L19.1,17z" />
    </svg>
  );
}

function CssIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#0277BD" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z" />
      <path fill="#039BE5" d="M24 8L24 39.9 35.2 36.7 37.7 8z" />
      <path fill="#FFF" d="M33.1,13H24v4h4.9l-0.3,4H24v4h4.4l-0.3,4.5l-4.1,1.4v4.2l7.9-2.6L33.1,13z" />
      <path fill="#EEE" d="M24,13h-9.1l0.3,4H24V13z M24,21h-4.6l0.3,4H24V21z M24,30.9l-4.1-1.4L19.6,27h-4l0.4,5.4L24,35.1V30.9z" />
    </svg>
  );
}

function PythonIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 50 50">
      <path fill="#0277bd" d="M24.047,5c-1.555,0.005-2.633,0.142-3.936,0.367c-3.848,0.67-4.549,2.077-4.549,4.67V14h9v2H15.22h-4.35c-2.636,0-4.943,1.242-5.674,4.219c-0.826,3.417-0.863,5.557,0,9.125C5.851,32.005,7.294,34,9.931,34h3.632v-5.104c0-2.966,2.686-5.896,5.764-5.896h7.236c2.523,0,5-1.862,5-4.377v-8.586c0-2.439-1.759-4.263-4.218-4.672C27.406,5.359,25.589,4.994,24.047,5z M19.063,9c0.821,0,1.5,0.677,1.5,1.502c0,0.833-0.679,1.498-1.5,1.498c-0.837,0-1.5-0.664-1.5-1.498C17.563,9.68,18.226,9,19.063,9z" />
      <path fill="#ffc107" d="M23.078,43c1.555-0.005,2.633-0.142,3.936-0.367c3.848-0.67,4.549-2.077,4.549-4.67V34h-9v-2h9.343h4.35c2.636,0,4.943-1.242,5.674-4.219c0.826-3.417,0.863-5.557,0-9.125C41.274,15.995,39.831,14,37.194,14h-3.632v5.104c0,2.966-2.686,5.896-5.764,5.896h-7.236c-2.523,0-5,1.862-5,4.377v8.586c0,2.439,1.759,4.263,4.218,4.672C19.719,42.641,21.536,43.006,23.078,43z M28.063,39c-0.821,0-1.5-0.677-1.5-1.502c0-0.833,0.679-1.498,1.5-1.498c0.837,0,1.5,0.664,1.5,1.498C29.563,38.32,28.899,39,28.063,39z" />
    </svg>
  );
}

function JavaIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#F44336" d="M23.65,24.898c-0.998-1.609-1.722-2.943-2.725-5.455C19.229,15.2,31.24,11.366,26.37,3.999c2.111,5.089-7.577,8.235-8.477,12.473C17.07,20.37,23.645,24.898,23.65,24.898z" />
      <path fill="#F44336" d="M23.878,17.27c-0.192,2.516,2.229,3.857,2.299,5.695c0.056,1.496-1.447,2.743-1.447,2.743s2.728-0.536,3.579-2.818c0.945-2.534-1.834-4.269-1.548-6.298c0.267-1.938,6.031-5.543,6.031-5.543S24.311,11.611,23.878,17.27z" />
      <path fill="#1565C0" d="M32.084 25.055c1.754-.394 3.233.723 3.233 2.01 0 2.901-4.021 5.643-4.021 5.643s6.225-.742 6.225-5.505C37.521 24.053 34.464 23.266 32.084 25.055zM29.129 27.395c0 0 1.941-1.383 2.458-1.902-4.763 1.011-15.638 1.147-15.638.269 0-.809 3.507-1.638 3.507-1.638s-7.773-.112-7.773 2.181C11.683 28.695 21.858 28.866 29.129 27.395z" />
    </svg>
  );
}

function JsIcon({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#ffff00" />
      <text x="50%" y="65%" textAnchor="middle" fontSize="28" fontWeight="500" fill="#000" fontFamily="Arial, Helvetica, sans-serif">JS</text>
    </svg>
  );
}

function CppIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#00549d" fillRule="evenodd" d="M22.903,3.286c0.679-0.381,1.515-0.381,2.193,0c3.355,1.883,13.451,7.551,16.807,9.434C42.582,13.1,43,13.804,43,14.566c0,3.766,0,15.101,0,18.867c0,0.762-0.418,1.466-1.097,1.847c-3.355,1.883-13.451,7.551-16.807,9.434c-0.679,0.381-1.515,0.381-2.193,0c-3.355-1.883-13.451-7.551-16.807-9.434C5.418,34.899,5,34.196,5,33.434c0-3.766,0-15.101,0-18.867c0-0.762,0.418-1.466,1.097-1.847C9.451,10.837,19.549,5.169,22.903,3.286z" clipRule="evenodd" />
    </svg>
  );
}


const iconMap = {
  python: PythonIcon,
  java: JavaIcon,
  javascript: JsIcon,
  cpp: CppIcon,
  claude: (props) => <SkillBadgeIcon {...props} label="CL" bg="#6d28d9" />,
  aws: (props) => <SkillBadgeIcon {...props} label="AWS" bg="#b45309" />,
  azure: (props) => <SkillBadgeIcon {...props} label="AZ" bg="#0ea5e9" />,
  gcp: (props) => <SkillBadgeIcon {...props} label="GCP" bg="#2563eb" />,
  ml: (props) => <SkillBadgeIcon {...props} label="ML" bg="#0f766e" />,
  dl: (props) => <SkillBadgeIcon {...props} label="DL" bg="#312e81" />,
  nlp: (props) => <SkillBadgeIcon {...props} label="NLP" bg="#be185d" />,
  data: (props) => <SkillBadgeIcon {...props} label="DATA" bg="#0f766e" />,
  sql: (props) => <SkillBadgeIcon {...props} label="SQL" bg="#1d4ed8" />,
  spark: (props) => <SkillBadgeIcon {...props} label="SPK" bg="#b45309" />,
  docker: (props) => <SkillBadgeIcon {...props} label="DKR" bg="#0284c7" />,
  k8s: (props) => <SkillBadgeIcon {...props} label="K8S" bg="#4338ca" />,
  security: (props) => <SkillBadgeIcon {...props} label="SEC" bg="#991b1b" />,
  dsa: (props) => <SkillBadgeIcon {...props} label="DSA" bg="#1f2937" />
};

// const languageData = {
// html: {
//   id: "html",
//   title: "HTML",
//   tagline: "Structure. Semantics. The Web's foundation.",
//   accentColor: "#e34f26",
//   accentLight: "#f7a072",
//   gradient: "from-orange-600 via-red-500 to-pink-500",
//   cardGradient: "from-orange-400 to-red-400",
//   icon: HtmlIcon,
//   summary: `HTML (HyperText Markup Language) is the standard markup language for creating and structuring content on the web. It defines the semantic structure of documents — headings, paragraphs, lists, links, images, forms, and more — which browsers render and assistive technologies interpret. HTML is not a programming language but the backbone that, together with CSS and JavaScript, makes the modern web possible.`,
//   info: [
//     {
//       heading: "Origin & History",
//       content: `HTML was created by Tim Berners-Lee in 1991 to share and link scientific documents across the early web. Initially simple and permissive, HTML evolved through community-driven standards at the W3C and WHATWG. Major milestones include HTML 2.0 (1995), HTML 4.01 (1999), and the modern HTML5 specification (2014 onward), which standardized multimedia, semantic elements, APIs, and improved interoperability across browsers. HTML's evolution prioritized backward compatibility and progressive enhancement.`
//     },
//     {
//       heading: "Core Strengths & Uses",
//       content: `HTML provides the semantic scaffolding for web content: headings for structure, paragraphs for text, anchors for navigation, forms for input, and media elements for audio and video. It enables accessibility when used with proper semantics and ARIA roles. HTML is essential for SEO, content indexing, and progressive enhancement — allowing content to remain available even when CSS or JavaScript fail. Every website, web app, email template, and many hybrid mobile apps rely on HTML as the entry point for content delivery.`
//     },
//     {
//       heading: "Why Developers Love It",
//       content: `HTML is simple to learn and immediately rewarding: a few tags produce visible results in any browser. Its declarative nature makes documents readable and maintainable. Modern HTML5 introduced semantic elements (header, nav, main, article, section, footer), native multimedia support (audio, video), and form improvements (input types, validation) that reduce reliance on polyfills and heavy JavaScript. Combined with progressive enhancement, HTML lets developers build resilient, accessible experiences that work across devices and network conditions.`
//     },
//     {
//       heading: "Drawbacks & Limitations",
//       content: `HTML alone cannot style or add interactivity — it must be paired with CSS and JavaScript. Misuse of non-semantic tags (divs and spans) or incorrect nesting harms accessibility and SEO. Browser inconsistencies and legacy quirks still exist, requiring careful testing. Over-reliance on client-side rendering can degrade initial load performance and accessibility if server-side rendering or pre-rendering is neglected. Finally, semantic correctness depends on developer discipline; poorly structured HTML undermines the web’s openness and accessibility goals.`
//     },
//     {
//       heading: "HTML Today & The Road Ahead",
//       content: `HTML remains the universal lingua franca of the web. Ongoing work focuses on richer semantics, improved accessibility primitives, and tighter integration with modern web platform APIs (e.g., Web Components, Media Capabilities, and improved form controls). The WHATWG maintains a living standard that evolves incrementally, emphasizing interoperability and progressive enhancement. As the web expands into new form factors and platforms, HTML’s role as the canonical content layer remains central — lightweight, accessible, and future-proof when used correctly.`
//     }
//   ]
// },

// css: {
//   id: "css",
//   title: "CSS",
//   tagline: "Style. Layout. Visual polish.",
//   accentColor: "#2965f1",
//   accentLight: "#6ea8ff",
//   gradient: "from-blue-800 via-indigo-600 to-purple-700",
//   cardGradient: "from-blue-500 to-indigo-400",
//   icon: CssIcon,
//   summary: `CSS (Cascading Style Sheets) is the language used to describe the presentation of HTML documents — how elements are laid out, colored, sized, and animated. It separates content from presentation, enabling designers and developers to craft responsive, accessible, and visually compelling user interfaces across devices and screen sizes.`,
//   info: [
//     {
//       heading: "Origin & History",
//       content: `CSS was first proposed by Håkon Wium Lie in 1994 and quickly adopted as the standard way to style web documents. The W3C standardized CSS1 in 1996, followed by CSS2 in 1998 which added positioning and media types. The modern era began with CSS3, a modular approach that allowed independent development of features (selectors, flexbox, grid, animations). Over the years, CSS evolved from simple color and font rules to a powerful layout and animation system, with ongoing additions like CSS Grid, custom properties (variables), container queries, and new color spaces.`
//     },
//     {
//       heading: "Core Strengths & Uses",
//       content: `CSS controls visual presentation: typography, spacing, color, layout, and responsive behavior. It enables device-adaptive designs via media queries, flexible layouts with Flexbox and Grid, and polished interactions through transitions and animations. CSS custom properties and the cascade make theming and design systems feasible. From simple static pages to complex single-page applications and design systems used across large product suites, CSS is the essential layer that turns structured content into usable, attractive interfaces.`
//     },
//     {
//       heading: "Why Developers Love It",
//       content: `CSS is declarative and expressive: a few well-chosen rules can transform a page. Modern layout primitives like Flexbox and Grid dramatically reduce layout complexity and fragile hacks. Custom properties enable runtime theming and reduce duplication. CSS integrates with the browser rendering pipeline, allowing hardware-accelerated animations and smooth transitions. Tooling and ecosystem support — preprocessors, PostCSS plugins, utility frameworks, and component-scoped styles — let teams adopt patterns that match their workflow, from atomic utility classes to component-driven styling.`
//     },
//     {
//       heading: "Drawbacks & Limitations",
//       content: `The cascade and global nature of CSS can cause specificity wars and unintended style leakage in large codebases. Browser inconsistencies and legacy behavior still require careful testing and fallbacks. Complex responsive designs can become verbose without disciplined architecture. Some powerful features (e.g., container queries, subgrid) arrived late and required polyfills or workarounds. Performance pitfalls exist: excessive repaints, heavy animations, and large style recalculations can degrade UX. Finally, CSS is not a programming language — logic-heavy styling often pushes developers to mix concerns or rely on JavaScript.`
//     },
//     {
//       heading: "CSS Today & The Road Ahead",
//       content: `CSS continues to expand its capabilities while keeping a focus on performance and interoperability. Recent advances — CSS Grid, container queries, logical properties for internationalization, new color formats, and Houdini APIs — give developers finer control and better performance. The community is converging on patterns for scalable, maintainable styling (design tokens, component-scoped styles, utility-first approaches). As the web targets more form factors and platforms, CSS’s role as the presentation layer remains central: lightweight, accessible, and increasingly expressive without sacrificing speed.`
//     }
//   ]
// },

//   python: {
//     id: "python",
//     title: "Python",
//     tagline: "The Language of Simplicity & Power",
//     accentColor: "#3b82f6",
//     accentLight: "#60a5fa",
//     gradient: "from-blue-900 via-blue-800 to-cyan-900",
//     cardGradient: "from-blue-500 to-cyan-400",
//     icon: PythonIcon,
//     summary: `Python, created by Guido van Rossum and first released in 1991, is one of the most beloved and versatile programming languages in the world. It was designed with a philosophy that emphasizes code readability and simplicity — famously encapsulated in "The Zen of Python." With its clean, English-like syntax, Python has become the go-to language for beginners, data scientists, web developers, and AI researchers alike.`,
//     info: [
//       {
//         heading: "Origin & History",
//         content: `Python's story begins in the late 1980s when Guido van Rossum, a Dutch programmer at Centrum Wiskunde & Informatica (CWI) in the Netherlands, began working on a successor to the ABC language. He wanted a language that would bridge the gap between shell scripting and C programming. The name "Python" was inspired not by the snake, but by the British comedy group Monty Python's Flying Circus. Python 1.0 was released in January 1994, Python 2.0 in 2000, and the landmark Python 3.0 — a major revision that broke backward compatibility to fix design flaws — dropped in 2008. Today Python 3.x is the standard, and the language consistently ranks as the world's most popular programming language.`
//       },
//       {
//         heading: "Core Strengths & Uses",
//         content: `Python's reach is extraordinary. In web development, frameworks like Django and Flask power everything from Instagram to Pinterest. In data science and machine learning, libraries such as NumPy, Pandas, Matplotlib, Scikit-learn, TensorFlow, and PyTorch have made Python the undisputed king. Automation and scripting, cybersecurity tools, network programming, game development with Pygame, and scientific computing in academia all rely heavily on Python. NASA, CERN, Google, Netflix, Spotify, and Dropbox use Python extensively in their stacks.`
//       },
//       {
//         heading: "Why Developers Love It",
//         content: `The beauty of Python lies in its readability — code that looks almost like pseudocode. It enforces indentation as syntax, making codebases inherently cleaner. Python's ecosystem is massive; PyPI (Python Package Index) hosts over 400,000 packages. Its "batteries included" philosophy means the standard library covers networking, file I/O, regular expressions, email, JSON, XML, databases, and more without installing anything extra. Dynamic typing, first-class functions, list comprehensions, generators, decorators, and context managers give Python expressive power far beyond its apparent simplicity.`
//       },
//       {
//         heading: "Drawbacks & Limitations",
//         content: `Python is not without flaws. It is significantly slower than compiled languages like C, C++, or Rust — the Global Interpreter Lock (GIL) prevents true multi-threaded parallelism, a pain point for CPU-bound tasks. Mobile development support is limited; Python is rarely used natively on iOS or Android. Its dynamic typing, while flexible, can introduce runtime bugs that statically-typed languages catch at compile time. Memory consumption is higher than lower-level languages. For real-time systems, embedded programming, or high-frequency trading where microseconds matter, Python often falls short.`
//       },
//       {
//         heading: "Python in AI & The Future",
//         content: `Python's dominance in artificial intelligence is near-total. The explosion of deep learning — spearheaded by frameworks like TensorFlow, Keras, PyTorch, and JAX — has been almost entirely Python-driven. Large Language Models, computer vision pipelines, reinforcement learning research, and data engineering workflows are built in Python. With the rise of tools like Jupyter Notebooks enabling interactive computing, and new runtimes like PyPy for speed improvements, Python's future looks incredibly bright. Projects are also underway to remove the GIL (PEP 703), which could unlock true parallelism.`
//       }
//     ]
//   },
//   java: {
//     id: "java",
//     title: "Java",
//     tagline: "Write Once, Run Anywhere",
//     accentColor: "#ef4444",
//     accentLight: "#f87171",
//     gradient: "from-red-900 via-orange-900 to-gray-900",
//     cardGradient: "from-red-500 to-orange-400",
//     icon: JavaIcon,
//     summary: `Java, unveiled by Sun Microsystems in 1995, revolutionized software development with its platform-independent "Write Once, Run Anywhere" philosophy. Powered by the Java Virtual Machine (JVM), Java programs compile to bytecode that runs identically on any platform — a radical idea at the time. Decades later, Java remains the backbone of enterprise software, Android development, and large-scale distributed systems.`,
//     info: [
//       {
//         heading: "Origin & History",
//         content: `Java was conceived by James Gosling and his team at Sun Microsystems (later acquired by Oracle). Originally named "Oak" after a tree outside Gosling's office, it was renamed Java — a nod to coffee. The language was designed for interactive television, but pivoted to the internet when the web exploded. Java 1.0 launched in 1996, and Netscape Navigator supported Java applets, making it a web sensation. The language evolved rapidly through versions: Java 5 brought generics and annotations, Java 8 introduced lambdas and the Stream API — a watershed moment for functional programming in Java. Today Java continues with bi-annual LTS releases.`
//       },
//       {
//         heading: "Core Strengths & Uses",
//         content: `Java is the workhorse of enterprise software. Spring Boot, Hibernate, and Jakarta EE power banks, insurance companies, hospitals, and government systems worldwide. Android development was built on Java (alongside Kotlin). Big Data tooling — Hadoop, Kafka, Spark — runs on the JVM. Java's strong typing, robust exception handling, and mature tooling (Maven, Gradle, IntelliJ IDEA) make it ideal for large teams building complex systems. Microservices architectures frequently use Java with frameworks like Quarkus and Micronaut for cloud-native development.`
//       },
//       {
//         heading: "Why Developers Love It",
//         content: `Java's object-oriented design enforces structure at scale — crucial for enterprise teams of hundreds of engineers. The JVM is a marvel of engineering: garbage collection, JIT compilation, and platform independence are taken for granted today because Java pioneered them. The ecosystem is gigantic: Maven Central hosts millions of libraries. Java's verbosity, often criticized, actually aids clarity in large codebases. Static typing catches entire classes of bugs at compile time. The tooling — debuggers, profilers, IDEs — is world-class. And Java's backward compatibility is legendary; code written in Java 1.0 often runs on modern JVMs.`
//       },
//       {
//         heading: "Drawbacks & Limitations",
//         content: `Java's verbosity is genuinely a double-edged sword — simple tasks require far more boilerplate than Python, Kotlin, or Ruby. Cold start times on the JVM are a significant issue for serverless and cloud functions, where frameworks like Quarkus and GraalVM native images attempt to compensate. Memory footprint is heavy; Java applications often require gigabytes of heap. The OOP-everything design can feel forced when functional patterns are more natural. Applets — Java's original web presence — died entirely. And the Oracle licensing changes for commercial use of the JDK after Java 11 caused significant enterprise concern and migration headaches.`
//       },
//       {
//         heading: "Java Today & Tomorrow",
//         content: `Java is far from dead — it consistently ranks among the top 3 languages globally. Project Loom has introduced virtual threads (Java 21), solving Java's concurrency limitations with lightweight threading at a massive scale. Project Panama improves native interop. GraalVM enables ahead-of-time compilation, dramatically reducing startup times and memory — positioning Java competitively for cloud-native and serverless workloads. Kotlin, which runs on the JVM and is fully interoperable with Java, has revitalized the ecosystem. Java 21 and beyond signal a modern, forward-looking language evolution with records, pattern matching, sealed classes, and more.`
//       }
//     ]
//   },
//   javascript: {
//     id: "javascript",
//     title: "JavaScript",
//     tagline: "The Language of the Web",
//     accentColor: "#eab308",
//     accentLight: "#facc15",
//     gradient: "from-yellow-900 via-amber-900 to-gray-900",
//     cardGradient: "from-yellow-400 to-amber-500",
//     icon: JsIcon,
//     summary: `JavaScript — born in just 10 days in 1995 by Brendan Eich at Netscape — was initially a humble scripting language to make web pages interactive. Today it is the most-used programming language on Earth, running in every web browser, powering server-side applications via Node.js, and driving mobile apps, desktop software, and even IoT devices. JavaScript is the lingua franca of the modern web.`,
//     info: [
//       {
//         heading: "Origin & History",
//         content: `JavaScript was created by Brendan Eich in just ten days while he was working at Netscape Communications. Originally called Mocha, then LiveScript, it was renamed JavaScript as a marketing move to piggyback on Java's popularity — despite the two languages being fundamentally different. Netscape Navigator 2.0 shipped JavaScript in 1995. Microsoft responded with JScript in Internet Explorer, leading to a fractured ecosystem. This prompted Netscape to submit JavaScript to ECMA International for standardization, resulting in ECMAScript. The ES6 / ES2015 release was transformational — introducing classes, arrow functions, modules, Promises, and template literals. Annual releases now keep JavaScript evolving steadily.`
//       },
//       {
//         heading: "Core Strengths & Uses",
//         content: `JavaScript is the only language natively supported by all web browsers, making it indispensable for frontend development. React, Angular, and Vue.js have transformed UI development. Node.js brought JavaScript to the server, enabling full-stack JavaScript development. React Native and Ionic power cross-platform mobile apps. Electron runs VS Code, Slack, and Discord as desktop applications built with JavaScript. Next.js, Nuxt, and Remix blur the line between frontend and backend. Deno and Bun offer modern runtimes challenging Node.js. The npm registry hosts over 2 million packages — the largest package ecosystem in existence.`
//       },
//       {
//         heading: "Why Developers Love It",
//         content: `JavaScript's ubiquity is its superpower — learn one language and build for browser, server, mobile, and desktop. Its event-driven, non-blocking I/O model via Node.js handles enormous concurrency without threads. First-class functions, closures, and prototypal inheritance give JavaScript remarkable flexibility. The developer experience is excellent: hot module replacement, browser DevTools, and an enormous community mean solutions to every problem are a search away. TypeScript — a superset of JavaScript — adds static typing while remaining fully compatible, giving teams the best of both worlds.`
//       },
//       {
//         heading: "Drawbacks & Limitations",
//         content: `JavaScript's birth story — 10 days of creation — left lasting scars. Type coercion is notoriously unpredictable; null == undefined but null !== undefined, and [] + {} produces "[object Object]". The language has multiple ways to do everything, leading to inconsistent codebases. Callback hell, though mitigated by Promises and async/await, still haunts legacy codebases. Single-threaded nature makes CPU-intensive tasks problematic on the main thread. The npm ecosystem, while vast, has serious supply chain security concerns — the infamous left-pad incident took down thousands of projects. Browser inconsistencies, while much rarer today, still occasionally surface.`
//       },
//       {
//         heading: "JavaScript's Future",
//         content: `JavaScript is evolving rapidly. WebAssembly enables near-native performance for compute-heavy tasks in the browser, complementing rather than replacing JavaScript. ES2024 and beyond continue adding features like Records & Tuples, pattern matching proposals, and Temporal (a modern date API replacing the notorious Date object). Edge computing with platforms like Cloudflare Workers and Vercel Edge Functions is JavaScript-native. Bun, written in Zig, promises a 3-5x faster runtime than Node.js. The language's reach will only grow as server components, streaming SSR, and AI-powered tooling (like GitHub Copilot, also heavily JS-based) reshape web development.`
//       }
//     ]
//   },
//   cpp: {
//     id: "cpp",
//     title: "C++",
//     tagline: "Power. Performance. Precision.",
//     accentColor: "#3b82f6",
//     accentLight: "#93c5fd",
//     gradient: "from-blue-900 via-indigo-900 to-gray-900",
//     cardGradient: "from-blue-600 to-indigo-500",
//     icon: CppIcon,
//     summary: `C++, developed by Bjarne Stroustrup beginning in 1979 as "C with Classes," is one of the most powerful, complex, and enduring programming languages ever created. It offers unparalleled control over hardware resources, zero-cost abstractions, and performance that rivals assembly — making it the language of choice for operating systems, game engines, browsers, databases, embedded systems, and anywhere raw speed is non-negotiable.`,
//     info: [
//       {
//         heading: "Origin & History",
//         content: `Bjarne Stroustrup began developing "C with Classes" at Bell Labs in 1979, adding object-oriented features to C while preserving its performance characteristics and low-level capabilities. The language was renamed C++ (using the increment operator ++) in 1983. The first commercial compiler shipped in 1985. C++ was standardized by ISO in 1998 (C++98), with major updates in C++11 — a watershed release that Stroustrup himself said "feels like a new language" — followed by C++14, C++17, C++20 (introducing modules, coroutines, and concepts), and C++23. Unlike many languages, C++ has continuously evolved while maintaining decades of backward compatibility.`
//       },
//       {
//         heading: "Core Strengths & Uses",
//         content: `C++ powers the software that powers everything else. The Linux kernel, Windows, and macOS components are written in C/C++. Chrome, Firefox, and Safari's JavaScript engines are C++. Every major game engine — Unreal Engine, Unity's core — runs on C++. Adobe Photoshop, Illustrator, and Premiere are C++. Financial trading systems, where nanoseconds matter, use C++. CUDA and GPU computing, embedded systems, robotics (ROS), compilers, databases (MySQL, MongoDB, SQLite), and scientific simulations all rely on C++. Even NASA's Mars rovers have C++ components.`
//       },
//       {
//         heading: "Why Developers Love It",
//         content: `C++ gives programmers complete control — memory management, bit-level operations, SIMD intrinsics, inline assembly. The zero-overhead abstraction principle means abstractions cost nothing at runtime; you pay only for what you use. Templates and template metaprogramming enable compile-time computation and type-safe generic programming of extraordinary power. Modern C++ (C++11 and beyond) brought smart pointers, move semantics, lambdas, range-based for loops, and structured bindings that make C++ far more ergonomic without sacrificing performance. The STL — Standard Template Library — provides world-class data structures and algorithms.`
//       },
//       {
//         heading: "Drawbacks & Limitations",
//         content: `C++'s power comes with brutal complexity. The language has a notoriously steep learning curve — mastering templates, undefined behavior, memory management, the rule of five, SFINAE, and the object model takes years. Memory safety is the Achilles' heel: buffer overflows, use-after-free, dangling pointers, and memory leaks are endemic. The NSA and Google have recommended moving away from C++ toward memory-safe languages. Compile times for large C++ projects can be agonizingly slow. The C preprocessor is a historical accident that creates fragility. Build system fragmentation (Make, CMake, Bazel, Meson) is a persistent headache. And undefined behavior — code that compiles but produces arbitrary results — is a constant landmine.`
//       },
//       {
//         heading: "C++ Today & The Memory Safety Debate",
//         content: `C++ remains irreplaceable for performance-critical domains, but faces its most serious challenge: Rust. Rust provides memory safety guarantees at compile time with comparable performance, leading to Microsoft, Google, and even the Linux kernel adopting Rust for new systems code. The C++ committee is responding — C++23 and future standards address safety concerns with safer span, string_view, and upcoming "Profiles" for safer subsets. The debate is intense: Stroustrup himself has published rebuttals to the safety criticism. Meanwhile, C++ continues to be the language of game engines, HPC, and systems where developer knowledge and existing codebases make replacement impractical.`
//       }
//     ]
//   }
// };

const DefaultCourseIcon = (props) => <SkillBadgeIcon {...props} label="CRS" bg="#334155" />;

function InfoSection({ section, accentColor }) {
  return (
    <div className="mb-9">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: accentColor }} />
        {section.heading}
      </h3>
      <p className="text-gray-400 leading-relaxed text-sm">{section.content}</p>
    </div>
  );
}

function MarketStat({ label, value }) {
  return (
    <div className="rounded-xl border border-[#1f2a38] bg-[#141b24] px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-sm sm:text-base text-white font-bold mt-1">{value}</div>
    </div>
  );
}

const LanguagePage = ({ langId }) => {
  const lang = courseCatalog[langId];
  const [readMore, setReadMore] = useState(false);
  const navigate = useNavigate();

  if (!lang) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white p-6">
        <div className="max-w-3xl mx-auto bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-2">Course not found</h1>
          <p className="text-gray-400">This course is not in the catalog yet.</p>
          <button
            type="button"
            onClick={() => navigate("/learn")}
            className="mt-4 px-4 py-2 rounded-lg bg-linear-to-r from-cyan-400 to-emerald-400 text-gray-950 font-bold"
          >
            Go to Learn Page
          </button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[lang.icon] || DefaultCourseIcon;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className={`w-full bg-linear-to-br ${lang.gradient} flex flex-col items-center justify-center gap-6 relative overflow-hidden px-4 py-10 sm:py-12`}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: lang.accentColor }} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="p-6 rounded-3xl bg-gray-900/50 backdrop-blur border border-white/10 shadow-2xl" style={{ boxShadow: `0 0 60px ${lang.accentColor}33` }}>
              <Icon size={80} />
            </div>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{lang.title}</h1>
              <p className="text-sm mt-1 font-medium" style={{ color: lang.accentLight }}>{lang.tagline}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                `${lang.domain}`,
                `${lang.level}`,
                "Career Track"
              ].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-10 py-10 sm:py-12">
          <div className="w-full max-w-sm bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-5 sm:p-6">
            <h2 className="text-2xl font-bold text-white mb-1">{lang.title} Market Snapshot</h2>
            <p className="text-gray-400 text-sm mb-5">See demand, salary potential, and start now.</p>

            <div className="space-y-3">
              <MarketStat label="People Enrolled" value={lang.enrolled} />
              <MarketStat label="Current Market Heat" value={lang.marketHotness} />
              <MarketStat label="Expected Salary (after proficiency)" value={lang.salary} />

              <div className="rounded-xl border border-[#1f2a38] bg-[#141b24] px-4 py-3">
                <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
                  <span>Hotness Score</span>
                  <span>{lang.hotnessScore}/100</span>
                </div>
                <div className="w-full mt-2 h-2 rounded-full bg-[#0f1419] border border-[#22303d] overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${lang.hotnessScore}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/levels/${lang.id}`)}
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${lang.accentColor}, ${lang.accentLight})`,
                boxShadow: `0 4px 20px ${lang.accentColor}44`
              }}
            >
              Start {lang.title} Course
            </button>
            <button
              type="button"
              onClick={() => navigate("/learn")}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold border border-[#2a3a4a] text-cyan-300 hover:bg-[#141b24]"
            >
              View All Courses
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 px-6 md:px-16 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 rounded-full" style={{ background: lang.accentColor }} />
              <h2 className="text-2xl font-bold text-white">About {lang.title}</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-base">{lang.summary}</p>
          </div>

          {lang.info.slice(0, 2).map((section, i) => (
            <InfoSection key={i} section={section} accentColor={lang.accentColor} />
          ))}

          <div className="mt-8">
            <button
              onClick={() => setReadMore((r) => !r)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition group"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <span className="transition-transform duration-300" style={{ display: "inline-block", transform: readMore ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              <span className="underline underline-offset-4 decoration-dotted">{readMore ? "Show less" : `Read more about ${lang.title}`}</span>
            </button>

            {readMore && (
              <div className="mt-8 space-y-0 border-l-2 border-white/5 pl-6">
                {lang.info.slice(2).map((section, i) => (
                  <InfoSection key={i} section={section} accentColor={lang.accentColor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer accentColor={lang.accentColor} />
    </div>
  );
};

function Footer({ accentColor }) {
  return (
    <footer className="bg-gray-950 border-t border-white/5 text-gray-500 text-sm">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="text-xl font-black text-white mb-3" style={{ textShadow: accentColor ? `0 0 12px ${accentColor}` : undefined }}>Codify</div>
          <p className="text-xs text-gray-600 leading-relaxed">Learn to code through gamified, bite-sized challenges. Free. Fun. Effective.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Platform</h4>
          <ul className="space-y-2">
            {["Courses", "Challenges", "Leaderboard", "Streaks"].map((l) => (
              <li key={l}><button className="hover:text-gray-300 transition text-left">{l}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Company</h4>
          <ul className="space-y-2">
            {["About", "Blog", "Careers", "Press"].map((l) => (
              <li key={l}><button className="hover:text-gray-300 transition text-left">{l}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Support</h4>
          <ul className="space-y-2">
            {["Help Center", "Contact Us", "Privacy", "Terms"].map((l) => (
              <li key={l}><button className="hover:text-gray-300 transition text-left">{l}</button></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-gray-700">
        © {new Date().getFullYear()} Codify. Built for learners, by learners.
      </div>
    </footer>
  );
}

export default LanguagePage;