const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error(' MongoDB Error: MONGO_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
