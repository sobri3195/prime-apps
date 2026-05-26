<?php
class AuthService {
    public static function register(array $data): array {
        $db=Database::connection();
        $stmt=$db->prepare('INSERT INTO users (name,email,phone,password,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())');
        $stmt->execute([$data['name'],$data['email'],$data['phone']??null,password_hash($data['password'], PASSWORD_BCRYPT),'patient','active']);
        $id=(int)$db->lastInsertId();
        $db->prepare('INSERT INTO patients (user_id,medical_record_number,created_at,updated_at) VALUES (?,?,NOW(),NOW())')->execute([$id,'MRN-'.str_pad((string)$id,6,'0',STR_PAD_LEFT)]);
        return ['id'=>$id,'name'=>$data['name'],'email'=>$data['email'],'phone'=>$data['phone']??null,'role'=>'patient'];
    }
}
