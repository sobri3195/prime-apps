<?php
function base_path(string $path = ''): string { return __DIR__ . '/../' . ltrim($path, '/'); }
function env(string $key, $default = null) { return $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: $default; }
function load_env(string $file): void {
    if (!file_exists($file)) return;
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$k,$v]=explode('=', $line,2); $v=trim($v," \t\n\r\0\x0B\""); $_ENV[trim($k)]=$v; $_SERVER[trim($k)]=$v;
    }
}
