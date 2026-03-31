import express from 'express';
import fetch from 'node-fetch';
import { apiKey } from './secret.js';
const router = express.Router();

const WORLDNEWS_BASE = 'https://api.worldnewsapi.com';

router.get('/', async (req, res) => {

  const params = new URLSearchParams ({
    'source-country': 'pl',
    'language': 'pl',
    'categories': 'politics,sports,business',
    'sort': 'publish-time',
    'sort-direction': 'DESC',
    'number': '5',
    'api-key': apiKey,
  });

  const url = `${WORLDNEWS_BASE}/search-news?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || 'Failed to fetch news from API'
      })
    }

    res.json({
      success: true,
      news: data.news,
      number: data.number
    });

  } catch (err) {
    console.error('Błąd API:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get news' 
    });
  }

});

router.get('/retrieve', async (req, res) => {
  const ids = (req.query.ids).trim() || '';

  if (!ids.length) {
    return res.status(400).json ({
      success: false,
      message: 'Lack of ids parameter'
    });
  }

  const params = new URLSearchParams({
    ids,
    'api-key': apiKey
  });

  const url = `${WORLDNEWS_BASE}/retrieve-news?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json ({
        success: false,
        message: data?.message || 'Failed to fetch articles with the given ids'
      });
    }

    res.json ({
      success: true,
      news: data.news || []
    });

  } catch (err) {
    console.error('Retreive news API error', err)
    res.status(500).json ({
      success: false,
      message: 'Failed to retreive articles'
    });
  }

});

router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  
  if (!q) return res.status(400).json({ 
    success: false, 
    message: 'There is no question q' 
  });

  const params = new URLSearchParams({
    'text': q,
    'language': 'pl',
    'source-country': 'pl',
    'number': '10',
    'sort': 'publish-time',
    'sort-direction': 'DESC',
    'api-key': apiKey,
  });

  const url = `${WORLDNEWS_BASE}/search-news?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    res.json({
      success: true,
      ...data 
    });

  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({
      success: false, 
      message: 'Nie udało się pobrać wyników'
    });
  }
});

export default router;