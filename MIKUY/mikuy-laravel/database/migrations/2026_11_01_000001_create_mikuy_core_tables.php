<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role', 30)->default('donor')->after('password');
                $table->string('organization', 150)->nullable()->default('')->after('role');
                $table->string('district', 80)->default('Cusco')->after('organization');
                $table->string('phone', 30)->nullable()->default('')->after('district');
                $table->boolean('active')->default(true)->after('phone');
                $table->string('verification', 30)->default('pending')->after('active');
                $table->text('public_description')->nullable()->after('verification');
                $table->longText('photo_data')->nullable()->after('public_description');
            }
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('category', 60);
            $table->decimal('qty', 10, 2);
            $table->string('unit', 25)->default('kg');
            $table->date('expiry');
            $table->string('care', 255)->nullable();
            $table->string('district', 80);
            $table->string('place', 150)->nullable();
            $table->string('status', 30)->default('available');
            $table->string('image', 60)->default('packaged');
            $table->longText('photo_data')->nullable();
            $table->string('origin', 150)->nullable();
            $table->string('lot', 60)->nullable();
            $table->string('packaging', 120)->nullable();
            $table->string('storage_type', 40)->default('ambient');
            $table->string('trace_code', 40)->unique();
            $table->timestamps();
        });

        Schema::create('donation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained('donations')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('qty', 10, 2);
            $table->text('message')->nullable();
            $table->string('status', 30)->default('pending');
            $table->text('response')->nullable();
            $table->timestamps();
        });

        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained('donations')->cascadeOnDelete();
            $table->foreignId('request_id')->constrained('donation_requests')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('qty', 10, 2);
            $table->string('unit', 25)->default('kg');
            $table->string('status', 30)->default('scheduled');
            $table->date('scheduled_date')->nullable();
            $table->string('scheduled_time', 20)->nullable();
            $table->string('pickup_place', 160)->nullable();
            $table->string('certificate_code', 50)->unique();
            $table->string('pickup_pin', 12)->default('102030');
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });

        Schema::create('organization_needs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('users')->cascadeOnDelete();
            $table->string('product', 120);
            $table->string('category', 60);
            $table->decimal('qty', 10, 2);
            $table->string('unit', 25)->default('kg');
            $table->string('priority', 20)->default('normal');
            $table->string('storage', 30)->default('any');
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('donation_requests')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('organization_needs');
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('donation_requests');
        Schema::dropIfExists('donations');
    }
};
