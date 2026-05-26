const { Visitor } = require("../models");

const registerVisitor = async (req, res) => {
  const { full_name, phone_number, purpose, host_name, time_in } = req.body;
  if (!full_name || !purpose) {
    return res.status(400).json({ message: "Name and purpose required" });
  }

  try {
    const now = time_in || new Date();
    const visitor = await Visitor.create({
      full_name,
      phone_number,
      purpose,
      host_name,
      time_in: now,
    });
    res
      .status(201)
      .json({ message: "Visitor registered", visitorId: visitor.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateVisitorExit = async (req, res) => {
  const { id } = req.params;
  try {
    const visitor = await Visitor.findByPk(id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    await visitor.update({ time_out: new Date() });
    res.json({ message: "Exit time recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.findAll({ order: [["time_in", "DESC"]] });
    res.json(visitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerVisitor, updateVisitorExit, getAllVisitors };
