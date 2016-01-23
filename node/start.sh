#!/bin/bash
while ! nc -z redis1 6379; do sleep 3; done
while ! nc -z redis2 6379; do sleep 3; done
nodemon /src/index.js
