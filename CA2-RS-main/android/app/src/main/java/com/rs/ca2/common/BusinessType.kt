package com.rs.ca2.common

enum class BusinessType(val type: Int) {
    VERIFY_EID(0),
    VERIFY_EID_ACTIVE_EKYC(1),
    VERIFY_EID_SIMPLE_EKYC(5),
    VERIFY_EID_PASSIVE_EKYC(6),
    VERIFY_BANK_TRANSFER(2),
    VERIFY_OCR(3),
//    VERIFY_EID_CECA(4),
    VERIFY_QR_CODE(7),
    VERIFY_EKYB(8)
}