import React, { useState } from 'react'

const CODE = {
  "app.js": {
    lines: 13,
    output: '{ message: "Hello, Alex!", path: "Learning: JavaScript" }',
    jsx: (
      <>
        <span style={{color:"#5c6370",fontStyle:"italic"}}>{`// 🚀 Welcome to Codify — try it live!`}</span>{"\n"}
        <span style={{color:"#c678dd"}}>function</span>{" "}<span style={{color:"#61afef"}}>greetLearner</span><span style={{color:"#abb2bf"}}>(name, lang) {"{"}</span>{"\n"}
        {"  "}<span style={{color:"#c678dd"}}>const</span>{" "}<span style={{color:"#e5c07b"}}>message</span>{" = "}<span style={{color:"#98c379"}}>{"`Hello, ${name}!`"}</span>{";  \n"}
        {"  "}<span style={{color:"#c678dd"}}>const</span>{" "}<span style={{color:"#e5c07b"}}>path</span>{" = "}<span style={{color:"#98c379"}}>{"`Learning: ${lang}`"}</span>{";  \n"}
        {"  "}<span style={{color:"#c678dd"}}>return</span><span style={{color:"#abb2bf"}}>{" { message, path };"}</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"}"}</span>{"\n\n"}
        <span style={{color:"#c678dd"}}>const</span>{" "}<span style={{color:"#e5c07b"}}>result</span>{" = "}<span style={{color:"#61afef"}}>greetLearner</span><span style={{color:"#abb2bf"}}>(</span>{"\n"}
        {"  "}<span style={{color:"#98c379"}}>"Alex"</span><span style={{color:"#abb2bf"}}>,</span>{"\n"}
        {"  "}<span style={{color:"#98c379"}}>"JavaScript"</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{")"}</span>{";  \n\n"}
        <span style={{color:"#e5c07b"}}>console</span><span style={{color:"#abb2bf"}}>.</span><span style={{color:"#61afef"}}>log</span><span style={{color:"#abb2bf"}}>(result);</span>{" "}
        <span className="a-blink" style={{display:"inline-block",width:2,height:14,background:"#3b82f6",verticalAlign:"middle"}} />
      </>
    )
  },
  "style.css": {
    lines: 9,
    output: "Styles applied successfully.",
    jsx: (
      <>
        <span style={{color:"#5c6370",fontStyle:"italic"}}>{"/* Codify theme */"}</span>{"\n"}
        <span style={{color:"#ef4444"}}>:root</span><span style={{color:"#abb2bf"}}>{" {"}</span>{"\n"}
        {"  "}<span style={{color:"#e5c07b"}}>--bg</span><span style={{color:"#abb2bf"}}>:</span>{" "}<span style={{color:"#d19a66"}}>#111113</span><span style={{color:"#abb2bf"}}>;</span>{"\n"}
        {"  "}<span style={{color:"#e5c07b"}}>--accent</span><span style={{color:"#abb2bf"}}>:</span>{" "}<span style={{color:"#d19a66"}}>#3b82f6</span><span style={{color:"#abb2bf"}}>;</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"}"}</span>{"\n\n"}
        <span style={{color:"#ef4444"}}>body</span><span style={{color:"#abb2bf"}}>{" {"}</span>{"\n"}
        {"  "}<span style={{color:"#e5c07b"}}>background</span><span style={{color:"#abb2bf"}}>:</span>{" "}<span style={{color:"#61afef"}}>var</span><span style={{color:"#abb2bf"}}>(--bg);</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"}"}</span>{" "}
        <span className="a-blink" style={{display:"inline-block",width:2,height:14,background:"#3b82f6",verticalAlign:"middle"}} />
      </>
    )
  },
  "index.html": {
    lines: 11,
    output: "HTML rendered successfully.",
    jsx: (
      <>
        <span style={{color:"#abb2bf"}}>{"<!"}</span><span style={{color:"#ef4444"}}>DOCTYPE</span><span style={{color:"#abb2bf"}}>{" html>"}</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"<"}</span><span style={{color:"#ef4444"}}>html</span><span style={{color:"#abb2bf"}}>{' lang="en">'}</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"<"}</span><span style={{color:"#ef4444"}}>head</span><span style={{color:"#abb2bf"}}>{">"}</span>{"\n"}
        {"  "}<span style={{color:"#abb2bf"}}>{"<"}</span><span style={{color:"#ef4444"}}>title</span><span style={{color:"#abb2bf"}}>{">"}</span>Codify<span style={{color:"#abb2bf"}}>{"</"}</span><span style={{color:"#ef4444"}}>title</span><span style={{color:"#abb2bf"}}>{">"}</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"</"}</span><span style={{color:"#ef4444"}}>head</span><span style={{color:"#abb2bf"}}>{">"}</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"<"}</span><span style={{color:"#ef4444"}}>body</span><span style={{color:"#abb2bf"}}>{">"}</span>{"\n"}
        {"  "}<span style={{color:"#abb2bf"}}>{"<"}</span><span style={{color:"#ef4444"}}>h1</span><span style={{color:"#abb2bf"}}>{">"}</span>Hello, Codify!<span style={{color:"#abb2bf"}}>{"</"}</span><span style={{color:"#ef4444"}}>h1</span><span style={{color:"#abb2bf"}}>{">"}</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"</"}</span><span style={{color:"#ef4444"}}>body</span><span style={{color:"#abb2bf"}}>{">"}</span>{"\n"}
        <span style={{color:"#abb2bf"}}>{"</"}</span><span style={{color:"#ef4444"}}>html</span><span style={{color:"#abb2bf"}}>{">"}</span>{" "}
        <span className="a-blink" style={{display:"inline-block",width:2,height:14,background:"#3b82f6",verticalAlign:"middle"}} />
      </>
    )
  },
};

