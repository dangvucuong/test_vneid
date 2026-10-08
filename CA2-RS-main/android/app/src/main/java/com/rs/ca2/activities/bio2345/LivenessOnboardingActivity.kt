package com.rs.ca2.activities.bio2345

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Outline
import android.media.MediaPlayer
import android.view.View
import android.view.ViewOutlineProvider
import androidx.camera.core.CameraSelector
import androidx.camera.view.LifecycleCameraController
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PreferencesKeys
import com.rs.ca2.common.Utils
import com.rs.ca2.databinding.ActivityLivenessBinding
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE

import co.vnsafe.xverifysdk.network.BioApiService
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.request.bio.OnboardFaceRequestModel
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.bio.RARResponseModel
import co.vnsafe.xverifysdk.utils.StringUtils
import co.vnsafe.xverifysdk.vision.ActiveEkycUtils
import co.vnsafe.xverifysdk.vision.EkycLivenessListener
import co.vnsafe.xverifysdk.vision.EkycVerificationMode
import co.vnsafe.xverifysdk.vision.EkycVerifyError
import co.vnsafe.xverifysdk.vision.EkycVerifyListener
import co.vnsafe.xverifysdk.vision.core.StepFace
import java.util.UUID

class LivenessOnboardingActivity : BaseActivity() {
    private var mBinding: ActivityLivenessBinding? = null
    private var cameraController: LifecycleCameraController? = null
    private var mediaPlayer: MediaPlayer? = null


    private val faceListener: EkycLivenessListener = object : EkycLivenessListener {

        override fun onMultiFace() {
            mBinding!!.tvStepInstruction.text = getString(R.string.multi_face)
        }

        override fun onNoFace() {
            mBinding!!.tvStepInstruction.text = getString(R.string.put_your_face_in_the_frame)
        }

        override fun onPlaySound() {
            playSoundBeep()
        }

        override fun onFaceResult(step: StepFace, path: String) {
        }

        override fun onStep(step: StepFace) {
            mBinding!!.tvStepInstruction.text = when (step) {
                StepFace.FACE -> getString(R.string.please_look_straight)
                StepFace.FACE_CENTER -> getString(R.string.please_look_straight)
                StepFace.LEFT -> getString(R.string.please_tilt_your_face_to_the_left)
                StepFace.RIGHT -> getString(R.string.please_tilt_your_face_to_the_right)
                StepFace.SURPRISED -> getString(R.string.please_surprised)
                StepFace.SADNESS -> getString(R.string.please_sadness)
                StepFace.SMILE -> getString(R.string.please_smile)
                StepFace.NOD_DOWN -> getString(R.string.please_nod_down)
                StepFace.NOD_UP -> getString(R.string.please_nod_up)
                StepFace.OPEN_MOUTH -> getString(R.string.please_open_your_mouth)
                StepFace.DONE -> {
                    ""
                }

                StepFace.FACE_FAR -> ""
                StepFace.FACE_NEAR -> TODO()
            }
        }
    }
    private val onVerifyListener: EkycVerifyListener = object : EkycVerifyListener {
        override fun onProcess() {
            showProgress()
            mBinding!!.tvStepInstruction.text = getString(R.string.nfc_verify)
        }

        override fun onFinishProcess() {
            hideProgress()
        }

        override fun onFailed(
            error: String,
            capturedFace: String,
            ekycVerificationMode: EkycVerificationMode,
            errorCodes: EkycVerifyError
        ) {
            hideProgress()
            CoreConstant.showAlertDialog(
                this@LivenessOnboardingActivity,
                error,
                CoreConstant.DialogType.ERROR
            )
        }

        override fun onVerifyCompleted(
            ekycVerificationMode: EkycVerificationMode,
            verifyLiveness: Boolean,
            isMatching: Boolean,
            matchingScore: Double,
            capturedFace: String
        ) {
            hideProgress()
            if(ekycVerificationMode == EkycVerificationMode.CAPTURE_LIVENESS){
                requestOnBoardingFace(capturedFace)
            }
        }
    }

    // =================================
    // region Life Cycle
    // =================================

