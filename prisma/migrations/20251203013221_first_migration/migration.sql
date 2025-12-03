-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAIL', 'CANCELLED', 'REFUNDED', 'EXPIRED');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "externalId" VARCHAR(100),
    "webhookUrl" VARCHAR(500),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "gateway_transaction_id" VARCHAR(100),
    "payment_link" VARCHAR(500),
    "qr_code" TEXT,
    "pix_code" TEXT,
    "pix_key" VARCHAR(100),
    "pix_key_type" VARCHAR(20),
    "account_holder_name" VARCHAR(100),
    "financial_institution" VARCHAR(100),
    "card_brand" VARCHAR(50),
    "card_last_four" VARCHAR(4),
    "capture_method" VARCHAR(50),
    "authorization_code" VARCHAR(100),
    "gateway_customer_id" VARCHAR(100),
    "client_ip" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "correlation_id" VARCHAR(100),
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notification_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_notification_attempt" TIMESTAMP(3),
    "last_notification_error" VARCHAR(500),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_logs" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB,
    "source_ip" VARCHAR(45),
    "status" VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',
    "error_message" TEXT,
    "error_stack" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "processing_time" INTEGER,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_retry_at" TIMESTAMP(3),

    CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_audit_logs" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "field" VARCHAR(100),
    "old_value" TEXT,
    "new_value" TEXT,
    "user_id" VARCHAR(100),
    "user_ip" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_payments" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT,
    "cpf" VARCHAR(11) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "error_code" VARCHAR(100) NOT NULL,
    "error_message" TEXT NOT NULL,
    "error_stack" TEXT,
    "failure_stage" VARCHAR(50) NOT NULL,
    "request_data" JSONB,
    "gateway_response" JSONB,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "last_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "recovered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_configurations" (
    "id" TEXT NOT NULL,
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" JSONB NOT NULL,
    "config_type" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "category" VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(100),

    CONSTRAINT "payment_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_cpf_idx" ON "payments"("cpf");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paymentMethod_idx" ON "payments"("paymentMethod");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE INDEX "payments_cpf_status_idx" ON "payments"("cpf", "status");

-- CreateIndex
CREATE INDEX "payments_paymentMethod_status_created_at_idx" ON "payments"("paymentMethod", "status", "created_at");

-- CreateIndex
CREATE INDEX "payments_externalId_idx" ON "payments"("externalId");

-- CreateIndex
CREATE INDEX "payments_gateway_transaction_id_idx" ON "payments"("gateway_transaction_id");

-- CreateIndex
CREATE INDEX "payments_expires_at_idx" ON "payments"("expires_at");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- CreateIndex
CREATE INDEX "payments_correlation_id_idx" ON "payments"("correlation_id");

-- CreateIndex
CREATE INDEX "payments_notified_status_created_at_idx" ON "payments"("notified", "status", "created_at");

-- CreateIndex
CREATE INDEX "payments_created_at_status_idx" ON "payments"("created_at", "status");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_payment_id_idx" ON "payment_webhook_logs"("payment_id");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_event_type_idx" ON "payment_webhook_logs"("event_type");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_source_idx" ON "payment_webhook_logs"("source");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_status_idx" ON "payment_webhook_logs"("status");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_received_at_idx" ON "payment_webhook_logs"("received_at");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_payment_id_received_at_idx" ON "payment_webhook_logs"("payment_id", "received_at");

-- CreateIndex
CREATE INDEX "payment_audit_logs_payment_id_idx" ON "payment_audit_logs"("payment_id");

-- CreateIndex
CREATE INDEX "payment_audit_logs_action_idx" ON "payment_audit_logs"("action");

-- CreateIndex
CREATE INDEX "payment_audit_logs_user_id_idx" ON "payment_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "payment_audit_logs_created_at_idx" ON "payment_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "payment_audit_logs_payment_id_created_at_idx" ON "payment_audit_logs"("payment_id", "created_at");

-- CreateIndex
CREATE INDEX "failed_payments_payment_id_idx" ON "failed_payments"("payment_id");

-- CreateIndex
CREATE INDEX "failed_payments_cpf_idx" ON "failed_payments"("cpf");

-- CreateIndex
CREATE INDEX "failed_payments_error_code_idx" ON "failed_payments"("error_code");

-- CreateIndex
CREATE INDEX "failed_payments_failure_stage_idx" ON "failed_payments"("failure_stage");

-- CreateIndex
CREATE INDEX "failed_payments_recovered_idx" ON "failed_payments"("recovered");

-- CreateIndex
CREATE INDEX "failed_payments_created_at_idx" ON "failed_payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_configurations_config_key_key" ON "payment_configurations"("config_key");

-- CreateIndex
CREATE INDEX "payment_configurations_config_key_idx" ON "payment_configurations"("config_key");

-- CreateIndex
CREATE INDEX "payment_configurations_category_idx" ON "payment_configurations"("category");

-- CreateIndex
CREATE INDEX "payment_configurations_is_active_idx" ON "payment_configurations"("is_active");

-- AddForeignKey
ALTER TABLE "payment_webhook_logs" ADD CONSTRAINT "payment_webhook_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_audit_logs" ADD CONSTRAINT "payment_audit_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "failed_payments" ADD CONSTRAINT "failed_payments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
