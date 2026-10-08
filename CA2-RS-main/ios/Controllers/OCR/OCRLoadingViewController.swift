//
//  OCRLoadingViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 20/03/2024.
//

import UIKit
import Lottie
import xverifysdk

class OCRLoadingViewController: NavigationBarViewController {
    @IBOutlet weak var animationLoading: LottieAnimationView!
    @IBOutlet weak var instructionLabel: UILabel!
    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.requestOCR()
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
            navigationController.popViewController(animated: true)
        }
    }
    
    private func navigateToOCRResult(result: OCRResponseModel) {
        let controller = INIT_CONTROLLER_XIB(OCRResultViewController.self)
        controller.resultInfo = result
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    private func isValidCard(resultInfo: OCRResponseModel) -> Bool {
        if resultInfo.getFrontType() == .PASSPORT { return true }
        
        if resultInfo.getBackType().rawValue.split(separator: "_").first == resultInfo.getFrontType().rawValue.split(separator: "_").first { return true }
        
        return false
    }
    
    private func requestOCR() {
        animationLoading.isHidden = false
        animationLoading.loopMode = .loop
        animationLoading.play()
        instructionLabel.text = LOCALIZED("loading_ocr").uppercased()
        
        let cardFrontPath = ONBOARDDATAMANAGER.cardFrontPath
        let cardBackPath = ONBOARDDATAMANAGER.cardBackPath
        
        APISERVICE.verifyOCR(path: "", frontPath: cardFrontPath, backPath: cardBackPath) { result in
            switch result {
            case .success(let data):
                ONBOARDDATAMANAGER.ocrResult = data
                if self.isValidCard(resultInfo: data) {
                    self.navigateToOCRResult(result: data)
                } else {
                    DISPATCH_ASYNC_MAIN {
                        Graphics.showAlert(title: LOCALIZED("verify_fail"),
                                           message: LOCALIZED("error_ocr_not_same_document"), hideCancelButton: true, otherTitle: "OK") {
                            if let navigationController = self.navigationController {
                                navigationController.popViewController(animated: true)
                            }
                        }
                    }
                }
            case .failure(_):
                DISPATCH_ASYNC_MAIN {
                    Graphics.showAlert(title: LOCALIZED("verify_fail"), message: LOCALIZED("error_verification"), cancelTitle: LOCALIZED("cancel")) {
                        if let navigationController = self.navigationController {
                            navigationController.popViewController(animated: true)
                        }
                    }
                }
            }
        }
        
    }
}
