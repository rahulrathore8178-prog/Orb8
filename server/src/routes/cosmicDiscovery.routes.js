const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const {
  getRecommendations,
  updateNearbyDiscovery,
} = require('../controllers/cosmicDiscovery.controller');

const router = express.Router();

router.use(protect);
router.get('/recommendations', getRecommendations);
router.post('/nearby', updateNearbyDiscovery);

module.exports = router;