import mongoose from "mongoose";
import moment from "moment";
import Project from "../models/project.model.js";

// POST route to create a new project (only for authenticated users)
export const createProject = async (re, res) => {
   try {
      const { title, checkList, priority, assignTo, dueDate } = req.body;

      const createdBy = req.user._id;

      if (!title || !checkList || !priority) {
         return res
            .status(400)
            .json({ message: "Required fields are missing" });
      }

      // Create a new project document
      const newProject = new Project({
         createdBy: mongoose.Types.ObjectId(createdBy),
         title,
         checkList,
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
      return res.status(500).json({ message: "Server error", error });
   }
};

export const filterProjects = async (req, res) => {
   try {
      const { filter, status } = req.query;

      const today = new Date();
      const startOfWeek = new Date(
         today.setDate(today.getDate() - today.getDay())
      );
      const endOfWeek = new Date(
         today.setDate(today.getDate() - today.getDay() + 6)
      );
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      let filterCondition = {};

      switch (filter) {
         case "today":
            filterCondition = {
               dueDate: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lt: new Date(new Date().setHours(23, 59, 59, 999)),
               },
            };
            break;

         case "thisWeek":
            filterCondition = {
               dueDate: {
                  $gte: startOfWeek,
                  $lt: endOfWeek,
               },
            };
            break;

         case "thisMonth":
            filterCondition = {
               dueDate: {
                  $gte: startOfMonth,
                  $lt: endOfMonth,
               },
            };
            break;

         case "all":
            filterCondition = {};
            break;

         default:
            return res.status(400).json({
               message:
                  "Invalid filter type. Use 'today', 'thisWeek', 'thisMonth', or 'all'.",
            });
      }

      if (status) {
         filterCondition.status = status;
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

//  GET route to fetch TODO projects
export const getTodoProjects = async (req, res) => {
   const userId = req.user.id;
   try {
      const projects = await Project.find({
         createdBy: userId,
         status: "TODO",
      });
      res.status(200).json({ projects });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

//  GET route to fetch PROGRESS projects
export const getProgressProjects = async (req, res) => {
   const userId = req.user.id;
   try {
      const projects = await Project.find({
         createdBy: userId,
         status: "PROGRESS",
      });
      res.status(200).json({ projects });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

//  GET route to fetch BACKLOG projects
export const getBacklogProjects = async (req, res) => {
   const userId = req.user.id;
   try {
      const projects = await Project.find({
         createdBy: userId,
         status: "BACKLOG",
      });
      res.status(200).json({ projects });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

//  GET route to fetch DONE projects
export const getDoneProjects = async (req, res) => {
   const userId = req.user.id;
   try {
      const projects = await Project.find({
         createdBy: userId,
         status: "DONE",
      });
      res.status(200).json({ projects });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

// GET route to fetch project counts
export const getProjectCount = async (req, res) => {
   try {
      const counts = await getProjectCounts(req.user._id);
      res.status(200).json(counts);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};
