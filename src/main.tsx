import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Amplify } from 'aws-amplify';
import ReactDOM from 'react-dom/client';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USERPOOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_USERPOOL_CLIENT_ID,
    },
  },
  Storage: {
    S3: {
      region: "us-west-1",
      bucket: "textract-uploads-app"
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
