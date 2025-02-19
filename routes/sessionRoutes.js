import express from "express";
import passport from "passport";
import {
  logonShow,
  registerShow,
  registerDo,
  logoff,
} from "../controllers/sessionController.js";

const router = express.Router();

router.route("/register").get(registerShow).post(registerDo);
router.route("/logoff").post(logoff);
router
  .route("/logon")
  .get(logonShow)
  .post(
    passport.authenticate("local", {
      successRedirect: "/jobs/",
      failureRedirect: "/sessions/logon",
      failureFlash: true,
    })
  );

export default router;
