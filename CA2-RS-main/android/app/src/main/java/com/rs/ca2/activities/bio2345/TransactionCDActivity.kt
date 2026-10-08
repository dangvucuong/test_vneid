package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.view.View
import android.view.View.OnClickListener
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.databinding.ActivityTransactionTypeCdBinding
import com.rs.ca2.databinding.ActivityVerifyOtpBinding

class TransactionCDActivity  : BaseActivity(), OnClickListener{
    private var binding: ActivityTransactionTypeCdBinding? = null
    override fun initUi() {

    }

    override fun setListeners() {
        binding!!.tvTransactionC.setOnClickListener(this)
        binding!!.tvTransactionD.setOnClickListener(this)

        binding!!.lHeader.ivBack.setOnClickListener {
            finish()
        }
    }

    override fun populateData() {
    }

    override val layoutRes: Int
        get() = com.rs.ca2.R.layout.activity_transaction_type_cd
    override val layoutView: View
        get() {
            binding = ActivityTransactionTypeCdBinding.inflate(layoutInflater)
            return binding!!.root
        }

    override fun onClick(p0: View?) {
        startActivity(Intent(this@TransactionCDActivity, TransferCreateActivity::class.java))
    }
}