const { ElevenLabsClient } = require("elevenlabs");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function speak(text) {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API Key missing. Skipping speech generation.");
    return null;
  }

  try {
    const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
      text: text,
      model_id: "eleven_v3",
      output_format: "mp3_44100_128",
    });

    const fileName = `briefing_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, 'audio', fileName);
    
    // Ensure audio directory exists
    if (!fs.existsSync(path.join(__dirname, 'audio'))) {
        fs.mkdirSync(path.join(__dirname, 'audio'));
    }

    const fileStream = fs.createWriteStream(filePath);
    audio.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on("finish", () => resolve(fileName));
      fileStream.on("error", reject);
    });
  } catch (err) {
    console.error("ElevenLabs Error:", err.message);
    return null;
  }
}

module.exports = { speak };
