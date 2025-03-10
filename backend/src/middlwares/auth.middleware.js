import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectedRoute = async (req,res,next) => {
  const token = req.cookies.jwtcookie;
  try {
    if(!token){
      return res.status(400).json({message :"Unauthorized :- No token recieved"})
    }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if(!decoded){
      return res.status(400).json({message :"Unauthorized :- Invalid token"})
    }
  
    const user = await User.findById(decoded.userId).select("-password");    // - minus password not send pass as response
    if (!user) {
      return res.status(404).json({message :"User not found"})
    }
    req.user = user;
    next();
    
  } catch (error) {
    console.log("error in auth middlware --> protectedRoute", error.message);
    return res.status(500).json({message:"Internal Server Error"})
  }
}

