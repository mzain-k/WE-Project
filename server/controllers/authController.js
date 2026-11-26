import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userPayload = (u) => ({
  _id: u._id,
  name: u.name,
  cmsId: u.cmsId,
  batch: u.batch,
  program: u.program,
  role: u.role,
});

export const signup = async (req, res) => {
  try {
    const { name, cmsId, batch, program, password } = req.body;
    if (!name || !cmsId || !batch || !program || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ cmsId });
    if (exists)
      return res.status(409).json({ message: "This CMS ID is already registered" });

    const user = await User.create({ name, cmsId, batch, program, password });
    res.status(201).json({ token: signToken(user._id), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { cmsId, password } = req.body;
    if (!cmsId || !password)
      return res.status(400).json({ message: "CMS ID and password are required" });

    const user = await User.findOne({ cmsId }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid CMS ID or password" });

    res.json({ token: signToken(user._id), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = (req, res) => {
  res.json({ user: userPayload(req.user) });
};