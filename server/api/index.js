const { Router } = require('@autofleet/node-common');

const router = Router();

router.use('/v1', require('./v1'));

module.exports = router;
