<?php
class Database {
    private static ?PDO $conn = null;
    public static function connection(): PDO {
        if (self::$conn) return self::$conn;
        $c = require base_path('config/database.php');
        $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['name']};charset=utf8mb4";
        self::$conn = new PDO($dsn, $c['user'], $c['pass'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
        return self::$conn;
    }
}
