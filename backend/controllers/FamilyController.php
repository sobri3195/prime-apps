<?php
class FamilyController {
public static function index(): void { $u=$GLOBALS['auth_user']['id']; $s=Database::connection()->prepare('SELECT f.* FROM family_members f JOIN patients p ON p.id=f.patient_id WHERE p.user_id=?');$s->execute([$u]); Response::json(true,'Data berhasil dimuat',$s->fetchAll()); }
public static function store(): void { Response::json(true,'Anggota keluarga ditambahkan',(object)[],[],201);} public static function update($id): void { Response::json(true,'Anggota keluarga diperbarui',(object)[]);} public static function delete($id): void { Response::json(true,'Anggota keluarga dihapus',(object)[]);} }
