//
//  OTPConfirmViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 07/05/2024.
//

import UIKit
import xverifysdk
import OTPFieldView

class OTPConfirmViewController: NavigationBarViewController {
    
    @IBOutlet weak var otpLabel: UILabel!
    
    @IBOutlet weak var otpInputLbl: UILabel!
    @IBOutlet weak var otpTextFieldView: OTPFieldView!
    var otp: String = ""
    var enteredOtp: String = ""
    override func viewDidLoad() {
        super.viewDidLoad()
        setupOtpView()
        otp = random(digits: 6)
        setLogoImage(UIImage(named: "ic_header_logo"))
        otpLabel.font =  UIFont(name: "GoogleSans-Bold", size: 17)
        otpLabel.text = ONBOARDDATAMANAGER.onboardStatus == .ONBOARD_COMPLETED ? LOCALIZED("input_otp_trans").uppercased() : LOCALIZED("input_otp_onboard").uppercased()
        otpInputLbl.font =  UIFont(name: "GoogleSans-Medium", size: 15)
        otpInputLbl.text = LOCALIZED("input_otp")
        //fake OTP notification
        let content = UNMutableNotificationContent()
        content.title = "Your OTP code:"
        content.body = otp
        
        
        // Configure the recurring date.
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 3, repeats: false)
        
        let uuidString = UUID().uuidString
        let request = UNNotificationRequest(identifier: uuidString, content: content, trigger: trigger)
        
        
        // Schedule the request with the system.
        let notificationCenter = UNUserNotificationCenter.current()
        notificationCenter.delegate = self
        notificationCenter.add(request)
    }
    
    override var leftBarButton: UIButton? {
        let button = UIButton(frame: CGRect(x: 0, y: 0, width: 24, height: 24))
        button.backgroundColor = .clear
        button.setImage(UIImage(named: "ic_action_arrowback"), for: .normal)
        button.tintColor = .white
        return button
    }
    
    override func handleLeftBarButtonEvent() {
        if let navigationController = self.navigationController {
            navigationController.popToRootViewController(animated: true)
        }
    }
    
    func random(digits:Int) -> String {
        var number = String()
        for _ in 1...digits {
           number += "\(Int.random(in: 0...9))"
        }
        return number
    }
    
    func navigateToSuccessView() {
        let controller = INIT_CONTROLLER_XIB(BioVerifyResultViewController.self)
        controller.capturedFacePath = ONBOARDDATAMANAGER.bioImageOnboard ?? ""
        controller.verifyFaceMatch = ONBOARDDATAMANAGER.bioFaceResult
        controller.otpSuccess = true
        controller.rarSuccess = ONBOARDDATAMANAGER.bioRarResult
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    func navigateToTransferSuccessView() {
        let controller = INIT_CONTROLLER_XIB(TransferSuccessViewController.self)
        controller.transferType = .TypeD
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    func setupOtpView(){
        self.otpTextFieldView.fieldsCount = 6
        self.otpTextFieldView.fieldBorderWidth = 2
        self.otpTextFieldView.cursorColor = ColorBrand.appColorBlack
        self.otpTextFieldView.defaultBackgroundColor = ColorBrand.appColorWhite
        self.otpTextFieldView.filledBackgroundColor = ColorBrand.appColorWhite
        self.otpTextFieldView.defaultBorderColor = ColorBrand.appColorSilver
        self.otpTextFieldView.filledBorderColor = ColorBrand.appColorMint
        self.otpTextFieldView.displayType = .roundedCorner
        self.otpTextFieldView.fieldSize = 42
        self.otpTextFieldView.separatorSpace = 12
        self.otpTextFieldView.shouldAllowIntermediateEditing = false
        self.otpTextFieldView.fieldFont = UIFont(name: "GoogleSans-Medium", size: 18) ?? UIFont.systemFont(ofSize: 18)
        self.otpTextFieldView.requireCursor = false
        self.otpTextFieldView.delegate = self
        self.otpTextFieldView.initializeUI()
        self.otpTextFieldView.subviews.forEach { view in
            if view is UITextField {
                view.layer.cornerRadius = 8
            }
        }
    }
}

extension OTPConfirmViewController: OTPFieldViewDelegate {
    func shouldBecomeFirstResponderForOTP(otpTextFieldIndex index: Int) -> Bool {
        true
    }
    
    func enteredOTP(otp: String) {
        print("otp string: \(otp)")
        enteredOtp = otp
    }
    
    func hasEnteredAllOTP(hasEnteredAll: Bool) -> Bool {
        if enteredOtp != self.otp && enteredOtp.count == 6 {
            enteredOtp = ""
            DISPATCH_ASYNC_MAIN {
                Graphics.showMessage(.error, body: LOCALIZED("otp_fail"))
            }
            return true
        } else if enteredOtp == self.otp && enteredOtp.count == 6  {
            if ONBOARDDATAMANAGER.onboardStatus == .BIOMETRIC_VERIFIED {
                BIOFACADE.requestBioOtpConfirm(idCard: ONBOARDDATAMANAGER.eid?.personOptionalDetails?.eidNumber ?? "", deviceUUID: Utils.sampleDeviceUUID) { otpResult in
                        if let status = otpResult.onboardingState {
                            ONBOARDDATAMANAGER.onboardStatus = status
                            self.navigateToSuccessView()
                    }
                } onError: { error in
                    Log.error(error.localizedDescription)
                }
            } else if ONBOARDDATAMANAGER.onboardStatus == .ONBOARD_COMPLETED {
                self.navigateToTransferSuccessView()
            }
        }
        enteredOtp = ""
        return true
    }
}

extension OTPConfirmViewController: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.alert, .badge, .sound])
    }
}

