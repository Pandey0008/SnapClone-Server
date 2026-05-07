import Location from "../models/locationModel.js";

export const updateLocation = async (req, res) => {

  try {

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required"
      });
    }

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
    console.error("Update location error:", error);
    res.status(500).json({
      message: error.message
    });

  }

};


export const getFriendsLocations = async (req, res) => {
  try {
    const locations = await Location.find()
      .populate("user", "displayName avatarUrl");

    if (!locations) {
      return res.status(200).json([]);
    }

    res.status(200).json(locations);
  } catch (error) {
    console.error("Get friends locations error:", error);
    res.status(500).json({
      message: error.message
    });
  }
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