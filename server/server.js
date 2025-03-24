import express from 'express';
import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { google } from 'googleapis';



// Initialize dotenv
import 'dotenv/config';

const app = express();

// Middlewares
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser());

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const corsOptions = {
  origin: 'localhost:3001/', // Allow only your frontend to make requests
  credentials: true, // Allow cookies to be sent
};

// Initialize client.
let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

app.use(cors(corsOptions));

// Apply basic security enhancements with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Additional directives can be added here
    },
  },
}));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
});
app.use(limiter);

// Logging HTTP requests
app.use(morgan('combined'));

// Initialize session storage with enhanced security for cookies
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Route to start OAuth flow
app.get('/authorize', (req, res) => {
  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`;
  res.redirect(zoomAuthUrl);
});

// OAuth callback route
app.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;
  const tokenUrl = 'https://zoom.us/oauth/token';

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.REDIRECT_URI,
  });

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
    });
    
    req.session.accessToken = response.data.access_token;
    // Pass a true flag on redirect if accessToken is received
    const redirectUrl = new URL('http://localhost:3001/zoom-phone');
    redirectUrl.searchParams.append('tokenReceived', 'true');
    res.redirect(redirectUrl.href);
  } catch (error) {
    console.error('Error fetching access token:', error);
    // Pass a false flag on redirect if accessToken is not received
    const redirectUrl = new URL('http://localhost:3001/zoom-phone');
    redirectUrl.searchParams.append('tokenReceived', 'false');
    res.redirect(redirectUrl.href);
  }
});

app.get('/api/auth/status', (req, res) => {
  if (req.session.accessToken) {
    // The presence of accessToken in the session indicates the user is authenticated
    res.json({ isAuthenticated: true });
  } else {
    // No accessToken in the session means the user is not authenticated
    res.json({ isAuthenticated: false });
  }
});

app.get('/api/sheet-data', async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH || 'path-to-your-credentials.json', // Replace with your credentials file path or use environment variable
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1ATj0H4uq3qyBbR4s29Iazr7guQiL3tz-DSd2fV9Z414', // Your Google Sheets ID
      range: 'Referral List (non cb referrer)!A1:R100', // Adjust the range as necessary
    });

    res.json(response.data.values);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).send('Failed to fetch data from Google Sheets');
  }
});


// Example route
app.get('/', (req, res) => {
  res.send('Hello World with Redis Session Store!');
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
