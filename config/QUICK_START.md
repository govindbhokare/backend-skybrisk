# Quick Start: Task Submissions Setup

## 1. Create the Table in MySQL Workbench

1. Open MySQL Workbench
2. Connect to your `intern_db` database
3. Open and execute: `be/config/tasks_schema.sql`

## 2. Verify Table Structure

Run in MySQL Workbench:
```sql
DESCRIBE task_submissions;
SHOW CREATE TABLE task_submissions;
```

## 3. Initialize Tasks (Choose One Method)

### Method A: Using API Endpoint
```bash
POST http://localhost:5000/api/tasks/initialize
Content-Type: application/json

{
  "email": "user@example.com",
  "durationMonths": 3
}
```

### Method B: Using Script
```bash
cd be
node scripts/initialize-tasks.js
```

## 4. Test the API

### Submit a Task
```bash
POST http://localhost:5000/api/tasks/submit
Content-Type: application/json

{
  "email": "user@example.com",
  "taskNumber": 1,
  "githubRepoLink": "https://github.com/username/repo"
}
```

### Approve a Task
```bash
PUT http://localhost:5000/api/tasks/approve/1
Content-Type: application/json

{
  "approvalFlag": 1,
  "feedback": "Great work!",
  "reviewedBy": "admin@example.com"
}
```

### Get User Tasks
```bash
GET http://localhost:5000/api/tasks/email/user@example.com
```

## Task Counts by Duration

| Duration | Task Count | Type |
|----------|------------|------|
| 1 month | 4 tasks | Weekly |
| 2 months | 8 tasks | Weekly |
| 3 months | 9 tasks | Monthly (3/month) |
| 6 months | 36 tasks | Monthly (6/month) |

## Important Notes

- All tasks start with `status='pending'` and `approval_flag=0`
- Users submit GitHub repo links via API
- Admins approve/reject using `approval_flag` (0 or 1)
- When `approval_flag=1`, status automatically changes to 'completed'

