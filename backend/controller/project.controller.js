import Project from "../models/project.model.js";
import mongoose from "mongoose";

// POST route to create a new project (only for authenticated users)

export const createProject = async (req, res) => {
   const { title, checklist, priority, assignTo, dueDate } = req.body;
   try {
      if (!req.user) {
         return res.status(401).json({ message: "User not authenticated" });
      }

      if (!title || !checklist || !priority) {
         return res
            .status(400)
            .json({ message: "Required fields are missing" });
      }

      const newProject = new Project({
         createdBy: req.user.id,
         title,
         checkList: checklist,
         priority,
         assignTo,
         dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      const savedProject = await newProject.save();

      return res.status(201).json({
         message: "Project created successfully",
         project: savedProject,
      });
   } catch (error) {
      console.error("Error creating project:", error);
      return res
         .status(500)
         .json({ message: "Server error", error: error.message });
   }
};

// filter projects

export const filterProjects = async (req, res) => {
   try {
      const user = req.user;
      const { filter } = req.params;
      console.log(filter);

      const today = new Date();
      const startOfWeek = new Date(
         today.setDate(today.getDate() - today.getDay())
      );
      const endOfWeek = new Date(
         today.setDate(today.getDate() - today.getDay() + 6)
      );
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      let filterCondition = {
         createdBy: user.id,
      };

      switch (filter) {
         case "today":
            filterCondition.dueDate = {
               $gte: new Date(new Date().setHours(0, 0, 0, 0)),
               $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            };
            break;

         case "thisWeek":
            filterCondition.dueDate = {
               $gte: startOfWeek,
               $lt: endOfWeek,
            };
            break;

         case "thisMonth":
            filterCondition.dueDate = {
               $gte: startOfMonth,
               $lt: endOfMonth,
            };
            break;

         case "all":
            break;

         default:
            return res.status(400).json({
               message:
                  "Invalid filter type. Use 'today', 'thisWeek', 'thisMonth', or 'all'.",
            });
      }

      const filteredProjects = await Project.find(filterCondition);
      res.status(200).json(filteredProjects);
   } catch (error) {
      res.status(500).json({ message: "Server error", error });
   }
};

// PUT route to edit an existing project
export const editProject = async (req, res) => {
   try {
      const { projectId } = req.params;
      const { title, checkList, priority, assignTo, dueDate } = req.body;

      const project = await Project.findById(projectId);

      if (!project) {
         return res.status(404).json({ message: "Project not found" });
      }

      if (project.createdBy.toString() !== req.user._id) {
         return res
            .status(403)
            .json({ message: "You are not authorized to edit this project" });
      }

      if (title) {
         project.title = title;
      }
      if (checkList) {
         project.checkList = checkList;
      }
      if (priority) {
         project.priority = priority;
      }
      if (assignTo) {
         project.assignTo = assignTo;
      }
      if (dueDate) {
         project.dueDate = new Date(dueDate);
      }

      const updatedProject = await project.save();

      return res.status(200).json({
         message: "Project updated successfully",
         project: updatedProject,
      });
   } catch (error) {
      return res.status(500).json({ message: "Server error", error });
   }
};

// DELETE route to delete a project
export const deleteProject = async (req, res) => {
   try {
      const { projectId } = req.params;

      const project = await Project.findById(projectId);

      if (!project) {
         return res.status(404).json({ message: "Project not found" });
      }

      if (project.createdBy.toString() !== req.user._id) {
         return res
            .status(403)
            .json({ message: "You are not authorized to delete this project" });
      }

      await Project.findByIdAndDelete(projectId);

      return res.status(200).json({ message: "Project deleted successfully" });
   } catch (error) {
      return res.status(500).json({ message: "Server error", error });
   }
};

// PUT route to update the status of a project
export const updateProjectStatus = async (req, res) => {
   try {
      const { projectId } = req.params;
      const { status } = req.body;

      const validStatuses = ["TODO", "PROGRESS", "BACKLOG", "DONE"];
      if (!validStatuses.includes(status)) {
         return res.status(400).json({ message: "Invalid status value" });
      }

      const project = await Project.findById(projectId);
      if (!project) {
         return res.status(404).json({ message: "Project not found" });
      }

      if (project.createdBy.toString() !== req.user._id) {
         return res
            .status(403)
            .json({ message: "You are not authorized to update this project" });
      }

      project.status = status;

      const updatedProject = await project.save();

      return res.status(200).json({
         message: "Project status updated successfully",
         project: updatedProject,
      });
   } catch (error) {
      return res.status(500).json({ message: "Server error", error });
   }
};

// GET route to fetch project counts
export const getProjectCounts = async (req, res) => {
   const today = new Date();
   const startOfToday = new Date(today.setHours(0, 0, 0, 0));
   const endOfToday = new Date(today.setHours(23, 59, 59, 999));

   const startOfWeek = new Date(startOfToday);
   startOfWeek.setDate(today.getDate() - today.getDay());

   const endOfWeek = new Date(startOfWeek);
   endOfWeek.setDate(endOfWeek.getDate() + 6);

   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

   try {
      const counts = await Project.aggregate([
         {
            $match: { createdBy: new mongoose.Types.ObjectId(req.user.id) },
         },
         {
            $facet: {
               priorityCounts: [
                  {
                     $group: {
                        _id: "$priority",
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $project: {
                        _id: 0,
                        priority: "$_id",
                        count: 1,
                     },
                  },
               ],
               statusCounts: [
                  {
                     $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $project: {
                        _id: 0,
                        status: "$_id",
                        count: 1,
                     },
                  },
               ],
               dueDateCounts: [
                  {
                     $group: {
                        _id: null,
                        overdue: {
                           $sum: {
                              $cond: [
                                 { $lt: ["$dueDate", startOfToday] },
                                 1,
                                 0,
                              ],
                           },
                        },
                        dueToday: {
                           $sum: {
                              $cond: [
                                 {
                                    $and: [
                                       { $gte: ["$dueDate", startOfToday] },
                                       { $lt: ["$dueDate", endOfToday] },
                                    ],
                                 },
                                 1,
                                 0,
                              ],
                           },
                        },
                        dueThisWeek: {
                           $sum: {
                              $cond: [
                                 {
                                    $and: [
                                       { $gte: ["$dueDate", startOfToday] },
                                       { $lt: ["$dueDate", endOfWeek] },
                                    ],
                                 },
                                 1,
                                 0,
                              ],
                           },
                        },
                        dueThisMonth: {
                           $sum: {
                              $cond: [
                                 {
                                    $and: [
                                       { $gte: ["$dueDate", startOfToday] },
                                       { $lt: ["$dueDate", endOfMonth] },
                                    ],
                                 },
                                 1,
                                 0,
                              ],
                           },
                        },
                     },
                  },
               ],
            },
         },
      ]);

      const formattedCounts = {
         priorityCounts: counts[0]?.priorityCounts || [],
         statusCounts: counts[0]?.statusCounts || [],
         dueDateCounts: {
            overdue: counts[0]?.dueDateCounts[0]?.overdue || 0,
            dueToday: counts[0]?.dueDateCounts[0]?.dueToday || 0,
            dueThisWeek: counts[0]?.dueDateCounts[0]?.dueThisWeek || 0,
            dueThisMonth: counts[0]?.dueDateCounts[0]?.dueThisMonth || 0,
         },
      };
      res.json(formattedCounts);
   } catch (error) {
      console.error("Error fetching project counts:", error.message);
      res.json(error);
   }
};
