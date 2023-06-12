class WeatherApi {
  async getUserLocationWeather(x, y) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&appid=4de0326522afcc173524251c3d641fec`;

    return await fetch(url, { method: "GET" })
      .then((response) => response.json())
      .catch((error) => {
        alert("Oops... Something went wrong. Try later");
      });
  }

  async getWeather(cityId) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityId}&appid=4de0326522afcc173524251c3d641fec`;

    return await fetch(url, { method: "POST" })
      .then((response) => response.json())
      .catch((error) => {
        alert("Oops... Something went wrong. Try later");
      });
  }
}

class Weather extends WeatherApi {
  list = document.querySelector(".cities");
  statusLocationRequest = document.querySelector(".city__error-message");
  $form = document.querySelector("form");
  $cityName = document.querySelector(".form__input");
  $button = document.querySelector("button");
  isVisibleList = false;

  constructor() {
    super();
    this.init();
  }

  init() {
    const { geolocation } = window.navigator;
    if (geolocation) {
      geolocation.getCurrentPosition(
        this.locationSuccess.bind(this),
        this.locationError.bind(this)
      );
    }

    this.list.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { target } = e;
      if (target.nodeName === "LI") {
        if (this.isVisibleList) {
          this.setLS(target.textContent);
          this.getCityWeather(target.textContent);
          this.list.prepend(target);
        }
        this.isVisibleList = !this.isVisibleList;
        for (let i = 0; i < this.list.children.length; i++) {
          if (i !== 0) {
            this.list.children[i].style.display = this.isVisibleList
              ? "block"
              : "none";
          }
        }
      }
    });
  }

  locationSuccess(position) {
    const { latitude, longitude } = position.coords;
    const response = this.getUserLocationWeather(latitude, longitude);
    response.then((data) => this.renderData(data, true));
  }

  locationError() {
    this.statusLocationRequest.textContent =
      "Ooops! Something else wrong... Try later";
    this.statusLocationRequest.style.opacity = "100%";
  }

  getCityWeather(city) {
    const response = this.getWeather(city);
    response.then((data) => this.renderData(data));
  }

  convertion(value) {
    return Math.floor(value - 273);
  }

  getCurrentDate() {
    let newDate = new Date();
    let optionsDate = {
      month: "long",
      day: "numeric",
    };
    let optionsTime = {
      hour: "numeric",
      minute: "numeric",
    };
    let date = newDate.toLocaleString("en-ES", optionsDate);
    let time = newDate.toLocaleString("en-ES", optionsTime);

    return `${time.toLowerCase()}, ${date}`;
  }

  changeFormat(number) {
    if (number < 10) {
      number = "0" + number;

      return number;
    }
    if (number === 13) {
      return number === 1;
    }
  }

  convertionDistance(distance) {
    return Math.floor(distance / 1000);
  }

  setLS(data) {
    localStorage.setItem("city", data);
  }

  renderData(data, isInitialRequestData = false) {
    const { name, weather, main, sys, wind, visibility } = data;

    const userLocation = document.querySelectorAll(".city-name--location");
    const temperature = document.querySelector(".temperature");
    const picture = document.querySelector(".picture");
    const currentWeather = document.querySelector(".current-weather");
    const dataWrapper = document.querySelector(".data-wrapper");

    userLocation.textContent = name;

    if (isInitialRequestData) this.list.firstElementChild.innerText = name;

    let dataWeather = weather["0"].description;
    let dataTemperature = main.temp;
    let dataCity = `${name}  ${sys.country}`;

    currentWeather.innerText = dataWeather;
    let textDateOfTemperature = `${this.convertion(dataTemperature)}°C`;
    temperature.innerText = textDateOfTemperature;
    picture.innerHTML = `<img class = 'weather__icon'src = 'http://openweathermap.org/img/wn/${
      weather[0].icon || "there is no data"
    }@2x.png'></img>`;

    if (dataWrapper.firstChild) {
      dataWrapper.firstChild.remove();
    }

    dataWrapper.insertAdjacentHTML(
      "afterbegin",
      `<div class='data'>
        <span class='data__date'>${this.getCurrentDate()}</span>
        <h2 class="data__title">${dataCity}</h2>
        <div>
          <img 
            class='data__icon'
            src='http://openweathermap.org/img/wn/${weather[0].icon}@2x.png'>
          </img> 
        </div>
        <p>Feels like ${this.convertion(main.feels_like)} ${
        weather[0].description
      }
        </p>
        <div class="data__footer">
          <div>
            <i class="fas fa-location-arrow data__footer-arrow"></i>
            <span>${wind.speed} m/s</span>
          </div>
          <div>
            <i class="fas fa-regular fa-smog"></i>
            <span>${main.pressure} hPo</span>
          </div>
          <div>
            Humidity: ${main.humidity}%
          </div>
          <div>
            Dew point: ${this.convertion(dataTemperature)}°C
          </div>
          <div>
            Visibility: ${this.convertionDistance(visibility)} km
          </div>
        </div>
      </div>`
    );
  }
}

let weatherApp = new Weather();
