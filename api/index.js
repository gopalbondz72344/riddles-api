const express = require('express');
const axios = require('axios');
const fuzzy = require('fuzzy');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors({origin: "http://localhost:3000"}));
app.use(express.json());

const RIDDLES_API = 'https://riddles-api.vercel.app/random';

// Normalize answer
const normalizeAnswer = (answer) => {
  return answer.trim().toLowerCase();
};

// Fetch a single riddle
const fetchRiddle = async () => {
  try {
    const response = await axios.get(RIDDLES_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching riddle:', error);
    throw new Error('Unable to fetch riddle from external API');
  }
};

// Fetch multiple riddles
app.get('/riddles', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 1;
    if (count <= 0 || count > 10) {
      return res.status(400).json({ error: 'Invalid count. Please request between 1 and 10 riddles.' });
    }

    const riddles = [];
    for (let i = 0; i < count; i++) {
      try {
        const riddle = await fetchRiddle();
        riddles.push(riddle);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch a riddle' });
      }
    }

    res.json(riddles);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'An unexpected error occurred while fetching riddles.' });
  }
});

// Check answer
app.post('/check-answer', (req, res) => {
  const { riddle, userAnswer } = req.body;

  if (!riddle || !userAnswer) {
    return res.status(400).json({ error: 'Both riddle and userAnswer are required' });
  }

  try {
    const correctAnswer = normalizeAnswer(riddle.answer);
    const userAnswerNormalized = normalizeAnswer(userAnswer);
    const fuzzyMatch = fuzzy.test(userAnswerNormalized, correctAnswer);

    if (correctAnswer === userAnswerNormalized || fuzzyMatch) {
      return res.json({ message: 'Correct answer!' });
    } else {
      return res.json({ message: 'Incorrect answer. Try again!' });
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return res.status(500).json({ error: 'An error occurred while checking the answer' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;