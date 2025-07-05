function getFooterFragment() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <twilio-widget>
  `;
  return wrapper.firstElementChild;
}

export { getFooterFragment };
