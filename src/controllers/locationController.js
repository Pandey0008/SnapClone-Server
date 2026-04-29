import Location from "../models/locationModel.js";

export const updateLocation = async (req, res) => {

  try {

    const { latitude, longitude } = req.body;

    const location = await Location.findOneAndUpdate(

      { user: req.user.userId },

      {
        latitude,
        longitude,
        updatedAt: new Date()
      },

      {
        upsert: true,
        new: true
      }

    );

    res.status(200).json(location);

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


export const getFriendsLocations = async (req, res) => {

  const locations = await Location.find()
    .populate("user", "displayName avatarUrl");

  res.json(locations);

};

export const updateLocationVisibility = async (req, res) => {
  try {
    const { locationVisibility } = req.body;

    const location = await Location.findOneAndUpdate(
      { user: req.user.userId },
      { locationVisibility },
      { new: true }
    );

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};