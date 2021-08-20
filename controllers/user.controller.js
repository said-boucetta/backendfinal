const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { roles } = require('../roles')

// -------------------------------------------------------------------------

 
exports.grantAccess = function(action, resource) {
 return async (req, res, next) => {
  try {
   const permission = roles.can(req.user.role)[action](resource);
   if (!permission.granted) {
    return res.status(401).json({
     error: "You don't have enough permission to perform this action"
    });
   }
   next()
  } catch (error) {
   next(error)
  }
 }
}
 
exports.allowIfLoggedin = async (req, res, next) => {
 try {
  const user = res.locals.loggedInUser;
  if (!user)
   return res.status(401).json({
    error: "You need to be logged in to access this route"
   });
   req.user = user;
   next();
  } catch (error) {
   next(error);
  }
}







async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
  try {
   const { email, password, role } = req.body
   const hashedPassword = await hashPassword(password);
   const newUser = new User({ email, password: hashedPassword, role: role || "basic" });
   const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
   });
   newUser.accessToken = accessToken;
   await newUser.save();
   res.json({
    data: newUser,
    accessToken
   })
  } catch (error) {
   next(error)
  }
 }

 exports.login = async (req, res, next) => {
  try {
   const { email, password } = req.body;
   const user = await User.findOne({ email });
   if (!user) return next(new Error('Email does not exist'));
   const validPassword = await validatePassword(password, user.password);
   if (!validPassword) return next(new Error('Password is not correct'))
   const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
   });
   await User.findByIdAndUpdate(user._id, { accessToken })
   res.status(200).json({
    data: { email: user.email, role: user.role },
    accessToken
   })
  } catch (error) {
   next(error);
  }
 }

 exports.getUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
   data: users
  });
 }
 
 exports.getUser = async (req, res, next) => {
  try {
   const userId = req.params.userId;
   const user = await User.findById(userId);
   if (!user) return next(new Error('User does not exist'));
    res.status(200).json({
    data: user
   });
  } catch (error) {
   next(error)
  }
 }
 
 exports.updateUser = async (req, res, next) => {
  try {
   const update = req.body
   const userId = req.params.userId;
   await User.findByIdAndUpdate(userId, update);
   const user = await User.findById(userId)
   res.status(200).json({
    data: user,
    message: 'User has been updated'
   });
  } catch (error) {
   next(error)
  }
 }
 
 exports.deleteUser = async (req, res, next) => {
  try {
   const userId = req.params.userId;
   await User.findByIdAndDelete(userId);
   res.status(200).json({
    data: null,
    message: 'User has been deleted'
   });
  } catch (error) {
   next(error)
  }
 }
// -------------------------------------------------------------------------

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

module.exports.userInfo = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  UserModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("ID unknown : " + err);
  }).select("-password");
};

module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        if (err) return res.status(500).send({ message: err });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.remove({ _id: req.params.id }).exec();
    res.status(200).json({ message: "Successfully deleted. " });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // add to the follower list
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs);
        else return res.status(400).jsos(err);
      }
    );
    // add to following list
    await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true },
      (err, docs) => {
        // if (!err) res.status(201).json(docs);
        if (err) return res.status(400).jsos(err);
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs);
        else return res.status(400).jsos(err);
      }
    );
    // remove to following list
    await UserModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true },
      (err, docs) => {
        // if (!err) res.status(201).json(docs);
        if (err) return res.status(400).jsos(err);
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
