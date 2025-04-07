<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\Request;
use App\Models\Event;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class RegistrationController extends Controller
{
    /***
     * Register current user for an event
     */
    public function register(Request $request, Event $event)
    {
        // Check if event has maximum participants and if it's already full
        if ($event->max_participants !== null) {
            $currentRegistrations = $event->registrations()->count();
            if ($currentRegistrations >= $event->max_participants) {
                return response()->json(['message' => 'This event is already full'], 400);
            }
        }
        
        $userId = JWTAuth::parseToken()->authenticate()->id; // Get user ID from JWT

        // Check if user is already registered
        $existingRegistration = Registration::where('user_id', $userId)
            ->where('event_id', $event->id)
            ->first();
            
        if ($existingRegistration) {
            return response()->json(['message' => 'You are already registered for this event'], 400);
        }
        
        // Create new registration
        $registration = new Registration([
            'user_id' => $userId, // Use JWT user ID
            'event_id' => $event->id,
            'registration_date' => now(),
            'status' => 'confirmed'
        ]);
        
        $registration->save();
        
        return response()->json([
            'message' => 'Registration successful',
            'registration' => $registration
        ], 201);
    }
    
    /**
     * Get registrations for the current user
     */
    public function userRegistrations()
    {
        $userId = JWTAuth::parseToken()->authenticate()->id; // Get user ID from JWT
        
        $registrations = Registration::with('event')
            ->where('user_id', $userId) // Use JWT user ID
            ->orderBy('registration_date', 'desc')
            ->get();
            
        return response()->json(['registrations' => $registrations]);
    }
    
    /**
     * Cancel a registration
     */
    public function cancel(Registration $registration){
        $userId = JWTAuth::parseToken()->authenticate()->id; // Get user ID from JWT
        // Check if user is authorized to cancel this registration
        if ($userId !== $registration->user_id) { // Use JWT user ID
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $registration->status = 'cancelled';
        $registration->save();
        
        return response()->json(['message' => 'Registration cancelled successfully']);
    }
}