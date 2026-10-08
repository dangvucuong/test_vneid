package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.view.View
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.common.NfcActivity
import com.rs.ca2.activities.verifyeid.VerifyEidMainActivity
import com.rs.ca2.activities.verifyeid.VerifyingEidActivity
import com.rs.ca2.common.EventTransaction
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityTransferCreateBinding
import com.rs.ca2.common.IntentData

class TransferCreateActivity : BaseActivity () {

    private lateinit var mBinding : ActivityTransferCreateBinding
    private var typeC = false

    override fun initUi() {
        EventBus.getDefault().register(this)
        typeC = intent.getBooleanExtra(IntentData.KEY_TRANSACTION_TYPE_C, false)
        ONBOARDDATAMANAGER.isTransactionTypeC = typeC
        mBinding.tvAmountValue.text = if (typeC) "500,000 VND" else "50,000,000 VND"
    }

    override fun setListeners() {
        mBinding.btnContinue.setOnClickListener {
            val intent = Intent(this@TransferCreateActivity, TransferFaceMatchingActivity::class.java)
            startActivity(intent)
        }

        mBinding.llHeader.ivBack.setOnClickListener { finish() }
    }

    override fun populateData() {

    }

    override val layoutRes: Int
        get() = R.layout.activity_transfer_create
    override val layoutView: View
        get() {
            mBinding = ActivityTransferCreateBinding.inflate(layoutInflater)
            return mBinding.root
        }


    override fun onDestroy() {
        super.onDestroy()
        EventBus.getDefault().unregister(this);
    }


    @Subscribe(threadMode = ThreadMode.MAIN)
    fun onMessageEvent(event: EventTransaction) {
        val intent = Intent(this@TransferCreateActivity, VerifyingFaceTransferActivity::class.java)
        intent.putExtra(IntentData.KEY_TRANSACTION_TYPE_C, typeC)
        startActivity(intent)
        finish()

    }



    companion object {
        const val REQUEST_CODE_TRANSFER = 10000

    }
}