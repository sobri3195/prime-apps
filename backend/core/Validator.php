<?php
class Validator {
    public static function required(array $data, array $fields): array { $e=[]; foreach($fields as $f){ if(!isset($data[$f])||$data[$f]==='') $e[$f]="$f wajib diisi";} return $e; }
    public static function email(?string $v): bool { return (bool) filter_var($v, FILTER_VALIDATE_EMAIL); }
}
