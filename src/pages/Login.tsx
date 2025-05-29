import { useState } from "react"
import { fetchAuthSession, fetchUserAttributes, getCurrentUser, signIn, signOut, signUp } from 'aws-amplify/auth'
import { useNavigate } from "react-router-dom";


const Login = () => {

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            if(!email || !password){
                alert("Please enter email and password")
            }

            const user = signIn({username: email, password});
            await saveUserToDynamoDB();

            navigate("/home");
        }
        catch(error){
            console.log(error)
        }
    }

    const handleSignOut = async () => {
        await signOut();
    }

    const saveUserToDynamoDB = async () => {
        try{
    
          const session = await fetchAuthSession();
          const userAttributes = await fetchUserAttributes();
    
          const response = await fetch(import.meta.env.VITE_AWS_INVOKE_URL_DYNAMODB, {
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

  return (
    <>
        <div className='w-full h-screen bg-white'>
            <div className='w-full h-full flex justify-center items-center'>
                <div className='rounded-xl border-[2px] border-black p-4'>
                    <div className='w-full h-full flex flex-col gap-4'>
                        {/* Header */}
                        <h1 className='text-3xl underline'>Login</h1>

                        {/* Inputs */}
                        <div className='flex flex-col gap-3'>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor="">Username</label>
                                <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" className='bg-slate-200 rounded-xl pl-3 py-[2px] outline-none' placeholder='Email address..'/>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor="">Password</label>
                                <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" className='bg-slate-200 rounded-xl pl-3 py-[2px] outline-none' placeholder='Password..'/>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button onClick={handleSignIn} className="px-2 py-2 bg-blue-300 text-white rounded-xl">
                            Login
                        </button>
                        <button onClick={handleSignOut} className="px-2 py-2 bg-blue-300 text-white rounded-xl">
                            Sign Out
                        </button>
                    </div>   
                </div>
            </div>
        </div>
    </>
  )
}

export default Login