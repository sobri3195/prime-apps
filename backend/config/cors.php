<?php
return [
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://prime-apps-kmfh.vercel.app',
    ],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
];
