const express    = require("express");
const {
  createRecurring,
  getRecurring,
  pauseRecurring,
  resumeRecurring,
  cancelRecurring,
  deleteRecurring,
} = require("../controllers/RecurringController");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

router.route("/").post(protect, createRecurring).get(protect, getRecurring);
router.put("/:id/pause",   protect, pauseRecurring);
router.put("/:id/resume",  protect, resumeRecurring);
router.put("/:id/cancel",  protect, cancelRecurring);
router.delete("/:id",      protect, deleteRecurring);

module.exports = router;