const { Router } = require('@autofleet/node-common');
const rideService = require('../../lib/ride');
const { Ride } = require('../../models');

const router = Router();

router.get('/rides', (req, res) => {
  const ride = rideService.create(req.body);
  res.json(booksService.getBooks());
});


router.get('/users/:userId/rides/', async (req, res) => {
  res.json(await Ride.find({
    where: {
      userId: req.params.userId,
      state: req.query.activeRide ? Ride.STATES.ACTIVE : undefined,
    }
  }));
});

router.get('/users/:userId/rides/active', async (req, res) => {
  res.json(await rideService.getRidderActiveRide(req.params.userId));
});

router.post('/users/:userId/rides', async (req, res) => {
  const ride = await rideService.create(req.body, req.params.userId);

  res.json(ride);
});

router.post('/users/:userId/cancel-active-ride', async (req, res) => {
  const ride = await rideService.cancelActiveRide(req.params.userId);

  res.json(ride);
});

router.put('/ride-webhook/:rideId', async (req, res) => {
  const ride = await Ride.find({
    where: {
      id: req.params.rideId,
    }
  });

  if (req.body.ride.status === 'active') {
    ride.state = 'active';
  } else if (req.body.ride.status === 'completed') {
    ride.state = 'completed';
  } else if (req.body.ride.status === 'canceled') {
    ride.state = 'canceled';
  }

  await ride.save();
  res.json(ride);
});

router.get('/rides/:rideId', (req, res) => {
  const { bookId } = req.params;

  res.json(booksService.getBook(parseInt(bookId, 10)));
});

router.put('/rides/:bookId', (req, res) => {
  const { bookId } = req.params;
  const newBook = req.body;

  res.json(booksService.editBook(parseInt(bookId, 10), newBook));
});

module.exports = router;
