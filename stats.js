const express = require("express");
const os = require("os");
const exec = require("child_process").exec;
const app = express();

function getCpuLoad() {
  return new Promise((resolve, reject) => {
    exec("cat /proc/loadavg", (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        const load = stdout.split(" ")[0];
        resolve(load);
      }
    });
  });
}

function getCpuTemperature() {
  return new Promise((resolve, reject) => {
    exec("cat /sys/class/hwmon/hwmon0/temp1_input", (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        const temperature = parseFloat(stdout) / 1000;
        resolve(temperature);
      }
    });
  });
}

function getGpuTemperature() {
  return new Promise((resolve, reject) => {
    exec("nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader", (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        const temperature = parseFloat(stdout);
        resolve(temperature);
      }
    });
  });
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", (req, res) => {
  Promise.all([getCpuLoad(), getCpuTemperature(), getGpuTemperature()])
    .then(([cpuLoad, cpuTemperature, gpuTemperature]) => {
      res.json({ cpuLoad, cpuTemperature, gpuTemperature });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
