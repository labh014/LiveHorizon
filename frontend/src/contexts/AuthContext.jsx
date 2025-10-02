import axios from 'axios'
import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

import httpStatus from 'http-status'
import server from "../../environment.js"

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({children}) => {
  const  authContext = useContext(AuthContext);

  const [userData, setUserData] = useState(authContext)
  const [loading, setLoading] = useState(true)

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
      }
      console.log(request);
    } catch (error) {
      throw error;
    }
  };

  const fetchMe = async () => {
    try {
      const response = await client.get('/me')
      setUserData(response.data)
    } catch (error) {
      // handled by interceptor on 401
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async ({ name, avatarUrl }) => {
    const response = await client.put('/profile', { name, avatarUrl })
    setUserData(response.data.user)
    return response.data
  }

  const logout = async () => {
    try {
      await client.post('/logout')
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token')
      window.location.href = '/auth'
    }
  }

  const isAuthenticated = () => !!localStorage.getItem('token')

  useEffect(() => {
    if (isAuthenticated()) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [])
  

  const getHistory = async () => {
    try
    {
      const request = await client.get("/get-to-history");
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
    userData, setUserData, handleRegister, handleLogin, addToHistory, getHistory, logout, loading, isAuthenticated, updateProfile
  }

  return (
      <AuthContext.Provider value={data}>
        {children}
      </AuthContext.Provider>
  )
}