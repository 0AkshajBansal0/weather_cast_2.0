import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import './App.css'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

function App() {
  const [city, setCity] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [forecastData, setForecastData] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.backgroundImage = `url(images/aa72913855f9e02a949a5c392b48299e.jpg)`
  }, [])

  const getWeatherIcon = (main) => {
    const icons = {
      Clouds: 'clouds.svg',
      Drizzle: 'drizzle.svg',
      Rain: 'rain.svg',
      Snow: 'snow.svg',
      Mist: 'atmosphere.svg',
      Clear: 'clear.svg'
    }
    return icons[main] || 'thunderstorm.svg'
  }

  const getWeatherBg = (main) => {
    const backgrounds = {
      Clouds: 'images/clouds.gif',
      Drizzle: 'images/drizzle.gif',
      Rain: 'images/rain.gif',
      Snow: 'images/snow.gif',
      Mist: 'images/mist.gif',
      Clear: 'images/aa72913855f9e02a949a5c392b48299e.jpg',
      Haze: 'images/haze.webp'
    }
    return backgrounds[main] || 'images/thunderstorm.gif'
  }

  const handleSearch = async (e) => {
    if (e.key && e.key !== 'Enter') return
    if (!city.trim()) return

    setLoading(true)
    setError(false)

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      )
      const weatherResult = await weatherResponse.json()

      if (weatherResult.cod !== 200) {
        setError(true)
        setWeatherData(null)
        return
      }

      setWeatherData(weatherResult)
      document.body.style.backgroundImage = `url(${getWeatherBg(weatherResult.weather[0].main)})`

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      )
      const forecastResult = await forecastResponse.json()

      const todayDate = new Date().toISOString().split('T')[0]
      const filteredForecasts = forecastResult.list
        .filter(item =>
          item.dt_txt.includes('12:00:00') && !item.dt_txt.includes(todayDate)
        )
        .slice(0, 6)

      setForecastData(filteredForecasts)
    } catch (err) {
      setError(true)
      setWeatherData(null)
    } finally {
      setLoading(false)
      setCity('')
    }
  }

  return (
    <div className="main">
      <div className="first">
        <header className="input">
          <input
            type="text"
            className="city-input"
            placeholder="Search City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="search-btn" onClick={handleSearch}>
            <span className="material-symbols-outlined">search</span>
          </button>
        </header>

        {loading && (
          <section className="search-city section-message">
            <h1>Loading...</h1>
          </section>
        )}

        {!loading && !weatherData && !error && (
          <section className="search-city section-message">
            <img src="Messages/search-city.png" alt="Search city" />
            <div>
              <h1>Search City</h1>
              <h4 className="regular-txt">
                Find out the Weather Conditions of the city
              </h4>
            </div>
          </section>
        )}

        {error && (
          <section className="not-found section-message">
            <img src="Messages/not-found.png" alt="City not found" />
            <div>
              <h1>City Not Found</h1>
              <h4 className="regular-txt">
                Please enter a valid city name
              </h4>
            </div>
          </section>
        )}

        {weatherData && (
          <section className="weather-info">
            <div className="location-date">
              <div className="location">
                <span className="material-symbols-outlined">location_on</span>
                <h4 className="country-txt">{weatherData.name}</h4>
              </div>
              <h5 className="current-date-txt regular-txt">
                {format(new Date(), 'EEE, dd MMM')}
              </h5>
            </div>

            <div className="weather-summary-container">
              <img
                src={`weather-svgs/${getWeatherIcon(weatherData.weather[0].main)}`}
                alt=""
                className="weather-summary-img"
              />
              <div className="weather-summary-info">
                <h1 className="temp-txt">{Math.round(weatherData.main.temp)} °C</h1>
                <h3 className="condition-txt regular-txt">{weatherData.weather[0].main}</h3>
              </div>
            </div>

            <div className="weather-conditions-container">
              <div className="condition-item">
                <span className="material-symbols-outlined">water_drop</span>
                <div className="condition-info">
                  <h5 className="regular-txt">humidity</h5>
                  <h5 className="humidity-value-txt">{weatherData.main.humidity}%</h5>
                </div>
              </div>

              <div className="condition-item">
                <span className="material-symbols-outlined">air</span>
                <div className="condition-info">
                  <h5 className="regular-txt">Wind Speed</h5>
                  <h5 className="wind-value-txt">{weatherData.wind.speed} Km/hr</h5>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {weatherData && forecastData.length > 0 && (
        <div className="second">
          <div className="forecast-items-container">
            {forecastData.map((forecast, index) => (
              <div className="forecast-item" key={index}>
                <h5 className="forecast-item-date regular-txt">
                  {format(new Date(forecast.dt_txt), 'dd MMM')}
                </h5>
                <img
                  src={`weather-svgs/${getWeatherIcon(forecast.weather[0].main)}`}
                  className="forcast-item-img"
                  alt=""
                />
                <h5 className="forecast-item-temp">{Math.round(forecast.main.temp)} °C</h5>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
