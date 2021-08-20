const mongoose = require("mongoose");
const { isEmail } = require("validator");

const messageSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 55,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      validate: { validator: isEmail },
      lowercase: true,
      unique: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },

  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("message", messageSchema);
module.exports = MessageModel;
