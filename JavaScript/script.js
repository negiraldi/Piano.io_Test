const fs = require('fs');
const axios = require('axios');

// Step 1: Merge file A and file B into file C
const fileA = fs.readFileSync('fileA.csv', 'utf-8');
const fileB = fs.readFileSync('fileB.csv', 'utf-8');

const dataA = fileA.split('\n').slice(1);
const dataB = fileB.split('\n').slice(1);

const mergedData = dataA.map((lineA, index) => {
  const fieldsA = lineA.split(',');
  const fieldsB = dataB[index].split(',');
  return [fieldsA[0], fieldsA[1], fieldsB[1], fieldsB[2]];
});

const fileC = 'user_id,email,first_name,last_name\n' + mergedData.join('\n');

// Step 2: Query the system API to check if users exist
const apiEndpoint = 'https://sandbox.piano.io/api/v3/publisher/user/list';
const aid = 'o1sRRZSLlw';
const apiToken = 'xeYjNEhmutkgkqCZyhBn6DErVntAKDx30FqFOS6D';

async function checkUserExists(email) {
  const url = `${apiEndpoint}?aid=${aid}&offset=0&api_token=${apiToken}&q=${email}`;
  try {
    const response = await axios.get(url);
    const { users } = response.data;
    if (users.length > 0) {
      return users[0].uid;
    }
  } catch (error) {
    console.error('Error querying the system API:', error.message);
  }
  return null;
}

// Step 3: Replace user IDs with system IDs in file C
async function processFileC() {
  const lines = fileC.split('\n');
  const updatedLines = [];
  updatedLines.push(lines[0]); // Header row

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    const email = fields[1];
    const uid = await checkUserExists(email);
    if (uid) {
      fields[0] = uid;
    }
    updatedLines.push(fields.join(','));
  }

  const updatedFileC = updatedLines.join('\n');

  // Save file C
  fs.writeFileSync('fileC.csv', updatedFileC, 'utf-8');
}

processFileC();