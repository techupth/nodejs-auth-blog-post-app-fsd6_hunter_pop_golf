import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../utils/db.js";
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
  //body required.
  const user = {
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };

  //
  const salt = await bcrypt.genSalt(10); //
  user.password = await bcrypt.hash(user.password, salt); //เข้ารหัส password

  const collection = db.collection("users"); //เข้าถึง db/users

  //Check already username
  const validAccount = await collection.findOne({ username: user.username });
  if (validAccount !== null) {
    return res.status(409).json({ message: "Username already exists." });
  }
  //Create User
  try {
    await collection.insertOne(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }

  return res.status(201).json({ message: "Register successfully!" });
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
  const user = await db
    .collection("users")
    .findOne({ username: req.body.username });

  //check username
  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }
  //check password
  const isInvalidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isInvalidPassword) {
    return res.status(401).json({ message: "Password invalid" });
  }

  //gen token with json web token
  const token = jwt.sign(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "90000", //expire token
    }
  );
  return res.status(201).json({ message: "Login Successfully!", token: token });
});

export default authRouter;
