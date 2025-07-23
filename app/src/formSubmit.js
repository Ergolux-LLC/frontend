document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const lead = {
      agentFirstName: formData.get("agentFirstName"),
      agentLastName: formData.get("agentLastName"),
      transactions: formData.get("transactions"),
      activeListings: formData.get("activeListings"),
      teamSize: formData.get("teamSize"),
      role: formData.get("role"),
      listingPrice: formData.get("listingPrice"),
      licenseTenure: formData.get("licenseTenure"),
      website: formData.get("website"),
      social: formData.get("social"),
      specialization: formData.get("specialization"),
      geography: formData.get("geography"),
      licenseStatus: formData.get("licenseStatus"),
      contactInfo: formData.get("contactInfo"),
    };

    const payload = {
      form_type: "lead",
      lead: lead,
    };

    try {
      const response = await fetch("/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Submission failed:", error);
        alert("Form submission failed.");
        return;
      }

      const result = await response.json();
      console.log("Form submitted successfully:", result);
      alert("Form submitted successfully.");
      form.reset();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Network or server error.");
    }
  });
});
