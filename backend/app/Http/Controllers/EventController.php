<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;// Import JWTAuth

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Event::with('user');

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->end_date);
        }

        // Sort events
        $sort = $request->get('sort', 'start_date');
        $direction = $request->get('direction', 'asc');
        $query->orderBy($sort, $direction);

        $events = $query->paginate(9);
        return response()->json($events);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'participants_number'=>'nullable|integer|min:0',
            'max_participants' => 'nullable|integer|min:1',
        ]);

        $event = new Event($request->all());
        $event->user_id = JWTAuth::parseToken()->authenticate()->id; // Get user ID from JWT
        $event->save();

        return response()->json($event, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        $event->load(['user', 'registrations.user']);
        return response()->json($event);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        $userId = JWTAuth::parseToken()->authenticate()->id; // Get user ID from JWT

        if ($userId !== $event->user_id && auth()->payload()->get('role') !== 'admin') { // Access role from payload
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'participants_number' => 'nullable|integer|min:0',
            'max_participants' => 'nullable|integer|min:1',
        ]);

        $event->update($request->all());
        return response()->json($event);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        $userId = JWTAuth::parseToken()->authenticate()->id; // Get user ID from JWT
        if ($userId !== $event->user_id && auth()->payload()->get('role') !== 'admin') {  //get role from payload
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }

    /**
     * Get categories for filtering
     */
    public function categories()
    {
        $categories = Event::select('category')->distinct()->pluck('category');
        return response()->json($categories);
    }
    
    /**
     * Get locations for filtering
     */
    public function locations()
    {
        $locations = Event::select('location')->distinct()->pluck('location');
        return response()->json($locations);
    }

    public function checkRegistration(Event $event)
    {
        $userId = JWTAuth::parseToken()->authenticate()->id;  // Get user ID from JWT
        $isRegistered = $event->registrations()
            ->where('user_id', $userId)
            ->exists();
        
        return response()->json([
            'is_registered' => $isRegistered
        ]);
    }

    public function upcoming(Request $request)
    {
        $query = Event::with('user')
            ->where('start_date', '>=', now()->startOfDay());
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }
        
        // Sort events
        $sort = $request->get('sort', 'start_date');
        $direction = $request->get('direction', 'asc');
        $query->orderBy($sort, $direction);
        $events = $query->get();

        return response()->json( $events);
    }

     /**
     * Get counts of events.
     */
    public function counts()
    {
        $totalEvents = Event::count();
        $upcomingEvents = Event::where('start_date', '>=', now()->startOfDay())->count();
        $pastEvents = Event::where('end_date', '<', now()->startOfDay())->count();

        return response()->json([
            'total' => $totalEvents,
            'upcoming' => $upcomingEvents,
            'past' => $pastEvents,
        ]);
    }
}