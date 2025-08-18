import Org from "../models/org_model.js";
import mongoose from "mongoose";

export const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const existingOrg = await Org.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({ success: false, message: "Organization already exists" });
    }

    const organization = await Org.create({
      name,
      createdBy: req.user.id,
      admins: [req.user.id],
    });

    await organization.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'admins', select: 'name email' }
    ]);

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create organization"
    });
  }
};

export const getAllOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Org.countDocuments(filter);
    const organizations = await Org.find(filter)
      .populate("createdBy", "name email")
      .populate("admins", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: organizations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizations"
    });
  }
};

export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid organization ID" });
    }

    const organization = await Org.findById(id)
      .populate("createdBy", "name email")
      .populate("admins", "name email");

    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    return res.status(200).json({ success: true, data: organization });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization"
    });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, admins, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid organization ID" });
    }

    const organization = await Org.findById(id);
    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    const updateData = {};
    if (name) {
      const existingOrg = await Org.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existingOrg) {
        return res.status(409).json({ success: false, message: "Organization name already exists" });
      }
      updateData.name = name.trim();
    }

    if (Array.isArray(admins)) {
      const valid = admins.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!valid) return res.status(400).json({ success: false, message: "Invalid admin ID(s)" });
      updateData.admins = admins;
    }

    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await Org.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "name email")
      .populate("admins", "name email");

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update organization"
    });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid organization ID" });
    }

    const organization = await Org.findById(id);
    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    if (permanent === "true") {
      await Org.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Organization permanently deleted" });
    }

    const deactivated = await Org.findByIdAndUpdate(id, { isActive: false }, { new: true })
      .populate("createdBy", "name email")
      .populate("admins", "name email");

    return res.status(200).json({
      success: true,
      message: "Organization deactivated successfully",
      data: deactivated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete organization"
    });
  }
};
