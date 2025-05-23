import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Create data directory in dist if it doesn't exist
const distDataDir = path.join(distDir, 'data');
if (!fs.existsSync(distDataDir)) {
    fs.mkdirSync(distDataDir);
}

// Copy data files
const sourceDataDir = path.join(__dirname, 'server', 'data');
if (fs.existsSync(sourceDataDir)) {
    const files = fs.readdirSync(sourceDataDir);
    files.forEach(file => {
        const sourcePath = path.join(sourceDataDir, file);
        const destPath = path.join(distDataDir, file);
        fs.copyFileSync(sourcePath, destPath);
    });
} else {
    // Create empty data files if they don't exist
    const timesheetsFile = path.join(distDataDir, 'timesheets.json');
    const cronJobsFile = path.join(distDataDir, 'cronjobs.json');

    if (!fs.existsSync(timesheetsFile)) {
        fs.writeFileSync(timesheetsFile, JSON.stringify([]));
    }

    if (!fs.existsSync(cronJobsFile)) {
        fs.writeFileSync(cronJobsFile, JSON.stringify([]));
    }
} 