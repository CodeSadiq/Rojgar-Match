import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://sadiqimam404_db_user:Imam%402004@cluster0.6v4usao.mongodb.net/?appName=Cluster0";

async function clearJobs() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const result = await db.collection('jobs').deleteMany({});
    console.log(`Deleted ${result.deletedCount} jobs from the collection.`);

    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (err) {
    console.error("Operation failed:", err);
  }
}

clearJobs();
