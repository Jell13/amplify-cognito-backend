import React, { useEffect, useState } from 'react'
import { fetchAuthSession, fetchUserAttributes, getCurrentUser, signIn, signOut, signUp } from 'aws-amplify/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';

function App() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<any>(null);
  const [fileType, setFileType] = useState<string>("");
  const [token, setToken] = useState<any>("");

  const [progress, setProgress] = useState(0);

  
  useEffect(() => {
    console.log(progress);
  }, [])

  const s3Client = new S3Client({
    region: 'us-west-1',
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: 'us-west-1' },
      identityPoolId: "us-west-1:9677e4fe-6337-4e1a-ae50-1441e43e8a13"
    })
  });

  const handleSignIn = async (e : React.FormEvent) => {
    e.preventDefault();
    try{
      const user = await signIn({username: email, password});
      console.log("Signed in user: ", user);
      setUser(user);
      await saveUserToDynamoDB();

      
    } catch (error){
      console.log("Error: ", error);
    }
  }

  const saveUserToDynamoDB = async () => {
    try{

      const session = await fetchAuthSession();
      const userAttributes = await fetchUserAttributes();

      const response = await fetch('https://77exw9tcke.execute-api.us-west-1.amazonaws.com/dev/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        body: JSON.stringify({
          userId: userAttributes.sub,
          email: userAttributes.email,
          name: userAttributes.name,
        })
      })

      const data = await response.json();
      console.log(data);

      console.log("Session: ", session);
      console.log("User Attributes: ", userAttributes);     
    }
    catch (error) {
      console.log(error);
    }
  }

  const getAuthenticatedS3Client = async () => {
    try {
      const session = await fetchAuthSession();

      // const current = await getCurrentSession()
      const idToken = session.tokens?.idToken?.toString();
      const accessToken = session.tokens?.accessToken?.toString();
      console.log("Session: ", session);

      console.log("JWT Token: ", idToken);
      console.log("Access Token: ", accessToken);
      
      if (!idToken) {
        throw new Error("No authentication token found");
      }
  
      return new S3Client({
        region: 'us-west-1',
        credentials: fromCognitoIdentityPool({
          clientConfig: { region: 'us-west-1' },
          identityPoolId: "us-west-1:9677e4fe-6337-4e1a-ae50-1441e43e8a13",
          logins: {
            [`cognito-idp.us-west-1.amazonaws.com/us-west-1_ShhlmS5yI`]: idToken
          }
        })
      });
    } catch (error) {
      console.error("Error creating S3 client:", error);
      throw error;
    }
  };

  const handleTextract = async () => {
    try{
      if(!file && !user) {
        return;
      }
      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        
      }
      console.log(file);
      const response = await axios.post('https://77exw9tcke.execute-api.us-west-1.amazonaws.com/dev/textract', {
        image: file,
      }, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        }
      })

      console.log(response.data.body);
    }
    catch (error){
      console.log("Error: ", error)
    }
  }

  const getToken = async () => {
    const session = await fetchAuthSession();
    console.log(session);
    return session;
  }

  const processFile = async () => {
    if (!file || !fileType || !user) return;

    const s3Client = await getAuthenticatedS3Client();
    const userAttr = await fetchUserAttributes();

    const userId = userAttr.sub;
    try {
      // Image case (base64 string)
      if (fileType === "image/jpeg") {
        console.log(file);
        const response = await axios.post(
          'https://77exw9tcke.execute-api.us-west-1.amazonaws.com/dev/textract',
          {
            image: file,
            documentType: 'maintenance-report'
          },
          {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              setProgress(percentCompleted);
            }
          }
        );
        console.log('Textract result:', response.data);
      }
      // PDF/DOCX case (File object)
      else if (fileType === "application/pdf") {
        const fileBuffer = await file.arrayBuffer();
        const s3Key = `uploads/${userId}/${Date.now()}-${file.name}`;
        
        // Upload to S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: 'textract-uploads-app',
            Key: s3Key,
            Body: new Uint8Array(fileBuffer),
            ContentType: fileType
          })
        );

        const response = await axios.post(
          'https://77exw9tcke.execute-api.us-west-1.amazonaws.com/dev/textract',
          {
            s3BucketDocument: {
              bucket: 'textract-uploads-app',
              key: s3Key,
              fileType: "pdf"
            }
          }
        )

        console.log(response);

        console.log("File uploaded to S3");
      }
    } catch (error) {
      console.error("Processing error:", error);
    }
  };

  const handleSignUp = async (e : React.FormEvent) => {

    e.preventDefault();
    try{
      const {nextStep: signUpNextStep} = await signUp({username: email, password, options:{
        userAttributes:{
          name
        }}
      })

      console.log("Successful Sign Up of user: ", user);
      setUser(user);
    }
    catch (error){
      console.log("Error: ", error);
    }
  }

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await signOut();
      setUser(null);
      console.log("user Signed Out");
    }
    catch (error){
      console.log("Error: ", error);
    }
  }
  
  const uploadImage = async () => {
    if(!file) return;
    
    await processFile();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png" || selectedFile.type === "application/pdf") {
      if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png") {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result === null) return;
          console.log(event.target?.result);
          setFile(event.target?.result);
        } 
  
        reader.readAsDataURL(selectedFile);
      }
      else if(selectedFile.type === "application/pdf" || selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
        setFile(selectedFile);
      }
      else{
        alert("Unsupported file type!");
      }
    }
    
    setFile(selectedFile);
    setFileType(selectedFile.type);

    await processFile();
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/home' element={<Home/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
