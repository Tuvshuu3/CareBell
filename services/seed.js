const medicines = require("../src/medicines.json");
const {
  closeDatabaseConnection,
  connectToDatabase,
  getUsersCollection,
} = require("./mongodb");

async function seed() {
  const db = await connectToDatabase();
  const usersCollection = getUsersCollection();

  await db.collection("patients").drop().catch(() => {});

  await Promise.all(
    medicines.map((patient) =>
      usersCollection.updateOne(
        { username: patient.name },
        {
          $set: {
            username: patient.name,
            password: patient.password || "123",
            role: "patient",
            name: patient.name,
            age: patient.age || "",
            profile: patient.profile || "",
            medicines: patient.medicines || [],
          },
        },
        { upsert: true }
      )
    )
  );

  console.log(`seeded ${medicines.length} patient users`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
