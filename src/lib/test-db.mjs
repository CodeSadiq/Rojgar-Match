import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://sadiqimam404_db_user:Imam%402004@cluster0.6v4usao.mongodb.net/?appName=Cluster0";

async function testConnection() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();
