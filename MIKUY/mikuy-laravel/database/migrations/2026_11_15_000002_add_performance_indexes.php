<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración de optimización (Indicador 5 y Sección 7.7 del informe).
 * Crea índices compuestos en columnas de búsqueda, filtrado y ordenamiento.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'active'], 'idx_users_role_active');
            $table->index('district', 'idx_users_district');
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->index(['status', 'district', 'expiry'], 'idx_donations_status_district_expiry');
            $table->index(['owner_id', 'status'], 'idx_donations_owner_status');
            $table->index(['category', 'status'], 'idx_donations_category_status');
        });

        Schema::table('donation_requests', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_requests_org_status');
            $table->index(['donation_id', 'status'], 'idx_requests_donation_status');
        });

        Schema::table('deliveries', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_deliveries_org_status');
        });

        Schema::table('organization_needs', function (Blueprint $table) {
            $table->index(['organization_id', 'priority'], 'idx_needs_org_priority');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['request_id', 'created_at'], 'idx_messages_request_created');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role_active');
            $table->dropIndex('idx_users_district');
        });
        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex('idx_donations_status_district_expiry');
            $table->dropIndex('idx_donations_owner_status');
            $table->dropIndex('idx_donations_category_status');
        });
        Schema::table('donation_requests', function (Blueprint $table) {
            $table->dropIndex('idx_requests_org_status');
            $table->dropIndex('idx_requests_donation_status');
        });
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropIndex('idx_deliveries_org_status');
        });
        Schema::table('organization_needs', function (Blueprint $table) {
            $table->dropIndex('idx_needs_org_priority');
        });
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_messages_request_created');
        });
    }
};
