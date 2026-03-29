const { chromium } = require("playwright");

async function runAgent(socket, userData) {
  let browser;

  try {
    socket.emit("log", "🚀 Launching browser...");
    socket.emit("status", "Launching browser");

    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    socket.emit("log", "🌐 Opening website...");
    await page.goto("https://example.com"); // 🔥 change to real gov site

    // Wait for page load
    await page.waitForTimeout(3000);

    socket.emit("log", "🔍 Scanning form fields...");

    // Get all input fields
    const inputs = await page.$$("input, textarea, select");

    socket.emit("log", `🧠 Found ${inputs.length} fields`);

    for (let i = 0; i < inputs.length; i++) {
      try {
        const input = inputs[i];

        const type = await input.getAttribute("type");
        const name = await input.getAttribute("name");
        const placeholder = await input.getAttribute("placeholder");

        const fieldInfo = `${name || placeholder || "unknown"}`.toLowerCase();

        socket.emit("log", `✍️ Filling field: ${fieldInfo}`);

        // SMART MATCHING LOGIC
        if (fieldInfo.includes("name")) {
          await input.fill(userData.name || "Test User");
        } else if (fieldInfo.includes("aadhaar")) {
          await input.fill(userData.aadhaar || "123456789012");
        } else if (fieldInfo.includes("email")) {
          await input.fill("test@example.com");
        } else if (fieldInfo.includes("phone")) {
          await input.fill("9876543210");
        } else if (type === "text") {
          await input.fill("Sample Data");
        } else if (type === "number") {
          await input.fill("12345");
        }

        await page.waitForTimeout(300);

      } catch (err) {
        socket.emit("log", `⚠️ Skipping field ${i}`);
      }
    }

    socket.emit("log", "📤 Trying to submit form...");

    // Try clicking submit button
    const submitButton = await page.$(
      "button[type=submit], input[type=submit]"
    );

    if (submitButton) {
      await submitButton.click();
      socket.emit("log", "✅ Form submitted!");
    } else {
      socket.emit("log", "⚠️ Submit button not found");
    }

    socket.emit("status", "Completed 🎉");

  } catch (error) {
    console.error(error);
    socket.emit("log", "❌ Error occurred");
    socket.emit("status", "Failed");
  }
}

module.exports = { runAgent };