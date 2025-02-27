const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, unique: true },
  description: { type: String },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team", required: false }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ["In Progress", "Completed", "Pending"], default: "Pending" }
});

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
