import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { Ollama } from "@langchain/ollama";
import { listFilesAndFolders, changeDirectory, goBack, sessionMemory } from "./directoryUtils.mjs";

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON request bodies

// Initialize AI Model
const llm = new Ollama({
  model: "llama3",
  temperature: 0.4,
  max_tokens: 1024,
  top_p: 0.85,
  presence_penalty: 0.6,
  frequency_penalty: 0.5,
  system_prompt: `You are an AI tutor assisting students with academic doubts.
  You can navigate directories, list files, and read multiple file contents upon user request.`,
});

sessionMemory.conversation = [];
sessionMemory.fileContents = {}; // Store multiple file contents

const currentDirectory = process.cwd(); // Set the initial directory

// Function to read multiple files
function selectMultipleFiles(fileNames) {
  let response = "";
  
  fileNames.forEach((fileName) => {
    const filePath = path.resolve(currentDirectory, fileName);
    console.log(`Checking file: ${filePath}`); // Debugging step

    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath, "utf8");
      sessionMemory.fileContents[fileName] = content;
      response += `✅ Loaded file: ${fileName}\n`;
    } else {
      response += `❌ File not found: ${fileName}\n`;
    }
  });

  return response;
}

// API Endpoint to process chat messages
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  console.log("User:", userMessage);

  sessionMemory.conversation.push(`User: ${userMessage}`);

  let botResponse = "";

  // Handle File Commands
  if (userMessage.toLowerCase() === "list files") {
    botResponse = listFilesAndFolders();
  } else if (userMessage.startsWith("cd ")) {
    const folderName = userMessage.substring(3);
    botResponse = changeDirectory(folderName);
  } else if (userMessage.toLowerCase() === "go back") {
    botResponse = goBack();
  } else if (userMessage.startsWith("open ")) {
    // Allow selecting multiple files (comma-separated)
    const fileNames = userMessage.substring(5).split(",").map(f => f.trim());
    botResponse = selectMultipleFiles(fileNames);
  } else {
    // Generate AI Response using File Context
    const fileContext = Object.entries(sessionMemory.fileContents)
      .map(([name, content]) => `File: ${name}\n${content}`)
      .join("\n\n");

    const context = `Stored Files:\n${fileContext}\n\nConversation History:\n${sessionMemory.conversation.join("\n")}\nTutor:`;

    try {
      botResponse = await llm.invoke(context);
    } catch (error) {
      console.error("AI Error:", error);
      botResponse = "❌ AI Error! Failed to process request.";
    }
  }

  console.log("Tutor:", botResponse);
  sessionMemory.conversation.push(`Tutor: ${botResponse}`);
  res.json({ response: botResponse });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 AI Tutor running on http://localhost:${PORT}`));
