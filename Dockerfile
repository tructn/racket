FROM golang:alpine

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download && go mod verify

COPY . ./

RUN go build -v -o ./app

ENV GIN_MODE=release

CMD ["./app"]