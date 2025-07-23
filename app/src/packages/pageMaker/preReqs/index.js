const fs = require("fs");
const path = require("path");

const contentDir = path.resolve(__dirname, "../../../content");

function verifyContentDirectory() {
  if (!fs.existsSync(contentDir) || !fs.statSync(contentDir).isDirectory()) {
    throw new Error(`Missing required 'content' directory at: ${contentDir}`);
  }

  console.log(`Verified: 'content' directory exists at ${contentDir}`);
}

verifyContentDirectory();
