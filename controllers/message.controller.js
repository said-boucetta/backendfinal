const MessageModel = require("../models/message.model");    
    
  module.exports.readMessage = (req, res) => {
    MessageModel.find((err, docs) => {
      if (!err) res.send(docs);
      else console.log("Error to get data : " + err);
    }).sort({ createdAt: -1 });
  };
  
  module.exports.createMessage = async (req, res) => {
    const newMessage = new MessageModel({
      pseudo: req.body.pseudo,
      email: req.body.email,
      message: req.body.message
    });
  
    try {
      const message = await newMessage.save();
      return res.status(201).json(message);
    } catch (err) {
      return res.status(400).send(err);
    }
  };