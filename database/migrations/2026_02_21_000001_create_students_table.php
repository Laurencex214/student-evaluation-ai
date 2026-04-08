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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('lrn', 20)->unique()->comment('Learner Reference Number');
            $table->string('name', 150);
            $table->string('section', 100)->nullable();
            $table->string('adviser', 150)->nullable();
            $table->decimal('attendance', 5, 2)->default(0)->comment('Attendance percentage');
            $table->enum('status', ['Active', 'Inactive', 'Transferred', 'Dropped'])->default('Active');
            $table->decimal('gwa', 5, 2)->default(0)->comment('General Weighted Average');
            $table->enum('risk', ['High', 'Low', 'Pending'])->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
