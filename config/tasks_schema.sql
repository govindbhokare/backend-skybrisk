-- Task Submissions Schema
-- This table stores weekly/monthly task submissions for interns

CREATE TABLE IF NOT EXISTS task_submissions (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    task_number INT NOT NULL,
    task_type ENUM('weekly', 'monthly') DEFAULT 'weekly',
    github_repo_link VARCHAR(500) DEFAULT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    approval_flag TINYINT(1) DEFAULT 0 COMMENT '0 = Pending Review, 1 = Approved',
    submission_date DATETIME DEFAULT NULL,
    approval_date DATETIME DEFAULT NULL,
    reviewed_by VARCHAR(255) DEFAULT NULL COMMENT 'Email of admin who reviewed',
    feedback TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (assuming interns table exists with email column)
    -- Note: If email is not unique in interns table, you may need to use intern_id instead
    -- FOREIGN KEY (email) REFERENCES interns(email) ON DELETE CASCADE,
    
    -- Unique constraint: one task number per email
    UNIQUE KEY unique_task_per_user (email, task_number),
    
    -- Indexes for better query performance
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_approval_flag (approval_flag),
    INDEX idx_task_number (task_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data structure (commented out - uncomment to test)
-- Note: Tasks are created based on internship duration:
-- 1 month = 4 weekly tasks
-- 2 months = 8 weekly tasks  
-- 3 months = 9 tasks (3 per month)
-- 6 months = 36 tasks (6 per month)

-- Example: For a 3-month internship, create 9 tasks
-- INSERT INTO task_submissions (email, task_number, task_type, status, approval_flag)
-- VALUES 
-- ('user@example.com', 1, 'monthly', 'pending', 0),
-- ('user@example.com', 2, 'monthly', 'pending', 0),
-- ('user@example.com', 3, 'monthly', 'pending', 0),
-- ('user@example.com', 4, 'monthly', 'pending', 0),
-- ('user@example.com', 5, 'monthly', 'pending', 0),
-- ('user@example.com', 6, 'monthly', 'pending', 0),
-- ('user@example.com', 7, 'monthly', 'pending', 0),
-- ('user@example.com', 8, 'monthly', 'pending', 0),
-- ('user@example.com', 9, 'monthly', 'pending', 0);

