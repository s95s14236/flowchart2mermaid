import mermaid from "mermaid";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import "../style/MermaidFlow.scss";

mermaid.initialize({
    startOnLoad: true,
    securityLevel: "loose",
    theme: "neutral",
});

export default function MermaidFlow({mermaidCode}) {
    const graph = useRef();

    useEffect(() => {
        // 導出mermaid code 即時畫圖
        mermaidCode && mermaid.render("mermaid-image", mermaidCode, (svgGraph) => {
            graph.current.innerHTML = svgGraph;
        });
    }, [mermaidCode])


    return (
        <div className="mermaid-flow">
            <div id="mermaid-image"></div>
            <div className="mermaid-graph" ref={graph}></div>
        </div>
    );
}