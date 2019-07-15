require('dotenv');
const axios = require('axios');
const { Ride } = require('../../models');

const demandApi = axios.create({
  baseURL: 'https://demand.autofleet.io/',
  headers: { Authorization: process.env.AF_API_TOKEN }
});

const webHookHost = 'https://716ee2e6.ngrok.io';

const rideService = {
  create: async (rideData, userId) => {
    const ride = await Ride.create({
      ...rideData,
      userId,
    });

    try {
      const { data: afRide } = await demandApi.post('/api/v1/rides', {
        external_id: ride.id,
        webhook_url: `${webHookHost}/api/v1/ride-webhook/${ride.id}`,
        stop_points: [
          {
            type: 'pickup',
            lat: parseFloat(rideData.pickupLat),
            lng: parseFloat(rideData.pickupLng),
            description: ride.pickupAddress,
          },
          {
            type: 'dropoff',
            lat: parseFloat(rideData.dropoffLat),
            lng: parseFloat(rideData.dropoffLng),
            description: ride.dropoffAddress,
          },
        ]
      })

      if (afRide.status === 'rejected') {
        ride.state = 'rejected';
      } else {
        ride.state = 'active';
      }
    } catch (e) {
      console.log(e)
      ride.state = 'rejected';
    }
    

    await ride.save()
    console.log(await rideService.getRideFromAf(ride.id))
    return ride;
  },
  getRidderActiveRide: async (userId) => {
    const ride = await Ride.findOne({
      where: {
        userId,
        state: 'active'
      }
    });

    if(ride) {
      const afRide = await rideService.getRideFromAf(ride.id);
      return afRide;
    }

    return null;
  },
  cancelActiveRide: async (userId) => {
    const ride = await Ride.findOne({
      where: {
        userId,
        state: 'active'
      }
    });

    if (ride) {
      const afRide = await rideService.getRideFromAf(ride.id);
      await demandApi.put(`/api/v1/rides/${afRide.id}/cancel`);
      ride.state = 'canceled';
      await ride.save();
      return afRide;
    }

    return null;
  },
  getRideFromAf: async (rideId) => {
    const { data: afRides } = await demandApi.get('/api/v1/rides', { params: { externalId: rideId } });
    return afRides[0]
  }
}

module.exports = rideService;