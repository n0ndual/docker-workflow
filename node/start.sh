#!/bin/bash
while ! nc -z redis 6379; do sleep 3; done
nodemon /src/index.js
