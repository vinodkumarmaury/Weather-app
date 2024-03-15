import React from 'react';
import { Link } from 'react-router-dom';
import "./Homepage.css"
const HomePage = () => {
  return (
    <div className="contain"> 
      <div>
        <Link to="/signin" className="button">
          Sign In
        </Link>
        <Link to="/signup" className="button">
          Sign Up
        </Link>
        <Link to="/search" className="button">
          Search
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
