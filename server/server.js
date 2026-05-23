require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Configure dynamic cross-origin matching for local testing and Vercel hosting
app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ CRITICAL ERROR: MONGODB_URI is not defined!");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("💾 Production MongoDB Atlas Connected Safely"))
  .catch(err => console.error("❌ Atlas Connection Error:", err));

// --- REST OF YOUR APP SCHEMAS & API ENDPOINTS REMAIN REMARKABLY INTENSIVELY THE SAME ---
const ProjectSchema = new mongoose.Schema({
  name: { type: String, default: "Untitled Sandbox" },
  files: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
});

const Project = mongoose.model("Project", ProjectSchema);

app.post("/api/projects/save", async (req, res) => {
  try {
    const { projectId, name, files } = req.body;
    let project;
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      project = await Project.findByIdAndUpdate(projectId, { name, files, updatedAt: Date.now() }, { new: true });
    }
    if (!project) {
      project = new Project({ name, files });
      await project.save();
    }
    res.status(200).json({ success: true, projectId: project._id, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Production Sandbox API Running on Port ${PORT}`));