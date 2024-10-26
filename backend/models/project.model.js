import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema({
   createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   title: {
      type: String,
      required: true,
      unique: true,
   },
   checkList: {
      type: Array,
      required: true,
   },
   priority: {
      type: String,
      required: true,
      enum: ["High", "Moderate", "Low"],
   },
   status: {
      type: String,
      enum: ["TODO", "PROGRESS", "BACKLOG", "DONE"],
      default: "TODO",
   },
   assignTo: {
      type: String,
   },
   assignedProjects: [
      {
         type: Schema.Types.ObjectId,
         ref: "Project",
      },
   ],
   dueDate: {
      type: Date,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

export default mongoose.model("Project", projectSchema);
