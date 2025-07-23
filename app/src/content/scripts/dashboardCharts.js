/* content/scripts/dashboard_charts.js
 * -----------------------------------
 * Renders the two <canvas> elements that live on the dashboard view.
 * Requires Chart.js 4 to be present globally (added via views.yaml).
 */

export const scriptTag = "dashboard_charts_script";

function buildCharts() {
  /* WEEKLY CALLS VS EMAILS -------------------------------------------------- */
  const callsCanvas = document.getElementById("callsEmailsChart");
  const pipeCanvas = document.getElementById("pipelineChart");

  if (!callsCanvas || !pipeCanvas) {
    console.warn("[dashboard_charts] canvases not found — skipping");
    return;
  }

  new window.Chart(callsCanvas, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Calls",
          data: [18, 22, 16, 25, 19, 7, 4],
          tension: 0.3,
          borderWidth: 2,
        },
        {
          label: "Emails",
          data: [12, 17, 14, 20, 15, 5, 3],
          tension: 0.3,
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: "#adb5bd" } } },
      scales: {
        x: { ticks: { color: "#adb5bd" } },
        y: { ticks: { color: "#adb5bd" } },
      },
    },
  });

  /* PIPELINE FUNNEL -------------------------------------------------------- */
  new window.Chart(pipeCanvas, {
    type: "bar",
    data: {
      labels: ["New", "Qualified", "Demo", "Proposal", "Closed"],
      datasets: [{ data: [48, 32, 18, 9, 7], borderWidth: 1 }],
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#adb5bd" }, grid: { display: false } },
        y: { ticks: { color: "#adb5bd" }, grid: { display: false } },
      },
    },
  });
}

/*  page‑Maker will call mount() after HTML injection */
export async function mount() {
  console.log("[dashboard_charts] 📊 building charts");
  buildCharts();
}

export function dismount() {
  /* no‑op: charts will be GC’d when DOM nodes are replaced */
}
