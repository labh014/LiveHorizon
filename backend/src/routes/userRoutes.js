import { Router } from "express";
import { login, register, getHistory, addHistory } from "../controller/userController.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/get-to-history").get(getHistory)
router.route("/add-to-history").post(addHistory)



export default router;