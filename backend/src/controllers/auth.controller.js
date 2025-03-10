import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt"

export const signup = async (req,res) => {
  const {email,fullname,password,profilepic} = req.body;

  try {
    if(!email || !fullname || !password){
      return res.status(400).json({message : "All fields are required"});
    }
    if(password.length < 6 ){
      return res.status(400).json({message :"Password must be atleast 6 character"})
    }
    const userExits = await User.findOne({email});
    if(userExits){
      return res.status(400).json({message:"User with this email already exists!"})
    } 

    // todo : make bcrypt await
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullname,
      email,
      password : hashedPass,
      profilepic,
    })

    // send token
    if(newUser){
      generateToken(newUser._id ,res);
      await newUser.save();
      res.status(201).json({
        _id : newUser._id,
        fullname : newUser.fullname,
        email : newUser.email,
        profilepic : newUser.profilepic,
      })

    }else{
      return res.status(400).json({message : "Invalid user data!"})
    }
  } catch (error) {
    console.log("error in signup controller : ", error.message);
    return res.status(500).json({message :"Internal Server Issue"})
  }
}

export const login = async (req,res) => {
  const {email, password} = req.body;
  try {
    if(!email || !password){
      return res.status(400).json({message : "All fields are required"})
    }

    const userExist = await User.findOne({email});
    if(!userExist){
      return res.status(400).json({message:"Invalid User Credential" })
    }

    const isPassword = await bcrypt.compare(password, userExist.password);
    if(!isPassword){
      return res.status(400).json({message:"Invalid User Credential" })
    }
    generateToken(userExist._id, res);
    return res.status(201).json({
      _id : userExist._id,
      fullname : userExist.fullname,
      email : userExist.email,
      profilepic : userExist.profilepic,
    })

  } catch (error) {
    console.log("error in login controller : ", error.message);
    return res.status(500).json({message :"Internal Server Issue"}) 
  }
}

export const logout = (req,res) => {
  try {
    res.cookie("jwtcookie", "", {maxAge:0})
    res.status(201).json({message :"logged out successfully"})
  } catch (error) {
    console.log("error in logout controller : ", error.message);
    return res.status(500).json({message :"Internal Server Issue"}) 
  }
}

export const updateProfile = async (req,res) => {
  const userId = req.user._id;
  const {profilepic} = req.body;

  try {
    if(!profilepic){
      return res.status(400).json({message:"Profile pic is required"})
    }
    const cloudResponse = await cloudinary.uploader.upload(profilepic);
    const updateUser = await User.findByIdAndUpdate(userId, {profilepic:cloudResponse.secure_url}, {new:true});
    return res.status(200).json(updateUser);

  } catch (error) {
    console.log("error in updateprofile controller : ", error.message);
    return res.status(500).json({message :"Internal Server Issue"})
  }
}

// this is used when user refreshes a page.. it will send user data taken from auth middleware
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};