import Location from "../models/locationModel.js";
import User from "../models/User.js";

export const handleLocationEvents = (io, socket) => {

  socket.on("location:update", async (data) => {

    try {

      const { userId, latitude, longitude } = data;

      if (!userId) return;

      const user = await User.findById(userId);

      if (!user) return;

      // Ghost mode check
      if (user.locationVisibility === "ghost") return;

      // Update MongoDB location
      await Location.findOneAndUpdate(

        { user: userId },

        {
          latitude,
          longitude,
          updatedAt: new Date()
        },

        { upsert: true }

      );

      // Broadcast update to all connected users
      socket.broadcast.emit("location:updated", {

        userId,
        latitude,
        longitude

      });

    }

    catch (error) {

      console.error("Location socket error:", error);

    }

  });

};