<?php
return [
    'name' => env('APP_NAME', 'PRIME Apps Klinik Utama Mata'),
    'env' => env('APP_ENV', 'local'),
    'url' => env('APP_URL', 'http://localhost/prime-backend/public'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'jwt_secret' => env('JWT_SECRET', 'change_this_secret_key'),
    'upload_max_size' => (int) env('UPLOAD_MAX_SIZE', 5242880),
];
