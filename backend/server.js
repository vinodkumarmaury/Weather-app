const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { credential } = require('firebase-admin');
const cors = require('cors');

dotenv.config();

const serviceAccount = require('./databaseSDK.json');

// Initialize Firebase Admin SDK
let adminApp;
try {
  adminApp = initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: 'YOUR_DATABASE_URL' // Optional if using Firestore
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit the process if Firebase Admin SDK initialization fails
}

// Get a Firestore instance
const adminDb = getFirestore(adminApp);

const app = express();

// Enable CORS middleware
app.use(cors());

// Parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on ${PORT} ...`);
});

// Generating JWT
app.post("/user/generateToken", (req, res) => {
  const { username, password } = req.body;
  if (username === "valid_username" && password === "valid_password") {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
      time: Date(),
      userId: 12,
    };
    const token = jwt.sign(data, jwtSecretKey);
    res.send(token);
  } else {
    res.status(401).send("Invalid username or password");
  }
});

// Signup - Store user data in Firestore
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const usersRef = adminDb.collection('users'); // Reference the 'users' collection
    const newUserRef = await usersRef.add({ firstName, lastName, email, password }); // Use 'add' method to add a new document to the collection

    console.log('User data saved:', newUserRef.id);
    res.status(200).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ message: 'Failed to sign up user' });
  }
});

// Signin - Validate user credentials
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersRef = adminDb.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.password === password) {
        res.status(200).json({ message: 'Sign-in successful', user: userData });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verification of JWT
app.post('/user/validateToken', (req, res) => {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const token = req.header(tokenHeaderKey);

    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return res.send("Successfully Verified");
    } else {
      return res.status(401).send("Invalid token");
    }
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
});
