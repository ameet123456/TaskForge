import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {type: String,required: true,},
  description: {type: String,required: true,},
  endDate: {type: Date,required: true,},
  team: {type: mongoose.Schema.Types.ObjectId,ref: "Team",required: true,},
  status: {type: String,enum: ["pending", "in_progress", "completed"],default: "pending",},
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,},
  isActive: {type: Boolean,default: true,},
  tasks: [{type: mongoose.Schema.Types.ObjectId,ref: "Task"}]
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
