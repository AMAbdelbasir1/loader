const fs = require("fs");
const JavaScriptObfuscator = require("javascript-obfuscator");

// Read your source JavaScript file
const filname = [
  "login.js",
  "profile.js",
  "video.js",
  "upload.js",
  "payment.js",
  "navbar.js",
  "email.js",
];
for (let i of filname) {
  console.log(i);
  const sourceCode = fs.readFileSync(`./static/js/${i}`, "utf8");

  // Load obfuscation configuration
  const obfuscationConfig = JSON.parse(
    fs.readFileSync("./config/obfuscate-config.json", "utf8"),
  );

  // Obfuscate the source code
  const obfuscatedCode = JavaScriptObfuscator.obfuscate(
    sourceCode,
    obfuscationConfig,
  ).toString();

  // Write the obfuscated code to an output file
  fs.writeFileSync(`./static/js/en-${i}`, obfuscatedCode);
}

console.log("JavaScript code obfuscated successfully.");
