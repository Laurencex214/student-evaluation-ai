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
            $table->json('enrollment_history')->nullable()->after('adviser');
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->json('assignment_history')->nullable()->after('section');
        });

        Schema::table('student_subjects', function (Blueprint $table) {
            $table->string('school_year', 20)->nullable()->after('quarter');

            $table->dropForeign(['student_id']);
            $table->dropUnique(['student_id', 'subject_name', 'quarter']);
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->unique(['student_id', 'subject_name', 'quarter', 'school_year'], 'student_subject_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_subjects', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropUnique('student_subject_unique');
            $table->dropColumn('school_year');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->unique(['student_id', 'subject_name', 'quarter']);
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn('assignment_history');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('enrollment_history');
        });
    }
};
