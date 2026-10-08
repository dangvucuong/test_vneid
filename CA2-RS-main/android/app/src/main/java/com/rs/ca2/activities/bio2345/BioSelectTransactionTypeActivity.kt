package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.view.View
import com.rs.ca2.activities.bio2345.TransferCreateActivity
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.IntentData.KEY_TRANSACTION_TYPE_C
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityTransactionTypeCdBinding

class BioSelectTransactionTypeActivity: BaseActivity(), View.OnClickListener {
    private var binding: ActivityTransactionTypeCdBinding? = null
    override fun initUi() {

    }

    override fun setListeners() {
        binding!!.tvTransactionC.setOnClickListener{
            ONBOARDDATAMANAGER.bankTransactionType = "C"
            val intent = Intent(this@BioSelectTransactionTypeActivity, TransferCreateActivity::class.java)
            intent.putExtra(KEY_TRANSACTION_TYPE_C,true)
            startActivity(intent)
            finish()
        }
        binding!!.tvTransactionD.setOnClickListener{
            ONBOARDDATAMANAGER.bankTransactionType = "D"
            val intent = Intent(this@BioSelectTransactionTypeActivity, TransferCreateActivity::class.java)
            intent.putExtra(KEY_TRANSACTION_TYPE_C,false)
            startActivity(intent)
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
    }
}