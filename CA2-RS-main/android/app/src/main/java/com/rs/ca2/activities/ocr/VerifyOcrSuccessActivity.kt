package com.rs.ca2.activities.ocr

import android.os.Handler
import android.os.Looper
import android.view.View
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayout.OnTabSelectedListener
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.databinding.ActivityVerifyOcrSuccessBinding
import com.rs.ca2.fragments.OcrResultEkycFragment
import com.rs.ca2.fragments.OcrResultInfoFragment
import com.rs.ca2.fragments.VerifyInfoFragment

class VerifyOcrSuccessActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyOcrSuccessBinding
    override fun initUi() {
        mBinding.lheader.ivBack.visibility = View.GONE
    }

    override fun setListeners() {
        mBinding.btnGoHome.setOnClickListener {
            finish()
        }
    }

    override fun populateData() {
        mBinding.tabLayoutMenu.addOnTabSelectedListener(object : OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab) {
                when (tab.position) {
                    0 -> {
                        val transaction = supportFragmentManager.beginTransaction()
                        transaction.replace(mBinding.fragContainerMain.id, OcrResultInfoFragment())
                        transaction.commit()
                    }
                    1 -> {
                        val transaction = supportFragmentManager.beginTransaction()
                        transaction.replace(mBinding.fragContainerMain.id, VerifyInfoFragment())
                        transaction.commit()
                    }
                    2 -> {
                        val transaction = supportFragmentManager.beginTransaction()
                        transaction.replace(mBinding.fragContainerMain.id, OcrResultEkycFragment())
                        transaction.commit()
                    }
                }
            }

            override fun onTabUnselected(tab: TabLayout.Tab) {}
            override fun onTabReselected(tab: TabLayout.Tab) {}
        })

        Handler(Looper.getMainLooper()).postDelayed({
            val transaction = supportFragmentManager.beginTransaction()
            transaction.replace(mBinding.fragContainerMain.id, OcrResultInfoFragment())
            transaction.commit()
        }, 100)
    }

    override val layoutRes: Int
        get() = R.layout.activity_verify_ocr_success
    override val layoutView: View
        get() {
            mBinding = ActivityVerifyOcrSuccessBinding.inflate(layoutInflater)
            return mBinding.root
        }
}