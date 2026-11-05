<?php

use Illuminate\Support\Facades\Route;

// Serve the Vue single-page app. Vue handles everything after the first load,
// talking to the Laravel API under /api.
Route::view('/', 'app');
