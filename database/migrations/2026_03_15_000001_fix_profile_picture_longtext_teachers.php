<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Force the profile_picture column to LONGTEXT using raw SQL
     * (avoids doctrine/dbal dependency of ->change()).
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE teachers MODIFY COLUMN profile_picture LONGTEXT NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE teachers MODIFY COLUMN profile_picture TEXT NULL');
        }
    }
};
