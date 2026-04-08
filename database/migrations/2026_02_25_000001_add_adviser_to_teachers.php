<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->boolean('is_adviser')->default(false)->after('subject');
            $table->string('section', 100)->nullable()->after('is_adviser')
                  ->comment('Section(s) the adviser handles, comma-separated');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['is_adviser', 'section']);
        });
    }
};
