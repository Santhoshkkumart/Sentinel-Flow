import express from "express";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/video", videoRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
