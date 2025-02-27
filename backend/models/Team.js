const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // References User model
  createdDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  teamSlogan: { type: String },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }]
});

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
