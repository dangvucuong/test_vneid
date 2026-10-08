//
//  OCRMatchingViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 21/03/2024.
//

import UIKit

class OCRMatchingViewController: NavigationBarViewController {
    
    //hidable stackviews
    @IBOutlet weak var passportStackView: UIStackView!
    @IBOutlet weak var addressStackView: UIStackView!
    @IBOutlet weak var identifyStackView: UIStackView!
    @IBOutlet weak var expireStackView: UIStackView!
    //components
    @IBOutlet weak var idCardLabel: UILabel!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var dayOfBirthLabel: UILabel!
    @IBOutlet weak var passportIdLabel: UILabel!
    @IBOutlet weak var addressLabel: UILabel!
    @IBOutlet weak var identifyLabel: UILabel!
    @IBOutlet weak var issueDayLabel: UILabel!
    @IBOutlet weak var expireDayLabel: UILabel!
    @IBOutlet weak var frontImageView: UIImageView!
    @IBOutlet weak var backImageView: UIImageView!
    //text
    @IBOutlet weak var idCardText: UILabel!
    @IBOutlet weak var nameText: UILabel!
    @IBOutlet weak var dayOfBirthText: UILabel!
    @IBOutlet weak var passportIdNumberText: UILabel!
    @IBOutlet weak var addressText: UILabel!
    @IBOutlet weak var identifyText: UILabel!
    @IBOutlet weak var issueDayText: UILabel!
    @IBOutlet weak var expireDayText: UILabel!
    
    //icon status
    @IBOutlet weak var personNumberIconStatus: UIImageView!
    @IBOutlet weak var nameIconStatus: UIImageView!
    @IBOutlet weak var dayOfBirthIconStatus: UIImageView!
    
    var resultInfo: OCRResponseModel!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        nameText.text = LOCALIZED("label_name:")
        dayOfBirthText.text = LOCALIZED("label_date_of_birth:")
        passportIdNumberText.text = LOCALIZED("label_passport_number:")
        addressText.text = LOCALIZED("label_place_of_residence:")
        identifyText.text = LOCALIZED("label_identification:")
        issueDayText.text = LOCALIZED("label_date_of_issue:")
        expireDayText.text = LOCALIZED("label_date_of_expiry:")
        hideComponentBasedOnCardType()
        setupTouchImageView()
    }
    
    override func setupUI() {
        guard let resultInfo = ONBOARDDATAMANAGER.ocrResult else {return}
        self.resultInfo = resultInfo
        var birthdayString = resultInfo.dateOfBirth
        var issueDateString = resultInfo.dateOfIssue
        var dueDateString = resultInfo.dateOfExpiry
        
        if birthdayString.contains(find: "-") {
            birthdayString = birthdayString.replacingOccurrences(of: "-", with: "/")
        }
        
        if dueDateString.contains(find: "-") {
            dueDateString = dueDateString.replacingOccurrences(of: "-", with: "/")
        }
        
        if issueDateString.contains(find: "-") {
            issueDateString = issueDateString.replacingOccurrences(of: "-", with: "/")
        }
        
        idCardLabel.text = resultInfo.personNumber
        nameLabel.text = resultInfo.fullName
        dayOfBirthLabel.text = birthdayString
        passportIdLabel.text = resultInfo.passportNumber
        addressLabel.text = resultInfo.placeOfResidence
        identifyLabel.text = resultInfo.identificationSign
        issueDayLabel.text = issueDateString
        expireDayLabel.text = dueDateString
        setupImageView(frontImageView, imagePath: ONBOARDDATAMANAGER.cardFrontPath)
        setupImageView(backImageView, imagePath: ONBOARDDATAMANAGER.cardBackPath)
        setupIconStatus()
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
    
    
    private func hideComponentBasedOnCardType()  {
        if resultInfo == nil { return }
        switch self.resultInfo.getFrontType() {
        case .PASSPORT:
            passportStackView.isHidden = false
            addressStackView.isHidden = true
            identifyStackView.isHidden = true
            expireStackView.isHidden = false
        case .FRONT_ID_CARD_9:
            passportStackView.isHidden = true
            addressStackView.isHidden = false
            identifyStackView.isHidden = false
            expireStackView.isHidden = true
        default:
            passportStackView.isHidden = true
            addressStackView.isHidden = false
            identifyStackView.isHidden = false
            expireStackView.isHidden = false
        }
    }
    
    private func setupTouchImageView() {
        frontImageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleTouchFrontImageView)))
        frontImageView.isUserInteractionEnabled = true
        backImageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleTouchBackImageView)))
        backImageView.isUserInteractionEnabled = true
    }
    
    private func popUpFullImage(path: String) {
        let controller = INIT_CONTROLLER_XIB(ShowImageViewController.self)
        controller.imagePath = path
        DISPATCH_ASYNC_MAIN {
            controller.modalPresentationStyle = .overCurrentContext
            self.present(controller, animated: true, completion: nil)
        }
    }
    
    @objc func handleTouchFrontImageView(_ sender: Any) {
            popUpFullImage(path: ONBOARDDATAMANAGER.cardFrontPath)
    }
    
    @objc func handleTouchBackImageView(_ sender: Any) {
            popUpFullImage(path: ONBOARDDATAMANAGER.cardBackPath)
    }
    
    private func setupIconStatus() {
        guard let eidDg13 = ONBOARDDATAMANAGER.eid?.personOptionalDetails else { return }
        var eIdMatch = false
        switch resultInfo.getFrontType() {
        case .FRONT_ID_CARD_9:
            eIdMatch = eidDg13.oldEidNumber == resultInfo.personNumber
        case .FRONT_ID_CARD_12, .FRONT_CHIP_ID_CARD:
            eIdMatch = eidDg13.eidNumber == resultInfo.personNumber
        case .PASSPORT:
            if resultInfo.personNumber.count == 12 {
                eIdMatch = eidDg13.eidNumber == resultInfo.personNumber
            } else if resultInfo.personNumber.count == 9 {
                eIdMatch = eidDg13.oldEidNumber == resultInfo.personNumber
            }
        default:
            print("Unexpected type")
        }
        
        personNumberIconStatus.image = eIdMatch ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        
        nameIconStatus.image = (resultInfo.fullName.lowercased() == eidDg13.fullName?.lowercased()) ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        
        
        let dateOfBirth = switch resultInfo.getBackType() {
        case .BACK_ID_CARD_9:
            resultInfo.dateOfBirth.split(separator: "-").joined()
        default:
            resultInfo.dateOfBirth.split(separator: "/").joined()
        }
        let eidDateOfBirth = eidDg13.dateOfBirth?.split(separator: "/").joined()
        
        dayOfBirthIconStatus.image = (dateOfBirth == eidDateOfBirth) ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
    }
    
    
    
}
