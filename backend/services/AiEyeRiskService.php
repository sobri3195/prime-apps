<?php
class AiEyeRiskService {
    public static function analyze(array $symptoms,string $duration,int $pain): array {
        $danger=['Penglihatan mendadak menurun','Riwayat trauma mata','Melihat kilatan cahaya'];
        if(array_intersect($danger,$symptoms)||$pain>=8) return ['Darurat','Gejala mengarah kondisi darurat mata.','Segera ke IGD/klinik mata terdekat.'];
        if(($pain>=6&&$pain<=7)||(in_array('Pandangan buram',$symptoms,true)&&in_array('Mata merah',$symptoms,true))||str_contains(strtolower($duration),'lebih dari 1 minggu')) return ['Tinggi','Keluhan berisiko tinggi dan perlu pemeriksaan dokter.','Segera booking pemeriksaan dokter mata.'];
        if($pain>=3||count(array_intersect(['Mata merah','Mata gatal','Mata berair','Mata kering'],$symptoms))>0) return ['Sedang','Keluhan mengarah iritasi ringan/alergi mata.','Istirahatkan mata dan periksa jika tidak membaik.'];
        return ['Rendah','Gejala cenderung ringan.','Lakukan perawatan mandiri dan pantau gejala.'];
    }
}
