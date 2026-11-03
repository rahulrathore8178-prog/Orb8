// Starter taxonomy (~60 topics). Grow it from the 'candidate' topics the resolver collects.
// Rules of thumb:
//  - aliases must be specific. Avoid common English words ("go", "express", "cat").
//  - a few aliases are deliberately ambiguous ("grinding") to be resolved by context + persona.
//  - roots: technology | education | entertainment | news | sports | lifestyle | business

const T = (slug, name, parent, root, aliases = [], related = []) => ({
    slug,
    name,
    parent,
    root,
    aliases,
    related: related.map(([s, w]) => ({ slug: s, w })),
});

module.exports = [
    // ---- technology
    T('webdev', 'Web Development', null, 'technology', ['webdevelopment', 'webdeveloper', 'fullstack', 'mern']),
    T('frontend', 'Frontend', 'webdev', 'technology', ['frontenddev', 'frontenddevelopment']),
    T('backend', 'Backend', 'webdev', 'technology', ['backenddev', 'backenddevelopment']),
    T('javascript', 'JavaScript', 'webdev', 'technology', ['js', 'es6', 'ecmascript'], [['typescript', 0.6], ['react', 0.4], ['nodejs', 0.4]]),
    T('typescript', 'TypeScript', 'javascript', 'technology', ['ts'], [['javascript', 0.6]]),
    T('react', 'React', 'frontend', 'technology', ['reactjs', 'reacthooks'], [['nextjs', 0.5], ['javascript', 0.4], ['reactnative', 0.4]]),
    T('nextjs', 'Next.js', 'frontend', 'technology', ['nextjs'], [['react', 0.5]]),
    T('reactnative', 'React Native', 'mobiledev', 'technology', ['rn', 'expo', 'nativewind'], [['react', 0.4]]),
    T('mobiledev', 'Mobile Development', null, 'technology', ['appdev', 'androiddev', 'iosdev', 'flutter']),
    T('nodejs', 'Node.js', 'backend', 'technology', ['node', 'expressjs', 'npm'], [['javascript', 0.4], ['mongodb', 0.3]]),
    T('mongodb', 'MongoDB', 'backend', 'technology', ['mongo', 'mongoose', 'nosql']),
    T('sql', 'SQL & Databases', 'backend', 'technology', ['postgres', 'postgresql', 'mysql', 'database', 'databases', 'prisma']),
    T('python', 'Python', null, 'technology', ['py', 'fastapi', 'django', 'flask'], [['machinelearning', 0.3]]),
    T('cpp', 'C++', null, 'technology', ['cplusplus'], [['dsa', 0.3]]),
    T('java', 'Java', null, 'technology', ['springboot', 'jvm']),
    T('dsa', 'DSA', null, 'technology', ['datastructures', 'algorithms', 'leetcode', 'competitiveprogramming', 'codingprep', 'grinding'], [['systemdesign', 0.3]]),
    T('systemdesign', 'System Design', null, 'technology', ['hld', 'lld', 'scalability', 'distributedsystems'], [['dsa', 0.3], ['backend', 0.3]]),
    T('ai', 'AI', null, 'technology', ['artificialintelligence', 'genai', 'generativeai', 'aitools'], [['machinelearning', 0.5], ['llm', 0.5]]),
    T('machinelearning', 'Machine Learning', 'ai', 'technology', ['ml', 'deeplearning', 'neuralnetworks', 'datascience'], [['python', 0.3]]),
    T('llm', 'LLMs', 'ai', 'technology', ['llms', 'largelanguagemodels', 'rag', 'promptengineering', 'chatgpt', 'finetuning', 'ollama']),
    T('devops', 'DevOps', null, 'technology', ['cicd', 'kubernetes', 'k8s', 'cloud', 'aws'], [['docker', 0.5]]),
    T('docker', 'Docker', 'devops', 'technology', ['containers', 'dockercompose'], [['devops', 0.5]]),
    T('cybersecurity', 'Cybersecurity', null, 'technology', ['infosec', 'ethicalhacking', 'hacking', 'pentesting']),
    T('opensource', 'Open Source', null, 'technology', ['oss', 'github', 'hacktoberfest']),
    T('uiux', 'UI/UX Design', null, 'technology', ['uidesign', 'uxdesign', 'figma', 'productdesign']),

    // ---- education
    T('studytips', 'Study Tips', null, 'education', ['studying', 'studymotivation', 'studywithme', 'productivitystudy']),
    T('competitiveexams', 'Competitive Exams', null, 'education', ['jee', 'neet', 'upsc', 'boardexams', 'examprep']),
    T('mathematics', 'Mathematics', null, 'education', ['maths', 'math', 'algebra', 'calculus']),
    T('physics', 'Physics', null, 'education', ['quantumphysics', 'mechanics']),
    T('languages', 'Language Learning', null, 'education', ['learnenglish', 'spokenenglish', 'ielts', 'duolingo']),
    T('college', 'College Life', null, 'education', ['collegelife', 'university', 'campus', 'ignou', 'bca']),

    // ---- business / career
    T('entrepreneurship', 'Entrepreneurship', null, 'business', ['startup', 'startups', 'founder', 'buildinpublic', 'saas']),
    T('investing', 'Investing', null, 'business', ['stocks', 'mutualfunds', 'sip', 'trading', 'stockmarket']),
    T('freelancing', 'Freelancing', null, 'business', ['fiverr', 'upwork', 'freelancer']),
    T('careers', 'Careers & Jobs', null, 'business', ['jobsearch', 'resume', 'interviewprep', 'placements', 'fresher', 'hiring', 'naukri']),
    T('productivity', 'Productivity', null, 'business', ['habits', 'deepwork', 'timemanagement', 'notion']),
    T('marketing', 'Marketing', null, 'business', ['digitalmarketing', 'seo', 'branding', 'contentcreation']),

    // ---- entertainment
    T('movies', 'Movies', null, 'entertainment', ['cinema', 'bollywood', 'hollywood', 'filmreview', 'moviereview']),
    T('music', 'Music', null, 'entertainment', ['songs', 'guitar', 'singing', 'hiphop', 'lofi']),
    T('gaming', 'Gaming', null, 'entertainment', ['gamer', 'esports', 'pcgaming', 'bgmi', 'valorant', 'minecraft', 'grinding']),
    T('comedy', 'Comedy', null, 'entertainment', ['funny', 'memes', 'jokes', 'standup', 'humor']),
    T('anime', 'Anime', null, 'entertainment', ['manga', 'otaku', 'animeedit']),
    T('webseries', 'Web Series & TV', null, 'entertainment', ['netflix', 'tvshows', 'bingewatch']),

    // ---- sports
    T('cricket', 'Cricket', null, 'sports', ['ipl', 't20', 'worldcup', 'testcricket']),
    T('football', 'Football', null, 'sports', ['soccer', 'fifa', 'premierleague', 'laliga']),
    T('othersports', 'Other Sports', null, 'sports', ['badminton', 'tennis', 'kabaddi', 'basketball', 'f1', 'formula1']),

    // ---- lifestyle
    T('gym', 'Gym & Fitness', null, 'lifestyle', ['workout', 'fitness', 'gymlife', 'bodybuilding', 'calisthenics', 'grinding']),
    T('yoga', 'Yoga & Wellness', null, 'lifestyle', ['meditation', 'mindfulness', 'mentalhealthawareness']),
    T('travel', 'Travel', null, 'lifestyle', ['travelling', 'wanderlust', 'roadtrip', 'backpacking', 'trekking']),
    T('food', 'Food', null, 'lifestyle', ['recipes', 'cooking', 'foodie', 'streetfood']),
    T('fashion', 'Fashion', null, 'lifestyle', ['ootd', 'streetwear']),
    T('photography', 'Photography', null, 'lifestyle', ['photographer', 'portrait', 'cinematography']),

    // ---- news
    T('technews', 'Tech News', null, 'news', ['gadgets', 'techupdate']),
    T('worldnews', 'World News', null, 'news', ['breakingnews', 'worldaffairs', 'geopolitics']),
    T('indianews', 'India News', null, 'news', ['indianews', 'indiapolitics']),
    T('financenews', 'Finance News', null, 'news', ['economy', 'markets', 'rbi', 'inflation']),
];