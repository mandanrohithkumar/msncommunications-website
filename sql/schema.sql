-- ==============================================================================
-- MSN Communication Portal - Customer View & Biometric Audit Database Schema
-- Multi-Tenant Customer Directory, Face Recognition Logs & Session Isolation
-- ==============================================================================

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    registered_at VARCHAR(100),
    last_login TIMESTAMP WITH TIME ZONE,
    total_logins INT DEFAULT 0,
    total_logouts INT DEFAULT 0,
    total_uploads INT DEFAULT 0,
    avatar_url TEXT,
    face_embedding TEXT,
    face_verified BOOLEAN DEFAULT FALSE,
    last_face_login_snapshot TEXT,
    face_login_timestamp TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_username ON customers(username);

-- 2. Customer Sessions Table (Isolated per user, records login and force-logout)
CREATE TABLE IF NOT EXISTS customer_sessions (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INT DEFAULT 0,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'force_logged_out'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_customer ON customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON customer_sessions(status);

-- 3. Biometric & Face Recognition Login Snapshots Table
CREATE TABLE IF NOT EXISTS customer_face_recognition_logs (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    captured_photo_data TEXT NOT NULL,
    match_confidence DECIMAL(5, 2) DEFAULT 98.50,
    liveness_status VARCHAR(50) DEFAULT 'verified_blink_detection',
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    auth_status VARCHAR(20) DEFAULT 'verified' CHECK (auth_status IN ('verified', 'failed', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_face_logs_customer ON customer_face_recognition_logs(customer_id);

-- 4. Customer Uploaded Works & Documents Vault
CREATE TABLE IF NOT EXISTS customer_uploaded_works (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    category_name VARCHAR(150) NOT NULL,
    doc_type VARCHAR(100),
    file_size_kb DECIMAL(10, 2),
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(30) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_uploads_customer ON customer_uploaded_works(customer_id);

-- 5. Admin Direct Messages & Alerts Table
CREATE TABLE IF NOT EXISTS admin_customer_messages (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    admin_id VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(30) DEFAULT 'info' CHECK (message_type IN ('info', 'alert', 'urgent', 'success')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_messages_customer ON admin_customer_messages(customer_id);

-- ==============================================================================
-- 6. Centralized Document Table: user_documents (Family Digital Vault)
-- Unified storage for all user & family member identity/statutory documents
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    family_member_id VARCHAR(64) DEFAULT 'self',
    document_type_code VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT fk_user_documents_customer FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_documents_user ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_member ON user_documents(user_id, family_member_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_type ON user_documents(document_type_code);
CREATE INDEX IF NOT EXISTS idx_user_documents_lookup ON user_documents(user_id, family_member_id, document_type_code);

-- Backward compatibility alias view for family_vault_documents
CREATE OR REPLACE VIEW family_vault_documents AS
SELECT 
    id,
    user_id,
    family_member_id,
    document_type_code,
    file_url,
    storage_path,
    uploaded_at,
    metadata
FROM user_documents;

-- ==============================================================================
-- 7. Service Linked Documents Table
-- Binds existing vault document records to specific service submission workflows
-- ==============================================================================
CREATE TABLE IF NOT EXISTS service_linked_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES user_documents(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    service_id VARCHAR(100) NOT NULL,
    application_id VARCHAR(100),
    slot_name VARCHAR(150) NOT NULL,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_service_linked_docs_user ON service_linked_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_service_linked_docs_app ON service_linked_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_service_linked_docs_service ON service_linked_documents(service_id);

