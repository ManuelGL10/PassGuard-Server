import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import Password from './schemas/Password';
import { sendPush } from './pushServer';
import Suscription from './schemas/Suscription';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.SERVER_PORT;

// Middleware configuration
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Routes
// Route to get all passwords
app.get('/get_passwords', async (req: Request, res: Response) => {
  try {
    const passwords = await Password.find();
    res.status(200).json(passwords);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving passwords', error });
  }
});

// Route to add a new password
app.post('/post_passwords', async (req: Request, res: Response) => {
  const { nombre, tipo_elemento, url, password } = req.body;

  if (!nombre || !tipo_elemento || !url || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const nuevaPassword = new Password({ nombre, tipo_elemento, url, password });
    await nuevaPassword.save();
    res.status(201).json(nuevaPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la contraseña.', error });
  }
});

// Route to delete a password by ID
app.delete('/delate/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await Password.findByIdAndDelete(id);
    res.status(200).json({ message: 'Password deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting password', error });
  }
});

// Route to add a new subscription
app.post('/suscription', async (req: Request, res: Response) => {
  const suscriptionData = req.body;

  try {
    const suscription = new Suscription(suscriptionData);
    await suscription.save();
    res.status(200).json({ message: 'Suscripción añadida exitosamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar la nueva suscripción' });
  }
});

app.post('/sendPush', async (req: Request, res: Response) => {
  const pushSubscription = req.body;

  try {
    await sendPush(pushSubscription);
    res.status(200).json({ message: 'Push notification sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send push notification.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

