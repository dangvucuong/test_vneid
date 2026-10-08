package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.view.View
import android.widget.ImageView
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.squareup.picasso.Picasso
import org.json.JSONObject
import com.rs.ca2.R
import com.rs.ca2.activities.MainActivity
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PreferencesKeys
import com.rs.ca2.databinding.ActivityOnboardingSuccessBinding
import co.vnsafe.xverifysdk.data.Eid
import co.vnsafe.xverifysdk.jmrtd.VerificationStatus
import java.io.File

class OnboardSuccessActivity : BaseActivity() {

    private lateinit var binding: ActivityOnboardingSuccessBinding
    private var listFace : ArrayList<Bitmap> = ArrayList()

    override fun initUi() {
        val colorSuccess = ContextCompat.getColor(this, R.color.success)
        val colorFailed = ContextCompat.getColor(this, R.color.failed)

        var eidInfo = getSharedPreferences(PreferencesKeys.KEY_SHARE_NAME, MODE_PRIVATE).getString(PreferencesKeys.KEY_EID, "")


        val jsonEidInfo: JSONObject = JSONObject(eidInfo)

        binding.valuePodASystems.setColorFilter(colorSuccess)
        binding.valuePodVerifyFace.setColorFilter(colorSuccess)
        binding.valuePodVerifyEid.setColorFilter(colorSuccess)
        binding.valuePodASystems.setImageResource(R.drawable.ic_checkmark)
        binding.valuePodVerifyFace.setImageResource(R.drawable.ic_checkmark)
        binding.valuePodVerifyEid.setImageResource(R.drawable.ic_checkmark)

        val sharedPreferences =  getSharedPreferences(PreferencesKeys.KEY_SHARE_NAME, MODE_PRIVATE)
        val chipImageBase64 = sharedPreferences.getString(PreferencesKeys.KEY_CHIP_IMAGE,"")
        val onboardImageBase64 = sharedPreferences.getString(PreferencesKeys.KEY_ONBOARD_IMAGE,"")

        val requestOptions = RequestOptions()
            .diskCacheStrategy(DiskCacheStrategy.NONE)
        Glide.with(binding.ivOriginal.context)
            .asBitmap()
            .load(chipImageBase64)
            .apply(requestOptions)
            .into(binding.ivOriginal)
        Glide.with(context)
            .asBitmap()
            .load(onboardImageBase64)
            .apply(requestOptions)
            .into(binding.ivFaceLive)

        // CHIP - Person Optional Details
        if (jsonEidInfo != null) {
            binding.valuePodEid.text = jsonEidInfo.getString("eid_number")
            binding.valuePodFullname.text = jsonEidInfo.getString("full_name")
            binding.valuePodDob.text = jsonEidInfo.getString("dob")
            binding.valuePodGender.text = jsonEidInfo.getString("gender")
            binding.valuePodPlaceOfResidence.text = jsonEidInfo.getString("place_of_residence")
        }
    }

    fun setBase64ToImageView(base64String: String, imageView: ImageView) {
        val decodedBytes: ByteArray = Base64.decode(base64String, Base64.DEFAULT)
        val bitmap: Bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
        imageView.setImageBitmap(bitmap)
    }

    override fun setListeners() {
        binding.btnContinue.setOnClickListener {

            val intent = Intent(this@OnboardSuccessActivity, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }

    }

    override fun populateData() {

    }



    override val layoutRes: Int
        get() = com.rs.ca2.R.layout.activity_onboarding_success
    override val layoutView: View
        get() {
            binding = ActivityOnboardingSuccessBinding.inflate(layoutInflater)
            return binding.root

        }
}