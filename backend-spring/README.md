# LiveHorizon Backend — Spring Boot

Java 21 / Spring Boot 3.4 rewrite of the Node + Express backend. Same REST
contract, same Socket.IO events, same MongoDB collections — the existing React
frontend talks to it with one line changed (see [Socket.IO port](#socketio-runs-on-its-own-port)).

```
src/main/java/com/livehorizon/
├── config/       AppProperties, SecurityConfig, SocketIoConfig, StorageConfig, WebConfig
├── common/       ApiException, GlobalExceptionHandler, RootController
├── security/     TokenAuthenticationFilter, RestAuthenticationEntryPoint, LoginRateLimiter
├── user/         User, UserRepository, UserService, UserController, dto/
├── meeting/      Meeting, MeetingRepository, MeetingService, dto/
├── storage/      AvatarService + Local/Cloudinary AvatarStorage
└── signaling/    RoomRegistry, SignalingHandler, SocketHandshakeAuthorizer, SocketIoLifecycle
```

## Running it

```bash
cd backend-spring && DATABASE_URL="mongodb://127.0.0.1:27017/livehorizon" mvn spring-boot:run
```

`application.yml` also imports `./.env` when present, so the same
`DATABASE_URL=...` file the Node backend used keeps working.

Build a runnable jar:

```bash
cd backend-spring && mvn clean package
```

```bash
java -jar backend-spring/target/livehorizon-backend-1.0.0.jar
```

## Configuration

Everything lives under `app.*` in `application.yml`; the env vars below are the
ones you normally set per environment.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | *(required)* | MongoDB connection string |
| `PORT` | `8080` | HTTP API port |
| `SOCKET_PORT` | `9092` | Socket.IO port |
| `UPLOAD_DIR` | `./uploads` | Local avatar directory |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | *(empty)* | Enables Cloudinary avatar storage |

Notable `app.*` keys: `app.cors.allowed-origins`, `app.auth.token-ttl`,
`app.auth.refresh-threshold`, `app.auth.login-max-attempts`,
`app.socket.require-auth`, `app.socket.chat-history-limit`,
`app.storage.max-size`.

## REST API

Base path `/api/v1/users`. Auth is `Authorization: Bearer <token>`; every error
body is `{"message": "..."}`.

| Method | Path | Auth | Success | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/` | – | `200` | `{"message":"Live Horizon Backend is running"}` |
| `POST` | `/register` | – | `201` | `409` when the username is taken |
| `POST` | `/login` | – | `200 {token}` | `404` unknown user, `401` bad password, `429` throttled |
| `GET` | `/me` | ✔ | `200` | `{name, username, avatarUrl}` |
| `POST` | `/logout` | ✔ | `200` | Clears the stored token |
| `PUT` | `/profile` | ✔ | `200` | `{message, user}` |
| `POST` | `/profile/avatar` | ✔ | `200 {avatarUrl}` | multipart field `avatar`; `415` wrong type, `413` over 5MB |
| `GET` | `/get-to-history` | ✔ | `200` | Newest first |
| `POST` | `/add-to-history` | ✔ | `201` | Body `{"meeting_code": "..."}` |
| `GET` | `/uploads/**` | – | `200` | Locally stored avatars |
| `GET` | `/actuator/health` | – | `200` | Includes live room/socket counts |

Tokens are 32 random bytes, hex encoded, with a sliding 1-day inactivity window.

## Socket.IO contract

Unchanged from the Node server, so `socket.io-client` v4 works as-is:

| Direction | Event | Arguments |
| --- | --- | --- |
| client → server | `join-call` | `(room)` |
| server → client | `user-joined` | `(joinerSocketId, membersInRoom[])` |
| client → server | `signal` | `(toSocketId, payload)` |
| server → client | `signal` | `(fromSocketId, payload)` |
| client → server | `chat-message` | `(data, sender)` |
| server → client | `chat-message` | `(data, sender, senderSocketId)` |
| server → client | `user-left` | `(socketId)` |

A late joiner is replayed the room's recent chat history, capped at
`app.socket.chat-history-limit`.

### Socket.IO runs on its own port

netty-socketio binds its own Netty listener, so it cannot share Tomcat's port.
Either point the frontend at it directly:

```js
// frontend/environment.js
export const socketServer = "https://api.example.com:9092";
```

…or proxy it, which keeps the frontend pointing at a single origin:

```nginx
location /socket.io/ {
    proxy_pass http://127.0.0.1:9092;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header Origin $http_origin;
}
```

The handshake authorizer checks the `Origin` header against
`app.cors.allowed-origins`, so the proxy must forward it.

## Behaviour that changed on purpose

| Area | Node | Here |
| --- | --- | --- |
| Duplicate registration | `302 Found` | `409 Conflict` |
| `Meeting.date` | `Date.now()` evaluated once at module load, so every row carried the process start time | Stamped per document |
| Failed `register` save | Returned `201` regardless (`save()` was not awaited) | Fails with the real error |
| Login throttling | None | 10 failures per 5 min per username+IP → `429` |
| Sliding token expiry | One Mongo write per authenticated request | At most one write per hour |
| Socket CORS | `origin: "*"` with `credentials: true` | Handshake checked against the allowlist |
| `signal` relay | Delivered to any socket id | Only within the sender's own room |
| Chat history | Kept for the process lifetime, never freed | Capped per room, released when the room empties |
| Disconnect | Scanned every room | Direct socket → room lookup |
| Avatar filename | Raw username interpolated into the path | Sanitised; extension derived from the validated content type |
| Avatar upload | Temp file written and never deleted | Streamed from memory; the replaced file is removed |
| Cloudinary `overwrite` | No-op (random public id each time) | Stable public id per user |
| Startup | Full `DATABASE_URL` logged, including credentials | Not logged |
| Mongo failure at boot | Unhandled rejection, server kept serving 500s | Startup fails loudly |

Everything else — endpoints, status codes, response shapes, socket events,
collection and field names, bcrypt hashes — is unchanged, so an existing
database and existing user passwords work without migration.

## Tests

```bash
cd backend-spring && mvn test
```

29 tests covering room membership and history eviction, token issue/expiry/refresh,
login throttling, and avatar validation including the path-traversal case.

## Not yet done

- The Node backend in `../backend` is still in place and untouched; nothing
  deploys this yet. `.github/workflows/cicd.yml` still builds and restarts the
  Node app.
- Session tokens are stored in plain text to stay compatible with the existing
  `users` collection. Storing a SHA-256 hash instead would mean one forced
  re-login for everyone.
- Single node only: room state is in-memory. More than one instance needs a
  shared store here plus a Socket.IO adapter.
