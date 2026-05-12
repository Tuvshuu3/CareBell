const medicines = require("../src/medicines.json");
const {
  closeDatabaseConnection,
  connectToDatabase,
  getPatientsCollection,
} = require("./mongodb");

async function seed() {
  await connectToDatabase();
  const patientsCollection = getPatientsCollection();

  await patientsCollection.deleteMany({});
  const result = await patientsCollection.insertMany(medicines);

  console.log(`added ${result.insertedCount}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
