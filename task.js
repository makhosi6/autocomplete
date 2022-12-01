/* eslint-disable no-undef */
[
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '0',
  'words_lowercase',
].map(letter => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    'Bearer A8E6YziXl3RmoYAq1LjIH8f8LZtEbrDDsOEqAs8i'
  );

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  fetch(
    `http://localhost:3001/secret/feed-data/${letter.toLowerCase()}`,
    requestOptions
  )
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
});

/**
 *
 *
 *
 *
 *
 */
const myHeaders = new Headers();
myHeaders.append(
  'Authorization',
  'Bearer A8E6YziXl3RmoYAq1LjIH8f8LZtEbrDDsOEqAs8i'
);

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};

fetch('http://localhost:3001/secret/boot', requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
