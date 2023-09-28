require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
require("dotenv").config();

// const secretKey = process.env.SECRET_KEY;
const secretKey = "toto";
const BASE_URL = "http://localhost:3002";

router.post("/register", async (req, res) => {
  try {
    const { username, password, timestamp } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = { username, password: hashedPassword, timestamp };

    api_url = BASE_URL + "/users";
    console.log("okay");
    const response = await axios.post(api_url, user, { validateStatus: false });
    console.log(response);

    if (response.status == 201) {
      res.status(201).json({ message: "User registered successfully" });
    } else if (response.status == 409) {
      res.status(409).json({ message: "Username already exists" });
    } else {
      res.status(500).json({ message: "User registration failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/logout", (req, res) => {
 
  res.cookie("token", null, {
    httpOnly: true,
    maxAge: 0, 
   
  });

  return res.status(200).json({ message: "Logout successful" });
});

router.post("/refresh-token", (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Decode the refresh token to get the username (no verification here)
    const decoded = jwt.decode(refreshToken);
    const username = decoded.username;

    // Generate a new JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
