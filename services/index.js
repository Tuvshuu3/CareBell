const express = require("express");
const {
  connectToDatabase,
  getUsersCollection,
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

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...publicUser } = user;
  return publicUser;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/login", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password || "";

  if (username === "admin" && password === "admin") {
    res.json({ role: "admin", username: "admin" });
    return;
  }

  const user = await getUsersCollection().findOne({ username });

  if (!user || user.password !== password) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }

  res.json({
    userId: user._id,
    username: user.username,
    role: user.role,
    patientId: user.role === "patient" ? user._id : undefined,
  });
});

app.post("/users", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password || "";
  const role = req.body.role;

  if (!username || !password || !["caretaker", "patient"].includes(role)) {
    res
      .status(400)
      .json({ message: "Username, password, and role are required" });
    return;
  }

  const usersCollection = getUsersCollection();
  const existingUser = await usersCollection.findOne({ username });

  if (existingUser) {
    res.status(409).json({ message: "Username already exists" });
    return;
  }

  const user = {
    username,
    password,
    role,
  };

  if (role === "caretaker") {
    user.patientIds = [];
  }

  if (role === "patient") {
    user.name = username;
    user.age = req.body.age ? Number(req.body.age) : "";
    user.profile = req.body.profile || "";
    user.medicines = [];
  }

  const result = await usersCollection.insertOne(user);

  res.status(201).json({
    userId: result.insertedId,
    username: user.username,
    role: user.role,
    patientId: role === "patient" ? result.insertedId : undefined,
  });
});

app.get("/users", async (req, res) => {
  const users = await getUsersCollection()
    .find({ role: { $in: ["patient", "caretaker"] } }, { projection: { password: 0 } })
    .toArray();

  res.json(users);
});

app.delete("/users/:userId", async (req, res) => {
  const userObjectId = toObjectId(req.params.userId);

  if (!userObjectId) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  const usersCollection = getUsersCollection();
  const user = await usersCollection.findOne({ _id: userObjectId });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.role === "patient") {
    await usersCollection.updateMany(
      { role: "caretaker" },
      { $pull: { patientIds: userObjectId } }
    );
  }

  await usersCollection.deleteOne({ _id: userObjectId });
  res.sendStatus(204);
});

app.get("/patients", async (req, res) => {
  const patients = await getUsersCollection()
    .find({ role: "patient" }, { projection: { password: 0 } })
    .toArray();
  res.json(patients);
});

app.get("/patients/:patientId", async (req, res) => {
  const patientObjectId = toObjectId(req.params.patientId);

  if (!patientObjectId) {
    res.status(400).json({ message: "Invalid patient id" });
    return;
  }

  const patient = await getUsersCollection().findOne(
    {
      _id: patientObjectId,
      role: "patient",
    },
    { projection: { password: 0 } }
  );

  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.json(patient);
});

app.get("/caretakers/:caretakerId/patients", async (req, res) => {
  const caretakerObjectId = toObjectId(req.params.caretakerId);

  if (!caretakerObjectId) {
    res.status(400).json({ message: "Invalid caretaker id" });
    return;
  }

  const caretaker = await getUsersCollection().findOne({
    _id: caretakerObjectId,
    role: "caretaker",
  });

  if (!caretaker) {
    res.status(404).json({ message: "Caretaker not found" });
    return;
  }

  const patients = await getUsersCollection()
    .find(
      { _id: { $in: caretaker.patientIds || [] }, role: "patient" },
      { projection: { password: 0 } }
    )
    .toArray();

  res.json(patients);
});

app.post("/caretakers/:caretakerId/patients", async (req, res) => {
  const caretakerObjectId = toObjectId(req.params.caretakerId);
  const username = req.body.username?.trim();

  if (!caretakerObjectId || !username) {
    res
      .status(400)
      .json({ message: "Caretaker id and patient username are required" });
    return;
  }

  const patientUser = await getUsersCollection().findOne({
    username,
    role: "patient",
  });

  if (!patientUser) {
    res.status(404).json({ message: "Patient username not found" });
    return;
  }

  const result = await getUsersCollection().updateOne(
    { _id: caretakerObjectId, role: "caretaker" },
    { $addToSet: { patientIds: patientUser._id } }
  );

  if (result.matchedCount === 0) {
    res.status(404).json({ message: "Caretaker not found" });
    return;
  }

  res.status(201).json(toPublicUser(patientUser));
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
  const result = await getUsersCollection().updateOne(
    { _id: patientObjectId, role: "patient" },
    { $push: { medicines: medicine } }
  );

  if (result.matchedCount === 0) {
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
    const result = await getUsersCollection().updateOne(
      { _id: patientObjectId, role: "patient", "medicines.id": medicineId },
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
    const result = await getUsersCollection().updateOne(
      { _id: patientObjectId, role: "patient", "medicines.id": medicineId },
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

  const result = await getUsersCollection().updateOne(
    { _id: patientObjectId, role: "patient" },
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
