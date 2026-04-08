<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            // 'JH' = Junior High, 'SH' = Senior High
            $table->string('level', 10)->default('JH')->after('section');
            // ABM, STEM, GAS, TVL, HUMSS — nullable for JH teachers
            $table->string('strand', 20)->nullable()->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['level', 'strand']);
        });
    }
};
