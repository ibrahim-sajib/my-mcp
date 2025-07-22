# 🧠 Ibrahim's MCP Server

This is a Model Context Protocol (MCP) server built with [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk). It exposes tools and resources like calendar lookup, basic math, and greetings for integration with LLMs like Cursor AI.

---

## ⚙️ Setup Instructions

```bash
# Clone the repo
git clone https://github.com/ibrahim-sajib/my-mcp.git

# Go to the project directory
cd my-mcp

# Install Node.js dependencies
npm install

# Create the environment file
cp .env.example .env

# Open .env and set the following variables:
# GOOGLE_PUBLIC_API_KEY=
# CALENDAR_ID=

# Run the server
node server.js
