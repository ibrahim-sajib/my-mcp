import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { google } from "googleapis";
import { z } from "zod";
import { DateTime } from "luxon";

dotenv.config();

// Create an MCP server
const server = new McpServer({
  name: "Ibrahim's Calendar",
  version: "1.0.0"
});

// Add an addition tool
server.registerTool("add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() }
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Add a dynamic greeting resource
server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  { 
    title: "Greeting Resource",      // Display name for UI
    description: "Dynamic greeting generator"
  },
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);


// tool function
async function getMyCalendarDataByDate(date) {
    // Parse the date in Bangladesh Standard Time (Asia/Dhaka)
    const startBST = DateTime.fromISO(date, { zone: "Asia/Dhaka" }).startOf("day");
    const endBST = startBST.plus({ days: 1 });
    // Convert to UTC ISO strings for Google Calendar API
    const timeMin = startBST.toUTC().toISO();
    const timeMax = endBST.toUTC().toISO();

    const calendar = google.calendar({
        version: "v3",
        auth: process.env.GOOGLE_PUBLIC_API_KEY,
    });

    try {
        const res = await calendar.events.list({
            calendarId: process.env.CALENDAR_ID,
            timeMin,
            timeMax,
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        });

        const events = res.data.items || [];
        const meetings = events.map((event) => {
            const start = event.start.dateTime || event.start.date;
            return `${event.summary} at ${start}`;
        });

        if (meetings.length > 0) {
            return {
                meetings,
            };
        } else {
            return {
                meetings: [],
            };
        }
    } catch (err) {
        return {
            error: err.message,
        };
    }
}

server.tool(
    "getMyCalendarDataByDate",
    {
        date: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format. Please provide a valid date string."
        }),
    },
     async ({ date }) => {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(await getMyCalendarDataByDate(date)),
                },
            ],
        };
    }
);

// Start receiving messages on stdin and sending messages on stdout
// const transport = new StdioServerTransport();
// await server.connect(transport);

// set transfort
async function init() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

// call the initialization
init();