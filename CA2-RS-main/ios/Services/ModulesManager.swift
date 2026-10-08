import UIKit
import xverifysdk

let MODULESMANAGER = ModulesManager.shared

enum BusinessType: Int {
    case verify_eid         = 0
    case ocr                = 1
    case verify_eid_ekyc    = 2
    case passive            = 3
    case simple             = 4
    case transfer           = 5
    case verify_eid_ceca    = 6
    case qr_code            = 7
    case ekyb               = 8
}

protocol ModulesProtocol {
    var type: BusinessType { get }
    var title: String { get }
    var iconImageName: String { get }
    var enable: Bool { get }
}

class EidModule: ModulesProtocol {
    var type: BusinessType = .verify_eid
    var title: String = LOCALIZED("title_eid")
    var iconImageName: String =  "ic_nfc"
    var enable: Bool = true
    required init() {}
}

class OCRModule: ModulesProtocol {
    var type: BusinessType = .ocr
    var title: String = LOCALIZED("title_ocr")
    var iconImageName: String =  "ic_ocr"
    var enable: Bool = true
    required init() {}
}

class EKycModule: ModulesProtocol {
    var type: BusinessType = .verify_eid_ekyc
    var title: String = LOCALIZED("title_ekyc")
    var iconImageName: String =  "ic_peoplescan"
    var enable: Bool = true
    required init() {}
}

class PassiveModule: ModulesProtocol {
    var type: BusinessType = .passive
    var title: String = LOCALIZED("title_passive_ekyc")
    var iconImageName: String =  "ic_peoplescan"
    var enable: Bool = true
    required init() {}
}

class SimpleModule: ModulesProtocol {
    var type: BusinessType = .simple
    var title: String = LOCALIZED("title_simple_ekyc")
    var iconImageName: String =  "ic_peoplescan"
    var enable: Bool = true
    required init() {}
}

class QrCodeModule: ModulesProtocol {
    var type: BusinessType = .qr_code
    var title: String = LOCALIZED("title_gtin")
    var iconImageName: String =  "ic_productscan"
    var enable: Bool = true
    required init() {}
}

class CecaModule: ModulesProtocol {
    var type: BusinessType = .verify_eid_ceca
    var title: String = LOCALIZED("title_ceca")
    var iconImageName: String =  "ic_note"
    var enable: Bool = true
    required init() {}
}

class TransferModule: ModulesProtocol {
    var type: BusinessType = .transfer
    var title: String = LOCALIZED("2345")
    var iconImageName: String =  "ic_card"
    var enable: Bool = true
    required init() {}
}

class EKybModule: ModulesProtocol {
    var type: BusinessType = .ekyb
    var title: String = LOCALIZED("title_ekyb")
    var iconImageName: String =  "ic_peoplescan"
    var enable: Bool = true
    required init() {}
}

class ModulesManager: NSObject {
    
    private var _allModules: [ModulesProtocol];

    // --------------------------------------
    // MARK: Singleton
    // --------------------------------------
    
    class var shared: ModulesManager {
        struct Static {
            static let instance = ModulesManager()
        }
        return Static.instance
    }
    
    override init() {
        _allModules = [
            EidModule.init(),
            OCRModule.init(),
            EKycModule.init(),
            SimpleModule.init(),
            TransferModule.init(),
            PassiveModule.init(),
            CecaModule.init(),
            QrCodeModule.init(),
            EKybModule.init()
        ]
        super.init()
    }
    
    // --------------------------------------
    // MARK: Public
    // --------------------------------------
    
    func getAllModules() -> [ModulesProtocol] {
        return _allModules
    }
    
    func clear() {
        _allModules.removeAll()
    }
    
    func initController(_ type: BusinessType) -> UIViewController {
        ONBOARDDATAMANAGER.businessType = type
        switch (type) {
        case .verify_eid: return VerifyEidMainViewController()
        case .verify_eid_ekyc: return VerifyEkycMainViewController()
        case .verify_eid_ceca: return VerifyCecaMainViewController()
        case .ocr: return OCRCaptureViewController()
        case .passive: return VerifyEkycMainViewController()
        case .transfer:
            switch ONBOARDDATAMANAGER.onboardStatus {
            case .PENDING, .UNKNOWN, .INACTIVE:
                let controller = INIT_CONTROLLER_XIB(VerifyEkycMainViewController.self)
                return controller
            case .RAR_VERIFIED:
                let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
                return controller
            case .BIOMETRIC_VERIFIED:
                let controller = INIT_CONTROLLER_XIB(OTPConfirmViewController.self)
                return controller
            case .ONBOARD_COMPLETED:
                let controller = INIT_CONTROLLER_XIB(TransferTypeSelectViewController.self)
                return controller
            @unknown default:
                print("Unimplemented")
            }
        case .simple:
            return VerifyEkycMainViewController()
        case .qr_code:
            return INIT_CONTROLLER_XIB(QrScannerViewController.self)
        case .ekyb: return VerifyEkybMainViewController()
        }
        return UIViewController()
    }
}
