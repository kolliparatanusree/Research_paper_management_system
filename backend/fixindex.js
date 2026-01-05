const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test')
  .then(async () => {
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.db.collection('hoduidrequests');

    // Drop the existing faulty index
    try {
      await collection.dropIndex('uid_1');
      console.log('Old index dropped: uid_1');
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log('Index uid_1 not found (already dropped)');
      } else {
        console.error('Error dropping index:', err);
        process.exit(1);
      }
    }

    // Recreate correct sparse+unique index
    try {
      await collection.createIndex(
        { uid: 1 },
        { unique: true, sparse: true }
      );
      console.log('✅ Sparse unique index on uid created');
    } catch (err) {
      console.error('Error creating index:', err);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
