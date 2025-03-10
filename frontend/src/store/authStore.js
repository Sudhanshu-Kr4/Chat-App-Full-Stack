import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client"

export const authStore = create((set,get) => ({
  authUser:null,

  isSigningUp:false,
  isLoggingIn:false,
  isUpdatingProfile:false,
  isCheckingAuth:true,
  onlineUsers:[],
  socket : null,

  checkAuth : async () => {
    try {
      const user = await axiosInstance.get("/auth/check");
      set({authUser : user.data});
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth Store at frontend", error);
      set({authUser:null});
    } finally{
      set({isCheckingAuth:false});
    }
  },

  signUp : async (userData) => {
    set({isSigningUp:true});
    try {
      const response = await axiosInstance.post("/auth/signup", userData);
      set({authUser:response.data});
      get().connectSocket();
      toast.success("Account created successfully");
    } catch (error) {
      console.log("Error in Signup Store at frontend", error);
      toast.error(error.response?.data?.message);
    }finally{
      set({isSigningUp:false});
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logged in successfully");

    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logOut : async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({authUser:null});
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error in Logout Store at frontend", error);
      toast.error(error.response?.data?.message);
    }
  },

  updateProfile : async (profilepic) => {
    set({isUpdatingProfile:true});

    try {
      const user = await axiosInstance.put("/auth/update-profile", profilepic)
      set({authUser:user.data});
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in Profile pic update Store at frontend", error);
      toast.error(error.response?.data?.message);
    }finally{
      set({isUpdatingProfile:false});
    }
  },

  connectSocket : () => {
    const {authUser} = get();

    if(!authUser || get().socket?.connected) return;

    const socket = io("http://localhost:4000",{query:{
      userId:authUser._id
    }});
    set({socket:socket});
    socket.connect();

    socket.on("getOnlineUsers", (userIds) => {
      set({onlineUsers:userIds});
    })
  },

  disconnectSocket : () => {
    if(get().socket?.connected){
      get().socket?.disconnect();
    }
  }



  



}))