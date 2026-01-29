import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default function (req, res, next) {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "buM@xfiySoz", async (err, decodedToken) => {
      if (err) {
        // token invalid or expired — don't redirect here, just clear req.userId and continue.
        console.log("JWT verify error in user middleware:", err.message);
        req.userId = null;
        next();
        return;
      } else {
        try {
          const user = await User.findById(decodedToken.id);
          // user may be null in mock mode or if the user was removed
          req.userId = user ? user._id : null;
        } catch (e) {
          console.error("Error loading user in middleware:", e.message || e);
          req.userId = null;
        }
        next();
      }
    });
  } else {
    next();
  }
}
