import { Uppy } from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import XHRUpload from "@uppy/xhr-upload";
import ThumbnailGenerator from "@uppy/thumbnail-generator";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

export const scriptTag = "upload_script";
console.log("[uploads.js] ⏱ module loaded");

let uppy = null;
let uploaderTarget = null;

async function getUploadParameters(file) {
  console.log("[uploads.js] getUploadParameters() called for", file.name);
  try {
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      }),
    });
    const { uploadUrl } = await res.json();
    console.log("[uploads.js] Upload URL received:", uploadUrl);
    return {
      url: uploadUrl,
      headers: { "Content-Type": file.type },
    };
  } catch (err) {
    console.error(
      "[uploads.js] Failed to get upload parameters for",
      file.name,
      err
    );
    throw err;
  }
}

export function mount() {
  console.log("[uploads.js] 🔧 mount()");

  uploaderTarget = document.getElementById("uploader");
  if (!uploaderTarget) {
    console.warn("[uploads.js] #uploader element not found");
    return;
  }

  uppy = new Uppy({
    restrictions: {
      maxFileSize: 50 * 1024 * 1024,
      allowedFileTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/tiff",
      ],
      maxNumberOfFiles: 0,
    },
    autoProceed: false,
  });

  uppy
    .use(Dashboard, {
      inline: true,
      target: uploaderTarget,
      proudlyDisplayPoweredByUppy: false,
      showProgressDetails: true,
    })
    .use(XHRUpload, {
      method: "PUT",
      getUploadParameters,
    })
    .use(ThumbnailGenerator, {
      thumbnailWidth: 120,
      waitForThumbnailsBeforeUpload: false,
    });

  console.log("[uploads.js] ✅ Uppy initialized with default styles");
}

export function dismount() {
  console.log("[uploads.js] 📴 dismount()");
  if (uppy) {
    uppy.close({ reason: "page change" });
    uppy = null;
  }
  uploaderTarget = null;
}
