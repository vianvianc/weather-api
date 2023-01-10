$(document).ready(function () {
  let currentDiv = $("#current");
  let fiveDaysDiv = $("#forecast");
  const apiKey = "5f7d81a3e5e751b9ae47b0813dc64954";
  let storage = JSON.parse(localStorage.getItem("history")) || [];

  navigator.geolocation.watchPosition(
    (success) => {
      let lat = success.coords.latitude;
      let lon = success.coords.longitude;

      getCurrentLocationForecast(lat, lon);
    },
    (error) => {
      if (storage.length > 0) {
        let city = storage[length - 1];
        getForecast(city);
      }
      getUVIndex(41.85, -87.65);
      getForecast("Denver");
    }
  );

  function getCurrentLocationForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      getForecast(response.name);
    });
  }

  $("#search-button").on("click", function (event) {
    event.preventDefault();
    let city = $("#search-value").val();
    $("#search-value").val("");
    getForecast(city);
    if (storage.indexOf(city) === -1) {
      storage.push(city);
    }
    localStorage.setItem("history", JSON.stringify(storage));
    displayRecent(storage);
  });

  $("body").on("click", ".recent", function () {
    let city = $(this).attr("data-name");
    getForecast(city);
  });

  function getForecast(searchValue) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&units=imperial&appid=${apiKey}`;
    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      getUVIndex(response.city.coord.lat, response.city.coord.lon);

      currentDiv.html("");
      fiveDaysDiv.html("");
      console.log(response);

      displayOneDay(response);
      fiveDays(response);
    });
  }

  function getUVIndex(lat, lon) {
    const url = `http://api.openweathermap.org/data/2.5/uvi?&lat=${lat}&lon=${lon}&appid=${apiKey}`;
    $.ajax({
      url: url,
      type: "GET",
    }).then(function (response) {
      uvIndexBtn(response.value);
    });
  }

  function uvIndexBtn(uvIndex) {
    let btnClass = "";
    if (uvIndex < 3) {
      btnClass = "success";
    } else if (uvIndex < 7) {
      btnClass = "warning";
    } else {
      btnClass = "danger";
    }
    let btnGroup = $("<div>").addClass("btn-group");
    let txt = $("<button>")
      .addClass(`btn btn-outline-${btnClass}`)
      .text("UV Index: ");
    let val = $("<button>").addClass(`btn btn-${btnClass}`).text(uvIndex);
    btnGroup.append(txt);
    btnGroup.append(val);
    $("body").find("#one-day .card-body .card-text").append(btnGroup);
  }

  function displayOneDay(data) {
    let cityCard = $("<div>").addClass("card").attr("id", "one-day");
    let cardHeader = $("<div>").addClass("card-header bg-white");
    let cardTitle = $("<div>").addClass("card-title");
    let cardBody = $("<div>").addClass("card-body");
    let cardText = $("<div>").addClass("card-text");
    let infoList = $("<ul>").addClass("list-unstyled");

    let cityName = data.city.name;
    let countryName = data.city.country;
    let currentDate = data.list[0].dt_txt.split(" ")[0].toLocaleString();
    let icon = `<img src="http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png">`;
    let temperature = data.list[0].main.temp.toFixed();
    let humidity = data.list[0].main.humidity;
    let windSpeed = data.list[0].wind.speed.toFixed();

    cardHeader.html(`<h1 class="text-custom">Weather Dashboard</h1>`);

    cardTitle.html(`
                  <h3>${cityName}, ${countryName}</h3>
                  <h5>${moment(currentDate).format("dddd, MMMM Do YYYY")}</h5>
                  <div class="d-flex align-items-center justify-content-center"> ${icon}<h1> ${temperature} </h1><span class="mb-4 font-weight-bold">°F</span> </div>
              `);

    infoList.html(`
          <li>Humidity: <b>${humidity} %</b></li>
          <li>Wind speed: <b>${windSpeed} MPH</b></li>
          `);

    cityCard.append(cardHeader);
    cityCard.append(cardBody);
    cardBody.append(cardTitle);
    cardBody.append(cardText);
    cardText.append(infoList);
    currentDiv.append(cityCard);
  }

  function displayRecent(arr) {
    let listGroup = $(".history");
    listGroup.html("");

    for (const element of arr) {
      let listGroupItem = $("<li>");
      let linkName = $("<a>");
      listGroupItem.addClass("list-group-item text-capitalize");
      linkName.attr("href", "#");
      linkName.addClass("recent");
      linkName.attr("data-name", element);
      linkName.text(element);
      listGroup.append(listGroupItem);
      listGroupItem.append(linkName);
    }
  }

  function fiveDays(data) {
    let dataRow = $("<div>");
    let title = $("<h3>").addClass("text-light text-center");

    dataRow.addClass("row my-3 justify-content-between");

    for (let i = 0; i < data.list.length; i++) {
      let dataCol = $("<div>");
      dataCol.addClass(
        "col-md-2 five-days mx-2 rounded text-dark p-3 text-center border"
      );
      let icon = `<img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png">`;
      if (data.list[i].dt_txt.includes("18:00:00")) {
        let date = data.list[i].dt_txt;
        dataCol.html(`
                  
            <h6>${moment(date).format("ddd, MMM Do")}</h6>
                      <div class="m-0">${icon}</div>
                      <ul class="list-unstyled m-0">
                      <li>Temp: <b>${data.list[
                        i
                      ].main.temp.toFixed()} °F</b></li>
            <li>Humidity:<b> ${data.list[i].main.humidity} %</b></li>
                      </ul>
            
          `);

        dataRow.append(dataCol);
      }
    }

    title.text("5-Day Forecast");
    fiveDaysDiv.append(title);
    fiveDaysDiv.append(dataRow);
  }

  displayRecent(storage);
});
