const db = require("../config/db");

exports.getUsers = (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, data: results });
  });
};

exports.getUserByEmail = (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: "Email parameter is required" 
    });
  }

  const sql = "SELECT * FROM interns WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: err.message 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }

    const user = results[0];
    
    // Calculate progress based on dates (assuming 6 months internship)
    const startDate = new Date(user.start_date);
    const endDate = new Date(user.end_date);
    const today = new Date();
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.max(Math.round((daysPassed / totalDays) * 100), 0), 100);

    // Format batch assignment for display
    const batchFormat = user.batch_assignment || "Not Assigned";
    const startDateFormatted = new Date(user.start_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const endDateFormatted = new Date(user.end_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const batch = `${startDateFormatted} - ${Math.ceil(totalDays / 30)}M`;

    // Generate ID based on intern_id and date
    const dateStr = new Date(user.start_date).toISOString().slice(0, 10).replace(/-/g, '');
    const id = `EMP${dateStr}-${String(user.intern_id).padStart(3, '0')}`;

    // Map database fields to frontend structure
    const formattedUser = {
      intern_id: user.intern_id,
      name: user.name,
      email: user.email,
      phone: user.mobile_number,
      paymentEmail: user.email,
      batch: batch,
      id: id,
      type: user.id_card_type === "Premium ID Card" ? "PREMIUM" : "STANDARD",
      progress: progress,
      batch_assignment: user.batch_assignment,
      start_date: user.start_date,
      end_date: user.end_date,
      id_card_type: user.id_card_type,
      certificate_sent: user.certificate_sent,
      id_card_sent: user.id_card_sent,
      note: user.note
    };

    res.json({ success: true, data: formattedUser });
  });
};