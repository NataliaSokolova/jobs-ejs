import Job from "../models/Job.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user }).sort("createdAt");
  res.render("jobs", {jobs});
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });

  if (!job) {
    throw new NotFoundError(`No job with ${_id}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const createJobShow = async (req, res) => {
  res.render("addJobForm");
}

const createJob = async (req, res) => {
    try {
        const newJob = new Job({
          company: req.body.company,
          position: req.body.position,
          status: req.body.status.toLowerCase(),
          createdBy: req.user._id,
        });
        await newJob.save();
        res.redirect('/jobs');
      } catch (err) {
        res.status(500).send('Error creating job', err);
      }
};

const updateJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
    body: { company, position },
  } = req;

  if (!company || !position) {
    throw new BadRequestError("Company or Position fields cannot be empty");
  }

  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!job) {
    throw new NotFoundError(`No job with id found`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findByIdAndDelete({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job with ${_id}`);
  }

  res.status(StatusCodes.OK).json({ msg: "The entry was deleted." });
};

export { createJob, deleteJob, getAllJobs, updateJob, getJob, createJobShow };