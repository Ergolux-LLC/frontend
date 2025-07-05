export function getLoginUI() {
  console.log("[getLoginUI] creating wrapper...");
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `<br>`; // placeholder

  const element = wrapper.firstElementChild;
  if (!element) {
    console.error("[getLoginUI] No content was created");
  } else {
    console.log("[getLoginUI] Created element:", element);
  }

  return element;
}
