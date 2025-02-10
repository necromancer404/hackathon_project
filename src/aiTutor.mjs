import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib"; // Replacing pdf-parse
import { Ollama } from "@langchain/ollama";
import { listFilesAndFolders, changeDirectory, goBack, sessionMemory } from "./directoryUtils.mjs";

const app = express();
app.use(cors());
app.use(express.json());

const llm = new Ollama({
  model: "llama3",
  temperature: 0.4,
  max_tokens: 1024,
  top_p: 0.85,
  presence_penalty: 0.6,
  frequency_penalty: 0.5,
  system_prompt: `You are an AI tutor assisting students. You can read and understand various file formats.`,
});

sessionMemory.conversation = [];
sessionMemory.fileContents = {};

const BASE_DIRECTORY = process.cwd(); // Set initial directory

/**
 * Reads and extracts text from a PDF using pdf-lib
 */
async function extractTextFromPDF(filePath) {
  try {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    let text = "";

    for (const page of pdfDoc.getPages()) {
      text += page.getTextContent() + "\n\n";
    }

    return text.trim();
  } catch (error) {
    console.error(`Error reading PDF: ${filePath}`, error);
    return "❌ Error reading PDF.";
  }
}

/**
 * Reads any file (Text, Code, PDF, Images, Binary)
 */
async function readAnyFile(filePath) {
  try {
    const absolutePath = path.resolve(BASE_DIRECTORY, filePath);
    if (!fs.existsSync(absolutePath)) {
      return `❌ File not found: ${filePath}`;
    }

    const fileExt = path.extname(absolutePath).toLowerCase();

    if ([".txt", ".md", ".json", ".js", ".html", ".css", ".py", ".java"].includes(fileExt)) {
      return fs.readFileSync(absolutePath, "utf8");
    } else if (fileExt === ".pdf") {
      return await extractTextFromPDF(absolutePath);
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)) {
      const imageBuffer = fs.readFileSync(absolutePath);
      return `data:image/${fileExt.replace(".", "")};base64,${imageBuffer.toString("base64")}`;
    } else {
      const binaryData = fs.readFileSync(absolutePath);
      return `Binary file (${fileExt}), size: ${binaryData.length} bytes.`;
    }
  } catch (error) {
    console.error(`❌ Read Error: ${filePath}`, error);
    return `❌ Error reading file: ${filePath}`;
  }
}

/**
 * Handles multiple file selection
 */
async function selectMultipleFiles(fileNames) {
  let response = "";

  for (const fileName of fileNames) {
    const fileContent = await readAnyFile(fileName);
    sessionMemory.fileContents[fileName] = fileContent;
    response += `✅ Loaded file: ${fileName}\n`;
  }

  return response;
}

/**
 * API Endpoint for chat processing
 */
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  console.log("User:", userMessage);

  sessionMemory.conversation.push(`User: ${userMessage}`);
  let botResponse = "";

  if (userMessage.toLowerCase() === "list files") {
    botResponse = listFilesAndFolders();
  } else if (userMessage.startsWith("cd ")) {
    const folderName = userMessage.substring(3);
    botResponse = changeDirectory(folderName);
  } else if (userMessage.toLowerCase() === "go back") {
    botResponse = goBack();
  } else if (userMessage.startsWith("open ")) {
    const fileNames = userMessage.substring(5).split(",").map(f => f.trim());
    botResponse = await selectMultipleFiles(fileNames);
  } else {
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

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 AI Tutor running on http://localhost:${PORT}`));
