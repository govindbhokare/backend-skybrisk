# Task Submissions Schema Setup Guide

## Database Schema Setup

### Step 1: Run the SQL Schema
1. Open MySQL Workbench
2. Connect to your database (`intern_db`)
3. Open the file `be/config/tasks_schema.sql`
4. Execute the SQL script to create the `task_submissions` table

### Step 2: Verify Table Creation
Run this query in MySQL Workbench to verify:
```sql
DESCRIBE task_submissions;
```

### Step 3: Initialize Tasks for Existing Interns
You can initialize tasks for interns based on their internship duration using the API endpoint:

**POST** `/api/tasks/initialize`
```json
{
  "email": "user@example.com",
  "durationMonths": 3
}
```

## Task Structure by Duration

- **1 Month**: 4 weekly tasks
- **2 Months**: 8 weekly tasks
- **3 Months**: 9 tasks (3 per month)
- **6 Months**: 36 tasks (6 per month)

## API Endpoints

### Get Tasks by Email
**GET** `/api/tasks/email/:email`
- Returns all tasks for a specific user

### Submit Task
**POST** `/api/tasks/submit`
```json
{
  "email": "user@example.com",
  "taskNumber": 1,
  "githubRepoLink": "https://github.com/username/repo"
}
```

### Approve/Reject Task
**PUT** `/api/tasks/approve/:taskId`
```json
{
  "approvalFlag": 1,  // 0 = Rejected, 1 = Approved
  "feedback": "Great work!",
  "reviewedBy": "admin@example.com"
}
```

### Get Task Statistics
**GET** `/api/tasks/stats/:email`
- Returns task statistics (total, pending, completed, approved)

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| task_id | INT | Primary key, auto-increment |
| email | VARCHAR(255) | Foreign key to interns table |
| task_number | INT | Task number (1, 2, 3, etc.) |
| task_type | ENUM | 'weekly' or 'monthly' |
| github_repo_link | VARCHAR(500) | GitHub repository URL |
| status | ENUM | 'pending' or 'completed' |
| approval_flag | TINYINT(1) | 0 = Pending, 1 = Approved |
| submission_date | DATETIME | When user submitted |
| approval_date | DATETIME | When admin approved/rejected |
| reviewed_by | VARCHAR(255) | Admin email who reviewed |
| feedback | TEXT | Admin feedback |
| created_at | TIMESTAMP | Auto timestamp |
| updated_at | TIMESTAMP | Auto timestamp |

## Workflow

1. **Initialization**: Tasks are created with status='pending' and approval_flag=0
2. **Submission**: User submits GitHub repo link via API
3. **Review**: Admin reviews and sets approval_flag (0 or 1)
4. **Completion**: When approval_flag=1, status changes to 'completed'

