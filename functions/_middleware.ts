interface Env {
  SITE_PASSWORD: string
}

const COOKIE_NAME = "kaya_auth"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const url = new URL(request.url)

  // Allow the login POST request through
  if (url.pathname === "/login" && request.method === "POST") {
    return handleLogin(request, env)
  }

  // Check for auth cookie
  const cookie = request.headers.get("Cookie") || ""
  const authToken = getCookie(cookie, COOKIE_NAME)

  if (authToken === env.SITE_PASSWORD) {
    // Authenticated - continue to the page
    return context.next()
  }

  // Not authenticated - show login page
  return new Response(loginPage(), {
    headers: { "Content-Type": "text/html" },
  })
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const formData = await request.formData()
  const password = formData.get("password") as string

  if (password === env.SITE_PASSWORD) {
    // Success - set cookie and redirect
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `${COOKIE_NAME}=${password}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`,
      },
    })
  }

  // Wrong password - show login page with error
  return new Response(loginPage("Incorrect password"), {
    headers: { "Content-Type": "text/html" },
  })
}

function getCookie(cookieString: string, name: string): string | null {
  const match = cookieString.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

function loginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workshop on AI & Indigenous Languages - Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
    }
    h1 {
      font-size: 1.5rem;
      color: #1a1a2e;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }
    button {
      width: 100%;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      margin-top: 1rem;
      transition: transform 0.1s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    .error {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.75rem;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Workshop on AI & Indigenous Languages</h1>
    <p class="subtitle">June 8-10, 2026 · Los Angeles</p>
    ${error ? `<div class="error">${error}</div>` : ""}
    <form method="POST" action="/login">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autofocus>
      <button type="submit">Enter</button>
    </form>
    <p class="footer">Organizers only</p>
  </div>
</body>
</html>`
}
