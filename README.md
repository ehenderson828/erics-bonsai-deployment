# Bonsai Sensor Dashboard

This project is a dashboard for monitoring Bonsai sensor data. It displays the latest sensor readings along with interactive charts to visualize data over time.

## Features

- **Tiles** displaying the latest sensor data:
  - Temperature
  - Humidity
  - Pressure
  - Battery Voltage
  - 24hr High & Low Temperature
- **Interactive Line Charts** for:
  - Temperature & Humidity (with dual Y-axes)
  - Pressure
  - Battery Voltage

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (optional, but recommended)

### Clone the Repository

```
git clone https://github.com/yourusername/erics-bonsai.git
cd erics-bonsai
```

### Install Dependencies

Using Yarn:
```
yarn install
```


### Running the Project

To start the development server:

Using Yarn:
```
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000).


## Building for Production

To build the project for production:

Using Yarn:
```
yarn build
```

The production-ready files will be located in the `build` directory.

## License

This project is licensed under the MIT License.
