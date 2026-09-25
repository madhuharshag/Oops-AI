import { Router, Request, Response } from 'express';

const router = Router();

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Oops! AI Security Platform API",
    version: "1.0.0",
    description: "API for Oops! AI — Autonomous security testing and trust platform for AI agents.",
    contact: {
      name: "Oops! AI Engineering",
    }
  },
  servers: [
    { url: "/api", description: "Current API Server" }
  ],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register new user account",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "confirmPassword"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  confirmPassword: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "User registered successfully" },
          "400": { description: "Validation error" }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Authenticate user and receive token pair",
        tags: ["Authentication"],
        responses: {
          "200": { description: "Logged in with access token and httpOnly refresh cookie" },
          "401": { description: "Invalid credentials" }
        }
      }
    },
    "/agents": {
      get: {
        summary: "List user's registered AI agents",
        tags: ["Agents"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Array of registered agents" } }
      },
      post: {
        summary: "Register a new AI agent security profile",
        tags: ["Agents"],
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Agent created" } }
      }
    },
    "/labs": {
      get: {
        summary: "List all 8 baseline Oops! Labs",
        tags: ["Labs"],
        responses: { "200": { description: "List of security testing labs" } }
      }
    },
    "/attacks": {
      post: {
        summary: "Execute controlled attack simulation",
        tags: ["Attacks"],
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Attack completed with timeline and AI analysis" } }
      }
    },
    "/attacks/{id}/replay": {
      post: {
        summary: "Replay attack against active policy defense",
        tags: ["Attacks"],
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Replay executed with before/after comparison" } }
      }
    },
    "/policies": {
      get: {
        summary: "List user's security policies",
        tags: ["Policies"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Array of policies" } }
      },
      post: {
        summary: "Create security defense policy",
        tags: ["Policies"],
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Policy created" } }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

// GET /api/docs/spec.json
router.get('/spec.json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

// GET /api/docs - HTML interactive viewer
router.get('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Oops! AI API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      body { margin: 0; background: #0d1117; color: #c9d1d9; }
      .swagger-ui .topbar { display: none; }
      .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
      .swagger-ui .wrapper { max-width: 1100px; padding: 20px; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: '/api/docs/spec.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: "BaseLayout"
        });
      };
    </script>
  </body>
</html>`);
});

export default router;
