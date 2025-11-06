const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

/**
 * Upload afbeelding naar Cloudinary
 * @param buffer - buffer van Multer
 * @param folder - folder in Cloudinary
 * @post afbeelding wordt geupload naar Cloudinary
 */
function uploadBufferToCloudinary(buffer, folder = 'chiro/events') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) { 
          return reject(error);
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * Verwijder een afbeelding van Cloudinary
 * @param publicId - de id van de afbeelding
 * @post afbeelding wordt van Cloudinary verwijderd
 */
async function deleteImageFromCloudinary(publicId) {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Fout bij verwijderen van afbeelding op Cloudinary:', err);
    }
  }
}

module.exports = { uploadBufferToCloudinary, deleteImageFromCloudinary};
