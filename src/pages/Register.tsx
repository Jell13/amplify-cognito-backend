import { signUp } from 'aws-amplify/auth';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Register = () => {

    const navigate = useNavigate();

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSignUp = async () => {
        try{
            const user = await signUp({username: email, password, options: {
                userAttributes: {
                    name
                }
            }})
            
            navigate("/login");
        }
        catch(error){
            console.log("Error: ", error);
        }
    }
  return (
    <>
        <div className='w-full h-screen bg-white'>
            <div className='w-full h-full flex justify-center items-center'>
                <div className='rounded-xl border-[2px] border-black p-4'>
                    <div className='w-full h-full flex flex-col gap-4'>
                        {/* Header */}
                        <h1 className='text-3xl underline'>Sign Up</h1>

                        {/* Inputs */}
                        <div className='flex flex-col gap-3'>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="">Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} type="text" className='bg-slate-200 rounded-xl pl-3 py-[2px] outline-none' placeholder='Name..'/>
                            </div>
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
                        <button onClick={handleSignUp} className="px-2 py-2 bg-blue-300 text-white rounded-xl">
                            Sign Up
                        </button>
                    </div>   
                </div>
            </div>
        </div>
    </>
  )
}

export default Register