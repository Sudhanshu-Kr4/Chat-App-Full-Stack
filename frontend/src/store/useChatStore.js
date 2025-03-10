import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { authStore } from "./authStore";



export const useChatStore = create((set,get) => ({
  messages:[],
  users:[],
  selectedUser : null,
  isUserLoading : false,
  isMessagesLoading:false,

  getUser : async () => {
    set({isUserLoading:true});
    try {
      const user = await axiosInstance.get("/message/users");
      set({users:user.data});

    } catch (error) {
      toast.error(error.response.data.message);
    } finally{
      set({isUserLoading:false});
    }
  },


  getMessages : async (userId) => {
    set({isMessagesLoading : true});
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({messages:res.data});
    } catch (error) {
      toast.error(error.response.data.message);
    } finally{
      set({isMessagesLoading:false});
    }
  },

  sendMessages : async (messageData) => {
    const {selectedUser} = get();
    try {
      const response = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      console.log("in sendmessages Chat Store", response.data.text);
      
      // set({messages:[...messages, response.data]});
      set((state) => ({
        messages: [...state.messages, response.data]
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeMessages : () => {
    const {selectedUser} = get();
    if(!selectedUser){
      return;
    }

    const socket = authStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;;
      if(!isMessageSentFromSelectedUser) return;
      // set({
      //   messages:[...get().messages, newMessage]
      // })
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
    })
  },

  unSubscribeFromMessages : () => {
    const socket = authStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser : (selectedUser) => {
    set({selectedUser});
  }





}))