const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { JSONCookie } = require("cookie-parser");

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
      max: 1024,
      minlength: 6,
    },
    picture: {
      type: String,
      default: "./ploads/profil/random-user.png",
    },
    bio: {
      type: String,
      max: 1024,
    },

    followers: {
      type: [String],
    },
    Following: {
      type: [String],
    },
    likes: {
      type: [mongoose.Types.ObjectId],
    },
    role: {
      type: String,
      default: "basic",
      enum:["basic", "supervisor", "admin"]
    },
    accessToken: {
      type: String
    }
  },
  {
    timestamps: true,
  }
  
);


// play function before save into display: 'black',
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};



const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
