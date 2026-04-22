import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index');
});

router.get('/profile', (req, res) => {
  res.render('pages/profile');
});

router.get('/search', (req, res) => {
  res.render('pages/search');
});

router.get('/article', (req, res) => {
  res.render('pages/article');
});

export default router;