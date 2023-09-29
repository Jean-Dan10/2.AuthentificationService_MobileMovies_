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

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    api_url = BASE_URL + "/users/" + username;

    const response = await axios.get(api_url, { validateStatus: false });
    if (response.status == 200) {
      const passwordMatch = await bcrypt.compare(
        password,
        response.data.user.password
      );
      if (!passwordMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else if (response.status == 404) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(500).json({ message: "User login failed" });
    }

    const token = jwt.sign({ username }, "toto", {
      expiresIn: "1h",
      header: { typ: undefined },
    });

    // Calculate the expiration time in milliseconds (1 hour in this example)
    const expirationTimeMs = 3600000; // 1 hour in milliseconds

    // Calculate the expiration date and time
    const expirationDate = new Date(Date.now() + expirationTimeMs);

    // Convert the expiration date and time to ISO 8601 format
    const isoExpiration = expirationDate.toISOString();

    // Set the cookie with the expires attribute set to the ISO 8601 string
    res.cookie("token", token, {
      httpOnly: true,
      expires: expirationDate, // Use the calculated expiration date
      domain: 'localhost', // Specify the domain as "localhost"
      path: '/', // Specify the path as "/"
    });
    
    res.cookie("username", username, {
      expires: expirationDate, // Use the calculated expiration date
      domain: 'localhost', // Specify the domain as "localhost"
      path: '/', // Specify the path as "/"
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    maxAge: 0,
    domain: 'localhost', // Specify the domain as "localhost" or your desired domain
    path: '/', // Specify the path as "/" or your desired path
  });

  res.cookie("username", null, {
    maxAge: 0,
    domain: 'localhost', // Specify the domain as "localhost" or your desired domain
    path: '/', // Specify the path as "/" or your desired path
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
