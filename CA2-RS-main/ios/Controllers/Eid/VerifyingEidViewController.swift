//
//  VerifyingEidViewController.swift
//  xverifydemoapp
//
//  Created by Minh Tri on 24/12/2023.
//

import UIKit
import Lottie
import xverifysdk

class VerifyingEidViewController: NavigationBarViewController {

    @IBOutlet weak var animationLoading: LottieAnimationView!
    @IBOutlet weak var stepInstructionLabel: UILabel!
    
    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if ONBOARDDATAMANAGER.businessType == .transfer {
            self.requestBioRarVerify()
        } else {
            self.requestVerifyEid()
        }
    }
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    
    override var leftBarButton: UIButton? {
        let button = UIButton(frame: CGRect(x: 0, y: 0, width: 24, height: 24))
        button.backgroundColor = .clear
        button.setImage(UIImage(named: "ic_action_arrowback"), for: .normal)
        button.tintColor = .white
        return button
    }
    
    override func handleLeftBarButtonEvent() {
        if let navigationController = self.navigationController {
            navigationController.popViewController(animated: true)
        }
    }
    
    // --------------------------------------
    // MARK: Services
    // --------------------------------------
    
    private func requestBioRarVerify() {
        animationLoading.isHidden = false
        animationLoading.loopMode = .loop
        animationLoading.play()
        stepInstructionLabel.text = LOCALIZED("please_wait_verifying").uppercased()
        if let eid = ONBOARDDATAMANAGER.eid {
            BIOFACADE.requestRarVerification(eid: eid, deviceUUID: Utils.sampleDeviceUUID, deviceName: UIDevice.current.name) { rarResult in
                ONBOARDDATAMANAGER.onboardStatus = rarResult.onboardingState
                
                //save data
                UserDefaults.standard.setValue(eid.personOptionalDetails?.eidNumber ?? "", forKey: "eidNumber")
                UserDefaults.standard.setValue(ONBOARDDATAMANAGER.bioEidChipImagePath, forKey: "chipImage")
                
                //save data only
                do {
                    let eidJsonData = RarVerificationRequestModel(from: eid, deviceUUID: "", deviceName: "", dsCert: "")
                    let data = try JSONEncoder().encode(eidJsonData)
                    UserDefaults.standard.setValue(data, forKey: "eidData")
                } catch {
                    Log.error(error.localizedDescription)
                }
                
                if rarResult.responds.result {
                    DISPATCH_ASYNC_MAIN {
                        let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
                        controller.eidVerified = true
                        controller.eidSignatureVerified = true
                        self.navigationController?.pushViewController(controller, animated: true)
                    }
              
                }
            } onError: { error in
                self.animationLoading.stop()
                Graphics.showAlert(title: LOCALIZED("verify_fail"), message: error.localizedDescription, cancelTitle: LOCALIZED("cancel")) {
                    if let navigationController = self.navigationController {
                        navigationController.popViewController(animated: true)
                    }
                }
            }

        }
    }
    
    private func requestVerifyEid() {
        animationLoading.isHidden = false
        animationLoading.play()
        stepInstructionLabel.text = LOCALIZED("please_wait_verifying").uppercased()
        if let eid = ONBOARDDATAMANAGER.eid {
            APISERVICE.verifyEid(path: "", idCard: eid.personOptionalDetails?.eidNumber ?? "", dsCert: eid.documentSigningCertificate?.certToPEM().toBase64() ?? "", deviceType: "mobile", province: eid.personOptionalDetails?.placeOfOrigin ?? "", code: Bundle.main.infoDictionary?["CUSTOMER_CODE"] as! String) { result in
                switch result{
                case .success(let eidVerifyModel):
                    var invalidModel = eidVerifyModel.isValidIdCard
                    if invalidModel {
                        self.animationLoading.stop()
                        ONBOARDDATAMANAGER.eid?.agencyVerified = invalidModel
                        let publicKeyUrl = Bundle.main.url(forResource: "public", withExtension: "pem") ?? URL(fileURLWithPath: "")
                        
                        if let verifiedEid = ONBOARDDATAMANAGER.eid?.verifyRsaSignature(publicKeyUrl: publicKeyUrl, plainText: eidVerifyModel.responds!, signature: eidVerifyModel.signature) {
                            ONBOARDDATAMANAGER.eid?.agencySignatureChecksum = verifiedEid
                            let controller = INIT_CONTROLLER_XIB(VerifyEidSuccessViewController.self)
                            self.navigationController?.pushViewController(controller, animated: true)
                        }else{
                            Graphics.showAlert(title: LOCALIZED("verify_fail"), message: LOCALIZED("error_verification"), otherTitle: LOCALIZED("try_again_button")) {
                                if let navigationController = self.navigationController {
                                    navigationController.popViewController(animated: true)
                                }
                            }
                        }
                    }
                case .failure(_):
                    Graphics.showAlert(title: LOCALIZED("verify_fail"), message: LOCALIZED("error_verification"), otherTitle: LOCALIZED("try_again_button")) {
                        if let navigationController = self.navigationController {
                            navigationController.popViewController(animated: true)
                        }
                    }
                }
            }
        }
    }
}
