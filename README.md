# Riddles API

This project provides an API to fetch random riddles and check answers. It uses Express.js for the server and Axios to fetch riddles from an external API.

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd riddles
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:4000`.

## API Endpoints

### Fetch Riddles

- **Endpoint:** `/riddles`
- **Method:** `GET`
- **Query Parameters:**
  - `count` (optional): Number of riddles to fetch (default is 1, max is 10)
- **Response:**
  ```json
  [
    {
      "question": "What has keys but can't open locks?",
      "answer": "A piano"
    }
  ]
  ```

### Check Answer

- **Endpoint:** `/check-answer`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "riddle": {
      "question": "What has keys but can't open locks?",
      "answer": "A piano"
    },
    "userAnswer": "a piano"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Correct answer!"
  }
  ```

## License

This project is licensed under the MIT License.