const CodeEditor = () => {
  const [tab, setTab] = useState("app.js");
  const [running, setRunning] = useState(false);
  const curr = CODE[tab];

  const run = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 650);
  };

  return (
    <div className="relative">
      <div className="editor-glow-bg absolute inset-10 rounded-full pointer-events-none" />

      {/* Badge top-right */}
      {/* <div className="a-floatA absolute -top-5 -right-5 z-10 flex items-center gap-2 bg-gray-800/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span className="text-green-400 text-[11px]" style={{ fontFamily: "'Space Mono',monospace" }}>All tests passed</span>
      </div> */}

      {/* Badge bottom-left */}
      {/* <div className="a-floatB absolute -bottom-2 -left-8 z-10 flex items-center gap-2.5 bg-gray-800/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl">
        <span className="text-lg">⚡</span>
        <div>
          <div className="text-[11px] font-bold text-blue-400" style={{ fontFamily: "'Syne',sans-serif" }}>+150 XP</div>
          <div className="text-[10px] text-gray-500">Challenge complete</div>
        </div>
      </div> */}

      {/* Window */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)]">

        {/* Title bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-white/2.5 border-b border-white/[0.07]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex gap-0.5 ml-2 flex-1">
            {Object.keys(CODE).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-[11px] px-3 py-1 rounded-md border-none outline-none cursor-pointer transition-all duration-200 ${tab === t ? "text-blue-400 bg-blue-500/10" : "text-gray-600 hover:text-gray-400 bg-transparent"}`}
                style={{ fontFamily: "'Space Mono',monospace" }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={run}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1 border-none cursor-pointer transition-all duration-200"
            style={{ fontFamily: "'Space Mono',monospace" }}>
            {running ? "⏳" : <><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>&nbsp;Run</>}
          </button>
        </div>

        {/* Code body */}
        <div className="flex">
          <div className="px-3 py-4 border-r border-white/[0.07] text-right select-none min-w-9">
            {Array.from({ length: curr.lines }, (_, i) => (
              <div key={i} className="text-[12px] text-gray-700 leading-[1.9]" style={{ fontFamily: "'Space Mono',monospace" }}>{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 p-4 text-[12.5px] leading-[1.9] overflow-x-auto" style={{ fontFamily: "'Space Mono',monospace", margin: 0, whiteSpace: "pre-wrap" }}>
            <code>{curr.jsx}</code>
          </pre>
        </div>

        {/* Output */}
        <div className="border-t border-white/[0.07] px-5 py-2.5 bg-green-500/4" style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>
          <span style={{ color: "#555" }}>▶ Output: </span>
          <span className="text-green-400">{curr.output}</span>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor
