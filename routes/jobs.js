import express from "express";
import {
  createJob,
  createJobShow,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
} from "../controllers/jobs.js";

const router = express.Router();

// GET /jobs (display all the job listings belonging to this user)
// POST /jobs (Add a new job listing)
router.route("/").post(createJob).get(getAllJobs);

router.route("/addJobForm").get(createJobShow);


// GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
// POST /jobs/update/:id (Update a particular entry)
router.route("/update/:id").post(updateJob);

// POST /JOBS/DELETE/:ID (DELETE AN ENTRY)
router.route("/:id").get(getJob).delete(deleteJob);

export default router;