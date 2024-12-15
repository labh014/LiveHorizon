import { User} from "../models/userModel.js"
import httpStatus from 'http-status'

export const checkTokenExpiry = async (req, res, next) => {
  const { token } = req.body; // or `req.headers` depending on your implementation
  try {
    const user = await User.findOne({ token });
    if (user) {
      if (new Date() > user.tokenExpiry) {
        user.token = null;
        user.tokenExpiry = null;
        await user.save();
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Token expired, please log in again" });
      }
      next(); // Token is still valid
    } else {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
  }
};

