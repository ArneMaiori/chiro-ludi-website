const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

function uploadBufferToCloudinary(buffer, folder = 'chiro/events') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { uploadBufferToCloudinary };
