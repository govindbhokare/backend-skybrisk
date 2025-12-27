const db = require("../config/db");

// Get all tasks for a specific user by email
exports.getTasksByEmail = (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email parameter is required"
    });
  }

  const sql = `
    SELECT 
      task_id,
      email,
      task_number,
      task_type,
      github_repo_link,
      status,
      approval_flag,
      submission_date,
      approval_date,
      reviewed_by,
      feedback,
      created_at,
      updated_at
    FROM task_submissions 
    WHERE email = ? 
    ORDER BY task_number ASC
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
};

// Get a specific task by task_id
exports.getTaskById = (req, res) => {
  const { taskId } = req.params;

  const sql = "SELECT * FROM task_submissions WHERE task_id = ?";

  db.query(sql, [taskId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
};

// Submit/Update a task (user submits GitHub repo link)
exports.submitTask = (req, res) => {
  const { email, taskNumber, githubRepoLink } = req.body;

  if (!email || !taskNumber) {
    return res.status(400).json({
      success: false,
      message: "Email and task number are required"
    });
  }

  if (!githubRepoLink) {
    return res.status(400).json({
      success: false,
      message: "GitHub repository link is required"
    });
  }

  // Validate GitHub URL format
  const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/[\w\-\.]+/i;
  if (!githubUrlPattern.test(githubRepoLink)) {
    return res.status(400).json({
      success: false,
      message: "Invalid GitHub repository URL format"
    });
  }

  // Check if task exists
  const checkSql = "SELECT * FROM task_submissions WHERE email = ? AND task_number = ?";
  
  db.query(checkSql, [email, taskNumber], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    if (results.length === 0) {
      // Create new task submission
      const insertSql = `
        INSERT INTO task_submissions 
        (email, task_number, github_repo_link, status, submission_date) 
        VALUES (?, ?, ?, 'pending', NOW())
      `;

      db.query(insertSql, [email, taskNumber, githubRepoLink], (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        res.json({
          success: true,
          message: "Task submitted successfully",
          data: {
            task_id: result.insertId,
            email,
            task_number: taskNumber,
            github_repo_link: githubRepoLink,
            status: 'pending',
            approval_flag: 0
          }
        });
      });
    } else {
      // Update existing task
      const updateSql = `
        UPDATE task_submissions 
        SET 
          github_repo_link = ?,
          status = 'pending',
          approval_flag = 0,
          submission_date = NOW(),
          updated_at = NOW()
        WHERE email = ? AND task_number = ?
      `;

      db.query(updateSql, [githubRepoLink, email, taskNumber], (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        res.json({
          success: true,
          message: "Task updated successfully",
          data: {
            email,
            task_number: taskNumber,
            github_repo_link: githubRepoLink,
            status: 'pending',
            approval_flag: 0
          }
        });
      });
    }
  });
};

// Approve/Reject a task (admin function)
exports.approveTask = (req, res) => {
  const { taskId } = req.params;
  const { approvalFlag, feedback, reviewedBy } = req.body;

  if (approvalFlag === undefined || approvalFlag === null) {
    return res.status(400).json({
      success: false,
      message: "Approval flag (0 or 1) is required"
    });
  }

  if (approvalFlag !== 0 && approvalFlag !== 1) {
    return res.status(400).json({
      success: false,
      message: "Approval flag must be 0 (rejected) or 1 (approved)"
    });
  }

  const updateSql = `
    UPDATE task_submissions 
    SET 
      approval_flag = ?,
      status = ?,
      approval_date = NOW(),
      reviewed_by = ?,
      feedback = ?,
      updated_at = NOW()
    WHERE task_id = ?
  `;

  const status = approvalFlag === 1 ? 'completed' : 'pending';

  db.query(
    updateSql,
    [approvalFlag, status, reviewedBy || null, feedback || null, taskId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      res.json({
        success: true,
        message: approvalFlag === 1 ? "Task approved successfully" : "Task rejected",
        data: {
          task_id: taskId,
          approval_flag: approvalFlag,
          status: status
        }
      });
    }
  );
};

// Initialize tasks for a user based on internship duration
exports.initializeTasks = (req, res) => {
  const { email, durationMonths } = req.body;

  if (!email || !durationMonths) {
    return res.status(400).json({
      success: false,
      message: "Email and duration (in months) are required"
    });
  }

  // Calculate number of tasks based on duration
  let taskCount = 0;
  let taskType = 'weekly';

  if (durationMonths === 1) {
    taskCount = 4; // 4 weekly tasks
    taskType = 'weekly';
  } else if (durationMonths === 2) {
    taskCount = 8; // 8 weekly tasks
    taskType = 'weekly';
  } else if (durationMonths === 3) {
    taskCount = 9; // 3 tasks per month × 3 months
    taskType = 'monthly';
  } else if (durationMonths === 6) {
    taskCount = 36; // 6 tasks per month × 6 months
    taskType = 'monthly';
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid duration. Supported: 1, 2, 3, or 6 months"
    });
  }

  // Check if tasks already exist
  const checkSql = "SELECT COUNT(*) as count FROM task_submissions WHERE email = ?";
  
  db.query(checkSql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    if (results[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Tasks already initialized for this user"
      });
    }

    // Create tasks
    const tasks = [];
    for (let i = 1; i <= taskCount; i++) {
      tasks.push([email, i, taskType, 'pending', 0]);
    }

    const insertSql = `
      INSERT INTO task_submissions 
      (email, task_number, task_type, status, approval_flag) 
      VALUES ?
    `;

    db.query(insertSql, [tasks], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        message: `Successfully initialized ${taskCount} tasks for ${durationMonths} month(s) internship`,
        data: {
          email,
          duration_months: durationMonths,
          task_count: taskCount,
          task_type: taskType,
          tasks_created: result.affectedRows
        }
      });
    });
  });
};

// Get task statistics for a user
exports.getTaskStats = (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email parameter is required"
    });
  }

  const sql = `
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN approval_flag = 1 THEN 1 ELSE 0 END) as approved_tasks,
      SUM(CASE WHEN approval_flag = 0 AND github_repo_link IS NOT NULL THEN 1 ELSE 0 END) as submitted_pending_approval
    FROM task_submissions 
    WHERE email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
};

