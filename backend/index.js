// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const hodRoutes = require('./routes/hodRoutes');
const principalRoutes = require('./routes/principalRoutes');
const mainAdminRoutes = require('./routes/mainadminRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (NO deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));


app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/principal', principalRoutes);
app.use('/api/main-admin', mainAdminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// // backend/index.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const adminRoutes = require('./routes/adminRoutes');
// const facultyRoutes = require('./routes/facultyRoutes');
// const hodRoutes = require('./routes/hodRoutes');
// const principalRoutes = require('./routes/principalRoutes');
// const mainAdminRoutes = require('./routes/mainadminRoutes');
// // const HodUidRequest = require('./models/hodUidRequest'); 

// const app = express();
// app.use(cors());
// app.use(express.json());




// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/faculty', facultyRoutes);
// app.use('/api/hod', hodRoutes);
// app.use('/api/principal', principalRoutes);
// app.use('/api/main-admin',mainAdminRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
