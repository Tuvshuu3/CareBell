const express = require("express");
const {
  connectToDatabase,
  getPatientsCollection,
  toObjectId,
} = require("./mongodb");

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/patients", async (req, res) => {
  const patients = await getPatientsCollection().find({}).toArray();
  res.json(patients);
});

app.get("/patients/:patientId", async (req, res) => {
  const patientObjectId = toObjectId(req.params.patientId);

  if (!patientObjectId) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const patient = await getPatientsCollection().findOne({
    _id: patientObjectId,
  });

  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.json(patient);
});

app.post("/patients", async (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    res.status(400).json({ message: "Patient name is required" });
    return;
  }

  const patient = {
    name,
    profile: req.body.profile || "",
    medicines: [],
  };
  const result = await getPatientsCollection().insertOne(patient);

  res.status(201).json({
    ...patient,
    _id: result.insertedId,
  });
});

app.post("/patients/:patientId/medicines", async (req, res) => {
  const patientObjectId = toObjectId(req.params.patientId);

  if (!patientObjectId) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const medicine = {
    id: Date.now(),
    name: req.body.name,
    dosage: req.body.dosage,
    intervalHours: Number(req.body.intervalHours),
    image: req.body.image || "",
    courses: req.body.courses || [],
    doseLogs: req.body.doseLogs || [],
  };
  const result = await getPatientsCollection().findOneAndUpdate(
    { _id: patientObjectId },
    { $push: { medicines: medicine } },
    { returnDocument: "after" }
  );

  if (!result) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.status(201).json(medicine);
});

app.post(
  "/patients/:patientId/medicines/:medicineId/courses",
  async (req, res) => {
    const patientObjectId = toObjectId(req.params.patientId);
    const medicineId = Number(req.params.medicineId);

    if (!patientObjectId || Number.isNaN(medicineId)) {
      res.status(400).json({ message: "Invalid patient or medicine id" });
      return;
    }

    const course = {
      courseId: Date.now(),
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      active: false,
    };
    const result = await getPatientsCollection().updateOne(
      { _id: patientObjectId, "medicines.id": medicineId },
      { $push: { "medicines.$.courses": course } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Patient or medicine not found" });
      return;
    }

    res.status(201).json(course);
  }
);

app.post(
  "/patients/:patientId/medicines/:medicineId/doseLogs",
  async (req, res) => {
    const patientObjectId = toObjectId(req.params.patientId);
    const medicineId = Number(req.params.medicineId);

    if (!patientObjectId || Number.isNaN(medicineId)) {
      res.status(400).json({ message: "Invalid patient or medicine id" });
      return;
    }

    const doseLog = {
      courseId: req.body.courseId,
      time: req.body.time || new Date().toISOString(),
      status: req.body.status,
    };
    const result = await getPatientsCollection().updateOne(
      { _id: patientObjectId, "medicines.id": medicineId },
      { $push: { "medicines.$.doseLogs": doseLog } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Patient or medicine not found" });
      return;
    }

    res.status(201).json(doseLog);
  }
);

app.delete("/patients/:patientId/medicines/:medicineId", async (req, res) => {
  const patientObjectId = toObjectId(req.params.patientId);
  const medicineId = Number(req.params.medicineId);

  if (!patientObjectId || Number.isNaN(medicineId)) {
    res.status(400).json({ message: "Invalid patient or medicine id" });
    return;
  }

  const result = await getPatientsCollection().updateOne(
    { _id: patientObjectId },
    { $pull: { medicines: { id: medicineId } } }
  );

  if (result.matchedCount === 0) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.sendStatus(204);
});

async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`carebell api running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
