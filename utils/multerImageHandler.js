const multer = require("multer");
const AppError = require('./appError');


const VALID_IMAGE_FORMATS = {
    PNG: 'png',
    JPG: 'jpg',
    JPEG: 'jpeg',
    GIF: 'gif',
  }
  const expectedMimeTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/svg': true,
    'image/tiff': true,
    'image/webp': true,
  };

const multerStorage = multer.memoryStorage();

const uploadPicture = multer({
    multerStorage,
    limits: {
      files: 5,
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: (req, file, cb) => {
      try {
        if (expectedMimeTypes[file.mimetype]) {
          cb(null, true);
        } else
          throw new AppError(
            `Please use a valid image format. Valid formats include: ${Object.values(
              VALID_IMAGE_FORMATS
            ).join(', ')}`, 404
          );
      } catch (error) {
        cb(error);
      }
    },
  });



module.exports = uploadPicture;
