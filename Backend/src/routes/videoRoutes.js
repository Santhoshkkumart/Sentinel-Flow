import express from "express";
import multer from "multer";
import axios from "axios";
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const YOLO = "http://localhost:8000";

router.post("/analyze-video", upload.single("video"), async (req, res) => {
  const videoPath = path.resolve(req.file.path);

  await axios.post(`${YOLO}/load-video`, {
    path: videoPath
  });

  res.json({ success: true });
});

router.get("/stream-video", async (req, res) => {
  const r = await axios.get(`${YOLO}/stream`, { responseType: "stream" });
  res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");
  r.data.pipe(res);
});

router.get("/stats", async (req, res) => {
  const r = await axios.get(`${YOLO}/stats`);
  res.json(r.data);
});

export default router;
