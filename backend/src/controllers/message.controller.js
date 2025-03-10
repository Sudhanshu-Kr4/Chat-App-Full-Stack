import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";



export const getUsersForSidebar = async (req,res) => {
  const loggedInUserId = req.user._id;
  try {
    const filteredUsers = await User.find({_id: {$ne : loggedInUserId}}).select("-password");
    res.status(200).json(filteredUsers); 
  } catch (error) {
    console.log("error in getUsersForSidebar controller : ", error.message);
    return res.status(500).json({message :"Internal Server Issue"})
  }
}

export const getMessages = async (req,res) => {
  const {id:userToChatId} = req.params;
  const myId = req.user._id;
  try {
    const messages = await Message.find({   // to do print messages
      $or : [
        {senderId:userToChatId, recieverId:myId},
        {senderId:myId, recieverId:userToChatId}
      ]
    })
    return res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessages controller : ", error.message);
    return res.status(500).json({message :"Internal Server Issue"})
  }
}

export const sendMessages = async (req,res) => {
  const {text, image} = req.body;
  const {id:recieverId} = req.params
  const senderId = req.user._id

  try {
    let imageUrl;
    if(image){
      imageUrl = (await cloudinary.uploader.upload(image)).secure_url;
    }
    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image : imageUrl
    })

    await newMessage.save();

    // realtime functionality with socket.io

    const recieverSocketId = getRecieverSocketId(recieverId);
    if(recieverSocketId){
      io.to(recieverSocketId).emit("newMessage", newMessage); 
    }

    
  } catch (error) {
    console.log("error in newMessage controller : ", error.message);
    return res.status(500).json({message :"Internal Server Issue"})
  }
}


