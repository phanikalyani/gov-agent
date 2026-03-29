async function runPanAgent(userData) {
  const agent = new TinyFishAgent({
    apiKey: process.env.TINYFISH_API_KEY
  });

  await agent.open("https://example-pan-site.com");

  await agent.click("Apply for New PAN");

  await agent.type("Full Name", userData.name);
  await agent.type("DOB", userData.dob);
  await agent.type("Aadhaar", userData.aadhaar);

  await agent.upload("Photo Upload", userData.photo);
  await agent.upload("Signature Upload", userData.signature);

  await agent.click("Next");
  await agent.click("Submit");

  return "Submitted Successfully";
}

module.exports = runPanAgent;