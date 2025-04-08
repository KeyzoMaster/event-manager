<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
 
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api')->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api')->name('refresh');
    Route::post('/me', [AuthController::class, 'me'])->middleware('auth:api')->name('me');
});

Route::group(['middleware' => 'auth:api', 'prefix'=> 'events'], function () {
    Route::get('', [EventController::class, 'index']);
    Route::get('/{event}', [EventController::class, 'show']);

    Route::post('/{event}/register', [RegistrationController::class, 'register']);
    Route::delete('/{event}/register', [RegistrationController::class, 'cancel']);
    Route::get('/{event}/register', [EventController::class, 'checkRegistration']);

    Route::group(['middleware' => 'admin'], function () {
        Route::post('', [EventController::class, 'store']);
        Route::put('/{event}', [EventController::class, 'update']);
        Route::delete('/{event}', [EventController::class, 'destroy']);
    });
});

Route::group(['middleware' => 'auth:api'],function(){
    Route::get('/upcoming', [EventController::class, 'upcoming']);
    Route::get('/counts', [EventController::class, 'counts']);
    Route::get('/locations', [EventController::class, 'locations']);
    Route::get('/categories', [EventController::class, 'categories']);
    Route::get('/registrations', [RegistrationController::class, 'userRegistrations']);
});

