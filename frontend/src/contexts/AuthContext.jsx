import axios from 'axios'
import { createContext, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';

import httpStatus from 'http-status'
import server from "../../environment.js"

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`
})

export const AuthProvider = ({children}) => {
  const  authContext = useContext(AuthContext);

  const [userData, setUserData] = useState(authContext)

  const handleRegister = async (name, username, password) => {
    try
    {
      let request = await client.post("/register", {
        name : name,
        username : username, 
        password : password
      })
      if(request.status === httpStatus.CREATED){
        return request.data.message;
      }
    }
    catch(error)
    {
      throw error;
    }
  }

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password
      });
      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        setTimeout(() => {
          localStorage.removeItem("token");
          alert("Session expired. Please log in again.");
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      }
      console.log(request);
    } catch (error) {
      throw error;
    }
  };
  

  const getHistory = async () => {
    try
    {
      const request = await client.get("/get-to-history",
        {params: {
          token : localStorage.getItem('token')
        }}
      );
      return request.data;

    }
    catch(error){
      throw error;
    }
  }

  const addToHistory = async (meetingCode) => {
    try
    {
      console.log(meetingCode)
      console.log("labh;ajlkdjflk")
      let request = await client.post("/add-to-history",
        {
          token : localStorage.getItem("token"),
          meeting_code : meetingCode,
          
        }
      );
      
      return request
      
    }
    catch(error) {
      throw error
    }
  }

  const router = useNavigate();

  const data = {
    userData, setUserData, handleRegister, handleLogin, addToHistory, getHistory
  }

  return (
      <AuthContext.Provider value={data}>
        {children}
      </AuthContext.Provider>
  )
}