    override fun initUi() {
        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        ActiveEkycUtils.EKYCSERVICE.init(
            this, cameraController!!, ONBOARDDATAMANAGER.eid?.faceImage,
            EkycVerificationMode.CAPTURE_LIVENESS, faceListener, onVerifyListener,
            arrayListOf(
                StepFace.FACE_CENTER,
                StepFace.SMILE,
            ), false,true
        )

        mBinding!!.layoutHeader.tvTitleHeader.text = getString(R.string.step_3_verify_face)
        mBinding!!.cameraPreview.clipToOutline = true
        mBinding!!.cameraPreview.outlineProvider = object : ViewOutlineProvider() {
            override fun getOutline(view: View, outline: Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, view.height / 2.0f)
            }
        }
        mBinding!!.tvStepInstruction.text = getString(R.string.put_your_face_in_the_frame)
        mediaPlayer = MediaPlayer.create(this, R.raw.sound_beep)
    }

    override fun setListeners() {
        mBinding!!.layoutHeader.ivBack.setOnClickListener { v: View? -> finish() }
        mBinding!!.ivChangeCamera.setOnClickListener { v: View? ->

            if (cameraController?.cameraSelector == CameraSelector.DEFAULT_BACK_CAMERA) {
                cameraController?.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
            } else {
                cameraController?.cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            }
        }
    }

    override fun populateData() {
        checkPermissions { startCamera() }
    }

    override val layoutRes: Int
        get() = R.layout.activity_liveness
    override val layoutView: View
        get() {
            mBinding = ActivityLivenessBinding.inflate(layoutInflater)
            return mBinding!!.root
        }

    override fun onDestroy() {
        if (mediaPlayer != null) {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        }
        super.onDestroy()
    }

    // =================================
    // endregion
    // =================================
    // region Private Liveness
    // =================================

    @SuppressLint("SetTextI18n")
    private fun startCamera() {
        cameraController = LifecycleCameraController(this)
        cameraController?.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
        cameraController?.bindToLifecycle(this)
        mBinding!!.cameraPreview.controller = cameraController
        ActiveEkycUtils.EKYCSERVICE.setCameraController(cameraController!!)
        ActiveEkycUtils.EKYCSERVICE.startAnalysis()
    }

    private fun playSoundBeep() {
        if (mediaPlayer != null && !mediaPlayer?.isPlaying!!) {
            mediaPlayer?.start()
        }
    }

    protected fun showProgress() {
        runOnUiThread { mBinding!!.lavAnimationLoading.visibility = View.VISIBLE }
    }

    protected fun hideProgress() {
        runOnUiThread { mBinding!!.lavAnimationLoading.visibility = View.INVISIBLE }
    }

    private fun verifyFaceFailed() {
        CoreConstant.showAlertDialog(
            this@LivenessOnboardingActivity,
            getString(R.string.face_not_match),
            CoreConstant.DialogType.ERROR
        )
    }

    private fun requestOnBoardingFace(pathFaceEKYC: String?) {
        if (pathFaceEKYC == null) {
            showPopup(getString(R.string.not_found_image)) { finish() }
            return
        }
        showProgress()
        mBinding!!.tvStepInstruction.text = getString(R.string.loading_verify)

        val requestModel = ONBOARDDATAMANAGER.verifyIdRequestModel
        val cardNumber =
            if (requestModel?.idCard.isNullOrEmpty()) getSharedPreferences(
                PreferencesKeys.KEY_SHARE_NAME, MODE_PRIVATE
            ).getString(PreferencesKeys.KEY_ID_CARD, "")
            else
                requestModel?.idCard

        val onboardFaceRequestModel = OnboardFaceRequestModel().apply {
            capturedImg = StringUtils.convertFileBitmapToBase64(pathFaceEKYC)
            idCard = cardNumber
            deviceUuid =
                if (BuildConfig.DEBUG) APPDELEGATE.randomDeviceUUID else StringUtils.getDeviceUniqueId(
                    context
                )
        }

        BioApiService.BIOAPISERVICE.bioFaceVerification(
            UUID.randomUUID().toString(),
            onboardFaceRequestModel,
            object : RestCallback<ResponseModel<RARResponseModel>>() {
                override fun Success(model: ResponseModel<RARResponseModel>?) {
                    if (model == null) {
                        showPopup(getString(R.string.error_system)) { finish() }
                        return
                    }
                    if (model.data == null) {
                        val errorMessage = model.error?.message
                        showPopup(
                            if (!errorMessage.isNullOrEmpty()) errorMessage else getString(
                                R.string.error_not_success
                            )
                        ) { finish() }
                        finish()
                        return
                    }
                    if (model.data.isMatching == null) {
                        showPopup(getString(R.string.error_not_success)) { finish() }
                        return
                    }
                    if (model.data.isMatching == true) {
                        Utils.storeImageEid(
                            this@LivenessOnboardingActivity,
                            ONBOARDDATAMANAGER.eid?.faceImage
                        ) {
                            ONBOARDDATAMANAGER.referenceFaceImagePath = it
                        }
                        ONBOARDDATAMANAGER.isFaceMatch = model.data.isMatching!!
                        ONBOARDDATAMANAGER.onboardingFaceImagePath = pathFaceEKYC

                        val share =
                            getSharedPreferences(
                                PreferencesKeys.KEY_SHARE_NAME,
                                MODE_PRIVATE
                            )
                        share.edit()
                            .putString(
                                PreferencesKeys.KEY_ID_CARD,
                                onboardFaceRequestModel.idCard
                            )
                            .apply()
                        share.edit().putString(
                            PreferencesKeys.KEY_ONBOARD_IMAGE,
                            onboardFaceRequestModel.capturedImg
                        ).apply()

                        hideProgress()
                        val intent = Intent(
                            this@LivenessOnboardingActivity,
                            VerifyOTPTransferActivity::class.java
                        )
                        intent.putExtra(IntentData.KEY_OTP_TYPE, false)
                        startActivity(intent)
                        finish()
                    } else {
                        hideProgress()
                        showPopup(getString(R.string.error_not_success)) { finish() }
                    }
                }

                override fun Error(error: String?) {
                    hideProgress()
                    showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { finish() }
                }
            })


    }

    // =================================
    // endregion
    // =================================

}
