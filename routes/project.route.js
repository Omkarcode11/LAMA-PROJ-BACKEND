const express = require("express");
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addEpisode,
} = require("../controllers/project.controller");
const protect = require("../middleware/auth.middleware");
const router = express.Router();

router.route("/").get(protect, getProjects).post(protect, createProject);
router.route("/:id").put(protect, updateProject).delete(protect, deleteProject);
router.post("/:projectId/episodes", protect, addEpisode);

module.exports = router;
