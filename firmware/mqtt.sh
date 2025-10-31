#!/bin/bash
BROKER="192.168.15.9"
TOPIC="home/led"
MESSAGE=$1

mosquitto_pub -h $BROKER -t $TOPIC -m "$MESSAGE"
