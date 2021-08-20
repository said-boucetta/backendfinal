const router = require("express").Router();
const videoController = require("../controllers/video.controller");

router.get("/", videoController.readVideo);
router.post("/", videoController.createVideo);
router.put("/:id", videoController.updateVideo);
router.delete("/:id", videoController.deleteVideo);

module.exports = router;
