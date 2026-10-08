//
//  TransferViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 15/03/2024.
//

import UIKit

enum TransferType {
    case TypeC
    case TypeD
}

class TransferViewController: NavigationBarViewController {
    override func loadView() {
        super.loadView()
        navigate()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        //navigateToEkyc()
    }
    
    func setUpLeftNavigationBarItem() {
        
    }
    
    private func navigate() {
        switch ONBOARDDATAMANAGER.onboardStatus {
        case .PENDING, .UNKNOWN, .INACTIVE:
            let controller = INIT_CONTROLLER_XIB(VerifyEkycMainViewController.self)
            self.navigationController?.pushViewController(controller, animated: true)
        case .RAR_VERIFIED:
            let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
            self.navigationController?.pushViewController(controller, animated: true)
        case .BIOMETRIC_VERIFIED:
            let controller = INIT_CONTROLLER_XIB(OTPConfirmViewController.self)
            self.navigationController?.pushViewController(controller, animated: true)
        case .ONBOARD_COMPLETED:
            let controller = INIT_CONTROLLER_XIB(TransferConfirmViewController.self)
            self.navigationController?.pushViewController(controller, animated: true)
        @unknown default:
            print("Unimplemented")
        }
 
    }
}
