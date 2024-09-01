import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
/*
    bcrypt.hashSync(password, saltRounds)   -> password hash
    bcrypt.compareSync(password, hash)      -> boolean
*/
const userRouter = Router();

// npm i bcrypt jsonwebtoken

userRouter.post("/signup", async (req, res) => {
  try {
    const { name, password, email } = req.body;

    const newUser = await User.create({
      name,
      password: bcrypt.hashSync(password, 9),
      email,
      boards: [],
    });
    res.json(newUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(404)
        .json({ message: "Please provide email and password!" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password, user.password))) {
      // 404
      return res.status(404).json({ message: "incorrect or password" });
    }
    // const correct = await bcrypt.compare(password, user.password);
    // if (!correct) {
    //   return res.status(401).json({ message: "wrong password" });
    // }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    console.log("token", token);
    res.status(200).json({
      status: "success",
      token,
      data: {
        data: user,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// npmjs.com/jsonwebtoken

export default userRouter;
