const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  const states = {
    CREATING: 'creating',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
    REJECTED: 'rejected',
  };

  const Ride = sequelize.define('Ride', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: false,
    },
    state: {
      type: DataTypes.ENUM(_.values(states)),
      defaultValue: 'creating',
      allowNull: false,
    },
    pickupAddress: {
      type: DataTypes.STRING,
      field: 'pickup_address',
      allowNull: false,
    },
    pickupLat: {
      type: DataTypes.DECIMAL,
      field: 'pickup_lat',
      allowNull: false,
    },
    pickupLng: {
      type: DataTypes.DECIMAL,
      field: 'pickup_lng',
      allowNull: false,
    },
    dropoffAddress: {
      type: DataTypes.STRING,
      field: 'dropoff_address',
      allowNull: false,
    },
    dropoffLat: {
      type: DataTypes.DECIMAL,
      field: 'dropoff_lng',
      allowNull: false,
    },
    dropoffLng: {
      type: DataTypes.DECIMAL,
      field: 'dropoff_lng',
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at',
    },
    canceledAt: {
      type: DataTypes.DATE,
      field: 'canceled_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    tableName: 'rides',
  });

  Ride.STATES = states;

  return Ride;
};
