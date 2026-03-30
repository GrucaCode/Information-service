import express from 'express';
import SavedArticle from '../models/SavedArticle.js';

const router = express.Router();

// middleware
function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ success:false, message:'Musisz być zalogowany' });
  next();
}

// zapisywanie artykułu
router.post('/', requireAuth, async (req, res) => {
  try {
    const { id: newsId } = req.body;
    if (!newsId) return res.status(400).json({ success:false, message:'There is no article id' });

    const existing = await SavedArticle.findOne({ 
      where: { 
        userId: req.session.user.id,
        newsId
      } 
    });

    if (existing) {
      return res.status(200).json({
        success:true,
        message:'Artykuł został już zapisany wcześniej' 
      });
    }

    const saved = await SavedArticle.create({
      userId: req.session.user.id,
      newsId
      // title,
      // url, 
      // image: image || null,
      // summary: summary || null,
      // text: text || null,
      // publishedAt: publishedAt ? new Date(publishedAt) : null,
      // author: author
    });

    res.status(201).json({
      success:true,
      item: saved 
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      success:false,
      message:'Błąd zapisu'
    });
  }
});   

router.get('/', requireAuth, async (req, res) => {
  try {
    const sort = (req.query.sort || 'newest');
    const order = sort === 'oldest' ? 'ASC' : 'DESC';
    const ids = await SavedArticle.findAll({
      where: { userId: req.session.user.id },
      order: [['createdAt', order]]
    });

    res.json({ success:true, ids });
  } catch (err) {
    console.error(err);
    
    res.status(500).json({ 
      success:false,
      message:'Błąd pobierania listy'
    });
  }
});

// pobranie jednego zapisu
// router.get('/:id', requireAuth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const item = await SavedArticle.findOne({
//       where: { id, userId: req.session.user.id }
//     });
//     if (!item) return res.status(404).json({ success: false, message: 'Nie znaleziono artykułu. Możliwe, że został usunięty ze strony źródłowej. Najlepiej usunąć go z listy zapisanych wiadomości' });
//     res.json({ success: true, item });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ success: false, message: 'Błąd pobierania zapisu' });
//   }
// });

router.delete('/:newsId', requireAuth, async (req, res) => {
  try {
    const { newsId } = req.params;

    const rows = await SavedArticle.destroy({
      where: {
        newsId, 
        userId: req.session.user.id
      }
    });

    if (!rows) {
      return res.status(404).json({ 
        success:false,
        message:'Article has not been found'
      });
    } 
    res.json({ success:true });

  } catch (err) {
    console.error(err);

    res.status(500).json({ 
      success:false, 
      message:'Failed to delete article'
    });
  }
});

export default router;
