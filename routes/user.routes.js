const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getUsers);
router.get("/email/:email", userController.getUserByEmail);

module.exports = router;
