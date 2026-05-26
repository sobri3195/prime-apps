<?php
class Auth {
    public static function generateToken(array $payload): string {
        $secret = (require base_path('config/app.php'))['jwt_secret'];
        $header = self::b64(json_encode(['alg'=>'HS256','typ'=>'JWT']));
        $payload['exp']=time()+86400; $body=self::b64(json_encode($payload));
        $sig=self::b64(hash_hmac('sha256',"$header.$body",$secret,true));
        return "$header.$body.$sig";
    }
    public static function verifyToken(?string $token): ?array {
        if (!$token) return null; $p=explode('.',$token); if (count($p)!==3) return null;
        [$h,$b,$s]=$p; $secret=(require base_path('config/app.php'))['jwt_secret'];
        $check=self::b64(hash_hmac('sha256',"$h.$b",$secret,true)); if (!hash_equals($check,$s)) return null;
        $payload=json_decode(base64_decode(strtr($b,'-_','+/')),true); if (($payload['exp']??0)<time()) return null; return $payload;
    }
    private static function b64(string $d): string { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }
}
