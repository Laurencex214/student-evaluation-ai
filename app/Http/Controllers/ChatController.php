<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    /**
     * Proxy the Gemini API call for the chatbot.
     * This keeps the API key server-side (secure) and avoids CORS issues.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message'  => 'required|string|max:2000',
            'context'  => 'nullable|string|max:10000',
        ]);

        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            return response()->json([
                'error' => 'Gemini API key is not configured on the server.',
            ], 500);
        }

        $userMessage = $request->input('message');
        $frontendContext = $request->input('context', '');

        // Provide real database context to the AI
        $students = \App\Models\Student::with('subjects')->take(50)->get();
        $dbContext = [];
        foreach ($students as $s) {
            $dbContext[] = [
                'name' => $s->name,
                'section' => $s->section,
                'gwa' => $s->gwa,
                'attendance' => $s->attendance,
                'risk' => $s->risk
            ];
        }

        $contextString = $frontendContext ?: json_encode($dbContext);

        // Build the prompt with context
        $prompt = $contextString
            ? "You are a helpful AI assistant for CNHS (City National High School) student evaluation system. Here is the current student data context from the database: {$contextString}\n\nUser question: {$userMessage}"
            : "You are a helpful AI assistant for CNHS student evaluation system. Answer concisely and helpfully. User: {$userMessage}";

        try {
            // Using gemini-2.5-flash — compatible with standard personal API keys
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'role'  => 'user',
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature'     => 0.7,
                        'maxOutputTokens' => 1024,
                        'topP'            => 0.9,
                    ],
                ]);

            if ($response->failed()) {
                $body = $response->json();
                $errMsg = $body['error']['message'] ?? 'API error (status ' . $response->status() . ')';
                Log::error('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json([
                    'error' => 'AI error: ' . $errMsg,
                ], 502);
            }

            $data  = $response->json();
            $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Sorry, I could not get a response.';

            return response()->json(['reply' => $reply]);

        } catch (\Exception $e) {
            Log::error('Gemini chat error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Network error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
