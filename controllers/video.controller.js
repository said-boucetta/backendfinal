const VideoModel = require("../models/video.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readVideo = (req, res) => {
  VideoModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get data : " + err);
  });
};

module.exports.createVideo = async (req, res) => {
  const newPost = new VideoModel({
    titre: req.body.titre,
    url: req.body.url,
    duree: req.body.duree,
    prix: req.body.prix,
    niveau: req.body.niveau,
  });

  try {
    const video = await newPost.save();
    return res.status(201).json(video);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.updateVideo = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  VideoModel.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Update error : " + err);
    }
  );
};

module.exports.deleteVideo = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  VideoModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
};
