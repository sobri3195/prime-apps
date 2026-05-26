<?php
class CorsMiddleware {
    public static function handle(): void {
        $c=require base_path('config/cors.php'); $o=$_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($o,$c['allowed_origins'],true)) header("Access-Control-Allow-Origin: $o");
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: '.implode(', ',$c['allowed_methods']));
        header('Access-Control-Allow-Headers: '.implode(', ',$c['allowed_headers']));
        if (Request::method()==='OPTIONS') { http_response_code(204); exit; }
    }
}
