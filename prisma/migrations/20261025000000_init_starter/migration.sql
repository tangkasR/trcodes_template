-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "roles" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "desc" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "features" (
    "uuid" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "desc" VARCHAR(255),
    "available_actions" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "uuid" UUID NOT NULL,
    "role_uuid" UUID NOT NULL,
    "feature_uuid" UUID NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_add" BOOLEAN NOT NULL DEFAULT false,
    "is_edit" BOOLEAN NOT NULL DEFAULT false,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "users" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_uuid" UUID NOT NULL,
    "session_version" INTEGER NOT NULL DEFAULT 0,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" VARCHAR(255),
    "mfa_recovery_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "uuid" UUID NOT NULL,
    "user_uuid" UUID NOT NULL,
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" VARCHAR(191) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "reset_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "mfa_attempts" (
    "uuid" UUID NOT NULL,
    "user_uuid" UUID,
    "ip" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_attempts_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "uuid" UUID NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "ip" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "uuid" UUID NOT NULL,
    "actor_uuid" UUID,
    "actor_name" VARCHAR(100),
    "actor_email" VARCHAR(191),
    "action" VARCHAR(60) NOT NULL,
    "target_type" VARCHAR(50),
    "target_uuid" VARCHAR(64),
    "detail" VARCHAR(1000),
    "ip" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "items" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "features_key_key" ON "features"("key");

-- CreateIndex
CREATE INDEX "role_permissions_feature_uuid_idx" ON "role_permissions"("feature_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_uuid_feature_uuid_key" ON "role_permissions"("role_uuid", "feature_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_uuid_idx" ON "users"("role_uuid");

-- CreateIndex
CREATE INDEX "user_sessions_user_uuid_expires_at_idx" ON "user_sessions"("user_uuid", "expires_at");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets"("reset_at");

-- CreateIndex
CREATE INDEX "mfa_attempts_user_uuid_created_at_idx" ON "mfa_attempts"("user_uuid", "created_at");

-- CreateIndex
CREATE INDEX "mfa_attempts_ip_created_at_idx" ON "mfa_attempts"("ip", "created_at");

-- CreateIndex
CREATE INDEX "mfa_attempts_created_at_idx" ON "mfa_attempts"("created_at");

-- CreateIndex
CREATE INDEX "login_attempts_email_ip_created_at_idx" ON "login_attempts"("email", "ip", "created_at");

-- CreateIndex
CREATE INDEX "login_attempts_ip_created_at_idx" ON "login_attempts"("ip", "created_at");

-- CreateIndex
CREATE INDEX "login_attempts_created_at_idx" ON "login_attempts"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_uuid_created_at_idx" ON "audit_logs"("actor_uuid", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "items_is_active_sort_order_idx" ON "items"("is_active", "sort_order");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_feature_uuid_fkey" FOREIGN KEY ("feature_uuid") REFERENCES "features"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
