<?php
class MarketplaceController {
public static function products(): void { $db=Database::connection(); $sql='SELECT * FROM products WHERE status=?'; $params=['active']; if($s=Request::query('search')){$sql.=' AND name LIKE ?';$params[]="%$s%";} if($c=Request::query('category')){$sql.=' AND category=?';$params[]=$c;} if($min=Request::query('min_price')){$sql.=' AND price>=?';$params[]=$min;} if($max=Request::query('max_price')){$sql.=' AND price<=?';$params[]=$max;} $sql.=' ORDER BY created_at DESC'; $st=$db->prepare($sql);$st->execute($params); Response::json(true,'Data berhasil dimuat',$st->fetchAll()); }
public static function product($id): void { $s=Database::connection()->prepare('SELECT * FROM products WHERE id=?');$s->execute([$id]); Response::json(true,'Data berhasil dimuat',$s->fetch()); }
public static function services(): void { Response::json(true,'Data berhasil dimuat',[['name'=>'Paket Pemeriksaan Mata Lengkap'],['name'=>'Paket Konsultasi Dokter Mata'],['name'=>'Screening Mata Awal'],['name'=>'Pemeriksaan Minus / Silinder']]); }
public static function order(): void { Response::json(true,'Order berhasil dibuat',(object)[],[],201); }
public static function myOrders(): void { Response::json(true,'Data berhasil dimuat',[]); }
}
