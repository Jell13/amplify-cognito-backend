import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Amplify } from 'aws-amplify';
import ReactDOM from 'react-dom/client';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-west-1_ShhlmS5yI",
      userPoolClientId: "2n29qv9ncvuo0flo3htjf8sd6o"
    }
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
