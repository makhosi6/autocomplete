const https = require('https'),
  fs = require('fs'),
  events = require('events');
const {v4: uuidv4} = require('uuid');

export interface Error {
  message: string;
}
// let err = [https, fs, events, uuidv4];
export function uniqueId(key: string) {
  //reverse the key
  const salt = [...key].reverse().join('');

  //hash the key
  const hash = Buffer.from(`${salt + key}`).toString('base64');

  ///exclude special chars
  return hash.replace(/[^a-zA-Z0-9 ]/g, '');
}
