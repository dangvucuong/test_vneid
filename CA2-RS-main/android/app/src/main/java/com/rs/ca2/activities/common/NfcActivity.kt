package com.rs.ca2.activities.common

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Intent
import android.nfc.NfcAdapter
import android.content.Context
import android.nfc.Tag
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.common.BusinessType
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityNfcBinding
import com.rs.ca2.fragments.NfcFragment
import co.vnsafe.xverifysdk.card.EidFacade
import co.vnsafe.xverifysdk.data.BasicInformation
import co.vnsafe.xverifysdk.data.Eid
import co.vnsafe.xverifysdk.jmrtd.VerificationStatus
import co.vnsafe.xverifysdk.network.models.CecaEnums
import co.vnsafe.xverifysdk.network.models.request.ceca.CecaVerifyRequestModel
import co.vnsafe.xverifysdk.network.models.request.VerifyIdResquestModel
import co.vnsafe.xverifysdk.utils.CecaUtils
import co.vnsafe.xverifysdk.utils.StringUtils
import java.util.UUID
import com.google.gson.Gson

import java.util.concurrent.atomic.AtomicBoolean


class NfcActivity : AppCompatActivity(),
    NfcFragment.NfcFragmentListener {
    private lateinit var binding: ActivityNfcBinding
    private var nfcAdapter: NfcAdapter? = null
    private var basicInformation: BasicInformation? = null
    private var isChecking = AtomicBoolean(true)
    private var pendingIntent: PendingIntent? = null
    var mrzInfo: MRZInfo? = null

    @SuppressLint("CommitTransaction")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityNfcBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        if (intent.hasExtra(IntentData.KEY_QRCODE_INFO)) {
            basicInformation =
                intent.getSerializableExtra(IntentData.KEY_QRCODE_INFO) as BasicInformation
            mrzInfo =
                if (basicInformation!!.dateOfExpiry == null) {
                    EidFacade.createMrz(
                        basicInformation!!.eidNumber,
                        basicInformation!!.dateOfBirth,
                        basicInformation!!.dateOfIssue!!
                    )
                } else {
                    EidFacade.createMrzInfo(
                        basicInformation!!.eidNumber,
                        basicInformation!!.dateOfBirth,
                        basicInformation!!.dateOfExpiry!!
                    )
                }
        }else if(intent.hasExtra(IntentData.KEY_MRZ_INFO)){
            mrzInfo = intent.getSerializableExtra(IntentData.KEY_MRZ_INFO) as MRZInfo
        }
        else {
            onBackPressed()
        }

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.getActivity(this, 0, Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), PendingIntent.FLAG_MUTABLE)
        } else {
            PendingIntent.getActivity(this, 0, Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), PendingIntent.FLAG_UPDATE_CURRENT)
        }
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(
                    R.id.container,
                    NfcFragment.newInstance(mrzInfo!!, basicInformation),
                    TAG_NFC
                )
                .commit()
        }
    }

    private fun onEnableNfc() {
        isChecking.set(false)
        if (nfcAdapter != null) {
            if (!nfcAdapter!!.isEnabled)
                showWirelessSettings()
        } else {
            Toast.makeText(this, getString(R.string.warning_no_nfc), Toast.LENGTH_LONG).show()
        }
    }

    override fun onResume() {
        super.onResume()
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onDisableNfc() {
        isChecking.set(true)
    }

    override fun onStartNfc() {
        onEnableNfc()
    }

    override fun onEidRead(eid: Eid?) {
        Log.d("TAG", "onEidRead")
        isChecking.set(true)
        ONBOARDDATAMANAGER.eid = eid


        val deviceID = StringUtils.getDeviceUniqueId(this)
//        if (ONBOARDDATAMANAGER.businessType == BusinessType.VERIFY_EID_CECA) {
//            val requestModel = CecaVerifyRequestModel()
//            requestModel.info.version = BuildConfig.CECA_VERSION
//            requestModel.info.senderId = BuildConfig.CECA_SENDER_ID
//            requestModel.info.receiverId = BuildConfig.CECA_RECEIVER_ID
//            requestModel.info.messageType = CecaEnums.CecaMessageType.HUB_PROVIDER_EVERIFY.code
//            requestModel.info.sendDate = System.currentTimeMillis()
//            requestModel.info.messageId = CecaUtils.generateMessageId(BuildConfig.CECA_SENDER_ID)
//            requestModel.content.transactionId =
//                UUID.randomUUID().toString().replace("-", "").uppercase()
//            requestModel.content.data.code = BuildConfig.CUSTOMER_CODE
//            requestModel.content.data.gatewayTransactionCode =
//                UUID.randomUUID().toString().replace("-", "").uppercase()
//            requestModel.content.data.dsCert =
//                StringUtils.encodeToBase64String(eid?.documentSigningCertificate)
//            requestModel.content.data.idCardNumber = eid?.personOptionalDetails?.eidNumber
//            requestModel.content.data.deviceType = "mobile"
//            requestModel.content.data.province =
//                StringUtils.getProvince(StringUtils.getProvince(eid?.personOptionalDetails?.placeOfOrigin))
//            requestModel.signature =
//                CecaUtils.generateSignature(BuildConfig.CECA_PROVIDER_SECRET_KEY, requestModel)
//            ONBOARDDATAMANAGER.cecaVerifyRequestModel = requestModel
//        }

        val requestModel = VerifyIdResquestModel()
        requestModel.dsCert = StringUtils.encodeToBase64String(eid?.documentSigningCertificate)
        requestModel.code = BuildConfig.CUSTOMER_CODE
        requestModel.province =
            StringUtils.getProvince(StringUtils.getProvince(eid?.personOptionalDetails?.placeOfOrigin))
        requestModel.idCard = eid?.personOptionalDetails?.eidNumber
        requestModel.deviceType = "mobile-$deviceID"
        requestModel.requestId = UUID.randomUUID().toString()
        ONBOARDDATAMANAGER.verifyIdRequestModel = requestModel
        val jsonString = Gson().toJson(requestModel)
        val pref = getSharedPreferences(packageName + "_preferences", Context.MODE_PRIVATE)
        pref.edit().putString("NFC_read", jsonString).apply()
        setResult(RESULT_OK)
        finish()
    }

    private fun verifyFailed() {
        isChecking.set(false)
        onReadFailed()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (isChecking.get()) {
            return
        }
        if (NfcAdapter.ACTION_TAG_DISCOVERED == intent.action || NfcAdapter.ACTION_TECH_DISCOVERED == intent.action) {
            val fragmentByTag = supportFragmentManager.findFragmentByTag(TAG_NFC)
            if (fragmentByTag is NfcFragment) {
                val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
                if (tag != null) {
                    fragmentByTag.handleNfcTag(tag)
                }
            }
        }
    }


    private fun onReadFailed() {
        val fragmentByTag = supportFragmentManager.findFragmentByTag(TAG_NFC)
        if (fragmentByTag is NfcFragment) {
            fragmentByTag.restartUi()
        }
    }

    private fun showWirelessSettings() {
        Toast.makeText(this, getString(R.string.warning_enable_nfc), Toast.LENGTH_LONG).show()
        val intent = Intent(Settings.ACTION_WIRELESS_SETTINGS)
        startActivity(intent)
    }


    companion object {
        private val TAG = NfcActivity::class.java.simpleName
        private val TAG_NFC = "TAG_NFC"
    }
}