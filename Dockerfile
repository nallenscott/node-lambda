# Stage 1: Build the executable
FROM node:latest as builder
WORKDIR /app
COPY . .
RUN npm install -g pkg
RUN pkg -t latest-linux-x64 -o bootstrap .

# Stage 2: Create the scratch container
FROM scratch
COPY --from=builder /app/bootstrap .
ENTRYPOINT ["./bootstrap"]
