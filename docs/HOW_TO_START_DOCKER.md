# How to Start Docker - Complete Guide 🐳

This guide will walk you through installing Docker, building your application, and running it with Docker.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing Docker](#installing-docker)
3. [Verifying Docker Installation](#verifying-docker-installation)
4. [Understanding Your Docker Setup](#understanding-your-docker-setup)
5. [Starting Docker with Docker Compose](#starting-docker-with-docker-compose)
6. [Starting Docker Manually](#starting-docker-manually)
7. [Common Commands](#common-commands)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have:

- A computer running macOS, Windows, or Linux
- Administrator/sudo access
- At least 4GB of RAM available
- Internet connection

---

## Installing Docker

### For macOS

1. **Download Docker Desktop:**
   - Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Click "Download for Mac"
   - Choose the version for your Mac (Intel or Apple Silicon)

2. **Install Docker Desktop:**
   - Open the downloaded `.dmg` file
   - Drag Docker to Applications folder
   - Open Docker from Applications
   - Follow the setup wizard
   - Enter your password when prompted

3. **Start Docker Desktop:**
   - Docker Desktop will appear in your menu bar (whale icon 🐳)
   - Wait until it shows "Docker Desktop is running"

### For Windows

1. **Download Docker Desktop:**
   - Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Click "Download for Windows"

2. **Install Docker Desktop:**
   - Run the installer
   - Follow the setup wizard
   - Restart your computer if prompted

3. **Start Docker Desktop:**
   - Open Docker Desktop from Start menu
   - Wait until it shows "Docker Desktop is running"

### For Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

---

## Verifying Docker Installation

Open your terminal/command prompt and run:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Test Docker with a simple container
docker run hello-world
```

**Expected output:**

- Docker version should be displayed (e.g., `Docker version 24.0.0`)
- Docker Compose version should be displayed
- The `hello-world` container should run successfully and print a welcome message

If you see errors, make sure Docker Desktop is running (macOS/Windows) or Docker service is started (Linux).

---

## Understanding Your Docker Setup

Your project has two main Docker files:

1. **`Dockerfile`** - Instructions for building your app image
2. **`docker-compose.yml`** - Configuration for running your app with Docker Compose

### Quick Overview

- **Dockerfile**: Builds your Next.js app into a Docker image
- **docker-compose.yml**: Defines how to run your app (ports, environment variables, etc.)

---

## Starting Docker with Docker Compose (Recommended)

Docker Compose is the easiest way to start your application. It handles building and running everything automatically.

### Step 1: Navigate to Your Project

```bash
cd "/Users/shubhamchopde/Desktop/fullStack Dockr/frontend"
```

### Step 2: Create Environment File (if needed)

Create a `.env` file in the `frontend` directory with your environment variables:

```bash
# Create .env file
touch .env
```

Add your environment variables to `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Build and Start with Docker Compose

```bash
# Build and start the container
docker compose up --build
```

**What this does:**

- Builds your Docker image (if not already built)
- Starts the container
- Shows logs in the terminal

**To run in the background (detached mode):**

```bash
docker compose up -d --build
```

### Step 4: Access Your Application

Once started, open your browser and go to:

- **http://localhost:3000**

### Step 5: Stop the Container

Press `Ctrl + C` in the terminal, or if running in detached mode:

```bash
docker compose down
```

---

## Starting Docker Manually

If you prefer to build and run Docker manually without Docker Compose:

### Step 1: Build the Docker Image

```bash
# Navigate to frontend directory
cd "/Users/shubhamchopde/Desktop/fullStack Dockr/frontend"

# Build the image
docker build -t fullstack-app .
```

**What this does:**

- Reads your `Dockerfile`
- Builds a Docker image named `fullstack-app`
- Takes a few minutes the first time (downloads dependencies)

### Step 2: Run the Container

```bash
# Run the container with environment variables
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_secret" \
  -e JWT_REFRESH_SECRET="your_refresh_secret" \
  -e NEXT_PUBLIC_API_URL="http://localhost:3000/api" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  fullstack-app
```

**Or use an environment file:**

```bash
# Create .env file first, then:
docker run -p 3000:3000 --env-file .env fullstack-app
```

### Step 3: Access Your Application

Open your browser and go to:

- **http://localhost:3000**

### Step 4: Stop the Container

Press `Ctrl + C` in the terminal, or in another terminal:

```bash
# Find the container ID
docker ps

# Stop the container
docker stop <container_id>
```

---

## Common Commands

### Docker Compose Commands

```bash
# Start containers
docker compose up

# Start in background (detached)
docker compose up -d

# Build and start
docker compose up --build

# Stop containers
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs

# View logs in real-time
docker compose logs -f

# Restart containers
docker compose restart

# Check container status
docker compose ps
```

### Docker Commands

```bash
# Build an image
docker build -t image-name .

# Run a container
docker run -p 3000:3000 image-name

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop <container_id>

# Remove a container
docker rm <container_id>

# List images
docker images

# Remove an image
docker rmi <image_id>

# View container logs
docker logs <container_id>

# View logs in real-time
docker logs -f <container_id>

# Execute command in running container
docker exec -it <container_id> /bin/sh

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a
```

---

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Solution:**

- **macOS/Windows**: Make sure Docker Desktop is running (check menu bar/notification area)
- **Linux**: Start Docker service: `sudo systemctl start docker`

### Issue: "Port 3000 is already in use"

**Solution:**

- Stop the process using port 3000, or
- Change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000" # Use port 3001 instead
  ```
- Then access at `http://localhost:3001`

### Issue: "Build fails with npm errors"

**Solution:**

- Make sure `package.json` and `package-lock.json` exist
- Try cleaning Docker cache:
  ```bash
  docker system prune -a
  docker compose build --no-cache
  ```

### Issue: "Environment variables not working"

**Solution:**

- Make sure `.env` file exists in the `frontend` directory
- Check that variable names match in `.env` and `docker-compose.yml`
- Restart containers after changing `.env`:
  ```bash
  docker compose down
  docker compose up --build
  ```

### Issue: "Container starts but app doesn't load"

**Solution:**

- Check container logs:
  ```bash
  docker compose logs
  # or
  docker logs <container_id>
  ```
- Verify the app is listening on port 3000 inside the container
- Check if MongoDB connection is working

### Issue: "Permission denied" (Linux)

**Solution:**

- Add your user to docker group:
  ```bash
  sudo usermod -aG docker $USER
  ```
- Log out and log back in
- Or use `sudo` with docker commands (not recommended)

### Issue: "Out of disk space"

**Solution:**

- Clean up unused Docker resources:
  ```bash
  docker system prune -a --volumes
  ```
- This removes:
  - All stopped containers
  - All unused images
  - All unused volumes
  - All unused networks

---

## Quick Start Checklist

✅ Docker Desktop installed and running  
✅ Navigated to `frontend` directory  
✅ Created `.env` file with environment variables  
✅ Run `docker compose up --build`  
✅ Open `http://localhost:3000` in browser  
✅ Application loads successfully

---

## Next Steps

Once Docker is running successfully:

1. **Development**: Make changes to your code and rebuild:

   ```bash
   docker compose up --build
   ```

2. **Production**: Build optimized image:

   ```bash
   docker build -t fullstack-app:production .
   ```

3. **Deployment**: Push to Docker Hub or container registry:
   ```bash
   docker tag fullstack-app:production yourusername/fullstack-app:latest
   docker push yourusername/fullstack-app:latest
   ```

---

## Additional Resources

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- See `DOCKER_EXPLAINED.md` for detailed explanation of your Dockerfile

---

**Happy Dockerizing! 🐳🚀**

