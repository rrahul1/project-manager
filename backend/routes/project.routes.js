import express from "express";
import { verifyUser } from "../helpers/authentication.js";
import {
   createProject,
   filterProjects,
   getProjectCounts,
   deleteProject,
   updateProjectStatus,
} from "../controller/project.controller.js";

const router = express.Router();

router.post("/create-project", verifyUser, createProject);
router.get("/get-projects/:filter", verifyUser, filterProjects);
router.get("/project-count", verifyUser, getProjectCounts);

export default router;
