import { useEffect, useRef, useState } from "react"
import api from "./utils/Api"
import {useNavigate} from "react-router-dom"
import Post from "./Post"
import PostForm from "./Popup"

const Dashboard = () => {
  const loginState= document.cookie.includes("token")
  const navigate= useNavigate()
  const [user , setUser]=useState(null)
  const fetched= useRef({userDetails:false,userPosts:false})
  const [post,setPost]=useState(null)
  const [dialog,setDialog]=useState(false)

  const getDetails=async ()=>{
    try {
      const resp= await api.get("user/")
      const data= await resp.data;
      if(data.success){
        setUser(data.user)
        fetched.current.userDetails= true
      }
    } catch (error) {
      alert("Error occured ",error.message)
    }
  }
  const getUserPosts=async()=>{
    try {
      const resp= await api.get("/memories/self")
      const data= resp.data
      if(data.success){
        setPost(data.posts)
        fetched.current.userPosts=true
      }else{
        alert("Wasn't able to fetch data.")
      }
    } catch (error) {
      alert("Error occured ",error.message)
    }
  }
  useEffect(()=>{
    !fetched.current.userDetails && getDetails()
    !fetched.current.userPosts && getUserPosts()
  },[fetched])
  const submitPost = async (formdata) => {
    try {
      const formData = new FormData();
      Object.keys(formdata).forEach((key) => {
        if (key !== 'images') {
          if (key === 'thoughtfulMemories' && Array.isArray(formdata[key])) {
            formData.append(key, JSON.stringify(formdata[key]));
          } else {
            formData.append(key, formdata[key]);
          }
        }
      })

      formdata.images?.forEach((file) => {
        formData.append(`photoMemories`, file);
      });
      const resp = await api.post("/memories/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      const data = resp.data;
      if (data.success) {
        console.log(data);
      } else {
        alert("Unable to post. An unrecognized error occurred.");
      }
    } catch (error) {
      alert("Error occured ",error.message)
    }
    setDialog(false)
  }
  console.log(loginState)
  return (
    <div className="w-[100vw] h-[100vh] overflow-hidden">
      <div className="w-full flex justify-between border-2 border-black py-3 px-5 items-center ">
        <button className="border-2 border-black rounded-md px-3 py-2 font-semibold shadow-md" onClick={()=>navigate("/")} >Home</button>
        <h2 className="text-xl font-semibold select-none cursor-default">Memories</h2>
        <button className={`${loginState?"bg-red-500":"bg-black bg-opacity-80"} text-lg text-white rounded-md px-3 py-2 shadow-md shadow-red-300`}
        onClick={async()=>{
          if(!loginState){
            navigate("/login")
            return
          }
          const resp = await api.get("/user/logout")
          const data = await resp.data
          if(data.success){
            navigate("/")
          }else{
            alert("Unable to logout.")
          }
        }} >{loginState?"Logout":"Login"}</button>
      </div>
      <PostForm showForm={dialog} onSubmit={submitPost} setDialog={setDialog} />
      <div className="w-3/5 h-auto min-h-[20vh] max-h-[90vh] border-2 border-black rounded-sm py-2 mx-auto my-5 space-y-2 overflow-auto">
        <div className="flex w-full justify-between items-center px-2">
          <button className="bg-yellow-400 font-semibold text-xl rounded-md px-3 py-2 hover:shadow-md hover:shaodw-sky-300" onClick={()=>{
            fetched.current.userPosts=false
          }}>Refresh</button>
          <button className="bg-sky-400 font-semibold text-xl rounded-md px-3 py-2 hover:shadow-md hover:shaodw-sky-300" onClick={()=>setDialog(true)}>Create Post</button>
        </div>
      <div className="h-full p-2 space-y-2 ">
        {
          (post?.length < 1 || !post) && 
          <div className="flex w-full justify-center items-center h-full">
            <h2 className="text-xl font-semibold text-amber-800">No post yet!!</h2>
          </div>
        }
        {post?.length>0 && 
          <>
            {post?.map((p,i)=>(
              <Post key={i} location={p.location || "delhi"} description={p.description || "kjdfkjsgs k sai k aj hwo wieh owp oi o"} startDate={p.startDate || "2021-2-20"} endDate={p.endDate || "2022-2-10"} thoughtfulMemories={p.thoughtfulMemories ||  ["Thing1 ","thing 2"]} privatePost= {p.privatePost || false} username={p.username || "pj"} userId={p.userId || 121212121} createdAt={p.createdAt || "Today"} photoMemories={p.photoMemories} />
            ))}
        </>
        }
      </div>
      </div>
    </div>
  )
}

export default Dashboard
