package com.rs.ca2.activities.bio2345

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.View
import android.view.View.OnFocusChangeListener
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.widget.addTextChangedListener
import org.greenrobot.eventbus.EventBus
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.EventTransaction
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.IntentData.KEY_OTP_TYPE
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PreferencesKeys
import com.rs.ca2.databinding.ActivityVerifyOtpBinding
import co.vnsafe.xverifysdk.network.BioApiService.BIOAPISERVICE
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.request.bio.OnboardOTPRequestModel
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.bio.RARResponseModel
import co.vnsafe.xverifysdk.utils.StringUtils
import java.lang.StringBuilder
import java.util.UUID
import kotlin.random.Random


class VerifyOTPTransferActivity : BaseActivity(), OnFocusChangeListener,
    TextView.OnEditorActionListener {


    private lateinit var binding: ActivityVerifyOtpBinding

    private var isTransactionOTP = true
    private lateinit var bgFilled: Drawable
    private lateinit var bgEmpty: Drawable
    private var otpCode: String = ""
    private var mapEdittext = mutableListOf<EditText>()

    override fun initUi() {
        mapEdittext = mutableListOf(
            binding.edt1,
            binding.edt2,
            binding.edt3,
            binding.edt4,
            binding.edt5,
            binding.edt6,
        )

        checkAndSendOTPNotification()
        isTransactionOTP = intent.getBooleanExtra(KEY_OTP_TYPE, true)
        binding.tvVerifyOtp.text = if(isTransactionOTP) getString(R.string.verify_transaction_otp) else getString(R.string.verify_onboard_otp)
        Handler(Looper.getMainLooper()).postDelayed({
            binding.edt1.isFocusable = true;
            binding.edt1.requestFocus()
            showSoftKeyboard(binding.edt1)
        } , 1000)
    }

    private fun checkAndSendOTPNotification() {
        otpCode = generateOTP()
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            when {
                ContextCompat.checkSelfPermission(context,
                    Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED -> {
                    sendNotification("OTP Confirmation", "OTP code: $otpCode")
                }
                else -> {
                    requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }
        } else {
            sendNotification("OTP Confirmation", "OTP code: $otpCode")
        }
    }

    private val requestPermissionLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { isGranted: Boolean ->
            if (isGranted) {
                sendNotification("OTP Confirmation", "OTP code: $otpCode")

            } else {
                Handler(Looper.getMainLooper()).postDelayed({
                    CoreConstant.showAlertDialog(this@VerifyOTPTransferActivity, "OTP Code: $otpCode", CoreConstant.DialogType.INFO)
                } , 1000)
            }
        }
    private fun showSoftKeyboard(view: View) {
        val inputMethodManager = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
        view.requestFocus()
        inputMethodManager.showSoftInput(view, 0)
    }

    private fun generateOTP(): String {
        val otp = Random.nextInt(0, 1000000)
        return String.format("%06d", otp)
    }


    override fun setListeners() {
        // Other -->
        binding.layoutHeader.ivBack.setOnClickListener{
            finish()
        }

        // OTP -->
        bgFilled = ContextCompat.getDrawable(context, R.drawable.bg_otp_active_border)!!
        bgEmpty = ContextCompat.getDrawable(context, R.drawable.bg_otp_digit)!!
        binding.edt1.onFocusChangeListener = this
        binding.edt2.onFocusChangeListener = this
        binding.edt3.onFocusChangeListener = this
        binding.edt4.onFocusChangeListener = this
        binding.edt5.onFocusChangeListener = this
        binding.edt6.onFocusChangeListener = this

        binding.edt1.setOnEditorActionListener(this)
        binding.edt2.setOnEditorActionListener(this)
        binding.edt3.setOnEditorActionListener(this)
        binding.edt4.setOnEditorActionListener(this)
        binding.edt5.setOnEditorActionListener(this)
        binding.edt6.setOnEditorActionListener(this)

        binding.edt1.addTextChangedListener {
            if (it?.length!! >= 1) {
                binding.edt2.requestFocus()
                binding.edt1.setBackgroundDrawable(bgFilled)
            } else {
                binding.edt1.setBackgroundDrawable(bgEmpty)
                if (binding.edt1.isFocused) {
                    binding.edt1.setBackgroundDrawable(bgFilled)
                }
            }
        }

        binding.edt2.addTextChangedListener {
            if (it?.length!! >= 1) {
                binding.edt3.requestFocus()
                binding.edt2.setBackgroundDrawable(bgFilled)
            } else {
                binding.edt2.setBackgroundDrawable(bgEmpty)
                if (binding.edt2.isFocused) {
                    binding.edt2.setBackgroundDrawable(bgFilled)
                }
            }
        }

        binding.edt3.addTextChangedListener {
            if (it?.length!! >= 1) {
                binding.edt4.requestFocus()
                binding.edt3.setBackgroundDrawable(bgFilled)
            } else {
                binding.edt3.setBackgroundDrawable(bgEmpty)
                if (binding.edt3.isFocused) {
                    binding.edt3.setBackgroundDrawable(bgFilled)
                }
            }
        }

        binding.edt4.addTextChangedListener {
            if (it?.length!! >= 1) {
                binding.edt5.requestFocus()
                binding.edt4.setBackgroundDrawable(bgFilled)
            } else {
                binding.edt4.setBackgroundDrawable(bgEmpty)
                if (binding.edt4.isFocused) {
                    binding.edt4.setBackgroundDrawable(bgFilled)
                }
            }

        }
        binding.edt5.addTextChangedListener {
            if (it?.length!! >= 1) {
                binding.edt6.requestFocus()
                binding.edt5.setBackgroundDrawable(bgFilled)
            } else {
                binding.edt5.setBackgroundDrawable(bgEmpty)
                if (binding.edt5.isFocused) {
                    binding.edt5.setBackgroundDrawable(bgFilled)
                }
            }
        }

        binding.edt6.addTextChangedListener {
            if (it?.length!! >= 1) {
                binding.edt6.setBackgroundDrawable(bgFilled)
                if (binding.edt1.text.isEmpty()
                    || binding.edt2.text.isEmpty()
                    || binding.edt3.text.isEmpty()
                    || binding.edt4.text.isEmpty()
                    || binding.edt5.text.isEmpty()
                    || binding.edt6.text.isEmpty()
                ) {
                    binding.edt1.requestFocus()
                    mapEdittext.forEach { edt ->
                        if(edt.text.isEmpty()) {
                            edt.requestFocus()
                            return@forEach
                        }
                    }

                } else {
                    val inputOtp = StringBuilder()
                        .append(binding.edt1.text.toString())
                        .append(binding.edt2.text.toString())
                        .append(binding.edt3.text.toString())
                        .append(binding.edt4.text.toString())
                        .append(binding.edt5.text.toString())
                        .append(binding.edt6.text.toString()).toString()
                    if(otpCode.equals(inputOtp)){
                        if(ONBOARDDATAMANAGER.isTransactionOnboard) {
                            requestVerifyOnboardOTP()
                        } else {
                            EventBus.getDefault().post(EventTransaction())
                            finish()
                        }
                    } else {
                        binding.edt1.setText("")
                        binding.edt2.setText("")
                        binding.edt3.setText("")
                        binding.edt4.setText("")
                        binding.edt5.setText("")
                        binding.edt6.setText("")
                        binding.edt1.requestFocus()
                        CoreConstant.showAlertDialog(this@VerifyOTPTransferActivity, "Mã OTP không chính xác", CoreConstant.DialogType.WARNING)
                    }
                }

            } else {
                binding.edt6.setBackgroundDrawable(bgEmpty)
            }
        }
    }

    override fun populateData() {
    }

    private fun requestVerifyOnboardOTP() {
        val requestModel = ONBOARDDATAMANAGER.verifyIdRequestModel

        val cardNumber =
            if (requestModel?.idCard.isNullOrEmpty()) getSharedPreferences(PreferencesKeys.KEY_SHARE_NAME, MODE_PRIVATE)
                .getString(PreferencesKeys.KEY_ID_CARD,"")
            else
                requestModel?.idCard
        val onboardFaceRequestModel = OnboardOTPRequestModel().apply {
            otpTransactionCode = ""
            idCard = cardNumber
            otpConfirm = otpCode.isNotEmpty()
            deviceUuid = if(BuildConfig.DEBUG) APPDELEGATE.randomDeviceUUID else StringUtils.getDeviceUniqueId(context)
        }
        BIOAPISERVICE.bioConfirmOTP(
            UUID.randomUUID().toString(),
            onboardFaceRequestModel,
            object : RestCallback<ResponseModel<RARResponseModel>>() {
                override fun Success(model: ResponseModel<RARResponseModel>?) {
                    if (model == null) {
                        showPopup(getString(com.rs.ca2.R.string.error_system)) { finish() }
                        return
                    }
                    if (model.data == null) {
                        val errorMessage = model.error?.message
                        showPopup(if (!errorMessage.isNullOrEmpty()) errorMessage else getString(com.rs.ca2.R.string.error_not_success)) { finish() }
                        finish()
                        return
                    }

                    if (model.success == null) {
                        showPopup(getString(com.rs.ca2.R.string.error_not_success)) { finish() }
                        return
                    }

                    if (model.success == true) {
                        ONBOARDDATAMANAGER.isOTPVerified = model.success
                        val intent = Intent(this@VerifyOTPTransferActivity,
                            OnboardSuccessActivity::class.java)
                        intent.putExtra(IntentData.KEY_FACE_MATCHING_SUCCESS, ONBOARDDATAMANAGER.isFaceMatch)
                        intent.putExtra(IntentData.KEY_VERIFY_ID_SUCCESS, model.data.isValidModel)
                        startActivity(intent)
                        finish()
                    } else {
                        showPopup(getString(com.rs.ca2.R.string.error_not_success)) { finish() }
                    }

                }

                override fun Error(error: String?) {
                    showPopup(if (!error.isNullOrEmpty()) error else getString(com.rs.ca2.R.string.error)) { finish() }
                }

            })
    }

    private fun sendNotification(title: String, body: String) {

        val notificationBuilder: NotificationCompat.Builder =
            NotificationCompat.Builder(this, "channel_id")
                .setContentTitle(title)
                .setContentText(body)
                .setDefaults(Notification.DEFAULT_ALL)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setSmallIcon(com.rs.ca2.R.mipmap.ic_launcher)
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val notificationChannel = NotificationChannel(
                "channel_id",
                "Service",
                importance
            )
            notificationBuilder.setChannelId("channel_id")
            notificationManager.createNotificationChannel(notificationChannel)
        }

        notificationManager.notify(0, notificationBuilder.build());
    }

    override val layoutRes: Int
        get() = R.layout.activity_verify_otp
    override val layoutView: View
        get() {
            binding = ActivityVerifyOtpBinding.inflate(layoutInflater)
            return binding.root
        }

    override fun onFocusChange(v: View?, hasFocus: Boolean) {
        v!!.setBackgroundDrawable(if(hasFocus) bgFilled else bgEmpty)
        if (v is EditText) {
            if (v.text?.length!! >= 1) {
                v.setBackgroundDrawable(bgFilled)
            }
        }
    }

    override fun onEditorAction(v: TextView?, actionId: Int, event: KeyEvent?): Boolean {
        if (actionId == EditorInfo.IME_ACTION_DONE) {
            val inputOtp = StringBuilder()
                .append(binding.edt1.text.toString())
                .append(binding.edt2.text.toString())
                .append(binding.edt3.text.toString())
                .append(binding.edt4.text.toString())
                .append(binding.edt5.text.toString())
                .append(binding.edt6.text.toString()).toString()
            if(otpCode.equals(inputOtp)){
                if(ONBOARDDATAMANAGER.isTransactionOnboard) {
                    requestVerifyOnboardOTP()
                } else {
                    EventBus.getDefault().post(EventTransaction())
                    finish()
                }
            } else {
                binding.edt1.setText("")
                binding.edt2.setText("")
                binding.edt3.setText("")
                binding.edt4.setText("")
                binding.edt5.setText("")
                binding.edt6.setText("")
                binding.edt1.requestFocus()
                CoreConstant.showAlertDialog(this@VerifyOTPTransferActivity, "Mã OTP không chính xác", CoreConstant.DialogType.WARNING)
            }
        }
        return false;
    }
}