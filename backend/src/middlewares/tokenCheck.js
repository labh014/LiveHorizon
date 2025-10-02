import { User} from "../models/userModel.js"
import httpStatus from 'http-status'

// Sliding 1-day inactivity timeout and Authorization header support
export const checkTokenExpiry = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const bearerToken = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    const token = bearerToken || req.body?.token || req.query?.token;

    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Missing token" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    if (!user.tokenExpiry || new Date() > new Date(user.tokenExpiry)) {
      user.token = null;
      user.tokenExpiry = null;
      await user.save();
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Token expired, please log in again" });
    }

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 1);
    user.tokenExpiry = newExpiry;
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
  }
};

