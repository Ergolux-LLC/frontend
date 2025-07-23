/*  src/packages/pageMaker/initialize/index.js
 *  ---------------------------------------------------------------------------
 *  • Pulls developer‑editable fragments:  head.html, preContent.html,
 *    postContent.html  (all in /src/content)
 *  • Replaces <head> wholesale with head.html
 *  • Injects  preContent + <div id="content"> + postContent  into <body>
 *  • Keeps body visibility:hidden  (index.html already sets that)
 *  • Adds a delegated “do‑action” listener for custom events
 *  ---------------------------------------------------------------------------
 */

import rawHeadHTML from "@content/head.html?raw";
import preContent from "@content/preContent.html?raw";
import postContent from "@content/postContent.html?raw";

export function initializePage() {
  /* -------------------------------------------------------------------------
   *  <html lang>
   * ---------------------------------------------------------------------- */
  document.documentElement.lang = "en";

  /* -------------------------------------------------------------------------
   *  <head>  – replace with developer fragment
   * ---------------------------------------------------------------------- */
  document.head.innerHTML = rawHeadHTML;

  /* -------------------------------------------------------------------------
   *  <body> – build the shell but DO NOT create a nested <body>
   * ---------------------------------------------------------------------- */
  const shell = `
${preContent.trim()}
<div id="content"></div>
${postContent.trim()}
`.trim();

  document.body.innerHTML = shell;

  /* body.visibility is already “hidden” via index.html inline style.
   * Leave it that way – renderer will set it to “visible” once everything
   * (HTML + scripts + mount()) is finished.                              */
  console.log("[init] body prepared and still hidden");

  /* -------------------------------------------------------------------------
   *  Delegated custom‑action handler
   * ---------------------------------------------------------------------- */
  const content = document.getElementById("content");
  if (!content) throw new Error("#content not found after injection");

  content.addEventListener("do-action", (e) => {
    const el = e.target.closest("[data-action]");
    if (el && content.contains(el)) {
      console.log("[init] custom do‑action:", e.detail);
    }
  });
}
