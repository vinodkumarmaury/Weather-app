import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUpPage from './component/signup';
import Search from './component/Search';
import HomePage from './component/Homepage';
import SignInPage from './component/login';
import "./App.css"

const App = () => {
  return (
    <>
    <h1>Welcome to Our Weather App</h1>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}/>
          <Route path="signup" element={<SignUpPage />} />
          <Route path="/search" element={<Search />} />
          {/* <Route path="signup" element={<SignUpPage />} /> */}
          <Route path="/signin" element={<SignInPage />} />
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
