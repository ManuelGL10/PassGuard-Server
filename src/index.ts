import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import Password from './schemas/Password';
import { sendPush } from './pushServer';
import User from './schemas/User';
import Suscription from './schemas/Suscription';
import bcrypt from 'bcrypt';

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
app.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar si el correo ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    // Crear el nuevo usuario
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario.', error });
  }
});


app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Cuerpo de la solicitud:", req.body);

  if (!email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Buscar usuario por correo electrónico
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso.', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.', error });
  }
});

app.get('/get_passwords', async (req: Request, res: Response) => {
  try {
    const userId = req.headers.userid as string; // Obtener userId desde los headers

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const passwords = await Password.find({ userId });
    res.status(200).json(passwords);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving passwords', error });
  }
});


// Route to add a new password
app.post('/post_passwords', async (req: Request, res: Response) => {
  const { nombre, tipo_elemento, url, password, userId } = req.body;
  console.log("Datos recibidos:", req.body);

  // Verificar que todos los campos necesarios están presentes
  if (!nombre || !tipo_elemento || !url || !password || !userId) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Crear la nueva contraseña asociada al usuario
    const nuevaPassword = new Password({ nombre, tipo_elemento, url, password, userId });
    await nuevaPassword.save();
    res.status(201).json({ message: 'Contraseña guardada exitosamente', data: nuevaPassword });
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
  const { userId, endpoint, ...subscriptionData } = req.body;

  try {
    // Buscar si ya existe una suscripción con el mismo userId y endpoint
    const existingSubscription = await Suscription.findOne({ userId, endpoint });

    if (existingSubscription) {
      return res.status(200).json({ message: 'El usuario ya está suscrito con este endpoint' });
    }

    // Crear una nueva suscripción
    const newSubscription = new Suscription({
      userId,
      endpoint,
      ...subscriptionData,
    });

    await newSubscription.save();
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

