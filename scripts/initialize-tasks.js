/**
 * Script to initialize tasks for all interns based on their internship duration
 * Run this script after setting up the task_submissions table
 * 
 * Usage: node scripts/initialize-tasks.js
 */

const db = require("../config/db");
require("dotenv").config();

// Calculate duration in months from start and end dates
function calculateDurationMonths(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
  return months;
}

// Get task count and type based on duration
function getTaskConfig(durationMonths) {
  if (durationMonths === 1) {
    return { count: 4, type: 'weekly' };
  } else if (durationMonths === 2) {
    return { count: 8, type: 'weekly' };
  } else if (durationMonths === 3) {
    return { count: 9, type: 'monthly' };
  } else if (durationMonths === 6) {
    return { count: 36, type: 'monthly' };
  } else {
    // Default: assume weekly tasks
    return { count: durationMonths * 4, type: 'weekly' };
  }
}

async function initializeTasksForAllInterns() {
  try {
    // Get all interns
    const getInternsQuery = "SELECT email, start_date, end_date FROM interns";
    
    db.query(getInternsQuery, async (err, interns) => {
      if (err) {
        console.error("❌ Error fetching interns:", err.message);
        process.exit(1);
      }

      console.log(`📋 Found ${interns.length} interns to process\n`);

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const intern of interns) {
        try {
          // Check if tasks already exist
          const checkTasksQuery = "SELECT COUNT(*) as count FROM task_submissions WHERE email = ?";
          
          db.query(checkTasksQuery, [intern.email], (err, results) => {
            if (err) {
              console.error(`❌ Error checking tasks for ${intern.email}:`, err.message);
              errorCount++;
              return;
            }

            if (results[0].count > 0) {
              console.log(`⏭️  Skipping ${intern.email} - tasks already exist`);
              skipCount++;
              return;
            }

            // Calculate duration
            const durationMonths = calculateDurationMonths(intern.start_date, intern.end_date);
            const config = getTaskConfig(durationMonths);

            // Create tasks
            const tasks = [];
            for (let i = 1; i <= config.count; i++) {
              tasks.push([intern.email, i, config.type, 'pending', 0]);
            }

            const insertQuery = `
              INSERT INTO task_submissions 
              (email, task_number, task_type, status, approval_flag) 
              VALUES ?
            `;

            db.query(insertQuery, [tasks], (err, result) => {
              if (err) {
                console.error(`❌ Error creating tasks for ${intern.email}:`, err.message);
                errorCount++;
                return;
              }

              console.log(`✅ Created ${config.count} ${config.type} tasks for ${intern.email} (${durationMonths} months)`);
              successCount++;
            });
          });
        } catch (error) {
          console.error(`❌ Error processing ${intern.email}:`, error.message);
          errorCount++;
        }
      }

      // Wait a bit for async operations to complete
      setTimeout(() => {
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⏭️  Skipped: ${skipCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        process.exit(0);
      }, 2000);
    });
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

// Run the script
console.log("🚀 Starting task initialization for all interns...\n");
initializeTasksForAllInterns();

