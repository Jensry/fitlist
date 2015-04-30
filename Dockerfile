# Use the standard nodejs image as a base
FROM library/node

# Install production dependencies.
ADD package.json /app/package.json
RUN cd /app && npm install --production

# Add the rest of the project to a folder app in the container.
ADD . /app

# Set working directory for the app:
WORKDIR /app

EXPOSE 9000

CMD node /app/server/server.js
