# Instructions for running application

## Prerequisites

- Install Docker: Please ensure Docker is installed on your system. You can find installation instructions for your operating system on the official Docker website (https://docs.docker.com/get-docker/).

- Install Docker Compose: Docker Compose is usually included with Docker Desktop installations. If you need to install it separately, refer to the official Docker Compose documentation (https://docs.docker.com/compose/install/).

## Application Instructions:

1. **Navigate to Application Root:**

   Ensure your terminal's current working directory is the root of your application, where your `docker-compose.yml` file is located. The context for your application is the current directory (`.`).

2. **Set Ownership for out Directory:**

   To allow the non-root user to access the `out` directory, run the following command:

   ```
   sudo chown 1000:1000 -R out
   ```

3. **Create Redis Volume:**

   ```
   docker volume create vol_redis
   ```

4. **Create ChromaDB Volume:**
   Create a Docker volume for ChromaDB to persist its data:

   ```
   docker volume create vol_chromadb
   ```

5. **Create .env.scrape File:**
   Move provided file named `.env.scrape` to your application's root directory. This file will contain environment variables for your scraping service.

6. **Create .env.api File:**
   Move provided file named `.env.api` to your application's root directory. This file will contain environment variables for your API service.

7. **Run Application with Docker Compose:**
   Start your application services using Docker Compose:
   ```
   docker compose up
   ```

## APIs

1. **Chat API:**

   **URL:** `https://ots_demo.ulatr.info/api/v1/chats`

   **Method:** `POST`

   **Request Body:**

   _Example:_

   ```json
   {
     "text": "How do I add a YouTube?"
   }
   ```

   **Response:**

   _Example:_

   ```json
   {
     "success": true,
     "data": [
       ["Putting YouTube video on your digital signs screens is easy with..."]
     ]
   }
   ```

2. **Log API**

   **URL:** `https://ots_demo.ulatr.info/api/v1/logs`

   **Method:** `GET`

   **Response:**

   _Example:_

   ```json
   {
     "success": true,
     "data": [
       "[2025-06-18 11:40:37] - add: 0 | updated: 0 | skipped: 393",
       "[2025-06-18 11:39:42] - add: 393 | updated: 0 | skipped: 0"
     ]
   }
   ```
