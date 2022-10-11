#!/bin/bash
for i in {1..5000}
do
   curl --location --request GET 'http://192.168.0.135:3001/api/v1/autocomplete/ye?limit=10&sort=DESC' \
  --header 'Authorization: Bearer THE_ONE' --header "X-Forwarded-For: 1.2.3.${i}"
done
