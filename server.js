/* eslint-env node */
/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

const express = require('express');
const fetch = require('node-fetch');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

// Read the .env file
const dotenv = require('dotenv');
dotenv.config();

// CODELAB: Change this to add a delay (ms) before the server responds.
const FORECAST_DELAY = 0; // 3000

// CODELAB: If running locally, set your Open Weather Map API key here
const API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall?&units=metric'; // `http://api.openweathermap.org/data/2.5/weather`;

// Fake forecast data used if we can't reach the Open Weather Map API
const fakeForecast = {
  fakeData: true,
  latitude: 0,
  longitude: 0,
  timezone: 'America/New_York',
  currently: {
    time: 0,
    summary: 'Clear',
    icon: 'clear-day',
    temperature: 43.4,
    humidity: 0.62,
    windSpeed: 3.74,
    windBearing: 208,
  },
  daily: {
    data: [
      {
        time: 0,
        icon: 'partly-cloudy-night',
        sunriseTime: 1553079633,
        sunsetTime: 1553123320,
        temperatureHigh: 52.91,
        temperatureLow: 41.35,
      },
      {
        time: 86400,
        icon: 'rain',
        sunriseTime: 1553165933,
        sunsetTime: 1553209784,
        temperatureHigh: 48.01,
        temperatureLow: 44.17,
      },
      {
        time: 172800,
        icon: 'rain',
        sunriseTime: 1553252232,
        sunsetTime: 1553296247,
        temperatureHigh: 50.31,
        temperatureLow: 33.61,
      },
      {
        time: 259200,
        icon: 'partly-cloudy-night',
        sunriseTime: 1553338532,
        sunsetTime: 1553382710,
        temperatureHigh: 46.44,
        temperatureLow: 33.82,
      },
      {
        time: 345600,
        icon: 'partly-cloudy-night',
        sunriseTime: 1553424831,
        sunsetTime: 1553469172,
        temperatureHigh: 60.5,
        temperatureLow: 43.82,
      },
      {
        time: 432000,
        icon: 'rain',
        sunriseTime: 1553511130,
        sunsetTime: 1553555635,
        temperatureHigh: 61.79,
        temperatureLow: 32.8,
      },
      {
        time: 518400,
        icon: 'rain',
        sunriseTime: 1553597430,
        sunsetTime: 1553642098,
        temperatureHigh: 48.28,
        temperatureLow: 33.49,
      },
      {
        time: 604800,
        icon: 'snow',
        sunriseTime: 1553683730,
        sunsetTime: 1553728560,
        temperatureHigh: 43.58,
        temperatureLow: 33.68,
      },
    ],
  },
};

/**
 * Generates a fake forecast in case the weather API is not available.
 *
 * @param {String} location GPS location to use.
 * @return {Object} forecast object.
 */
function generateFakeForecast(location) {
  location = location || '40.7720232, -73.9732319';
  const commaAt = location.indexOf(',');

  // Create a new copy of the forecast
  const result = Object.assign({}, fakeForecast);
  result.latitude = parseFloat(location.substr(0, commaAt));
  result.longitude = parseFloat(location.substr(commaAt + 1));
  return result;
}

/**
 * Gets the weather forecast from the Open Weather Map API for the given location.
 *
 * @param {Request} req request object from Express.
 * @param {Response} resp response object from Express.
 */
function getForecast(req, resp) {
  const location = req.params.location || '11.92988, -85.95602';
  const commaAt = location.indexOf(',');

  const latitude = parseFloat(location.substr(0, commaAt));
  const longitude = parseFloat(location.substr(commaAt + 1));

  const url = `${BASE_URL}&lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
  console.log(url);

  fetch(url)
    .then((resp) => {
      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }
      return resp.json();
    })
    .then((data) => {
      setTimeout(() => {
        // console.log(data);

        resp.json(data);
      }, FORECAST_DELAY);
    })
    .catch((err) => {
      console.error('Open Weather Map API Error:', err.message);
      resp.json(generateFakeForecast(location));
    });
}

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() {
  // const fs = require('fs');
  // const https = require('https');
  // const ngrok = require('ngrok');
  const app = express();

  // Redirect HTTP to HTTPS,
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

  // Logging for each request
  app.use((req, resp, next) => {
    const now = new Date();
    const time = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
    const path = `"${req.method} ${req.path}"`;
    const m = `${req.ip} - ${time} - ${path}`;
    // eslint-disable-next-line no-console
    console.log(m);
    next();
  });

  // Handle requests for the data
  app.get('/forecast/:location', getForecast);
  app.get('/forecast/', getForecast);
  app.get('/forecast', getForecast);

  // Handle requests for static files
  app.use(express.static('public'));

  // Start the server HTTPS
  // return https
  //   .createServer(
  //     {
  //       key: fs.readFileSync('server.key'),
  //       cert: fs.readFileSync('server.cert'),
  //     },
  //     app
  //   )
  //   .listen(8000, function () {
  //     console.log('Local DevServer Started on port https://localhost:8000/');
  //   });

  // Run CMD process
  // const util = require('util');
  // const exec = util.promisify(require('child_process').exec);

  // Start the server
  return app.listen(8000, () => {
    console.log('Local DevServer Started on port http://localhost:8000/');

    // (async function () {
    //   const { stdout, stderr } = await exec('ngrok.cmd https 8000');
    //   console.log('stdout:', stdout);
    //   console.log('stderr:', stderr);
    // })();

    // (async function () {
    //   const ngrokURL = await ngrok.connect(8000);
    //   console.log(`Local DevServer Started ${ngrokURL}`);
    // })();
  });
}

startServer();
