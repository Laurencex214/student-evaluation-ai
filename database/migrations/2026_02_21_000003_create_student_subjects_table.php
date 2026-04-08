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
        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('subject_name', 100);
            // Written Works (Quiz scores)
            $table->decimal('ww1', 8, 2)->nullable();
            $table->decimal('ww2', 8, 2)->nullable();
            $table->decimal('ww3', 8, 2)->nullable();
            $table->decimal('ww4', 8, 2)->nullable();
            $table->decimal('ww5', 8, 2)->nullable();
            // Performance Tasks
            $table->decimal('pt1', 8, 2)->nullable();
            $table->decimal('pt2', 8, 2)->nullable();
            $table->decimal('pt3', 8, 2)->nullable();
            $table->decimal('pt4', 8, 2)->nullable();
            $table->decimal('pt5', 8, 2)->nullable();
            // Quarterly Assessment
            $table->decimal('qa', 8, 2)->nullable();
            // Computed grade
            $table->decimal('grade', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'subject_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_subjects');
    }
};
