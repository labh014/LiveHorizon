import { User} from "../models/userModel.js"
import { Meeting} from "../models/meetingModel.js"

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import httpStatus from 'http-status'



const register = async (req, res) => {
  const { name, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(httpStatus.FOUND).json({ message: "User existing" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      password: hashPassword,
      username: username,
    })
    newUser.save();
    return res.status(httpStatus.CREATED).json({ message: "User registered" });
  }
  catch (error) {
    return res.status(httpStatus.NOT_FOUND).json({ message: "Error registering user" })
  }
}


const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Enter correct information" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = crypto.randomBytes(20).toString("hex");
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 1); // Set expiry to 1 day from now

      user.token = token;
      user.tokenExpiry = tokenExpiry;
      await user.save();

      return res.status(httpStatus.OK).json({ token: token });
    } else {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
  }
};


const getHistory = async (req, res) => {
  const { token } = req.query;
  try {
    console.log(token)
    const user = await User.findOne({ token: token });
    console.log(user)
    const meeting = await Meeting.find({ userId: user.username });
    console.log("labh")
    
    console.log(meeting)
    res.json(meeting)

  }
  catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
  }

}

const addHistory = async (req, res) => {
  const { token, meeting_code } = req.body;
  try {
    
    const user = await User.findOne({ token: token })
    console.log(user)
    const newMeeting = new Meeting(
      {
        userId: user.username,
        meetingCode: meeting_code
        
      }
    )
    console.log("labhlabhlabh")
    console.log(user, meeting_code)
    await newMeeting.save();
    
    return res.status(httpStatus.CREATED).json({ message: "History added" })

  }
  catch (e) {
    res.json({ message: `Something went wrong ${e}` })
}
}
export { login, register, getHistory, addHistory }