const Project = require("../models/Project");
const User = require("../models/User");
const Episode = require("../models/Episode");
const catchAsync = require("../utils/catchAsync");

// Create a Project
exports.createProject = catchAsync(async (req, res) => {
  const { title, description } = req.body;

  try {
    const project = new Project({ title, description, user: req.user._id });
    const savedProject = await project.save();

    req.user.projects.push(savedProject._id);
    await req.user.save(); // Save the user with the updated project array

    res.status(201).json(savedProject);
  } catch (err) {
    res.status(400).json({ message: "Failed to create project" });
  }
});

// Read all Projects for a User
exports.getProjects = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "projects",
      populate: { path: "episodes" },
    });

    res.json(user.projects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Update a Project
exports.updateProject = catchAsync(async (req, res) => {
  const { title, description } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    project.title = title;
    project.description = description;
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: "Failed to update project" });
  }
});

// Delete a Project
exports.deleteProject = catchAsync(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await project.remove();

    req.user.projects.pull(project._id); // Remove project from user's project array
    await req.user.save(); // Save user after removal

    res.json({ message: "Project removed" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete project" });
  }
});

// Add Episode to a Project
exports.addEpisode = catchAsync(async (req, res) => {
  const { title, content } = req.body;
  try {
    const project = await Project.findById(req.params.projectId);
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const episode = new Episode({
      title,
      content,
      project: req.params.projectId,
    });
    const savedEpisode = await episode.save();
    project.episodes.push(savedEpisode._id);
    await project.save();
    res.status(201).json(savedEpisode);
  } catch (err) {
    res.status(400).json({ message: "Failed to add episode" });
  }
});
