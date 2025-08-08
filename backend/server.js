import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/debug", async (req, res) => {
  const { code, lang } = req.body;

  if (lang !== "javascript") {
    return res.status(400).json({ error: "Only JavaScript supported in MVP" });
  }

  // Temp file
  const tempPath = path.join(process.cwd(), "temp.js");
  fs.writeFileSync(tempPath, code);

  // Run code to get error
  exec(`node ${tempPath}`, async (err, stdout, stderr) => {
    if (!err && !stderr) {
      return res.json({ status: "no_error", output: stdout });
    }

    // Send to AI for fix
    const prompt = `
You are a JavaScript debugging assistant.
Fix the following JS code so it runs without error.
Return only the corrected code.

--- ORIGINAL CODE ---
${code}

--- ERROR ---
${stderr}
    `;

    try {
      const aiRes = await openai.responses.create({
        model: "gpt-4o-mini",
        input: prompt
      });

      const fixedCode = aiRes.output_text;
      res.json({
        status: "error_fixed",
        error: stderr,
        fixedCode
      });
    } catch (apiErr) {
      res.status(500).json({ error: apiErr.message });
    }
  });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
