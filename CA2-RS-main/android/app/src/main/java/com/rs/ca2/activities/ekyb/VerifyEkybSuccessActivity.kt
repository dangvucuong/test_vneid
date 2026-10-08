package com.rs.ca2.activities.ekyb

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.FragmentTransaction
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayout.OnTabSelectedListener
import com.rs.ca2.R
import com.rs.ca2.activities.MainActivity
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.DialogLoading
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityVerifyEkybSuccessBinding
import com.rs.ca2.databinding.ActivityVerifyOcrSuccessBinding
import com.rs.ca2.fragments.OcrResultEkycFragment
import com.rs.ca2.fragments.OcrResultInfoFragment
import com.rs.ca2.fragments.VerifyInfoFragment
import com.rs.ca2.fragments.ekyb.ResultEkybFragment

class VerifyEkybSuccessActivity : BaseActivity() {
    private lateinit var mBinding : ActivityVerifyEkybSuccessBinding
    private var isValidMst = false

    override fun initUi() {
        mBinding.lheader.ivBack.visibility = View.GONE
        mBinding.tabLayoutMenu.getTabAt(0)?.view?.visibility = View.VISIBLE
    }

    override fun setListeners() {
        mBinding.btnGoHome.setOnClickListener {
            startActivity(Intent(this@VerifyEkybSuccessActivity, MainActivity::class.java))
            finishAffinity()
        }
    }

    override fun populateData() {

        mBinding.tabLayoutMenu.addOnTabSelectedListener(object : OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab) {
                val transaction = supportFragmentManager.beginTransaction()

                when (tab.position) {
                    0 -> {
                        // Check if the fragment is already added
                        val fragment = supportFragmentManager.findFragmentByTag(ResultEkybFragment::class.java.simpleName)
                        if (fragment == null) {
                            // If it's not added, add it
                            transaction.add(mBinding.fragContainerMain.id, ResultEkybFragment(), ResultEkybFragment::class.java.simpleName)
                        }
                        // Hide other fragments
                        hideOtherFragments(transaction, ResultEkybFragment::class.java.simpleName)
                    }
                    1 -> {
                        val fragment = supportFragmentManager.findFragmentByTag(OcrResultInfoFragment::class.java.simpleName)
                        if (fragment == null) {
                            transaction.add(mBinding.fragContainerMain.id, OcrResultInfoFragment(), OcrResultInfoFragment::class.java.simpleName)
                        }
                        hideOtherFragments(transaction, OcrResultInfoFragment::class.java.simpleName)
                    }
                    2 -> {
                        val fragment = supportFragmentManager.findFragmentByTag(VerifyInfoFragment::class.java.simpleName)
                        if (fragment == null) {
                            transaction.add(mBinding.fragContainerMain.id, VerifyInfoFragment(), VerifyInfoFragment::class.java.simpleName)
                        }
                        hideOtherFragments(transaction, VerifyInfoFragment::class.java.simpleName)
                    }
                    3 -> {
                        val fragment = supportFragmentManager.findFragmentByTag(OcrResultEkycFragment::class.java.simpleName)
                        if (fragment == null) {
                            transaction.add(mBinding.fragContainerMain.id, OcrResultEkycFragment(), OcrResultEkycFragment::class.java.simpleName)
                        }
                        hideOtherFragments(transaction, OcrResultEkycFragment::class.java.simpleName)
                    }
                }

                transaction.commit()
            }

            override fun onTabUnselected(tab: TabLayout.Tab) {}
            override fun onTabReselected(tab: TabLayout.Tab) {}
        })

        Handler(Looper.getMainLooper()).postDelayed({
            val transaction = supportFragmentManager.beginTransaction()
            transaction.replace(mBinding.fragContainerMain.id, ResultEkybFragment(),ResultEkybFragment::class.java.simpleName)
            transaction.commit()
        }, 100)
    }

    override val layoutRes: Int
        get() = R.layout.activity_verify_ocr_success
    override val layoutView: View
        get() {
            mBinding = ActivityVerifyEkybSuccessBinding.inflate(layoutInflater)
            return mBinding.root
        }
    fun hideOtherFragments(transaction: FragmentTransaction, currentFragmentTag: String) {
        val fragments = supportFragmentManager.fragments
        for (fragment in fragments) {
            if (fragment != null && fragment.tag != currentFragmentTag) {
                transaction.hide(fragment)
            } else {
                // Show the selected fragment
                transaction.show(fragment)
            }
        }
    }


}