<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('+1 week', '+2 months');
        $endDate = Carbon::instance($startDate)->addHours(rand(1, 48));
        
        return [
            'title' => $this->faker->sentence(rand(3, 8)),
            'description' => $this->faker->paragraphs(rand(2, 5), true),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'location' => $this->faker->address(),
            'category' => $this->faker->randomElement(['Conference', 'Workshop', 'Meetup', 'Seminar', 'Party', 'Exhibition', 'Concert']),
            'participants_number' => $this->faker->numberBetween(0, 100),
            'max_participants' => $this->faker->optional(0.7)->numberBetween(10, 1000),
            'user_id' => User::factory(),
        ];
    }
}
