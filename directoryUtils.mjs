import fs from 'fs';
import path from 'path';

const sessionMemory = {
  currentDirectory: process.cwd(),
  fileContents: {},
};

// Function to list files & folders in the current directory
export function listFilesAndFolders() {
  try {
    const items = fs.readdirSync(sessionMemory.currentDirectory, { withFileTypes: true });
    if (items.length === 0) {
      console.log("📂 No files or folders found.");
      return;
    }

    console.log(`📂 Contents of: ${sessionMemory.currentDirectory}`);
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.isDirectory() ? `[📁] ${item.name}` : item.name}`);
    });
  } catch (error) {
    console.error("❌ Error listing directory contents:", error);
  }
}

// Function to navigate into a folder
export function changeDirectory(folderName) {
  const newPath = path.join(sessionMemory.currentDirectory, folderName);
  if (!fs.existsSync(newPath) || !fs.statSync(newPath).isDirectory()) {
    console.log(`❌ Folder "${folderName}" not found.`);
    return;
  }

  sessionMemory.currentDirectory = newPath;
  console.log(`📂 Moved into: ${newPath}`);
}

// Function to go back to the previous directory
export function goBack() {
  const parentDir = path.dirname(sessionMemory.currentDirectory);
  if (parentDir === sessionMemory.currentDirectory) {
    console.log("❌ Already at the root directory.");
    return;
  }

  sessionMemory.currentDirectory = parentDir;
  console.log(`📂 Moved back to: ${parentDir}`);
}

// Function to select & read a file (supports multiple files)
export function selectFile(fileName) {
  const filePath = path.join(sessionMemory.currentDirectory, fileName);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    console.log(`❌ File "${fileName}" not found.`);
    return;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    sessionMemory.fileContents[fileName] = fileContent;
    console.log(`📂 File "${fileName}" selected and stored in memory.`);
  } catch (error) {
    console.error("❌ Error reading file:", error);
  }
}

// Export sessionMemory to maintain file state across imports
export { sessionMemory };
