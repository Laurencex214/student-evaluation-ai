<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'qr_pin')) {
                $table->string('qr_pin')->nullable()->after('password');
            }
            if (!Schema::hasColumn('students', 'profile_picture')) {
                $table->longText('profile_picture')->nullable()->after('qr_pin');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['qr_pin', 'profile_picture']);
        });
    }
};
