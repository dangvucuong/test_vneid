import xverifysdk
import UIKit

let ONBOARDDATAMANAGER = OnboardDataManager.shared

class OnboardDataManager: NSObject {
    
    var mrzKey: String = ""
    var mrzInfo: MRZInfo?
    var eid: Eid?
    var faceId: String = ""
    
    var cardFrontPath: String = ""
    var cardBackPath: String = ""
    
    var eidFacePath: String = ""
    var cecaVerifyRequest: CecaRequestModel?
    var ocrResult: OCRResponseModel?
    var businessType: BusinessType?
    var onboardStatus: OnboardStatus = .UNKNOWN
    var currentOnboardFace: String = ""
    
    
    //bio
    var ekycFront: String = ""
    var bioFaceResult: Bool = false
    var bioRarResult: Bool = false
    var transactionStatus: TransactionStatus = .UNKNOWN
    var eidNumber: String?
    var bioEidChipImagePath: String?
    var bioImageOnboard: String?
    var eidBio: RarVerificationRequestModel?
    
    //ekyb
    var ekybResponse: Any?
    var typeDocument: VerifyDocumentType?
    var taxCode: String = ""
    var taxCodeInfomation: TaxcodeVerifyInfoResponseModel<TaxcodeVerifyAdvanceResponseModel>?
    
    // --------------------------------------
    // MARK: Singleton
    // --------------------------------------
    
    class var shared: OnboardDataManager {
        struct Static {
            static let instance = OnboardDataManager()
        }
        return Static.instance
    }
    
    override init() {
        
    }
    
    func clear() {
        mrzKey = ""
        mrzInfo = nil
        eid = nil
        eidFacePath = ""
        cecaVerifyRequest = nil
        businessType = nil
        cardFrontPath = ""
        cardBackPath = ""
        faceId = ""
        ekycFront = ""
        ocrResult = nil
        ekybResponse = nil
        taxCode = ""
    }
}
