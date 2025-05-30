import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import React, { useEffect } from 'react'

const Home = () => {

  // useEffect(() => {
  //   const getUser = async () => {

  //     const user = await getCurrentUser();

  //     if(user) {
  //       await saveUserToDynamoDB();
  //     }
  //   }

  //   getUser();
  // }, [])

  // const saveUserToDynamoDB = async () => {
  //   try{

  //     const session = await fetchAuthSession();
  //     const userAttributes = await fetchUserAttributes();

  //     const response = await fetch(import.meta.env.VITE_AWS_INVOKE_URL_DYNAMODB, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',

  //       },
  //       body: JSON.stringify({
  //         userId: userAttributes.sub,
  //         email: userAttributes.email,
  //         name: userAttributes.name,
  //       })
  //     })

  //     const data = await response.json();
  //     console.log(data);

  //     console.log("Session: ", session);
  //     console.log("User Attributes: ", userAttributes);     
  //   }
  //   catch (error) {
  //     console.log(error);
  //   }
  // }


  return (
    <div>Home</div>
  )
}

export default Home