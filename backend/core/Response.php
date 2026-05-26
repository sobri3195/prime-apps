<?php
class Response {
    public static function json(bool $success, string $message, $data = null, array $errors = [], int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json');
        $payload = ['success'=>$success,'message'=>$message];
        if ($success) $payload['data']=$data ?? (object)[];
        else $payload['errors']=$errors ?: (object)[];
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
