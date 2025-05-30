import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Home = () => {

  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<any>(null);
  const [fileType, setFileType] = useState<string>("");
  const [token, setToken] = useState<any>("");

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();

    console.log(user);
  }, [])

  // const uploadImage = async () => {
  //   if(!file) return;
  //   console.log(file);
  //   await processFile);
  // }

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

  const processFilePDF = async ( file : any, s3Key : string) => {
    if (!file) return;

    const response = await axios.post(
      import.meta.env.VITE_AWS_INVOKE_URL_TEXTRACT,
      {
        s3BucketDocument: {
          bucket: 'textract-uploads-app',
          key: s3Key,
          fileType: "pdf"
        }
      }
    )

    console.log(response);
  }

  const processFileImage = async ( base64 : string) => {
    // if (!file || !fileType || !user) return;
    if (!base64) return;

    const userAttr = await fetchUserAttributes();

    const userId = userAttr.sub;
    try {

      const response = await axios.post(
        import.meta.env.VITE_AWS_INVOKE_URL_TEXTRACT,
        {
          image: base64,
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
      // Image case (base64 string)
      // if (fileType === "image/jpeg") {
      //   console.log(file);
      //   const response = await axios.post(
      //     import.meta.env.VITE_AWS_INVOKE_URL_TEXTRACT,
      //     {
      //       image: base64,
      //       documentType: 'maintenance-report'
      //     },
      //     {
      //       onUploadProgress: (progressEvent) => {
      //         const percentCompleted = Math.round(
      //           (progressEvent.loaded * 100) / (progressEvent.total || 1)
      //         );
      //         setProgress(percentCompleted);
      //       }
      //     }
      //   );
      //   console.log('Textract result:', response.data);
      // }
      // // PDF/DOCX case (File object)
      // else if (fileType === "application/pdf") {
      //   const fileBuffer = await file.arrayBuffer();
      //   const s3Key = `uploads/${userId}/${Date.now()}-${file.name}`;
        
      //   // Upload to S3
      //   await s3Client.send(
      //     new PutObjectCommand({
      //       Bucket: 'textract-uploads-app',
      //       Key: s3Key,
      //       Body: new Uint8Array(fileBuffer),
      //       ContentType: fileType
      //     })
      //   );

        // const response = await axios.post(
        //   import.meta.env.VITE_AWS_INVOKE_URL_TEXTRACT,
        //   {
        //     s3BucketDocument: {
        //       bucket: 'textract-uploads-app',
        //       key: s3Key,
        //       fileType: "pdf"
        //     }
        //   }
        // )

        // console.log(response);

        // console.log("File uploaded to S3");
      // }
    } catch (error) {
      console.error("Processing error:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    const userAttr = await fetchUserAttributes();
    const userId = userAttr.sub;

    if (!selectedFile) return;
    if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png" || selectedFile.type === "application/pdf") {
      if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png") {
        const processImage = () =>
            new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = (event) => {
                if (event.target?.result) {
                  resolve(event.target.result as string)
                }
              }
              reader.readAsDataURL(selectedFile)
            })

        const base64 = await processImage()
        console.log(base64);
        await processFileImage(base64);
      }
      else if(selectedFile.type === "application/pdf" || selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
        // setFile(selectedFile);
        const fileBuff = await selectedFile.arrayBuffer();
        const s3Client = await getAuthenticatedS3Client();
        const s3Key = `uploads/${userId}/${Date.now()}-${selectedFile.name}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: 'textract-uploads-app',
            Key: s3Key,
            Body: new Uint8Array(fileBuff),
            ContentType: selectedFile.type
          })
        )

        await processFilePDF( selectedFile, s3Key);
      }
      else{
        alert("Unsupported file type!");
      }
    }
    
    setFile(selectedFile);
    setFileType(selectedFile.type);

    // await processFile(base64);
  };

  return (
    <>
      <section className='w-full h-screen'>
        <div className='w-full h-full flex justify-center items-center'>
          <div className='flex flex-col rounded-xl border-[2px] border-black p-4'>
            <div className='w-full h-full flex flex-col gap-4'>
              {/* Header */}
              <h1 className='text-3xl underline'>Textract Process JPG & PDF</h1>

              {/* Inputs */}
              <div className='flex flex-col gap-3'>
                  <div className='flex flex-col gap-2'>
                      <label htmlFor="">JPG or PDF</label>
                      <input type="file" onChange={handleFileChange}/>
                  </div>
              </div>

              {/* Buttons */}
              
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home