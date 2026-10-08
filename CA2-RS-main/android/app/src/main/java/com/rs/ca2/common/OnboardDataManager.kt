package com.rs.ca2.common

import android.graphics.Bitmap
import com.rs.ca2.model.PreviewDocumentModel
import co.vnsafe.xverifysdk.data.Eid
import co.vnsafe.xverifysdk.network.models.request.ceca.CecaVerifyRequestModel
import co.vnsafe.xverifysdk.network.models.request.VerifyIdResquestModel
import co.vnsafe.xverifysdk.network.models.request.bio.RARRequestModel
import co.vnsafe.xverifysdk.network.models.response.VerifyOCRResponseModel
import co.vnsafe.xverifysdk.onboard.OnboardStatus
import java.io.File

val ONBOARDDATAMANAGER = OnboardDataManager.shared

class OnboardDataManager {

    var eid: Eid? = null
    var verifyIdRequestModel: VerifyIdResquestModel? = null
    //    var rarRequestModel: RARRequestModel? = null
    var cecaVerifyRequestModel: CecaVerifyRequestModel? = null
    var businessType: BusinessType? = null
    var mFileFront: File? = null
    var mFileBack: File? = null
    var previewDocumentModel: PreviewDocumentModel?=null
    /**
     * Image path of CCCD
     */
    var referenceFaceImagePath: String? = null

    var onboardingFaceImagePath : String? = null
    var liveFaceImagePath: String? = null
    var mPathFace: String? = null
    var mVerifyOCRModel: VerifyOCRResponseModel? = null
    var mBitmapFront: Bitmap? = null
    var mBitmapBack: Bitmap? = null
    var isFaceMatch = false
    var isValidIdCard = false
    var isOTPVerified = false
    var bankTransactionType = ""
    var isTransactionOnboard = true

    var isTransactionTypeC = true

    var onboardingStatus: OnboardStatus = OnboardStatus.UNKNOWN
        get() {
            if (eid == null) {
                return OnboardStatus.PENDING
            }
            if (eid?.dsCertChecksumVerified == true && isValidIdCard  && isFaceMatch && isOTPVerified) {
                return OnboardStatus.ONBOARD_COMPLETED
            }

            if(eid?.dsCertChecksumVerified == false || !isValidIdCard) {
                return OnboardStatus.PENDING
            }

            if(!isFaceMatch) {
                return OnboardStatus.RAR_VERIFIED
            }

            if(!isOTPVerified) {
                return OnboardStatus.BIOMETRIC_VERIFIED
            }

            return OnboardStatus.UNKNOWN
        }
        set(value) {
            field = value
        }


    fun clear() {
        eid = null
        verifyIdRequestModel = null
        cecaVerifyRequestModel = null
    }

    companion object {
        @get:Synchronized
        var shared: OnboardDataManager = OnboardDataManager()
    }


}