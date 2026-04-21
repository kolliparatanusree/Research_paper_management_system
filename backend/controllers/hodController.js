const nodemailer = require("nodemailer");
const jsPDF = require("jspdf").jsPDF;
const User = require("../models/User");




// If you use autotable later
require("jspdf-autotable");

const sendReportEmail = async (req, res) => {
  try {
    const { email, reportData, userId } = req.body;

    // 🔍 1. Find HOD properly
    const hod = await User.findOne({
      role: "hod",
      userId: userId,
    });

    if (!hod) {
      return res.status(404).json({ message: "HoD not found" });
    }

    // 📄 2. Create PDF
    const doc = new jsPDF();

    doc.text("UID REPORT", 10, 10);
    doc.text(`Department: ${hod.department}`, 10, 20);

    reportData.forEach((r, i) => {
      doc.text(
        `${i + 1}. ${r.paperTitle} - ${r.facultyName}`,
        10,
        30 + i * 10
      );
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // 📧 3. Email setup
    const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rpmssvecw@gmail.com',
    pass: 'opdh fgkm seaa qsvy'
  }
});
    // 📤 4. Send email
    await transporter.sendMail({
      from: `"R&D System" <${process.env.EMAIL}>`,
      to: email,
      subject: "UID Report - HOD Dashboard",
      text: "Please find attached UID report.",
      attachments: [
        {
          filename: "UID_Report.pdf",
          content: pdfBuffer,
        },
      ],
    });

    return res.json({ message: "Email sent successfully 📧" });

  } catch (err) {
    console.error("Send Report Error:", err);
    return res.status(500).json({
      message: "Failed to send email",
      error: err.message,
    });
  }
};

module.exports = { sendReportEmail };