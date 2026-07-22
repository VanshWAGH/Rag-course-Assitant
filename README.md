# Advanced RAG Course Assistant

A Node.js based command-line assistant using Retrieval-Augmented Generation (RAG). It uses Google's Gemini API for generation and Qdrant as the vector database.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker](https://www.docker.com/) and Docker Compose (for running the Qdrant vector database)

## Setup and Installation

1. **Clone the repository** (if you haven't already) and navigate to the project directory:
   ```bash
   cd advanced-rag-course-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory if it doesn't exist, and add the necessary environment variables. You can use the provided `.env` format:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=
   QDRANT_COLLECTION_NAME=advanced_rag_course
   ```
   *Note: Replace `your_gemini_api_key_here` with your actual Google Gemini API key.*

4. **Start the Vector Database (Qdrant)**:
   This project uses Qdrant via Docker. Start it in the background by running:
   ```bash
   docker-compose up -d
   ```

## Usage

This project provides several CLI scripts via `npm`. Here are the available commands:

### 1. Ingest Data
Before you can ask questions, you need to ingest the documents/data into the Qdrant vector database.
```bash
npm run ingest
```

### 2. Chat with the Assistant
Start an interactive chat session with the assistant.
```bash
npm run chat
# or simply
npm run dev
```

### 3. Ask a Single Question
Use this if you want to ask a direct question without entering an interactive chat loop.
```bash
npm run ask
```

### 4. Reindex Data
If you need to reindex your dataset, you can run:
```bash
npm run reindex
```

## Testing

To run the test suite (powered by Vitest):
```bash
npm test
```
