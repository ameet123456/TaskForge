import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: false },
  teamLead: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);
