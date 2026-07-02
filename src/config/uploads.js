const createUploader = require("../middleware/upload.middleware");

const avatarUpload = createUploader(
    "avatars",
    [".jpg", ".jpeg", ".png", ".webp"]
);

const teamLogoUpload = createUploader(
    "teams",
    [".jpg", ".jpeg", ".png", ".webp"]
);

const presentationUpload = createUploader(
    "presentations",
    [".pdf", ".ppt", ".pptx"]
);

module.exports = {
    avatarUpload,
    teamLogoUpload,
    presentationUpload
};