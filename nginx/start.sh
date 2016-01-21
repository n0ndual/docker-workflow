#!/bin/bash
while ! nc -z node1 8080; do sleep 3; done
while ! nc -z node2 8080; do sleep 3; done
service nginx start
