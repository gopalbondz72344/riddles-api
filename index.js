const express = require('express');
const axios = require('axios');
const fuzzy = require('fuzzy'); // Optional: For fuzzy matching
const path = require('path'); // Import path module

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for Vercel

app.use(express.json()); // For parsing JSON

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const RIDDLES_API = 'https://riddles-api.vercel.app/random';

// Function to normalize the answers by trimming spaces and converting to lowercase
const normalizeAnswer = (answer) => {
  return answer.trim().toLowerCase();
};

// Fetch a single riddle from the Riddles API
const fetchRiddle = async () => {
  try {
    const response = await axios.get(RIDDLES_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching riddle:', error);
    throw new Error('Unable to fetch riddle from external API');
  }
};

// Route to fetch multiple riddles (based on user-specified count)
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

// Route to check the answer to a specific riddle
app.post('/check-answer', (req, res) => {
  const { riddle, userAnswer } = req.body;

  // Ensure the riddle and userAnswer are provided
  if (!riddle || !userAnswer) {
    return res.status(400).json({ error: 'Both riddle and userAnswer are required' });
  }

  try {
    // Normalize both the user's answer and the correct answer
    const correctAnswer = normalizeAnswer(riddle.answer);
    const userAnswerNormalized = normalizeAnswer(userAnswer);

    // Optionally, use fuzzy matching for approximate matches (if needed)
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

// Catch-all for unexpected errors
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});