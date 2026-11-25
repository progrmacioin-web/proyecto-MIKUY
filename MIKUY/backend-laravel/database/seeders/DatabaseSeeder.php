<?php

namespace Database\Seeders;

use App\Models\Delivery;
use App\Models\Donation;
use App\Models\DonationRequest;
use App\Models\Message;
use App\Models\OrganizationNeed;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('Mikuy2026!');

        $sanPedro = User::updateOrCreate(['email' => 'donante@mikuy.demo'], [
            'name' => 'Mercado San Pedro',
            'password' => $password,
            'role' => 'donor',
            'organization' => 'Asociación de Comerciantes San Pedro',
            'district' => 'Cusco',
            'phone' => '+51 984 111 222',
            'active' => true,
            'verification' => 'verified',
            'public_description' => 'Comercio tradicional del Cusco que canaliza excedentes frescos del día.',
        ]);

        $lasFlores = User::updateOrCreate(['email' => 'organizacion@mikuy.demo'], [
            'name' => 'Comedor Popular Las Flores',
            'password' => $password,
            'role' => 'organization',
            'organization' => 'Comedor Popular Las Flores',
            'district' => 'Santiago',
            'phone' => '+51 984 333 444',
            'active' => true,
            'verification' => 'verified',
            'public_description' => 'Comedor comunitario que prepara raciones diarias en el distrito de Santiago.',
        ]);

        User::updateOrCreate(['email' => 'admin@mikuy.demo'], [
            'name' => 'Administración MIKUY',
            'password' => $password,
            'role' => 'admin',
            'organization' => 'MIKUY Cusco',
            'district' => 'Cusco',
            'phone' => '+51 984 000 000',
            'active' => true,
            'verification' => 'verified',
        ]);

        $inti = User::updateOrCreate(['email' => 'inti@demo.mikuy'], [
            'name' => 'Restaurante Inti',
            'password' => $password,
            'role' => 'donor',
            'organization' => 'Restaurante Inti Wanchaq',
            'district' => 'Wanchaq',
            'phone' => '+51 984 555 666',
            'active' => true,
            'verification' => 'verified',
        ]);

        $buenCamino = User::updateOrCreate(['email' => 'albergue@demo.mikuy'], [
            'name' => 'Albergue Buen Camino',
            'password' => $password,
            'role' => 'organization',
            'organization' => 'Albergue Buen Camino',
            'district' => 'San Sebastián',
            'phone' => '+51 984 777 888',
            'active' => true,
            'verification' => 'verified',
        ]);

        if (OrganizationNeed::count() === 0) {
            OrganizationNeed::insert([
                ['organization_id' => $lasFlores->id, 'product' => 'Papa nativa', 'category' => 'Tubérculos', 'qty' => 20, 'unit' => 'kg', 'priority' => 'high', 'storage' => 'ambient', 'created_at' => now(), 'updated_at' => now()],
                ['organization_id' => $lasFlores->id, 'product' => 'Arroz extra', 'category' => 'Cereales', 'qty' => 15, 'unit' => 'kg', 'priority' => 'normal', 'storage' => 'any', 'created_at' => now(), 'updated_at' => now()],
                ['organization_id' => $buenCamino->id, 'product' => 'Zanahoria fresca', 'category' => 'Verduras', 'qty' => 12, 'unit' => 'kg', 'priority' => 'high', 'storage' => 'refrigerated', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (Donation::count() === 0) {
            $lots = [
                [$sanPedro->id, 'Papa nativa', 'Papa seleccionada del día en jabas limpias.', 'Tubérculos', 35, 'kg', 5, 'Cusco', 'Mercado San Pedro', 'potato', 'PN-101', 'ambient'],
                [$inti->id, 'Zanahoria fresca', 'Zanahorias frescas en cajas ventiladas.', 'Verduras', 18, 'kg', 3, 'Wanchaq', 'Av. de la Cultura', 'carrot', 'ZF-102', 'refrigerated'],
                [$sanPedro->id, 'Arroz extra', 'Paquetes sellados de 1 kg en almacén seco.', 'Cereales', 24, 'kg', 180, 'Cusco', 'Mercado San Pedro', 'rice', 'AE-103', 'ambient'],
                [$inti->id, 'Manzana de mesa', 'Fruta fresca seleccionada para consumo próximo.', 'Frutas', 12, 'kg', 2, 'Wanchaq', 'Wanchaq Centro', 'apple', 'MT-104', 'refrigerated'],
                [$sanPedro->id, 'Lenteja serrana', 'Menestra seca en bolsas selladas de 1 kg.', 'Menestras', 15, 'kg', 140, 'Cusco', 'Centro Histórico', 'beans', 'LE-105', 'ambient'],
                [$sanPedro->id, 'Olluco fresco', 'Olluco seleccionado de productores locales.', 'Tubérculos', 22, 'kg', 6, 'Santiago', 'Mercado Zarzuela', 'potato', 'OL-106', 'ambient'],
                [$inti->id, 'Quinua blanca', 'Sacos cerrados listos para preparación comunitaria.', 'Cereales', 20, 'kg', 200, 'San Jerónimo', 'Av. Velasco Astete', 'rice', 'QB-107', 'ambient'],
                [$sanPedro->id, 'Plátano de seda', 'Cajas en punto óptimo de maduración.', 'Frutas', 16, 'kg', 2, 'Cusco', 'Mercado San Pedro', 'apple', 'PS-108', 'ambient'],
                [$inti->id, 'Frijol canario', 'Bolsas herméticas de excedente de almacén.', 'Menestras', 18, 'kg', 160, 'Wanchaq', 'Mercado Wanchaq', 'beans', 'FC-109', 'ambient'],
                [$sanPedro->id, 'Zapallo macre', 'Enteros y en buen estado de conservación.', 'Verduras', 28, 'kg', 7, 'San Sebastián', 'Av. La Cultura', 'carrot', 'ZM-110', 'ambient'],
                [$inti->id, 'Avena en hojuelas', 'Paquetes sellados de fábrica para desayunos.', 'Productos envasados', 30, 'kg', 120, 'Cusco', 'Plaza San Francisco', 'packaged', 'AV-111', 'ambient'],
                [$sanPedro->id, 'Camote amarillo', 'Jabas limpias recién acopiadas.', 'Tubérculos', 25, 'kg', 8, 'Poroy', 'Paradero Poroy', 'potato', 'CA-112', 'ambient'],
                [$inti->id, 'Cebolla roja', 'Mallas ventiladas de 10 kg.', 'Verduras', 20, 'kg', 10, 'Santiago', 'Puente Santiago', 'carrot', 'CR-113', 'ambient'],
                [$sanPedro->id, 'Trigo pelado', 'Grano seco en bolsas selladas.', 'Cereales', 19, 'kg', 150, 'Cusco', 'Mercado San Pedro', 'rice', 'TP-114', 'ambient'],
                [$inti->id, 'Mandarina dulce', 'Cajas seleccionadas para consumo inmediato.', 'Frutas', 14, 'kg', 3, 'Wanchaq', 'Óvalo Pachacútec', 'apple', 'MD-115', 'refrigerated'],
                [$sanPedro->id, 'Arveja partida', 'Menestra seca en empaque sellado.', 'Menestras', 16, 'kg', 190, 'San Jerónimo', 'Mercado Vinocanchón', 'beans', 'AP-116', 'ambient'],
            ];

            $created = [];
            foreach ($lots as $idx => $l) {
                $created[] = Donation::create([
                    'owner_id' => $l[0],
                    'name' => $l[1],
                    'description' => $l[2],
                    'category' => $l[3],
                    'qty' => $l[4],
                    'unit' => $l[5],
                    'expiry' => now()->addDays($l[6])->format('Y-m-d'),
                    'care' => 'Mantener en lugar limpio, fresco y ventilado.',
                    'district' => $l[7],
                    'place' => $l[8],
                    'status' => 'available',
                    'image' => $l[9],
                    'origin' => 'Productor / comercio local de Cusco',
                    'lot' => $l[10],
                    'packaging' => 'Empaque limpio',
                    'storage_type' => $l[11],
                    'trace_code' => 'MK-LOT-2026' . str_pad((string) ($idx + 1), 2, '0', STR_PAD_LEFT),
                ]);
            }

            // Ticket activo pendiente de recojo + chat de ejemplo
            $activeReq = DonationRequest::create([
                'donation_id' => $created[0]->id,
                'organization_id' => $lasFlores->id,
                'qty' => 10,
                'message' => 'Para preparar almuerzos comunitarios de esta semana en Santiago.',
                'status' => 'accepted',
                'response' => 'Ticket de recojo autorizado listo.',
            ]);

            Delivery::create([
                'donation_id' => $created[0]->id,
                'request_id' => $activeReq->id,
                'organization_id' => $lasFlores->id,
                'qty' => 10,
                'unit' => 'kg',
                'status' => 'scheduled',
                'scheduled_date' => now()->format('Y-m-d'),
                'scheduled_time' => '10:30',
                'pickup_place' => 'Mercado San Pedro, puerta principal',
                'certificate_code' => 'MK-CUS-2026-0002',
                'pickup_pin' => '482910',
            ]);

            Message::create([
                'request_id' => $activeReq->id,
                'sender_id' => $lasFlores->id,
                'body' => 'Hola, somos del Comedor Popular Las Flores. ¿Podemos pasar hoy a las 10:30 a. m. con nuestro ticket QR?',
            ]);
            Message::create([
                'request_id' => $activeReq->id,
                'sender_id' => $sanPedro->id,
                'body' => '¡Claro! Los esperamos en la puerta principal del Mercado San Pedro. Traigan el código MK-CUS-2026-0002.',
            ]);

            // Entrega confirmada con constancia QR
            $completedReq = DonationRequest::create([
                'donation_id' => $created[1]->id,
                'organization_id' => $buenCamino->id,
                'qty' => 8,
                'message' => 'Insumos para cenas del albergue infantil.',
                'status' => 'completed',
                'response' => 'Entrega verificada con pase QR.',
            ]);

            Delivery::create([
                'donation_id' => $created[1]->id,
                'request_id' => $completedReq->id,
                'organization_id' => $buenCamino->id,
                'qty' => 8,
                'unit' => 'kg',
                'status' => 'confirmed',
                'scheduled_date' => now()->subDay()->format('Y-m-d'),
                'scheduled_time' => '10:30',
                'pickup_place' => 'Av. de la Cultura, Wanchaq',
                'certificate_code' => 'MK-CUS-2026-0001',
                'pickup_pin' => '910422',
                'received_at' => now()->subDay(),
            ]);
        }
    }
}
