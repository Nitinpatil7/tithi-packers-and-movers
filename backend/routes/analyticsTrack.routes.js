const express = require("express");
const { recordTrafficEvent } = require("../utility/metricsBuffer");

const router = express.Router();

router.post("/", (req, res) => {
  const event = req.body || {};
  if (!["page_view", "click"].includes(event.type)) {
    return res.status(400).json({ success: false, message: "Invalid analytics event type" });
  }
  recordTrafficEvent(event, req);
  return res.status(204).send();
});

module.exports = router;
