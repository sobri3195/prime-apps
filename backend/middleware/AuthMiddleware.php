<?php
class AuthMiddleware {
    public static function handle(): void {
        $payload=Auth::verifyToken(Request::bearerToken());
        if(!$payload) Response::json(false,'Unauthorized',null,[],401);
        $GLOBALS['auth_user']=$payload;
    }
}
