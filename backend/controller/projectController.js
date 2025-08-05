import { json } from "express";
import Project from "../models/project_model.js";
import TeamMember from "../models/team_member_model.js";
import mongoose from "mongoose";

export const createProject = async (req, res) => {
  try {
    const { name, description, endDate, teamId } = req.body;

    if (!name || !description || !endDate || !teamId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!req.user.isAdmin) {
      const membership = await TeamMember.findOne({
        user: req.user.id,
        team: teamId,
        role: "team_lead",
      });

      if (!membership) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Only team leads can create projects for their team",
          });
      }
    }
    const project = await Project.create({
      name,
      description,
      endDate,
      team:teamId,
      createdBy: req.user.id,
    });

    return res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("Error creating project:", err.message);
    
    return res
      .status(500)
      .json({ success: false, message: "Server error while creating project" });
  }
};

export const getProject = async (req, res) => {
  try {
    let projects;

    if (req.user.isAdmin) {
      projects = await Project.find();
    } else {
      const memberships = await TeamMember.find({ user: req.user.id });

      const teamIds = memberships.map((m) =>
        new mongoose.Types.ObjectId(m.team)
      );

      projects = await Project.find({ team: { $in: teamIds } });
    }



    return res.status(200).json({ success: true, projects });
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};


export const getProjectById = async (req, res) => {
  try {
    const projectWithTasks = await Project.findById(req.project._id)
      .populate({
        path: "tasks",
        populate: {
          path: "assignedTo assignedBy createdById",
          select: "name email",
        },
      })
      .populate("team", "name");

    return res.status(200).json({ success: true, project: projectWithTasks });
  } catch (err) {
    console.error("Error in getProjectById:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error while fetching project" });
  }
};
export const editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, teamId, status } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user.isAdmin) {
      if (name) project.name = name;
      if (description) project.description = description;
      if (teamId) project.teamId = teamId;
      if (status) project.status = status;

      await project.save();

      return res
        .status(200)
        .json({ message: "Project updated successfully", project });
    }

    if (req.user.role === "team_lead") {
      if (project.teamId.toString() !== req.user.teamId.toString()) {
        return res
          .status(403)
          .json({ message: "You can only update projects from your own team" });
      }

      if (name) project.name = name;
      if (description) project.description = description;
      if (status) project.status = status;

      await project.save();

      return res
        .status(200)
        .json({ message: "Project updated successfully", project });
    }

    return res
      .status(403)
      .json({ message: "You don't have permission to update this project" });
  } catch (error) {
    console.error("Error updating project:", error.message);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
