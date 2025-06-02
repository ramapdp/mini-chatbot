FROM node:20

# Install Chromium dan dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set working dir dan copy
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set path ke Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

VOLUME ["/app/.wwebjs_auth"]
VOLUME ["/app/.wwebjs_cache"]

CMD ["node", "index.js"]
