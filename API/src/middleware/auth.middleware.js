import jwt from "jsonwebtoken";
import User from '../model/user.schema.js'



export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" ,err});
  }
}

export const adminOnly = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.user; 
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};

