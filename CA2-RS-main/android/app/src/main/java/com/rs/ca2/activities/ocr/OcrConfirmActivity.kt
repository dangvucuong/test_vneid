package com.rs.ca2.activities.ocr

import android.content.Intent
import android.view.View
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.EventTransaction
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityOcrConfirmBinding


class OcrConfirmActivity : BaseActivity () {

    private lateinit var mBinding : ActivityOcrConfirmBinding

    override fun initUi() {
        EventBus.getDefault().register(this);
    }

    override fun setListeners() {
        mBinding.tvAccountName.text = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.fullName
        mBinding.btnContinue.setOnClickListener {
            val intent = Intent(this@OcrConfirmActivity, OcrFaceMatchingActivity::class.java)
            startActivity(intent)
        }

        mBinding.llHeader.ivBack.setOnClickListener { finish() }
    }

    override fun populateData() {

    }

    override val layoutRes: Int
        get() = R.layout.activity_ocr_confirm
    override val layoutView: View
        get() {
            mBinding = ActivityOcrConfirmBinding.inflate(layoutInflater)
            return mBinding.root
        }

    @Subscribe(threadMode = ThreadMode.MAIN)
    fun onMessageEvent(event: EventTransaction) {
        val intent = Intent(this@OcrConfirmActivity, VerifyOcrSuccessActivity::class.java)
        startActivity(intent)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        EventBus.getDefault().unregister(this);
    }
}