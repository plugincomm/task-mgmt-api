const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
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

const compressVideo = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        if (inputPath === outputPath) {
            return reject(new Error('Input and output paths must be different'));
        }

        console.log('Compressing video from', inputPath, 'to', outputPath);
        ffmpeg(inputPath)
            .outputOptions('-vcodec', 'libx264')
            .outputOptions('-crf', '28') // Adjust CRF value to control compression quality
            .save(outputPath)
            .on('end', async () => {
                console.log('Video compression finished. Deleting original file...');
                try {
                    await deleteFileIfExists(inputPath); // Use the delete function with retry logic
                    resolve(outputPath);
                } catch (unlinkError) {
                    console.error('Error deleting original video file:', unlinkError);
                    reject(unlinkError);
                }
            })
            .on('error', (err) => {
                console.error('Error compressing video:', err);
                reject(err);
            });
    });
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

// Example usage
deleteFileIfExists('F:\\venktesh\\videoupload\\server\\public\\uploads\\videoimg\\video_img-1722401528687.jpg');

module.exports = { compressImage, compressVideo, generateUniquePath, deleteFileIfExists };
