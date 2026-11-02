// src/scripts/mermaid.ts
async function renderMermaid(): Promise<void> {
  const blocks = document.querySelectorAll<HTMLElement>(
    "pre > code.language-mermaid"
  );
  if (blocks.length === 0) return; // not load when there is no diagram

  try {
    // Lazy-load: only load mermaid when page has diagram
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict", // Blocking HTML/JS embedded in diagrams
      theme: "base",
    });

    blocks.forEach((code, i) => {
      const pre = code.parentElement;
      if (!pre) return;
      const container = document.createElement("div");
      container.className = "mermaid";
      container.id = `mermaid-${i}`;
      container.textContent = code.textContent ?? "";
      pre.replaceWith(container);
    });

    await mermaid.run({ querySelector: ".mermaid" });
  } catch (err) {
    console.error("Mermaid render failed:", err);
  }
}

// Run on the first load and after each ClientRouter navigation
document.addEventListener("astro:page-load", renderMermaid);