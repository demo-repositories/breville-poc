import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { NextResponse } from "next/server";

import { client } from "@/lib/sanity/client";
import { token } from "@/lib/sanity/token";

const draftMode = defineEnableDraftMode({
  client: client.withConfig({ token }),
});

export async function GET(req: Request) {
  // Call the original draft mode handler
  const response = await draftMode.GET(req);
  
  // Clone the response to modify headers
  const newResponse = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  }).headers;

  // Set headers to allow iframe embedding
  newResponse.set('Content-Security-Policy', "frame-ancestors 'self' *");
  newResponse.set('X-Frame-Options', 'ALLOWALL');
  
  // Apply headers to the original response
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "frame-ancestors 'self' *");
  headers.set('X-Frame-Options', 'ALLOWALL');
  
  // Create a new response with the same status, body, and updated headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
