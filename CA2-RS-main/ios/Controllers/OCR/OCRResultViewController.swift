//
//  OCRResultViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 20/03/2024.
//

import UIKit
import xverifysdk

class OCRResultViewController: ChildViewController {
    
    @IBOutlet weak var frontCardImageView: UIImageView!
    @IBOutlet weak var backCardImageView: UIImageView!
    @IBOutlet weak var cardTypeLabel: UILabel!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var cardNumberLabel: UILabel!
    @IBOutlet weak var birthDayLabel: UILabel!
    @IBOutlet weak var expireLabel: UILabel!
    @IBOutlet weak var addressLabel: UILabel!
    @IBOutlet weak var personIdentificationLabel: UILabel!
    @IBOutlet weak var passportIdLabel: UILabel!
    @IBOutlet weak var continueButton: UIButton!
    //text
    @IBOutlet weak var cardTypeText: UILabel!
    @IBOutlet weak var nameText: UILabel!
    @IBOutlet weak var cardNumberText: UILabel!
    @IBOutlet weak var passportIdText: UILabel!
    @IBOutlet weak var birthdayText: UILabel!
    @IBOutlet weak var expireText: UILabel!
    @IBOutlet weak var sexText: UILabel!
    @IBOutlet weak var placeOfResidenceText: UILabel!
    @IBOutlet weak var personIdentificationText: UILabel!
    
    //hidedable stackView
    @IBOutlet weak var passportStackView: UIStackView!
    @IBOutlet weak var addressStackView: UIStackView!
    @IBOutlet weak var identifyStackView: UIStackView!
    @IBOutlet weak var expireStackView: UIStackView!
    
    var resultInfo: OCRResponseModel!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
        cardTypeText.text = LOCALIZED("label_card_type:")
        nameText.text = LOCALIZED("label_name:")
        cardNumberText.text = LOCALIZED("label_eid_number:")
        passportIdText.text = LOCALIZED("label_passport_number:")
        birthdayText.text = LOCALIZED("label_date_of_birth:")
        expireText.text = LOCALIZED("label_date_of_expiry:")
        sexText.text = LOCALIZED("label_gender:")
        placeOfResidenceText.text = LOCALIZED("label_place_of_residence:")
        personIdentificationText.text = LOCALIZED("label_identification:")
        continueButton.setTitle(LOCALIZED("next_button").uppercased(), for: .normal)
    }
    
    override func setupUI() {
        continueButton.layer.cornerRadius = continueButton.frame.height/2
        guard resultInfo != nil else {
            DISPATCH_ASYNC_MAIN {
                Graphics.showAlert(title: LOCALIZED("verify_fail"), message: LOCALIZED("error_verification"), cancelTitle: LOCALIZED("cancel")) {
                    if let navigationController = self.navigationController {
                        navigationController.popViewController(animated: true)
                    }
                }
            }
            return
        }
        
        setupImageView(frontCardImageView,imagePath: ONBOARDDATAMANAGER.cardFrontPath)
        setupImageView(backCardImageView,imagePath: ONBOARDDATAMANAGER.cardBackPath)
        
        var birthdayString = resultInfo.dateOfBirth
        var dueDateString = resultInfo.dateOfExpiry
        
        if birthdayString.contains(find: "-") {
            birthdayString = birthdayString.replacingOccurrences(of: "-", with: "/")
        }
        
        if dueDateString.contains(find: "-") {
            dueDateString = dueDateString.replacingOccurrences(of: "-", with: "/")
        }
    
        nameLabel.text = resultInfo.fullName
        cardNumberLabel.text = resultInfo.personNumber
        birthDayLabel.text = birthdayString
        expireLabel.text = dueDateString
        addressLabel.text = resultInfo.placeOfResidence
        personIdentificationLabel.text = resultInfo.identificationSign
        passportStackView.isHidden = true
        if resultInfo.getFrontType().rawValue.contains(find: "chip") {
            cardTypeLabel.text = LOCALIZED("chip")
        } else if resultInfo.getFrontType().rawValue.contains(find: "passport") {
            cardTypeLabel.text = LOCALIZED("passport")
            passportStackView.isHidden = false
            identifyStackView.isHidden = true
            addressStackView.isHidden = true
            passportIdLabel.text = resultInfo.passportNumber
            
        } else if resultInfo.getFrontType().rawValue.starts(with: "12") {
            cardTypeLabel.text = LOCALIZED("cccd")
        }
        else {
            cardTypeLabel.text = LOCALIZED("cmnd")
            expireStackView.isHidden = true
        }
    }
    
    override func handleLeftBarButtonEvent() {
        if let navigation = navigationController {
            navigation.popToRootViewController(animated: true)
        } else {
            dismiss(animated: true, completion: nil)
        }
    }
    
    private func setupImageView(_ imageView: UIImageView, imagePath: String, shouldCropImage: Bool = false) {
        if let uriImage = URL(string: imagePath) {
            do {
                let imageData = try Data(contentsOf: uriImage)
                let image = UIImage(data: imageData)
                
                imageView.contentMode = .scaleAspectFill
                imageView.clipsToBounds = true
                
                imageView.image = image
                imageView.layer.cornerRadius = 10
            } catch {
                print("Error loading image : \(error)")
            }
        }
        
    }
    
    private func proccessMRZ(image: UIImage, completion: @escaping (() -> Void)) {
        EIDFACADE.processMrz(image: image) { mrzInfo in
            guard let info = mrzInfo else {
                DISPATCH_ASYNC_MAIN {
                    Graphics.showMessage(.error, body: LOCALIZED("eid_read_fail"))
                }
                return
            }
            ONBOARDDATAMANAGER.mrzInfo = info
            ONBOARDDATAMANAGER.mrzKey = try! EIDFACADE.buildMrzKey(eidNumber: info.documentNumber, dateOfBirth: info.dateOfBirth, dateOfExpiry: info.dateOfExpiry) ?? ""
            completion()
        } errorHandler: { error in
            Log.error(error?.localizedDescription ?? "")
        }
    }
    
    private func isValidCard() -> Bool {
        if resultInfo.getFrontType() == .PASSPORT { return true }
        
        if resultInfo.getBackType().rawValue.split(separator: "_").first == resultInfo.getFrontType().rawValue.split(separator: "_").first { return true }
        
        return false
    }
    
    private func isBackCardChipType() -> Bool {
        if resultInfo.getBackType().rawValue.split(separator: "_").first == "chip" { return true }
        return false
    }
    
    private func navigateToMRZScan() {
      
        if isBackCardChipType(), let uriImage = URL(string: ONBOARDDATAMANAGER.cardBackPath) {
            do {
                let controller = INIT_CONTROLLER_XIB(MRZScannerViewController.self)
                let imageData = try Data(contentsOf: uriImage)
                let image = UIImage(data: imageData) ?? UIImage()
                proccessMRZ(image: image) { [weak self] in
                    guard let self = self else {return}
                    controller.isNFCOnly = true
                    self.navigationController?.pushViewController(controller, animated: true)
                }
            } catch {
                print("Error loading image : \(error)")
                return
            }
        } else {
            let controller = INIT_CONTROLLER_XIB(MRZScannerViewController.self)
            controller.isNFCOnly = false
            self.navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    @IBAction func continueButtonAction(_ sender: Any) {
        if !isValidCard() {
            DISPATCH_ASYNC_MAIN {
                Graphics.showMessage(.error, body: LOCALIZED("ocr_read_fail"))
            }
            return
        }
        //navigateToMRZScan()
        let controller = INIT_CONTROLLER_XIB(QrScannerViewController.self)
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
}
