// dropUidIndex.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/test'; // Replace with your DB URI if different

async function dropUidIndex() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('hoduidrequests');

    const indexes = await collection.indexes();
    const hasUidIndex = indexes.some(idx => idx.name === 'uid_1');

    if (hasUidIndex) {
      await collection.dropIndex('uid_1');
      console.log('Dropped index: uid_1');
    } else {
      console.log('Index uid_1 not found');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Failed to drop index:', err);
  }
}

dropUidIndex();
