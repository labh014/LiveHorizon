import { useNavigate } from "react-router-dom";

import React, { useEffect } from 'react'

function Auth(WrappedComponent) {
  const AuthComponent = (props) => {
    let navigate = useNavigate()

    const isAuthenticated = () =>{
      if(localStorage.getItem("token") !== null){
        return true
      }
      return false
    }

    useEffect(() => {
      if(!isAuthenticated()){
        navigate('/auth')
      }
    },[])

    return ( < WrappedComponent {...props} /> )
  }

  return (
    AuthComponent
  )
}

export default Auth