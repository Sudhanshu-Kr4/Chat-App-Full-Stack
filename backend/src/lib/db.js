import mongoose from "mongoose"


export const connectDB = async () => {
  try {
    const db = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
    console.log("database connected, host is : ", db.connection.host);
    
  } catch (error) {
    console.log("Dtabase connection issue"); 
  }
}