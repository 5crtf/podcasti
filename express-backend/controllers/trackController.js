const { tracks } = require("../data/tracks");
const User = require("../models/User");

const getTracks = (req, res) => {
  res.json(tracks);
};

const addToFavorites = (req, res) => {
  let { trackId } = req.body;
  const username = req.user.username;
  trackId = Number(trackId);
  User.addFavorite(username, trackId);
  res.json({ message: "композиция добавлена в избранное" });
};

const removeFromFavorites = (req, res) => {
  let { trackId } = req.body;
  const username = req.user.username;
  trackId = Number(trackId);
  User.removeFavorite(username, trackId);
  res.json({ message: "композиция убрана из избранного" });
};

const getFavorites = (req, res) => {
  const username = req.user.username;
  const favoriteTracks = User.getFavorites(username);

  const favoriteTrackDetails = tracks.filter((track) =>
    favoriteTracks.includes(track.id)
  );
  res.json(favoriteTrackDetails);
};

module.exports = {
  getTracks,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};
