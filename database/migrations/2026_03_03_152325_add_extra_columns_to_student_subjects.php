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
        Schema::table('student_subjects', function (Blueprint $table) {
            $table->decimal('ww6', 8, 2)->nullable();
            $table->decimal('ww7', 8, 2)->nullable();
            $table->decimal('ww8', 8, 2)->nullable();
            $table->decimal('ww9', 8, 2)->nullable();
            $table->decimal('ww10', 8, 2)->nullable();

            $table->decimal('pt6', 8, 2)->nullable();
            $table->decimal('pt7', 8, 2)->nullable();
            $table->decimal('pt8', 8, 2)->nullable();
            $table->decimal('pt9', 8, 2)->nullable();
            $table->decimal('pt10', 8, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_subjects', function (Blueprint $table) {
            $table->dropColumn(['ww6','ww7','ww8','ww9','ww10','pt6','pt7','pt8','pt9','pt10']);
        });
    }
};
