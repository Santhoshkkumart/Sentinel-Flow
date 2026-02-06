import Zone from "../models/zoneModel.js";

export const updateCrowd = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentCount, inflowRate } = req.body;

    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    zone.currentCount = currentCount;
    zone.inflowRate = inflowRate;


    const density = currentCount / zone.capacity;

    const riskScore = density * inflowRate;

    if (riskScore > 6) zone.riskLevel = "red";
    else if (riskScore > 3) zone.riskLevel = "yellow";
    else zone.riskLevel = "green";
    await zone.save();
    
    const io = req.app.get("io");
    io.emit("zoneUpdated", zone);

    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createZone = async (req, res) => {
  try {
    const { zoneName, capacity } = req.body;

    if (!zoneName || !capacity) {
      return res.status(400).json({
        message: "zoneName and capacity are required",
      });
    }

    const zone = await Zone.create({
      zoneName,
      capacity,
      currentCount: 0,
      inflowRate: 0,
      riskLevel: "green",
    });

    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort({ createdAt: -1 });
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
