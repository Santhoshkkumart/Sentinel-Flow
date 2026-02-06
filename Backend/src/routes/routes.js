import express from "express";
import { updateCrowd, createZone, getZones } from "../controllers/zoneController.js";

const route = express.Router();

route.post("/", createZone);
route.get("/", getZones);
route.put("/:id/update", updateCrowd);

export default route;