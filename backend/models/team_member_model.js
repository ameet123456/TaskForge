import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  role: {
    type: String,
    enum: ['team_lead', 'team_member', 'admin'],
    default: "viewer",
  },
  isAdmin: { type: Boolean, default: false }, 
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

teamMemberSchema.index({ user: 1, team: 1 }, { unique: true });

export default mongoose.model("TeamMember", teamMemberSchema);
