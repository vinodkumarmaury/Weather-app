import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import "./Search.css";

const fetchWeatherData = async (city) => {
  const url = `http://api.weatherapi.com/v1/current.json?key=d5c2c0c0a85f45c98d7130200240703&q=${city}&aqi=no`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("City not found");
  }
  const data = await response.json();

  const { current } = data;
  const isRainy = current.condition.text.includes("Rain");
  const isCloudy = current.condition.text.includes("Cloud");
  const isStormy = current.condition.text.includes("Storm");
  const isWindy = current.wind_kph > 30;

  if (isRainy || isCloudy || isStormy || isWindy) {
    console.log("Notify user about weather conditions:", current.condition.text, "and wind speed:", current.wind_kph);
  }

  return data;
};

const Search = () => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchDataFromFirestore = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "weatherData"));
        const data = querySnapshot.docs.map(doc => doc.data());
        setResults(data);
        setError(null);
        console.log("Data fetched from Firestore successfully:", data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        setError("Failed to fetch data from Firestore");
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromFirestore();
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchWeatherData(inputValue);
      setResults([...results, data]);
      setError(null);
      console.log("Data fetched successfully:", data);
      await addWeatherDataToFirestore(data);
      console.log("Data saved to Firestore successfully");
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addWeatherDataToFirestore = async (data) => {
    try {
      await addDoc(collection(db, "weatherData"), data);
    } catch (error) {
      console.error("Error adding weather data to Firestore:", error);
    }
  };

  const handleSearch = () => {
    if (inputValue.trim() !== "") {
      fetchData();
      setInputValue("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return <EditCityList setIsEditing={setIsEditing} results={results} setResults={setResults} fetchWeatherData={fetchWeatherData} />;
  }

  if (selectedCity) {
    return <CityWeatherDetails cityName={selectedCity} setSelectedCity={setSelectedCity} fetchWeatherData={fetchWeatherData} />;
  }

  return (
    <div >
      <a href="/">Home</a> 
      <div className="input">
      <input 
        type="text"
        placeholder="Search for city"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSearch}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="weatherContainer">
        {results.map((result, index) => (
          <div className="result" key={index} onClick={() => handleCityClick(result.location.name)}>
            <div className="image">
              <img className="icon" src={result.current.condition.icon} alt="Weather icon" />
            </div>
            <div className="content">
              <p className="title">
                Location : <b>{result.location.name}</b>
              </p>
              {result && result.current && (
                <div >
                  <div className="items">
                    <p>
                      Temperature : <b>{result.current.temp_c}°C / {result.current.temp_f}°F</b>
                    </p>
                    <p>Condition : <b>{result.current.condition.text}</b></p>
                    <p>Humidity: <b>{result.current.humidity}%</b></p>
                    <p>Wind: <b>{result.current.wind_kph} km/h</b></p>
                    {(result.current.condition.text.includes("Rain") || result.current.condition.text.includes("Cloud") || result.current.condition.text.includes("Storm") || result.current.wind_kph > 30) && (
                      <p className="notification">Weather Alert!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleEditClick}>Edit City List</button>
    </div>
  );
};

const EditCityList = ({ setIsEditing, results, setResults, fetchWeatherData }) => {
  const [cities, setCities] = useState(results.map(result => result.location.name));
  const [editingCity, setEditingCity] = useState(null);
  const [newCityName, setNewCityName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setCities(results.map(result => result.location.name));
  }, [results]);

  const handleAddCity = async (city) => {
    if (city.trim() === "") return;
    try {
      const data = await fetchWeatherData(city);
      setResults([...results, data]);
      setCities([...cities, city]);
      console.log("City added successfully:", city);
    } catch (error) {
      console.error("Error adding city:", error);
    }
  };

  const handleDeleteCity = async (cityToDelete) => {
    const updatedResults = results.filter(result => result.location.name !== cityToDelete);
    setResults(updatedResults);
    setCities(cities.filter(city => city !== cityToDelete));
    console.log("City deleted successfully:", cityToDelete);
    try {
      const querySnapshot = await getDocs(collection(db, "weatherData"));
      querySnapshot.forEach(async (doc) => {
        if (doc.data().location.name === cityToDelete) {
          await deleteDoc(doc.ref);
          console.log("City data deleted from Firestore:", cityToDelete);
        }
      });
    } catch (error) {
      console.error("Error deleting city data from Firestore:", error);
    }
  };

  const handleEditCity = (cityName) => {
    setEditingCity(cityName);
  };

  const handleModifyCity = async (oldCity, newCity) => {
    try {
      const index = cities.findIndex(city => city === oldCity);
      if (index === -1) {
        throw new Error("City not found");
      }
      const data = await fetchWeatherData(newCity);
      const updatedResults = [...results];
      updatedResults[index] = data;
      setResults(updatedResults);
      const updatedCities = [...cities];
      updatedCities[index] = newCity;
      setCities(updatedCities);
      console.log("City modified successfully:", oldCity, "->", newCity);
      setEditingCity(null);
    } catch (error) {
      console.error("Error modifying city:", error);
      setError(error.message);
    }
  };

  const handleDoneClick = () => {
    setIsEditing(false);
  };

  return (
    <div className="edit">
      <input className="editBox" type="text" value={newCityName} onChange={(e) => setNewCityName(e.target.value)} placeholder="Add New City" />
      <button className="editCiy" onClick={() => handleAddCity(newCityName)}>Add City</button>
      <div className="editCityList">
      {cities.map((city, index) => (
        <div key={index}>
          <span><b>{city} </b></span>
          <button onClick={() => handleDeleteCity(city)}>Delete</button>
          <button onClick={() => handleEditCity(city)}>Edit</button>
          {editingCity === city && (
            <>
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Edit your City"
              />
              <button onClick={() => handleModifyCity(city, newCityName)}>Save</button>
            </>
          )}
        </div>
      ))}
      </div>
      <button onClick={handleDoneClick}>Done</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

const CityWeatherDetails = ({ cityName, setSelectedCity, fetchWeatherData }) => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    fetchWeatherData(cityName).then(data => setWeatherData(data));
  }, [cityName]);

  const handleBackClick = () => {
    setSelectedCity(null);
  };

  return (
    <>
    <div className="containers">
      {weatherData && (
        <div className="results">
          <div className="images">
            <img className="icons" src={weatherData.current.condition.icon} alt="Weather-icon" />
          </div>
          <div className="contents">
            <p className="titles">Location:<b> {weatherData.location.name}</b></p>
            <p>Temperature: <b>{weatherData.current.temp_c}°C</b></p>
            <p>Condition:<b> {weatherData.current.condition.text}</b></p>
            <p>Humidity: <b>{weatherData.current.humidity}%</b></p>
            <p>Wind: <b>{weatherData.current.wind_kph} km/h</b></p>
          </div>
        </div>
      )}
    </div>
    <button className="back" onClick={handleBackClick}>Back</button>
    </>
  );
};

export default Search;
