package com.rs.ca2.common

import android.content.res.Resources
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.R

val DASHBOARDMANAGER = DashboardManager.shared

class DashboardManager private constructor() {

    private val items: List<DashboardItem>

    init {
        val res: Resources = APPDELEGATE.context.resources
        items = listOf(
            DashboardItem(
                0,
                BusinessType.VERIFY_EID,
                res.getString(R.string.title_verify_eid),
                R.drawable.ic_nfc,
                R.color.white,
                true
            ),
            DashboardItem(
                1,
                BusinessType.VERIFY_OCR,
                res.getString(R.string.title_verify_ocr),
                R.drawable.ic_ocr,
                R.color.white,
                true
            ),
            DashboardItem(
                2,
                BusinessType.VERIFY_EID_ACTIVE_EKYC,
                res.getString(R.string.title_verify_eid_ekyc),
                R.drawable.ic_peoplescan,
                R.color.white,
                true
            ),
            DashboardItem(
                3,
                BusinessType.VERIFY_EID_SIMPLE_EKYC,
                res.getString(R.string.title_verify_eid_ekyc_2),
                R.drawable.ic_peoplescan,
                R.color.white,
                true
            ),
            DashboardItem(
                4,
                BusinessType.VERIFY_BANK_TRANSFER,
                res.getString(R.string.title_verify_bio2345),
                R.drawable.ic_card,
                R.color.white,
                true
            ),
//            DashboardItem(
//                5,
//                BusinessType.VERIFY_QR_CODE,
//                res.getString(R.string.title_qr_code),
//                R.drawable.ic_productscan,
//                R.color.white,
//                true
//            ),
//            DashboardItem(
//                6,
//                BusinessType.VERIFY_EID_CECA,
//                res.getString(R.string.title_verify_eid_ceca),
//                R.drawable.ic_note,
//                R.color.white,
//                true
//            ),
            DashboardItem(7,
                BusinessType.VERIFY_EKYB,
                res.getString(R.string.title_verify_ekyb),
                R.drawable.ic_note,
                R.color.white,
                true)
        )
    }

    fun getListDashboard(): List<DashboardItem> {
        return items
    }

    companion object {
        @get:Synchronized
        var shared: DashboardManager = DashboardManager()
    }
}