<?php
class Request {
    public static function method(): string { return $_SERVER['REQUEST_METHOD'] ?? 'GET'; }
    public static function path(): string { $u=parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH); return rtrim($u,'/') ?: '/'; }
    public static function json(): array { return json_decode(file_get_contents('php://input'), true) ?: []; }
    public static function bearerToken(): ?string {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? ''; if (preg_match('/Bearer\s+(.*)$/i',$h,$m)) return $m[1]; return null;
    }
    public static function query(string $key, $default=null){ return $_GET[$key] ?? $default; }
}
