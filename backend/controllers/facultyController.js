const User = require("../models/User");
const DocumentUpload = require("../models/DocumentUpload");

exports.getDepartmentPublicationHistory = async (req, res) => {
  try {
    const { department } = req.params;
    const { startDate, endDate, search } = req.query; // get date & search query

    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    // Get all faculty IDs in this department
    const facultyMembers = await User.find({ department });
    const facultyIds = facultyMembers.map((f) => f.userId);

    // Build MongoDB query
    const query = {
      userId: { $in: facultyIds }
    };

    if (startDate || endDate) {
      query.uploadedAt = {};
      if (startDate) query.uploadedAt.$gte = new Date(startDate);
      if (endDate) query.uploadedAt.$lte = new Date(endDate);
    }

    if (search) {
      // Search in userId, paperTitle, pid, abstract, target/journal
      query.$or = [
        { userId: { $regex: search, $options: "i" } },
        { paperTitle: { $regex: search, $options: "i" } },
        { pid: { $regex: search, $options: "i" } },
        { abstract: { $regex: search, $options: "i" } },
        { target: { $regex: search, $options: "i" } },
      ];
    }

    const publications = await DocumentUpload.find(query).sort({ uploadedAt: -1 });

    const formatted = publications.map((pub) => ({
      title: pub.paperTitle || "Untitled",
      userId: pub.userId,
      journal: pub.target || "Unknown",
      abstract: pub.abstract || "",
      year: pub.uploadedAt ? new Date(pub.uploadedAt).getFullYear() : null,
      pid: pub.pid,
      uploadedAt: pub.uploadedAt
    }));

    res.json({
      department,
      publicationHistory: formatted
    });

  } catch (error) {
    console.error("Department publication error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPublicationHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const publications = await DocumentUpload.find({
      userId: userId,
      pid: { $exists: true, $ne: "" }
    }).sort({ uploadedAt: -1 });

    const formatted = publications.map(pub => ({
      title: pub.paperTitle || "Untitled", 
      journal: pub.target || "Unknown",
      year: new Date(pub.uploadedAt).getFullYear(),
      pid: pub.pid,
      abstract: pub.abstract,                // ✅ send abstract
      uploadedAt: pub.uploadedAt 
    }));

    res.json({
      publicationHistory: formatted
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};