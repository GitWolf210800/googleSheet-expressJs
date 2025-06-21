const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.json());

// Load service account credentials
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE));

// Create an authorized client
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

// Spreadsheet ID
const spreadsheetId = '1B7Y7G193AOPssi7C3kHYj6BG8ytfdqaUbUxd5A2w7Ns'; // Replace with your spreadsheet ID

// CREATE
app.post('/mahasiswa', async (req, res) => {
  const { name, nim, ipk } = req.body;

  if (!name || !nim || !ipk) {
    return res.status(400).send('All fields are required');
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1', // Replace with the appropriate range
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[name, nim, ipk]],
      },
    });
    res.status(200).send('Data saved successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error saving data');
  }
});

// READ
app.get('/mahasiswa', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:C', // Replace with the appropriate range
    });

    const rows = response.data.values;
    if (rows.length) {
      res.status(200).send(rows);
    } else {
      res.status(404).send('No data found');
    }
  } catch (err) {
    console.error('Error reading data:', err);
    res.status(500).send('Error reading data');
  }
});

// UPDATE
app.put('/mahasiswa/:row', async (req, res) => {
  const { row } = req.params;
  const { name, nim, ipk } = req.body;

  if (!name || !nim || !ipk) {
    return res.status(400).send('All fields are required');
  }

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${row}:C${row}`, // Replace with the appropriate range
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[name, nim, ipk]],
      },
    });
    res.status(200).send('Data updated successfully');
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).send('Error updating data');
  }
});

// DELETE
app.delete('/mahasiswa/:row', async (req, res) => {
  const { row } = req.params;

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${row}:C${row}`, // Replace with the appropriate range
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['', '', '']], // Clear the data
      },
    });
    res.status(200).send('Data deleted successfully');
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).send('Error deleting data');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
