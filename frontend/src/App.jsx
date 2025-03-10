import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Homepage from "./pages/Homepage"
import Signuppage from "./pages/Signuppage"
import Loginpage from "./pages/Loginpage"
import Profilepage from "./pages/Profilepage"
import Settingspage from "./pages/Settingspage"
import { authStore } from "./store/authStore"
import { useEffect } from "react"
import {Loader} from "lucide-react"
import { Toaster } from "react-hot-toast"


function App() {

  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = authStore();
  console.log("online users are : ",onlineUsers);
  

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);   // try removing array 

  console.log(authUser);

  if(isCheckingAuth && !authUser){
    return(
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    ) 
  }

  return (
    <div>

      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <Homepage /> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ? <Signuppage /> : <Navigate to="/"/>}/>
        <Route path="/login" element={!authUser ? <Loginpage /> : <Navigate to="/"/>}/>
        <Route path="/profile" element={authUser ? <Profilepage /> : <Navigate to="/login"/>}/>
        <Route path="/settings" element={<Settingspage />}/>
      </Routes>

      <Toaster/>
    </div>
  )
}
export default App
