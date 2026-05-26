<?php
class UploadController {
 public static function eyePhoto(): void { if(!isset($_FILES['file'])) Response::json(false,'File tidak ditemukan',null,[],422); $f=$_FILES['file']; $ok=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp']; if(!isset($ok[$f['type']])) Response::json(false,'Format file tidak didukung',null,[],422); if($f['size']>(require base_path('config/app.php'))['upload_max_size']) Response::json(false,'Ukuran file melebihi 5MB',null,[],422); $name=uniqid('eye_',true).'.'.$ok[$f['type']]; $target=base_path('storage/uploads/eye-photo/'.$name); if(!move_uploaded_file($f['tmp_name'],$target)) Response::json(false,'Gagal menyimpan file',null,[],500); Response::json(true,'Upload berhasil',['path'=>'storage/uploads/eye-photo/'.$name]); }
}
