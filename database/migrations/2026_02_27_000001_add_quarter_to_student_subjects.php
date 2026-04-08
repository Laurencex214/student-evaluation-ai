<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_subjects', function (Blueprint $table) {
            // Drop foreign key first so MySQL allows dropping the underlying unique index used for it
            $table->dropForeign(['student_id']);
            
            // Drop the old unique constraint (student_id, subject_name)
            $table->dropUnique(['student_id', 'subject_name']);

            // Add quarter column (1–4), default 1st quarter
            $table->tinyInteger('quarter')->default(1)->after('subject_name');

            // Re-add foreign key
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');

            // New unique constraint: one row per student × subject × quarter
            $table->unique(['student_id', 'subject_name', 'quarter']);
        });
    }

    public function down(): void
    {
        Schema::table('student_subjects', function (Blueprint $table) {
            $table->dropUnique(['student_id', 'subject_name', 'quarter']);
            $table->dropColumn('quarter');
            $table->unique(['student_id', 'subject_name']);
        });
    }
};
