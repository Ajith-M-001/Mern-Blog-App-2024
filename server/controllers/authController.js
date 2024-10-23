import User from "../Schema/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import admin from "firebase-admin";
import serviceAccountKey from "../mern-blog-2024-firebase-adminsdk-2u9a2-06a7e784f3.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  // Check for required fields
  if (!fullname || !email || !password) {
    return res.status(400).json({ message: "Required fields cannot be empty" });
  }

  try {
    // Create a base username from the email
    let baseUsername = email.split("@")[0];

    // Function to generate a unique username
    const generateUniqueUsername = async (base) => {
      let randomNum = Math.floor(100 + Math.random() * 900);
      let newUsername = `${base}${randomNum}`;
      const userNameExist = await User.findOne({
        "personal_info.username": newUsername,
      }); // Check if username exists
      return userNameExist ? generateUniqueUsername(base) : newUsername; // If exists, generate a new one
    };

    // Generate a unique username
    let username = await generateUniqueUsername(baseUsername);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await User.create({
      personal_info: { fullname, email, password: hashedPassword, username },
    });

    // Respond with the created user
    res.status(201).json({
      fullname: user.personal_info.fullname,
      email: user.personal_info.email,
      profile_img: user.personal_info.profile_img,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(500).json({ message: "Email Already Exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email exists
    const user = await User.findOne({ "personal_info.email": email });

    // If user not found, respond with an error
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      user.personal_info.password
    );

    // If password is invalid, respond with an error
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate an access token with 3 days expiration
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // Your JWT secret from .env
      { expiresIn: "3d" } // Token expiration time set to 3 days
    );

    // If everything is valid, respond with user information and the access token
    res.status(200).json({
      user: {
        fullname: user.personal_info.fullname,
        email: user.personal_info.email,
        username: user.personal_info.username,
        bio: user.personal_info.bio,
        profile_img: user.personal_info.profile_img,
      },
      access_token: accessToken, // Include the access token in the response
      message: "Signin successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { access_token } = req.body;

    // Verify the access token with Firebase Admin SDK
    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name, picture } = decodedUser;

    // Update the picture URL to use a different size
    const updatedPicture = picture.replace("s96-c", "s348-c");

    // Check if the user exists in the database
    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.fullname personal_info.email personal_info.username personal_info.profile_img google_auth"
    );
    // Generate an access token with 3 days expiration
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // Your JWT secret from .env
      { expiresIn: "3d" } // Token expiration time set to 3 days
    );

    if (user) {
      if (!user.google_auth) {
        // User exists but not authenticated via Google, send appropriate error response
        return res.status(403).json({
          message:
            "This email is already registered with a password, please login with your password",
        });
      }

      // Respond with existing Google authenticated user details
      return res.status(200).json({
        user: {
          fullname: user.personal_info.fullname,
          email: user.personal_info.email,
          username: user.personal_info.username,
          profile_img: user.personal_info.profile_img,
        },
        access_token: accessToken,
        message: "Google sign-in successful",
      });
    } else {
      // If user does not exist, create a new one
      let baseUsername = email.split("@")[0];

      // Make sure `generateUniqueUsername` function is available
      const generateUniqueUsername = async (base) => {
        let randomNum = Math.floor(100 + Math.random() * 900);
        let newUsername = `${base}${randomNum}`;
        const userNameExist = await User.findOne({
          "personal_info.username": newUsername,
        });
        return userNameExist ? generateUniqueUsername(base) : newUsername;
      };

      let username = await generateUniqueUsername(baseUsername);

      user = await User.create({
        personal_info: {
          fullname: name,
          email: email,
          username: username,
        },
        access_token: accessToken,
        google_auth: true,
      });

      // Respond with the newly created Google user details
      return res.status(201).json({
        user: {
          fullname: user.personal_info.fullname,
          email: user.personal_info.email,
          username: user.personal_info.username,
          profile_img: user.personal_info.profile_img,
        },
        message: "User created and signed in successfully via Google",
      });
    }
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id: user_id } = req.user; // Assuming `req.user` contains the authenticated user's ID


    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Required fields can't be empty" });
    }

    // Find the user by ID
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is using Google Authentication
    if (user.google_auth) {
      return res.status(403).json({
        message:
          "You can't change this account's password because you logged in through Google",
      });
    }

    // Compare the current password with the stored hash
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.personal_info.password
    );

    if (!isMatch) {
      return res.status(403).json({ message: "Incorrect current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.findByIdAndUpdate(user_id, {
      "personal_info.password": hashedPassword,
    });

    // Send success response
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message:
        "An error occurred while changing the password. Please try again later.",
    });
  }
};
