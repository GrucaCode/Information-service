import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Nieprawidłowy e-mail lub hasło. Spróbuj jeszcze raz"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Nieprawidłowy e-mail lub hasło. Spróbuj jeszcze raz"
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    res.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Błąd serwera"
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.json({ 
      loggedIn: true, 
      user: req.session.user 
    });
  }
  res.json({ loggedIn: false });
});

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false, 
        message: 'Ten użytkownik posiada już profil w aplikacji. Podaj inne dane lub zaloguj się'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    return res.json({
      success: true, 
      message: 'Zarejestrowano pomyślnie'
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ 
      success: false, 
      message: 'Błąd serwera przy rejestracji'
    });
  }
});

export default router;