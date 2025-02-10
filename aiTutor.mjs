import readline from 'readline';
import { Ollama } from '@langchain/ollama';
import { listFilesAndFolders, changeDirectory, goBack, selectFile, sessionMemory } from './directoryUtils.mjs';

// Initialize AI Model with response control
const llm = new Ollama({
  model: "llama3",
  temperature: 0.4,
  max_tokens: 1024,
  top_p: 0.85,
  presence_penalty: 0.6,
  frequency_penalty: 0.5,
  system_prompt: `You are an AI tutor assisting students with academic doubts.
  - Use all stored file contents for answering questions.
  - Remember previous interactions for contextual responses.
  - Provide clear, step-by-step explanations and avoid repetition.
  - Ensure factual accuracy and correcting misunderstandings.`,
});

sessionMemory.conversation = [];
sessionMemory.isProcessing = false;

// Function to process user input & get AI response
async function processUserInput(input) {
  if (sessionMemory.isProcessing) {
    console.log("⏳ Please wait for the current task to complete...");
    return;
  }

  sessionMemory.isProcessing = true;
  input = input.trim();

  if (input === "list") {
    listFilesAndFolders();
    sessionMemory.isProcessing = false;
    return;
  }

  if (input.startsWith("cd ")) {
    const folderName = input.replace("cd ", "").trim();
    changeDirectory(folderName);
    sessionMemory.isProcessing = false;
    return;
  }

  if (input === "back") {
    goBack();
    sessionMemory.isProcessing = false;
    return;
  }

  if (input.startsWith("select ")) {
    const fileName = input.replace("select ", "").trim();
    selectFile(fileName);
    sessionMemory.isProcessing = false;
    return;
  }

  try {
    sessionMemory.conversation.push(`User: ${input}`);

    // Combine all file contents
    const fileContext = Object.entries(sessionMemory.fileContents)
      .map(([name, content]) => `File: ${name}\n${content}`)
      .join("\n\n");

    const context = `Stored Files:\n${fileContext}\n\nConversation History:\n${sessionMemory.conversation.join("\n")}\nTutor:`;
    const response = await llm.invoke(context);

    console.log("💬 AI Tutor:", response);
    sessionMemory.conversation.push(`Tutor: ${response}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }

  sessionMemory.isProcessing = false;
}

// Interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('📚 AI Tutor Ready! Use commands:\n  - "list" → Show current folder contents\n  - "cd <folder>" → Enter a folder\n  - "back" → Go back one level\n  - "select <filename>" → Open a file\n  - Ask questions normally');
rl.setPrompt('📌 Enter command: ');
rl.prompt();

rl.on('line', async (input) => {
  await processUserInput(input);
  rl.prompt();
});
