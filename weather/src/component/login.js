import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./login.css";

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      // Sending the form data to the backend
      const response = await axios.post('http://localhost:5000/signin', { email, password });

      console.log(response.data); // Logging the response from the backend
      setError('');
      // Resetting the form fields after successful sign-in
      setEmail('');
      setPassword('');
    } catch (error) {
      // Handling errors from the backend
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="container">
      <Link to="/" className="home-button">
        Home
      </Link>
      <form onSubmit={handleSubmit}>
        <div className="box">
          <div className="header">
            <h2>Sign in</h2>
          </div>
          <div className="google">
            <a href="https://accounts.google.com/o/oauth2/auth?response_type=code&redirect_uri=https://myredirecturl.com/login&client_id=xxxxxx-xxxxxxxxxx.apps.googleusercontent.com&scope=email+profile&access_type=online&approval_prompt=auto">
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Logo" /> Login with Google
            </a>
          </div>
          <form>
            <div className="container">
              <div>
                <input type="email" id="Email" placeholder="Email*" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <br />
              <div>
                <input type="password" id="password" placeholder="Password*" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" title="Must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <br />
            </div>
            <div id="button">
              <button className="para">SIGN IN</button>
            </div>
            <br />
            <div id="btn">
              <Link className="lower-para" to="/signup">New to Weather App? Signup</Link>
            </div>
          </form>
        </div>
      </form>
    </div>
  );
};

export default SignInPage;
