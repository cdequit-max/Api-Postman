<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Passwords are read from .env (SEED_ADMIN_PASSWORD / SEED_USER_PASSWORD)
     * so no credentials are committed to GitHub.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make(env('SEED_ADMIN_PASSWORD', 'change-me-admin')),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make(env('SEED_USER_PASSWORD', 'change-me-user')),
                'role' => 'user',
            ]
        );
    }
}
