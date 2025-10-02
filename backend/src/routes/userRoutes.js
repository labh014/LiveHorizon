import { Router } from "express";
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import { fileURLToPath } from 'url'
import { login, register, getHistory, addHistory, me, logout, updateProfile } from "../controller/userController.js";
import { checkTokenExpiry } from "../middlewares/tokenCheck.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/me").get(checkTokenExpiry, me)
router.route("/logout").post(checkTokenExpiry, logout)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', 'uploads', 'avatars')
    try { fs.mkdirSync(dest, { recursive: true }) } catch (e) {}
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `${req.user.username}_${Date.now()}${ext}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg']
    if (allowed.includes(file.mimetype)) return cb(null, true)
    const err = new Error('INVALID_FILE_TYPE')
    return cb(err)
  }
})

router.route("/profile").put(checkTokenExpiry, updateProfile)
router.route("/profile/avatar").post(checkTokenExpiry, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large (max 5MB)' })
      }
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(415).json({ message: 'Only PNG and JPG/JPEG are allowed' })
      }
      return res.status(400).json({ message: 'Upload failed' })
    }
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }
      // If Cloudinary env is set, upload to Cloudinary
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        })
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'livehorizon/avatars',
          resource_type: 'image',
          overwrite: true
        })
        req.user.avatarUrl = result.secure_url
        await req.user.save()
        return res.status(200).json({ avatarUrl: req.user.avatarUrl })
      }
      // fallback to local storage
      const rel = `/uploads/avatars/${req.file.filename}`
      req.user.avatarUrl = rel
      await req.user.save()
      return res.status(200).json({ avatarUrl: req.user.avatarUrl })
    } catch (e) {
      return res.status(500).json({ message: 'Failed to upload avatar' })
    }
  })
})
router.route("/get-to-history").get(checkTokenExpiry, getHistory)
router.route("/add-to-history").post(checkTokenExpiry, addHistory)



export default router;