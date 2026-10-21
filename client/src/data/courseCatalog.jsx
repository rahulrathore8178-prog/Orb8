function infoBlock(heading, content) {
  return { heading, content };
}

export const courseCatalog = {
  python: {
    id: "python",
    title: "Python",
    domain: "Coding",
    level: "Beginner",
    tagline: "The Language of Simplicity & Power",
    accentColor: "#3b82f6",
    accentLight: "#60a5fa",
    gradient: "from-blue-900 via-blue-800 to-cyan-900",
    cardGradient: "from-blue-500 to-cyan-400",
    icon: <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="80" height="80" viewBox="0 0 50 50">
      <path fill="#0277bd" d="M24.047,5c-1.555,0.005-2.633,0.142-3.936,0.367c-3.848,0.67-4.549,2.077-4.549,4.67V14h9v2H15.22	h-4.35c-2.636,0-4.943,1.242-5.674,4.219c-0.826,3.417-0.863,5.557,0,9.125C5.851,32.005,7.294,34,9.931,34h3.632v-5.104	c0-2.966,2.686-5.896,5.764-5.896h7.236c2.523,0,5-1.862,5-4.377v-8.586c0-2.439-1.759-4.263-4.218-4.672	C27.406,5.359,25.589,4.994,24.047,5z M19.063,9c0.821,0,1.5,0.677,1.5,1.502c0,0.833-0.679,1.498-1.5,1.498	c-0.837,0-1.5-0.664-1.5-1.498C17.563,9.68,18.226,9,19.063,9z"></path><path fill="#ffc107" d="M23.078,43c1.555-0.005,2.633-0.142,3.936-0.367c3.848-0.67,4.549-2.077,4.549-4.67V34h-9v-2h9.343	h4.35c2.636,0,4.943-1.242,5.674-4.219c0.826-3.417,0.863-5.557,0-9.125C41.274,15.995,39.831,14,37.194,14h-3.632v5.104	c0,2.966-2.686,5.896-5.764,5.896h-7.236c-2.523,0-5,1.862-5,4.377v8.586c0,2.439,1.759,4.263,4.218,4.672	C19.719,42.641,21.536,43.006,23.078,43z M28.063,39c-0.821,0-1.5-0.677-1.5-1.502c0-0.833,0.679-1.498,1.5-1.498	c0.837,0,1.5,0.664,1.5,1.498C29.563,38.32,28.899,39,28.063,39z"></path>
    </svg>,
    enrolled: "1.9M+ learners",
    marketHotness: "Very High",
    salary: "$95k - $165k",
    hotnessScore: 94,
    summary: "Python is used from automation to AI and data systems, with beginner-friendly syntax and a huge package ecosystem.",
    info: [
      infoBlock("Origin & History", "Created by Guido van Rossum and first released in 1991, Python prioritized readability and quick development."),
      infoBlock("Core Strengths & Uses", "Python is dominant in AI, automation, data science, and backend APIs thanks to strong frameworks and libraries."),
      infoBlock("Career Outlook", "Python skills map to high-demand roles in data, ML, backend engineering, and cloud automation.")
    ]
  },
  java: {
    id: "java",
    title: "Java",
    domain: "Coding",
    level: "Intermediate",
    tagline: "Write Once, Run Anywhere",
    accentColor: "#ef4444",
    accentLight: "#f87171",
    gradient: "from-red-900 via-orange-900 to-gray-900",
    cardGradient: "from-red-500 to-orange-400",
    icon: <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
      <path fill="#F44336" d="M23.65,24.898c-0.998-1.609-1.722-2.943-2.725-5.455C19.229,15.2,31.24,11.366,26.37,3.999c2.111,5.089-7.577,8.235-8.477,12.473C17.07,20.37,23.645,24.898,23.65,24.898z"></path><path fill="#F44336" d="M23.878,17.27c-0.192,2.516,2.229,3.857,2.299,5.695c0.056,1.496-1.447,2.743-1.447,2.743s2.728-0.536,3.579-2.818c0.945-2.534-1.834-4.269-1.548-6.298c0.267-1.938,6.031-5.543,6.031-5.543S24.311,11.611,23.878,17.27z"></path><g><path fill="#1565C0" d="M32.084 25.055c1.754-.394 3.233.723 3.233 2.01 0 2.901-4.021 5.643-4.021 5.643s6.225-.742 6.225-5.505C37.521 24.053 34.464 23.266 32.084 25.055zM29.129 27.395c0 0 1.941-1.383 2.458-1.902-4.763 1.011-15.638 1.147-15.638.269 0-.809 3.507-1.638 3.507-1.638s-7.773-.112-7.773 2.181C11.683 28.695 21.858 28.866 29.129 27.395z"></path><path fill="#1565C0" d="M27.935,29.571c-4.509,1.499-12.814,1.02-10.354-0.993c-1.198,0-2.974,0.963-2.974,1.889c0,1.857,8.982,3.291,15.63,0.572L27.935,29.571z"></path><path fill="#1565C0" d="M18.686,32.739c-1.636,0-2.695,1.054-2.695,1.822c0,2.391,9.76,2.632,13.627,0.205l-2.458-1.632C24.271,34.404,17.014,34.579,18.686,32.739z"></path><path fill="#1565C0" d="M36.281,36.632c0-0.936-1.055-1.377-1.433-1.588c2.228,5.373-22.317,4.956-22.317,1.784c0-0.721,1.807-1.427,3.477-1.093l-1.42-0.839C11.26,34.374,9,35.837,9,37.017C9,42.52,36.281,42.255,36.281,36.632z"></path><path fill="#1565C0" d="M39,38.604c-4.146,4.095-14.659,5.587-25.231,3.057C24.341,46.164,38.95,43.628,39,38.604z"></path></g>
    </svg>,
    enrolled: "1.5M+ learners",
    marketHotness: "High",
    salary: "$105k - $180k",
    hotnessScore: 90,
    summary: "Java remains a backbone for enterprise systems, Android apps, and large distributed backends.",
    info: [
      infoBlock("Origin & History", "Launched by Sun Microsystems in 1995, Java popularized portable runtime execution through the JVM."),
      infoBlock("Core Strengths & Uses", "Java powers enterprise APIs, banking platforms, Android services, and mission-critical systems."),
      infoBlock("Career Outlook", "Strong demand for Java engineers in backend, fintech, telecom, and cloud-native modernization.")
    ]
  },
  javascript: {
    id: "javascript",
    title: "JavaScript",
    domain: "Coding",
    level: "Beginner",
    tagline: "The Language of the Web",
    accentColor: "#eab308",
    accentLight: "#facc15",
    gradient: "from-yellow-900 via-amber-900 to-gray-900",
    cardGradient: "from-yellow-400 to-amber-500",
    icon: <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      className="w-20 h-20"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="JavaScript logo"
    >
      <rect width="64" height="64" rx="8" fill="#FFFF00" />
      <text
        x="50%"
        y="65%"
        textAnchor="middle"
        fontSize="28"
        fontWeight="500"
        fill="#000"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        JS
      </text>
    </svg>,
    enrolled: "2.3M+ learners",
    marketHotness: "Very High",
    salary: "$95k - $170k",
    hotnessScore: 96,
    summary: "JavaScript powers modern frontend, full-stack web apps, and real-time product experiences.",
    info: [
      infoBlock("Origin & History", "Designed in 1995, JavaScript became the default scripting language of the browser."),
      infoBlock("Core Strengths & Uses", "With React and Node.js, JavaScript spans frontend, backend, and edge applications."),
      infoBlock("Career Outlook", "JavaScript is one of the strongest entry points for web and full-stack engineering roles.")
    ]
  },
  cpp: {
    id: "cpp",
    title: "C++",
    domain: "Coding",
    level: "Advanced",
    tagline: "Power. Performance. Precision.",
    accentColor: "#3b82f6",
    accentLight: "#93c5fd",
    gradient: "from-blue-900 via-indigo-900 to-gray-900",
    cardGradient: "from-blue-600 to-indigo-500",
    icon: <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
      <path fill="#00549d" fill-rule="evenodd" d="M22.903,3.286c0.679-0.381,1.515-0.381,2.193,0 c3.355,1.883,13.451,7.551,16.807,9.434C42.582,13.1,43,13.804,43,14.566c0,3.766,0,15.101,0,18.867 c0,0.762-0.418,1.466-1.097,1.847c-3.355,1.883-13.451,7.551-16.807,9.434c-0.679,0.381-1.515,0.381-2.193,0 c-3.355-1.883-13.451-7.551-16.807-9.434C5.418,34.899,5,34.196,5,33.434c0-3.766,0-15.101,0-18.867 c0-0.762,0.418-1.466,1.097-1.847C9.451,10.837,19.549,5.169,22.903,3.286z" clip-rule="evenodd"></path><path fill="#0086d4" fill-rule="evenodd" d="M5.304,34.404C5.038,34.048,5,33.71,5,33.255 c0-3.744,0-15.014,0-18.759c0-0.758,0.417-1.458,1.094-1.836c3.343-1.872,13.405-7.507,16.748-9.38 c0.677-0.379,1.594-0.371,2.271,0.008c3.343,1.872,13.371,7.459,16.714,9.331c0.27,0.152,0.476,0.335,0.66,0.576L5.304,34.404z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M24,10c7.727,0,14,6.273,14,14s-6.273,14-14,14 s-14-6.273-14-14S16.273,10,24,10z M24,17c3.863,0,7,3.136,7,7c0,3.863-3.137,7-7,7s-7-3.137-7-7C17,20.136,20.136,17,24,17z" clip-rule="evenodd"></path><path fill="#0075c0" fill-rule="evenodd" d="M42.485,13.205c0.516,0.483,0.506,1.211,0.506,1.784 c0,3.795-0.032,14.589,0.009,18.384c0.004,0.396-0.127,0.813-0.323,1.127L23.593,24L42.485,13.205z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M31 21H33V27H31zM38 21H40V27H38z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M29 23H35V25H29zM36 23H42V25H36z" clip-rule="evenodd"></path>
    </svg>,
    enrolled: "900k+ learners",
    marketHotness: "High",
    salary: "$120k - $220k",
    hotnessScore: 88,
    summary: "C++ is used where performance and system-level control are critical, from engines to infrastructure.",
    info: [
      infoBlock("Origin & History", "Developed by Bjarne Stroustrup, C++ evolved from C and became a core systems language."),
      infoBlock("Core Strengths & Uses", "C++ drives game engines, low-latency systems, compilers, robotics, and performance-heavy applications."),
      infoBlock("Career Outlook", "Advanced C++ engineers are highly paid in trading, gaming, systems, and embedded industries.")
    ]
  },
  claude: {
    id: "claude",
    title: "Claude API Engineering",
    domain: "AI",
    level: "Intermediate",
    tagline: "Build Reliable AI Assistants",
    accentColor: "#8b5cf6",
    accentLight: "#c4b5fd",
    gradient: "from-violet-900 via-purple-900 to-slate-900",
    cardGradient: "from-violet-500 to-purple-400",
    icon: <svg width="100" height="100">
      <circle cx="50" cy="50" r="40" stroke="#333" stroke-width="4" fill="#fff" />
      <path d="M 20,20 L 80,20 L 80,80 L 20,80 Z" stroke="#333" stroke-width="2" fill="#fff" />
    </svg>,
    enrolled: "420k+ learners",
    marketHotness: "Exploding",
    salary: "$125k - $210k",
    hotnessScore: 97,
    summary: "Learn prompt orchestration, tool-calling design, and production workflows for Claude-based apps.",
    info: [
      infoBlock("Origin & Context", "LLM-powered app engineering is now core to product and automation roadmaps."),
      infoBlock("Core Strengths & Uses", "This track covers prompt strategy, agent flows, evaluation, safety, and integration."),
      infoBlock("Career Outlook", "AI application engineers are rapidly becoming top-priority hires in startups and enterprises.")
    ]
  },
  aws: {
    id: "aws",
    title: "AWS Cloud Essentials",
    domain: "Cloud",
    level: "Beginner",
    tagline: "Deploy and Scale in the Cloud",
    accentColor: "#f59e0b",
    accentLight: "#fcd34d",
    gradient: "from-amber-900 via-orange-900 to-zinc-900",
    cardGradient: "from-amber-500 to-orange-400",
    icon: "aws",
    enrolled: "1.1M+ learners",
    marketHotness: "Very High",
    salary: "$110k - $185k",
    hotnessScore: 92,
    summary: "Master foundational AWS services including compute, storage, IAM, and deployment patterns.",
    info: [
      infoBlock("Origin & History", "AWS pioneered modern cloud infrastructure and remains a major enterprise platform."),
      infoBlock("Core Strengths & Uses", "Used for hosting, serverless apps, analytics pipelines, and resilient architectures."),
      infoBlock("Career Outlook", "Cloud engineers with AWS skills are highly in-demand across backend and DevOps roles.")
    ]
  },
  azure: {
    id: "azure",
    title: "Azure Fundamentals",
    domain: "Cloud",
    level: "Beginner",
    tagline: "Cloud for Enterprise Workloads",
    accentColor: "#0ea5e9",
    accentLight: "#7dd3fc",
    gradient: "from-cyan-900 via-sky-900 to-slate-900",
    cardGradient: "from-cyan-500 to-sky-400",
    icon: "azure",
    enrolled: "800k+ learners",
    marketHotness: "Very High",
    salary: "$108k - $182k",
    hotnessScore: 90,
    summary: "Understand Azure services for apps, data, identity, and secure cloud operations.",
    info: [
      infoBlock("Origin & Context", "Azure is heavily adopted in enterprise and Microsoft-centric ecosystems."),
      infoBlock("Core Strengths & Uses", "Ideal for .NET apps, hybrid cloud, analytics, and business-critical workloads."),
      infoBlock("Career Outlook", "Azure certifications map directly to cloud architect and platform engineering tracks.")
    ]
  },
  gcp: {
    id: "gcp",
    title: "GCP Foundations",
    domain: "Cloud",
    level: "Beginner",
    tagline: "Data and Cloud-native by Design",
    accentColor: "#2563eb",
    accentLight: "#93c5fd",
    gradient: "from-blue-900 via-sky-900 to-slate-900",
    cardGradient: "from-blue-500 to-sky-400",
    icon: "gcp",
    enrolled: "620k+ learners",
    marketHotness: "High",
    salary: "$112k - $188k",
    hotnessScore: 87,
    summary: "Build cloud-native systems with GCP services for compute, data, and analytics.",
    info: [
      infoBlock("Origin & Context", "GCP grew from Google's internal infrastructure and data platform heritage."),
      infoBlock("Core Strengths & Uses", "Known for Kubernetes, BigQuery, and high-scale analytics workflows."),
      infoBlock("Career Outlook", "GCP expertise is valuable for data engineering, ML infrastructure, and platform roles.")
    ]
  },
  ml: {
    id: "ml",
    title: "Machine Learning Basics",
    domain: "ML",
    level: "Intermediate",
    tagline: "Predict, Classify, Optimize",
    accentColor: "#0f766e",
    accentLight: "#5eead4",
    gradient: "from-teal-900 via-emerald-900 to-slate-900",
    cardGradient: "from-teal-500 to-emerald-400",
    icon: "ml",
    enrolled: "950k+ learners",
    marketHotness: "Very High",
    salary: "$120k - $205k",
    hotnessScore: 93,
    summary: "Learn ML workflows from data preparation to model evaluation and deployment basics.",
    info: [
      infoBlock("Origin & Context", "ML adoption accelerated across product recommendation, forecasting, and optimization."),
      infoBlock("Core Strengths & Uses", "Covers supervised learning, feature engineering, and model validation."),
      infoBlock("Career Outlook", "ML fluency unlocks roles in applied AI, analytics, and intelligent product teams.")
    ]
  },
  dl: {
    id: "dl",
    title: "Deep Learning with PyTorch",
    domain: "ML",
    level: "Advanced",
    tagline: "Neural Networks in Production",
    accentColor: "#4338ca",
    accentLight: "#a5b4fc",
    gradient: "from-indigo-900 via-violet-900 to-slate-900",
    cardGradient: "from-indigo-500 to-violet-400",
    icon: "dl",
    enrolled: "540k+ learners",
    marketHotness: "Exploding",
    salary: "$135k - $230k",
    hotnessScore: 95,
    summary: "Train, tune, and deploy deep learning models with practical PyTorch workflows.",
    info: [
      infoBlock("Origin & Context", "Deep learning powers modern computer vision, NLP, and multimodal systems."),
      infoBlock("Core Strengths & Uses", "Focuses on neural architecture, optimization, and model serving."),
      infoBlock("Career Outlook", "Deep learning engineers are in high demand across AI-first product teams.")
    ]
  },
  nlp: {
    id: "nlp",
    title: "NLP and LLM Apps",
    domain: "AI",
    level: "Intermediate",
    tagline: "Language Intelligence at Scale",
    accentColor: "#db2777",
    accentLight: "#f9a8d4",
    gradient: "from-pink-900 via-fuchsia-900 to-slate-900",
    cardGradient: "from-pink-500 to-fuchsia-400",
    icon: "nlp",
    enrolled: "690k+ learners",
    marketHotness: "Exploding",
    salary: "$130k - $220k",
    hotnessScore: 96,
    summary: "Build text and LLM applications using embeddings, retrieval, and evaluation pipelines.",
    info: [
      infoBlock("Origin & Context", "NLP evolved from classic text mining to transformer and LLM workflows."),
      infoBlock("Core Strengths & Uses", "Includes vector search, retrieval pipelines, and response quality evaluation."),
      infoBlock("Career Outlook", "NLP/LLM engineering is now a top-tier specialization in AI product development.")
    ]
  },
  data: {
    id: "data",
    title: "Data Analysis with Pandas",
    domain: "Data",
    level: "Beginner",
    tagline: "Clean, Explore, Explain",
    accentColor: "#0f766e",
    accentLight: "#5eead4",
    gradient: "from-teal-900 via-cyan-900 to-slate-900",
    cardGradient: "from-teal-500 to-cyan-400",
    icon: "data",
    enrolled: "1.2M+ learners",
    marketHotness: "Very High",
    salary: "$90k - $155k",
    hotnessScore: 91,
    summary: "Learn practical data wrangling, exploration, and storytelling with Python and Pandas.",
    info: [
      infoBlock("Origin & Context", "Data-driven decision making is now central to product and business operations."),
      infoBlock("Core Strengths & Uses", "Covers cleaning, joins, aggregations, visuals, and reporting."),
      infoBlock("Career Outlook", "Data analysis skills support roles in analytics, product, and BI engineering.")
    ]
  },
  sql: {
    id: "sql",
    title: "SQL for Analytics",
    domain: "Data",
    level: "Beginner",
    tagline: "Query the Business",
    accentColor: "#1d4ed8",
    accentLight: "#93c5fd",
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
    cardGradient: "from-blue-500 to-indigo-400",
    icon: "sql",
    enrolled: "1.6M+ learners",
    marketHotness: "Very High",
    salary: "$92k - $160k",
    hotnessScore: 93,
    summary: "Master SQL querying, joins, windows, and dashboards for analytics workflows.",
    info: [
      infoBlock("Origin & Context", "SQL remains the universal language for relational data and BI platforms."),
      infoBlock("Core Strengths & Uses", "Teaches analytical querying for product metrics and business insights."),
      infoBlock("Career Outlook", "SQL is foundational for analysts, engineers, and product teams.")
    ]
  },
  spark: {
    id: "spark",
    title: "Big Data with Spark",
    domain: "Data",
    level: "Advanced",
    tagline: "Distributed Data at Scale",
    accentColor: "#b45309",
    accentLight: "#fdba74",
    gradient: "from-orange-900 via-amber-900 to-slate-900",
    cardGradient: "from-orange-500 to-amber-400",
    icon: "spark",
    enrolled: "430k+ learners",
    marketHotness: "High",
    salary: "$125k - $210k",
    hotnessScore: 86,
    summary: "Process large datasets with Spark for ETL, analytics, and scalable data pipelines.",
    info: [
      infoBlock("Origin & Context", "Spark emerged to accelerate distributed processing beyond classic MapReduce."),
      infoBlock("Core Strengths & Uses", "Covers distributed transformations and production ETL architecture."),
      infoBlock("Career Outlook", "Spark skills are sought in data platform and lakehouse engineering teams.")
    ]
  },
  docker: {
    id: "docker",
    title: "Docker and Containers",
    domain: "DevOps",
    level: "Intermediate",
    tagline: "Ship Anywhere Consistently",
    accentColor: "#0284c7",
    accentLight: "#7dd3fc",
    gradient: "from-sky-900 via-cyan-900 to-slate-900",
    cardGradient: "from-sky-500 to-cyan-400",
    icon: "docker",
    enrolled: "980k+ learners",
    marketHotness: "Very High",
    salary: "$110k - $190k",
    hotnessScore: 92,
    summary: "Containerize applications and streamline delivery from development to production.",
    info: [
      infoBlock("Origin & Context", "Containers transformed software delivery with consistent runtime packaging."),
      infoBlock("Core Strengths & Uses", "Learn image creation, networking, volumes, and container best practices."),
      infoBlock("Career Outlook", "Docker knowledge is core for backend, DevOps, and platform engineering roles.")
    ]
  },
  k8s: {
    id: "k8s",
    title: "Kubernetes in Practice",
    domain: "DevOps",
    level: "Advanced",
    tagline: "Operate Cloud-native Systems",
    accentColor: "#4338ca",
    accentLight: "#a5b4fc",
    gradient: "from-indigo-900 via-blue-900 to-slate-900",
    cardGradient: "from-indigo-500 to-blue-400",
    icon: "k8s",
    enrolled: "610k+ learners",
    marketHotness: "Very High",
    salary: "$130k - $220k",
    hotnessScore: 94,
    summary: "Run scalable and resilient workloads with Kubernetes orchestration patterns.",
    info: [
      infoBlock("Origin & Context", "Kubernetes became the standard orchestration layer for containerized systems."),
      infoBlock("Core Strengths & Uses", "Covers deployments, services, autoscaling, and production operations."),
      infoBlock("Career Outlook", "Kubernetes expertise is highly paid across SRE and platform engineering tracks.")
    ]
  },
  security: {
    id: "security",
    title: "App Security Essentials",
    domain: "Security",
    level: "Intermediate",
    tagline: "Build Secure by Default",
    accentColor: "#b91c1c",
    accentLight: "#fca5a5",
    gradient: "from-red-900 via-rose-900 to-slate-900",
    cardGradient: "from-red-500 to-rose-400",
    icon: "security",
    enrolled: "570k+ learners",
    marketHotness: "Very High",
    salary: "$125k - $215k",
    hotnessScore: 93,
    summary: "Learn practical secure coding, auth hardening, and threat-aware architecture.",
    info: [
      infoBlock("Origin & Context", "Security is now a first-class requirement in modern software delivery."),
      infoBlock("Core Strengths & Uses", "Covers OWASP risks, authentication hardening, and secure review workflows."),
      infoBlock("Career Outlook", "Security-aware engineers are increasingly preferred in every product team.")
    ]
  },
  dsa: {
    id: "dsa",
    title: "DSA Interview Prep",
    domain: "Coding",
    level: "Intermediate",
    tagline: "Think in Algorithms",
    accentColor: "#374151",
    accentLight: "#9ca3af",
    gradient: "from-gray-900 via-slate-900 to-zinc-900",
    cardGradient: "from-gray-600 to-slate-500",
    icon: "dsa",
    enrolled: "1.4M+ learners",
    marketHotness: "High",
    salary: "$100k - $185k",
    hotnessScore: 89,
    summary: "Sharpen problem-solving with core data structures and algorithm patterns.",
    info: [
      infoBlock("Origin & Context", "DSA remains central in technical screening and engineering fundamentals."),
      infoBlock("Core Strengths & Uses", "Covers arrays, trees, graphs, dynamic programming, and complexity analysis."),
      infoBlock("Career Outlook", "Strong DSA skills improve interview outcomes and engineering confidence.")
    ]
  }
};

export const courseList = Object.values(courseCatalog);
