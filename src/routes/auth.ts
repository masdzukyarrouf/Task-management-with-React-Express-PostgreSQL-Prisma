import { Router } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
router.post("/debug-token", async (req, res) => {
  console.log("=== 🔍 COMPLETE TOKEN ANALYSIS ===");

  const authHeader = req.headers.authorization;
  console.log("1. Full Authorization header:", authHeader);

  if (!authHeader) {
    return res.json({ error: "No authorization header" });
  }

  const parts = authHeader.split(" ");
  console.log("2. Split parts:", parts);
  console.log("3. Number of parts:", parts.length);

  if (parts.length < 2) {
    return res.json({ error: "Not enough parts in authorization header" });
  }

  const token = parts[1];
  console.log("4. Raw token:", token);
  console.log("5. Token length:", token.length);
  console.log("6. Token type:", typeof token);

  // Check if it looks like a JWT
  const tokenParts = token.split(".");
  console.log("7. JWT parts count:", tokenParts.length);
  console.log(
    "8. Part lengths:",
    tokenParts.map((part) => part.length)
  );

  // Try to decode each part
  try {
    if (tokenParts.length === 3) {
      const header = JSON.parse(
        Buffer.from(tokenParts[0], "base64").toString()
      );
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], "base64").toString()
      );
      console.log("9. Decoded header:", header);
      console.log("10. Decoded payload:", payload);
    }
  } catch (e) {
    console.log("11. Cannot decode parts - invalid base64 or JSON");
  }

  // Check your JWT secret
  console.log("12. JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log("13. JWT_SECRET length:", process.env.JWT_SECRET?.length);
  console.log(
    "14. JWT_SECRET preview:",
    process.env.JWT_SECRET?.substring(0, 10) + "..."
  );

  // Try manual verification to see exact error
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    console.log("✅ Token is valid! Payload:", payload);
    return res.json({
      status: "valid",
      payload: payload,
      tokenAnalysis: {
        isJWT: true,
        parts: tokenParts.length,
        header: tokenParts[0],
        payload: tokenParts[1],
        signature: tokenParts[2],
      },
    });
  } catch (error) {
    // console.log("❌ Verification failed:", error.message);
    console.log("❌ Error details:", error);

    return res.json({
      status: "invalid",
      error: error,
      tokenAnalysis: {
        isJWT: tokenParts.length === 3,
        parts: tokenParts.length,
        rawToken: token,
        tokenLength: token.length,
        issues:
          tokenParts.length !== 3
            ? "Not a JWT format (should have 3 parts)"
            : "JWT format but verification failed",
        key: process.env.JWT_SECRET,
        token: token,
      },
    });
  }
});
// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    res.json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
