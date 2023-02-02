#!/bin/bash

temp=$(sensors | grep Tctl | awk '{print $2}' | tr -d '°C+')
result=$(echo "$temp" | bc)
echo $result
