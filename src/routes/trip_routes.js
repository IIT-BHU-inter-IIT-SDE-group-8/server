const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { getAlltrips, createTrip } = require('../controllers/tripController')

router.use(cors());

router.get('/', checkAuthenticated, getAlltrips)
router.post('/', checkAuthenticated, createTrip)

