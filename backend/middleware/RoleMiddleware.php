<?php
class RoleMiddleware {
    public static function allow(array $roles): callable { return function() use($roles){ $u=$GLOBALS['auth_user'] ?? null; if(!$u||!in_array($u['role'],$roles,true)) Response::json(false,'Forbidden',null,[],403); }; }
}
