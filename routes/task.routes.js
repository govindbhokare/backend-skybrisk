const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");

// Get all tasks for a user by email
router.get("/email/:email", taskController.getTasksByEmail);

// Get task statistics for a user
router.get("/stats/:email", taskController.getTaskStats);

// Get a specific task by task_id
router.get("/:taskId", taskController.getTaskById);

// Submit/Update a task (user submits GitHub repo link)
router.post("/submit", taskController.submitTask);

// Initialize tasks for a user based on duration
router.post("/initialize", taskController.initializeTasks);

// Approve/Reject a task (admin function)
router.put("/approve/:taskId", taskController.approveTask);

module.exports = router;

