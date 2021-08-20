const router = require("express").Router();
const messageController = require("../controllers/message.controller");

router.get("/", messageController.readMessage);
router.post("/", messageController.createMessage);

module.exports = router;
