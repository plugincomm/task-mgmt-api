const sharp = require('sharp');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Function to generate unique output paths
const generateUniquePath = (filePath) => {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    const timestamp = Date.now(); // Generate a unique timestamp
    return path.join(path.dirname(filePath), `${basename}-${timestamp}${ext}`);
};

const compressImage = async (inputPath, outputPath) => {
    try {
        console.log('Compressing image from', inputPath, 'to', outputPath);
        await sharp(inputPath)
            .resize(800) // Resize to 800px width, maintaining aspect ratio
            .toFile(outputPath);

        console.log('Image compressed successfully. Deleting original file...');
        await deleteFileIfExists(inputPath); // Use the delete function with retry logic
        return outputPath;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
};

const compressVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const ffmpegProcess = spawn('ffmpeg', [
            '-i', inputPath,
            '-vcodec', 'libx264',
            '-crf', '28',
            '-preset', 'veryfast',
            outputPath
        ]);

        ffmpegProcess.stdout.on('data', (data) => {
            console.log(`ffmpeg stdout: ${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
            console.error(`ffmpeg stderr: ${data}`);
        });

        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Video compression finished');
                resolve(outputPath);
            } else {
                console.error(`ffmpeg process exited with code ${code}`);
                reject(new Error(`ffmpeg process exited with code ${code}`));
            }
        });

        ffmpegProcess.on('error', (err) => {
            console.error('ffmpeg process error:', err);
            reject(err);
        });
    });
};

const compressVideoWithRetry = async (inputPath, outputPath, retries = 3) => {
    try {
        return await compressVideo(inputPath, outputPath);
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying video compression... (${retries} retries left)`);
            await delay(2000); // Wait before retrying
            return compressVideoWithRetry(inputPath, outputPath, retries - 1);
        } else {
            throw new Error('Failed to compress video after multiple attempts');
        }
    }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const deleteFileIfExists = async (filePath, retries = 3) => {
    try {
        await fs.access(filePath); // Check if the file exists
        console.log(`File exists: ${filePath}`);

        // Introduce a delay before deleting the file
        await delay(1000); // 1 second delay

        await fs.unlink(filePath); // Delete the file
        console.log(`Successfully deleted: ${filePath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`File not found, skipping deletion: ${filePath}`);
        } else if (error.code === 'EPERM') {
            console.error(`Permission error while deleting file: ${filePath}`, error);
            if (retries > 0) {
                console.log(`Retrying deletion... (${retries} retries left)`);
                await delay(2000); // Wait a bit longer before retrying
                await deleteFileIfExists(filePath, retries - 1);
            } else {
                console.error(`Failed to delete file after multiple attempts: ${filePath}`);
            }
        } else {
            console.error(`Error deleting file: ${filePath}`, error);
        }
    }
};

module.exports = { compressImage, compressVideoWithRetry, generateUniquePath, deleteFileIfExists };
