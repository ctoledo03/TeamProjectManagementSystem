const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, unique: true },
  description: { type: String },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: [
      "Pending",
      "Planning",
      "In Progress",
      "In Review",
      "Testing",
      "On Hold",
      "Completed",
      "Cancelled"
    ],
    default: "Pending" 
  }
});

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
