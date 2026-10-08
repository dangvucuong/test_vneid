import UIKit
import Foundation
import React
import SwiftUI
@objc(EIDModule)

class EIDModule: NSObject {
  
  @objc(StartEKYC:successCallback:errorCallback:)
    func StartEKYC(_ name: String, successCallback: @escaping RCTResponseSenderBlock, errorCallback: @escaping RCTResponseSenderBlock) {
      DispatchQueue.main.async {
        guard let rootViewController = RCTPresentedViewController() else {
          errorCallback(["Unable to get root view controller"])
          return
        }

        //let ekycVC = VerifyEkycMainViewController()
        //let navVC = UINavigationController(rootViewController: ekycVC)
        let ekycController = MODULESMANAGER.initController(.verify_eid_ekyc)
        let navVC = UINavigationController(rootViewController: ekycController)
        rootViewController.present(navVC, animated: true) {
          successCallback(["Presented VerifyEkycMainViewController"])
        }
      }
    }

  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

