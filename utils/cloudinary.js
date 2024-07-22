// Config cloudinary using Cloud Name, API Key and API Secret

const cloudinary = require("cloudinary").v2;
const CONFIG = require("./../config/config");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: CONFIG.CLOUDINARY_NAME,
  api_key: CONFIG.CLOUDINARY_API_KEY,
  api_secret: CONFIG.CLOUDINARY_API_SECRET,
});

uploadToCloudinary = async (buffer, folder) => {

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { quality: "auto:low" }, // You can adjust the quality level as needed
        ],
      }, 
      (error, result) => {
        if (error) {
          console.log("Upload error:", error);
          reject(error); // Reject the promise on error
        } else {
          // console.log("Cloudinary upload result:", result);
          resolve({ url: result.url, public_id: result.public_id }); // Resolve the promise with the upload result
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}; 

// uploadToCloudinary = async (file, folder) => {
//   return new Promise(resolve => {
//     cloudinary.uploader.upload(file, (result) => {
//       resolve({
//         url: result.url,
//         public_id: result.public_id
//       })
//     }, {
//       resource_type: "auto",
//       folder: folder
//     })
//   })
// }

removeFromCloudinary = async (public_id) => {
  await cloudinary.uploader.destroy(public_id, function (error, result) {
    console.log(result, error);
  });
};

module.exports = { uploadToCloudinary, removeFromCloudinary };